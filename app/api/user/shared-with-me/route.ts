import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    // Get current user's email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', auth.userId)
      .single();

    if (userError || !userData?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 });
    }

    // Find all trusted contacts where the current user's email matches
    const { data: contacts, error: contactsError } = await supabase
      .from('trusted_contacts')
      .select(`
        id,
        name,
        email,
        role,
        relationship,
        status,
        can_view_personal_details,
        can_view_medical_contacts,
        can_view_funeral_preferences,
        can_view_documents,
        can_view_letters,
        owner_id,
        created_at
      `)
      .eq('email', userData.email)
      .eq('status', 'invited')
      .order('created_at', { ascending: false });

    if (contactsError) {
      console.error('Error fetching shared contacts:', contactsError);
      return NextResponse.json({ error: 'Failed to load shared accounts' }, { status: 500 });
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ sharedAccounts: [] });
    }

    // Get owner information for each contact
    const ownerIds = [...new Set(contacts.map(c => c.owner_id))];
    const { data: owners, error: ownersError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', ownerIds);

    if (ownersError) {
      console.error('Error fetching owners:', ownersError);
    }

    // Get owner personal details (name, profile picture)
    const { data: personalDetails, error: personalError } = await supabase
      .from('personal_details')
      .select('user_id, full_name, preferred_name, profile_picture_url, role')
      .in('user_id', ownerIds);

    if (personalError) {
      console.error('Error fetching personal details:', personalError);
    }

    // Build the response with owner information
    const sharedAccounts = contacts.map(contact => {
      const owner = owners?.find(o => o.id === contact.owner_id);
      const ownerDetails = personalDetails?.find(p => p.user_id === contact.owner_id);
      
      return {
        contactId: contact.id,
        ownerId: contact.owner_id,
        ownerName: ownerDetails?.preferred_name || ownerDetails?.full_name || owner?.email?.split('@')[0] || 'Unknown',
        ownerEmail: owner?.email || '',
        ownerProfilePicture: ownerDetails?.profile_picture_url || null,
        ownerRole: ownerDetails?.role || 'User',
        myRole: contact.role || 'Trusted Viewer',
        relationship: contact.relationship,
        status: contact.status,
        permissions: {
          canViewPersonalDetails: contact.can_view_personal_details || false,
          canViewMedicalContacts: contact.can_view_medical_contacts || false,
          canViewFuneralPreferences: contact.can_view_funeral_preferences || false,
          canViewDocuments: contact.can_view_documents || false,
          canViewLetters: contact.can_view_letters || false,
        },
        invitedAt: contact.created_at,
      };
    });

    return NextResponse.json({ sharedAccounts });
  } catch (error: any) {
    console.error('Shared with me error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load shared accounts' }, { status: 500 });
  }
}

