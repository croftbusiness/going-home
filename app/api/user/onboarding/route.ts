import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    // Update or create personal_details with onboarding data
    const { data: existingDetails } = await supabase
      .from('personal_details')
      .select('id')
      .eq('user_id', auth.userId)
      .single();

    const personalDetailsData: any = {
      user_id: auth.userId,
      preferred_name: body.preferredName,
      full_name: body.preferredName, // Use preferred name as full name initially
      date_of_birth: new Date().toISOString().split('T')[0], // Placeholder, user can update later
      address: '', // Placeholder
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '', // Will be populated from user table if needed
      emergency_contact_name: body.emergencyContactName,
      emergency_contact_phone: body.emergencyContactPhone,
      emergency_contact_relationship: body.emergencyContactRelationship,
    };

    if (existingDetails) {
      // Update existing record
      const { error } = await supabase
        .from('personal_details')
        .update(personalDetailsData)
        .eq('id', existingDetails.id);

      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabase
        .from('personal_details')
        .insert(personalDetailsData);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}

