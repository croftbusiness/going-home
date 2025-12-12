import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

async function getAccessToken(userId: string) {
  const supabase = createServerClient();
  const { data: tokenData } = await supabase
    .from('spotify_tokens')
    .select('access_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (!tokenData || new Date(tokenData.expires_at) <= new Date()) {
    return null;
  }

  return tokenData.access_token;
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');

    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID required' }, { status: 400 });
    }

    const accessToken = await getAccessToken(auth.userId);
    if (!accessToken) {
      return NextResponse.json({ error: 'Not connected to Spotify' }, { status: 401 });
    }

    // Fetch playlist tracks
    const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!tracksResponse.ok) {
      throw new Error('Failed to fetch playlist tracks');
    }

    const tracksData = await tracksResponse.json();
    const tracks = tracksData.items
      .filter((item: any) => item.track && !item.track.is_local)
      .map((item: any) => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map((a: any) => a.name).join(', '),
        album: item.track.album.name,
        preview_url: item.track.preview_url,
        external_urls: item.track.external_urls,
      }));

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error('Spotify playlist tracks error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tracks' }, { status: 500 });
  }
}

