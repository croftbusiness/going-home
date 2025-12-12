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

    // Get user email for personal_details
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', auth.userId)
      .single();

    const personalDetailsData: any = {
      user_id: auth.userId,
      full_name: body.fullName || 'User',
      preferred_name: body.preferredName || null,
      date_of_birth: body.dateOfBirth || null,
      phone: body.phoneNumber || null,
      email: body.email || userData?.email || null,
      // Set placeholder values for required fields that aren't collected in onboarding
      address: '',
      city: '',
      state: '',
      zip_code: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
    };

    if (existingDetails) {
      // Update existing record with onboarding data
      const updateData: any = {
        full_name: body.fullName || undefined,
        preferred_name: body.preferredName || undefined,
        date_of_birth: body.dateOfBirth || undefined,
        phone: body.phoneNumber || undefined,
      };
      
      // Only update email if provided
      if (body.email) {
        updateData.email = body.email;
      }

      const { error } = await supabase
        .from('personal_details')
        .update(updateData)
        .eq('id', existingDetails.id);

      if (error) {
        console.error('Error updating personal_details:', error);
        throw error;
      }
    } else {
      // Create new record with onboarding data
      const { error } = await supabase
        .from('personal_details')
        .insert(personalDetailsData);

      if (error) {
        console.error('Error creating personal_details:', error);
        throw error;
      }
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

