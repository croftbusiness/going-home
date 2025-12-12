import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/spotify/callback`;

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Validate Spotify credentials
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error('Spotify credentials missing:', {
        hasClientId: !!SPOTIFY_CLIENT_ID,
        hasClientSecret: !!SPOTIFY_CLIENT_SECRET,
      });
      return NextResponse.json({ 
        error: 'Spotify integration is not configured. Please contact support or check your environment variables.',
        details: 'SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in environment variables'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'authorize') {
      // Generate authorization URL
      const scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-library-read';
      
      // Get return URL from query params, default to current page or dashboard
      const { searchParams } = new URL(request.url);
      const returnUrl = searchParams.get('returnUrl') || '/dashboard/funeral-preferences';
      
      // Encode state as JSON with user ID and return URL
      const state = JSON.stringify({
        userId: auth.userId,
        returnUrl: returnUrl,
      });
      
      const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${SPOTIFY_CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `state=${encodeURIComponent(state)}`;

      return NextResponse.json({ authUrl });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Spotify auth error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

