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
      .from('personal_details')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Transform snake_case to camelCase for frontend
    const personalDetails = data ? {
      fullName: data.full_name || '',
      preferredName: data.preferred_name || '',
      dateOfBirth: data.date_of_birth || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: data.zip_code || '',
      phone: data.phone || '',
      email: data.email || '',
      emergencyContactName: data.emergency_contact_name || '',
      emergencyContactPhone: data.emergency_contact_phone || '',
      emergencyContactRelationship: data.emergency_contact_relationship || '',
    } : null;

    return NextResponse.json({ personalDetails });
  } catch (error) {
    console.error('Personal details GET error:', error);
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
      .from('personal_details')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const personalDetailsData = {
      user_id: auth.userId,
      full_name: body.fullName,
      preferred_name: body.preferredName,
      date_of_birth: body.dateOfBirth,
      address: body.address,
      city: body.city,
      state: body.state,
      zip_code: body.zipCode,
      phone: body.phone,
      email: body.email,
      emergency_contact_name: body.emergencyContactName,
      emergency_contact_phone: body.emergencyContactPhone,
      emergency_contact_relationship: body.emergencyContactRelationship,
    };

    let data, error;
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('personal_details')
        .update(personalDetailsData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('personal_details')
        .insert(personalDetailsData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const personalDetails = data ? {
      fullName: data.full_name || '',
      preferredName: data.preferred_name || '',
      dateOfBirth: data.date_of_birth || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: data.zip_code || '',
      phone: data.phone || '',
      email: data.email || '',
      emergencyContactName: data.emergency_contact_name || '',
      emergencyContactPhone: data.emergency_contact_phone || '',
      emergencyContactRelationship: data.emergency_contact_relationship || '',
    } : null;

    return NextResponse.json({ personalDetails });
  } catch (error) {
    console.error('Personal details POST error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
