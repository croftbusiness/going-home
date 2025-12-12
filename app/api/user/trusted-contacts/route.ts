import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { sendTrustedContactEmail } from '@/lib/email';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch owner's profile picture
    const { data: personalDetails } = await supabase
      .from('personal_details')
      .select('profile_picture_url')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const ownerProfilePictureUrl = personalDetails?.profile_picture_url || null;

    // Transform snake_case to camelCase for frontend
    const trustedContacts = (data || []).map(contact => ({
      id: contact.id,
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      relationship: contact.relationship || '',
      accessLevel: contact.access_level || 'view',
      role: contact.role || 'Custom',
      status: contact.status || 'invited',
      canViewPersonalDetails: contact.can_view_personal_details || false,
      canViewMedicalContacts: contact.can_view_medical_contacts || false,
      canViewFuneralPreferences: contact.can_view_funeral_preferences || false,
      canViewDocuments: contact.can_view_documents || false,
      canViewLetters: contact.can_view_letters || false,
      avatarUrl: contact.profile_picture_url || null, // Trusted contact's own profile picture if they have one
      ownerProfilePictureUrl: ownerProfilePictureUrl, // Owner's profile picture
    }));

    return NextResponse.json({ trustedContacts, ownerProfilePictureUrl });
  } catch (error) {
    console.error('Trusted contacts GET error:', error);
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

    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert({
        user_id: auth.userId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        relationship: body.relationship,
        role: body.role || 'Custom',
        owner_id: auth.userId,
        access_level: 'view',
        status: 'invited',
        can_view_personal_details: body.canViewPersonalDetails || false,
        can_view_medical_contacts: body.canViewMedicalContacts || false,
        can_view_funeral_preferences: body.canViewFuneralPreferences || false,
        can_view_documents: body.canViewDocuments || false,
        can_view_letters: body.canViewLetters || false,
      })
      .select()
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const contact = data ? {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      relationship: data.relationship || '',
      accessLevel: data.access_level || 'view',
      canViewPersonalDetails: data.can_view_personal_details || false,
      canViewMedicalContacts: data.can_view_medical_contacts || false,
      canViewFuneralPreferences: data.can_view_funeral_preferences || false,
      canViewDocuments: data.can_view_documents || false,
      canViewLetters: data.can_view_letters || false,
    } : null;

    // Send email notification to the trusted contact (non-blocking)
    if (contact && contact.email) {
      try {
        // Get user information for the email
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', auth.userId)
          .single();

        const { data: personalDetails } = await supabase
          .from('personal_details')
          .select('full_name, preferred_name')
          .eq('user_id', auth.userId)
          .single();

        const userName = personalDetails?.preferred_name || personalDetails?.full_name || userData?.email?.split('@')[0] || 'Someone';
        const userEmail = userData?.email || '';

        // Send email asynchronously (don't wait for it)
        sendTrustedContactEmail({
          contactName: contact.name,
          contactEmail: contact.email,
          userName,
          userEmail,
          relationship: contact.relationship,
          permissions: {
            canViewPersonalDetails: contact.canViewPersonalDetails,
            canViewMedicalContacts: contact.canViewMedicalContacts,
            canViewFuneralPreferences: contact.canViewFuneralPreferences,
            canViewDocuments: contact.canViewDocuments,
            canViewLetters: contact.canViewLetters,
          },
        }).catch((emailError) => {
          // Log but don't fail the request if email fails
          console.error('Failed to send trusted contact email:', emailError);
        });
      } catch (emailError) {
        // Log but don't fail the request if email setup fails
        console.error('Error setting up trusted contact email:', emailError);
      }
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Trusted contacts POST error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await request.json();

    const { data, error } = await supabase
      .from('trusted_contacts')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        relationship: body.relationship,
        role: body.role || 'Custom',
        can_view_personal_details: body.canViewPersonalDetails,
        can_view_medical_contacts: body.canViewMedicalContacts,
        can_view_funeral_preferences: body.canViewFuneralPreferences,
        can_view_documents: body.canViewDocuments,
        can_view_letters: body.canViewLetters,
      })
      .eq('id', id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const contact = data ? {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      relationship: data.relationship || '',
      accessLevel: data.access_level || 'view',
      canViewPersonalDetails: data.can_view_personal_details || false,
      canViewMedicalContacts: data.can_view_medical_contacts || false,
      canViewFuneralPreferences: data.can_view_funeral_preferences || false,
      canViewDocuments: data.can_view_documents || false,
      canViewLetters: data.can_view_letters || false,
    } : null;

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Trusted contacts PUT error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase
      .from('trusted_contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
