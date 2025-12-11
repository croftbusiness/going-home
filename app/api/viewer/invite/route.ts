import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { sendViewerInvitationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { contactId } = body;

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    }

    // Verify the contact belongs to the owner
    const { data: contact, error: contactError } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('id', contactId)
      .eq('owner_id', auth.userId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Generate a secure random token (32 characters, base64url safe)
    const randomBytes = crypto.getRandomValues(new Uint8Array(24));
    const base64 = btoa(String.fromCharCode(...randomBytes));
    const token = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    // Create token record (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: tokenRecord, error: insertError } = await supabase
      .from('viewer_tokens')
      .insert({
        trusted_contact_id: contactId,
        token,
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single();

    if (insertError || !tokenRecord) {
      return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
    }

    // Get user information for email
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

    // Build login URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const loginUrl = `${siteUrl}/viewer/login?token=${token}`;

    // Send invitation email
    const emailSent = await sendViewerInvitationEmail({
      contactName: contact.name,
      contactEmail: contact.email,
      userName,
      userEmail,
      relationship: contact.relationship,
      role: contact.role || 'Trusted Viewer',
      loginUrl,
      expiresInDays: 7,
    });

    // Update contact status to 'invited'
    await supabase
      .from('trusted_contacts')
      .update({ status: 'invited' })
      .eq('id', contactId);

    return NextResponse.json({
      success: true,
      token: tokenRecord.id,
      emailSent,
      loginUrl, // Return for testing/debugging
    });
  } catch (error: any) {
    console.error('Viewer invite error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send invitation' }, { status: 500 });
  }
}

