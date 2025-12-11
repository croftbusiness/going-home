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
      preferred_name: body.preferredName,
      full_name: body.preferredName || 'User', // Use preferred name as full name initially
      date_of_birth: '1900-01-01', // Placeholder date, user can update later
      address: 'To be completed', // Placeholder, user can update later
      city: 'To be completed',
      state: 'To be completed',
      zip_code: '00000',
      phone: '000-000-0000', // Placeholder
      email: userData?.email || '', // Use actual user email
      emergency_contact_name: body.emergencyContactName || 'To be completed',
      emergency_contact_phone: body.emergencyContactPhone || '000-000-0000',
      emergency_contact_relationship: body.emergencyContactRelationship || 'To be completed',
    };

    if (existingDetails) {
      // Update existing record - only update the fields we have from onboarding
      const updateData: any = {
        preferred_name: body.preferredName || undefined,
      };
      
      // Only update emergency contact if provided
      if (body.emergencyContactName) {
        updateData.emergency_contact_name = body.emergencyContactName;
      }
      if (body.emergencyContactPhone) {
        updateData.emergency_contact_phone = body.emergencyContactPhone;
      }
      if (body.emergencyContactRelationship) {
        updateData.emergency_contact_relationship = body.emergencyContactRelationship;
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
      // Create new record with all required fields
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

