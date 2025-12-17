import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('viewer_tokens')
      .select(`
        *,
        trusted_contacts (
          id,
          name,
          email,
          role,
          relationship,
          owner_id,
          permissions,
          can_view_personal_details,
          can_view_medical_contacts,
          can_view_funeral_preferences,
          can_view_documents,
          can_view_letters
        )
      `)
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const contact = tokenRecord.trusted_contacts;

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Build permissions object
    const permissions: Record<string, boolean> = {};
    
    // Use JSONB permissions if available, otherwise fall back to boolean columns
    if (contact.permissions && typeof contact.permissions === 'object') {
      Object.assign(permissions, contact.permissions);
    } else {
      permissions.personalDetails = contact.can_view_personal_details || false;
      permissions.medicalContacts = contact.can_view_medical_contacts || false;
      permissions.funeralPreferences = contact.can_view_funeral_preferences || false;
      permissions.documents = contact.can_view_documents || false;
      permissions.letters = contact.can_view_letters || false;
    }

    // Mark token as used
    await supabase
      .from('viewer_tokens')
      .update({ used: true })
      .eq('id', tokenRecord.id);

    // Update contact status to 'accepted'
    await supabase
      .from('trusted_contacts')
      .update({ status: 'accepted' })
      .eq('id', contact.id);

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        role: contact.role,
        relationship: contact.relationship,
        ownerId: contact.owner_id,
      },
      permissions,
      tokenId: tokenRecord.id,
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify token' }, { status: 500 });
  }
}





