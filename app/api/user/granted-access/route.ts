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
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', auth.userId)
      .single();

    if (!userData?.email) {
      return NextResponse.json({ grantedAccess: [] });
    }

    // Find all trusted_contacts where the current user's email matches the contact email
    const { data: contacts, error } = await supabase
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
        permissions,
        created_at
      `)
      .eq('email', userData.email)
      .eq('status', 'invited')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // For each contact, get the owner's information
    const grantedAccess = await Promise.all(
      (contacts || []).map(async (contact) => {
        // Get owner's personal details
        const { data: ownerDetails } = await supabase
          .from('personal_details')
          .select('full_name, preferred_name, profile_picture_url, role')
          .eq('user_id', contact.owner_id)
          .maybeSingle();

        // Get owner's email
        const { data: ownerUser } = await supabase
          .from('users')
          .select('email')
          .eq('id', contact.owner_id)
          .maybeSingle();

        // Build permissions object
        const permissions: Record<string, boolean> = {};
        if (contact.permissions && typeof contact.permissions === 'object') {
          Object.assign(permissions, contact.permissions);
        } else {
          permissions.canViewPersonalDetails = contact.can_view_personal_details || false;
          permissions.canViewMedicalContacts = contact.can_view_medical_contacts || false;
          permissions.canViewFuneralPreferences = contact.can_view_funeral_preferences || false;
          permissions.canViewDocuments = contact.can_view_documents || false;
          permissions.canViewLetters = contact.can_view_letters || false;
        }

        return {
          contactId: contact.id,
          ownerId: contact.owner_id,
          ownerName: ownerDetails?.preferred_name || ownerDetails?.full_name || ownerUser?.email?.split('@')[0] || 'Unknown',
          ownerEmail: ownerUser?.email || '',
          ownerProfilePicture: ownerDetails?.profile_picture_url || null,
          ownerRole: ownerDetails?.role || 'User',
          myRole: contact.role || 'Trusted Viewer',
          relationship: contact.relationship,
          permissions,
          grantedAt: contact.created_at,
        };
      })
    );

    return NextResponse.json({ grantedAccess });
  } catch (error) {
    console.error('Granted access GET error:', error);
    return NextResponse.json({ error: 'Failed to load granted access' }, { status: 500 });
  }
}

