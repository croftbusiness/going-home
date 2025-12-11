import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';

// Helper to get viewer context from session/cookie
async function getViewerContext(request: Request) {
  // In MVP, we'll use a simple approach: check for viewer session in cookie
  // For production, you'd want to use proper session management
  const cookies = request.headers.get('cookie') || '';
  const viewerTokenMatch = cookies.match(/viewer_token=([^;]+)/);
  
  if (!viewerTokenMatch) {
    return null;
  }

  const supabase = createServerClient();
  
  // Verify the viewer session is still valid
  const { data: tokenRecord } = await supabase
    .from('viewer_tokens')
    .select(`
      *,
      trusted_contacts (
        id,
        owner_id,
        permissions,
        can_view_personal_details,
        can_view_medical_contacts,
        can_view_funeral_preferences,
        can_view_documents,
        can_view_letters
      )
    `)
    .eq('id', viewerTokenMatch[1])
    .single();

  if (!tokenRecord || !tokenRecord.trusted_contacts) {
    return null;
  }

  const contact = tokenRecord.trusted_contacts;
  
  // Build permissions
  const permissions: Record<string, boolean> = {};
  if (contact.permissions && typeof contact.permissions === 'object') {
    Object.assign(permissions, contact.permissions);
  } else {
    permissions.personalDetails = contact.can_view_personal_details || false;
    permissions.medicalContacts = contact.can_view_medical_contacts || false;
    permissions.funeralPreferences = contact.can_view_funeral_preferences || false;
    permissions.documents = contact.can_view_documents || false;
    permissions.letters = contact.can_view_letters || false;
  }

  return {
    ownerId: contact.owner_id,
    contactId: contact.id,
    permissions,
  };
}

export async function GET(request: Request) {
  try {
    const viewerContext = await getViewerContext(request);
    
    if (!viewerContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    if (!section) {
      return NextResponse.json({ error: 'Section required' }, { status: 400 });
    }

    // Check permission for this section
    const permissionKey = section.charAt(0).toLowerCase() + section.slice(1).replace(/([A-Z])/g, '$1');
    const hasPermission = viewerContext.permissions[permissionKey] || 
                         viewerContext.permissions[section] ||
                         false;

    if (!hasPermission) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const supabase = createServerClient();
    let data = null;

    // Fetch data based on section
    switch (section) {
      case 'personalDetails':
        const { data: personalData } = await supabase
          .from('personal_details')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .single();
        data = personalData;
        break;

      case 'medicalContacts':
        const { data: medicalData } = await supabase
          .from('medical_contacts')
          .select('*')
          .eq('user_id', viewerContext.ownerId);
        data = medicalData;
        break;

      case 'funeralPreferences':
        const { data: funeralData } = await supabase
          .from('funeral_preferences')
          .select('*')
          .eq('user_id', viewerContext.ownerId)
          .single();
        data = funeralData;
        break;

      case 'documents':
        const { data: documentsData } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', viewerContext.ownerId);
        data = documentsData;
        break;

      case 'letters':
        const { data: lettersData } = await supabase
          .from('letters')
          .select('*')
          .eq('user_id', viewerContext.ownerId);
        data = lettersData;
        break;

      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    return NextResponse.json({ data, permissions: viewerContext.permissions });
  } catch (error: any) {
    console.error('Viewer data fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch data' }, { status: 500 });
  }
}


