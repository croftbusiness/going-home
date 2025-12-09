import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('medical_contacts')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Transform snake_case to camelCase for frontend
    const medicalContacts = data ? {
      physicianName: data.physician_name || '',
      physicianPhone: data.physician_phone || '',
      lawyerName: data.lawyer_name || '',
      lawyerPhone: data.lawyer_phone || '',
      medicalNotes: data.medical_notes || '',
    } : null;

    return NextResponse.json({ medicalContacts });
  } catch (error) {
    console.error('Medical contacts GET error:', error);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from('medical_contacts')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const medicalContactsData = {
      user_id: auth.userId,
      physician_name: body.physicianName,
      physician_phone: body.physicianPhone,
      lawyer_name: body.lawyerName,
      lawyer_phone: body.lawyerPhone,
      medical_notes: body.medicalNotes,
    };

    let data, error;
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('medical_contacts')
        .update(medicalContactsData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('medical_contacts')
        .insert(medicalContactsData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const medicalContacts = data ? {
      physicianName: data.physician_name || '',
      physicianPhone: data.physician_phone || '',
      lawyerName: data.lawyer_name || '',
      lawyerPhone: data.lawyer_phone || '',
      medicalNotes: data.medical_notes || '',
    } : null;

    return NextResponse.json({ medicalContacts });
  } catch (error) {
    console.error('Medical contacts POST error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
