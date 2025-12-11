import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const viewerSessionCookie = cookieStore.get('viewer_session');

    if (!viewerSessionCookie) {
      return NextResponse.json({ error: 'Viewer session not found' }, { status: 401 });
    }

    const viewerSession = JSON.parse(viewerSessionCookie.value);
    const viewerId = viewerSession.viewerId;

    if (!viewerId) {
      return NextResponse.json({ error: 'Viewer ID not found in session' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: contact, error } = await supabase
      .from('trusted_contacts')
      .select('id, name, email, profile_picture_url')
      .eq('id', viewerId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching viewer contact details:', error);
      return NextResponse.json({ error: 'Failed to fetch viewer contact details' }, { status: 500 });
    }

    if (!contact) {
      return NextResponse.json({ error: 'Viewer contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        profilePictureUrl: contact.profile_picture_url || null,
      },
    });
  } catch (error: any) {
    console.error('Viewer access route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch viewer access data' },
      { status: 500 }
    );
  }
}

