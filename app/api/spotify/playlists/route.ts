import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

async function getAccessToken(userId: string) {
  const supabase = createServerClient();
  const { data: tokenData, error } = await supabase
    .from('spotify_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) {
    return null;
  }

  // Check if token is expired
  if (new Date(tokenData.expires_at) <= new Date()) {
    // Refresh token
    const refreshed = await refreshSpotifyToken(userId, tokenData.refresh_token);
    return refreshed;
  }

  return tokenData.access_token;
}

async function refreshSpotifyToken(userId: string, refreshToken: string) {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const supabase = createServerClient();
    
    await supabase
      .from('spotify_tokens')
      .update({
        access_token: data.access_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const accessToken = await getAccessToken(auth.userId);
    if (!accessToken) {
      return NextResponse.json({ error: 'Not connected to Spotify' }, { status: 401 });
    }

    // Fetch user's playlists
    const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!playlistsResponse.ok) {
      throw new Error('Failed to fetch playlists');
    }

    const playlistsData = await playlistsResponse.json();
    return NextResponse.json({ playlists: playlistsData.items });
  } catch (error: any) {
    console.error('Spotify playlists error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch playlists' }, { status: 500 });
  }
}

