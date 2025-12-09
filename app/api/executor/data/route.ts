import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';
import { verifyExecutorAccess } from '@/lib/executor-auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    const session = await verifyExecutorAccess(token);
    if ('error' in session) {
      return NextResponse.json({ error: session.error }, { status: session.status });
    }

    const supabase = createServerClient();
    const data: any = {};

    // Get personal details if permitted
    if (session.permissions.canViewPersonalDetails) {
      const { data: personalDetails } = await supabase
        .from('personal_details')
        .select('*')
        .eq('user_id', session.userId)
        .single();

      if (personalDetails) {
        data.personalDetails = {
          fullName: personalDetails.full_name,
          preferredName: personalDetails.preferred_name,
          dateOfBirth: personalDetails.date_of_birth,
          address: personalDetails.address,
          city: personalDetails.city,
          state: personalDetails.state,
          zipCode: personalDetails.zip_code,
          phone: personalDetails.phone,
          email: personalDetails.email,
          emergencyContactName: personalDetails.emergency_contact_name,
          emergencyContactPhone: personalDetails.emergency_contact_phone,
          emergencyContactRelationship: personalDetails.emergency_contact_relationship,
        };
      }
    }

    // Get medical contacts if permitted
    if (session.permissions.canViewMedicalContacts) {
      const { data: medicalContacts } = await supabase
        .from('medical_contacts')
        .select('*')
        .eq('user_id', session.userId)
        .single();

      if (medicalContacts) {
        data.medicalContacts = {
          physicianName: medicalContacts.physician_name,
          physicianPhone: medicalContacts.physician_phone,
          lawyerName: medicalContacts.lawyer_name,
          lawyerPhone: medicalContacts.lawyer_phone,
          medicalNotes: medicalContacts.medical_notes,
        };
      }
    }

    // Get funeral preferences if permitted
    if (session.permissions.canViewFuneralPreferences) {
      const { data: funeralPrefs } = await supabase
        .from('funeral_preferences')
        .select('*')
        .eq('user_id', session.userId)
        .single();

      if (funeralPrefs) {
        data.funeralPreferences = {
          burialOrCremation: funeralPrefs.burial_or_cremation,
          funeralHome: funeralPrefs.funeral_home,
          serviceType: funeralPrefs.service_type,
          atmosphereWishes: funeralPrefs.atmosphere_wishes,
          song1: funeralPrefs.song_1,
          song2: funeralPrefs.song_2,
          song3: funeralPrefs.song_3,
          photoPreferenceUrl: funeralPrefs.photo_preference_url,
          preferredClothing: funeralPrefs.preferred_clothing,
        };
      }
    }

    // Get documents if permitted
    if (session.permissions.canViewDocuments) {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false });

      data.documents = documents || [];
    }

    // Get letters if permitted (only letters for this executor)
    if (session.permissions.canViewLetters) {
      const { data: letters } = await supabase
        .from('letters')
        .select('*')
        .eq('user_id', session.userId)
        .eq('recipient_id', session.executorContactId)
        .order('created_at', { ascending: false });

      data.letters = letters || [];
    }

    return NextResponse.json({ data, permissions: session.permissions });
  } catch (error: any) {
    console.error('Executor data GET error:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

