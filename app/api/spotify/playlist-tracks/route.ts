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
      const errorData = await tracksResponse.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Failed to fetch playlist tracks';
      throw new Error(errorMessage);
    }

    const tracksData = await tracksResponse.json();
    const tracks = tracksData.items
      .filter((item: any) => {
        // Filter out null tracks, local tracks, and error objects
        if (!item || !item.track) return false;
        if (item.track.is_local) return false;
        // Check if it's an error object (has reason/title but not id/name)
        if (item.track.reason || (item.track.title && !item.track.id)) return false;
        // Ensure it has required track properties
        return item.track.id && item.track.name && item.track.artists;
      })
      .map((item: any) => {
        const track = item.track;
        return {
          id: track.id,
          name: track.name || 'Unknown',
          artist: track.artists && Array.isArray(track.artists) 
            ? track.artists.map((a: any) => a.name || 'Unknown').join(', ')
            : 'Unknown Artist',
          album: track.album?.name || null,
          preview_url: track.preview_url || null,
          external_urls: track.external_urls || null,
          album_art_url: track.album?.images?.[0]?.url || null,
          duration_ms: track.duration_ms || null,
        };
      });

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error('Spotify playlist tracks error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tracks' }, { status: 500 });
  }
}

