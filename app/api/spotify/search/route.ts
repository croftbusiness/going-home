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
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '20';

    if (!query) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 });
    }

    const accessToken = await getAccessToken(auth.userId);
    if (!accessToken) {
      return NextResponse.json({ error: 'Not connected to Spotify' }, { status: 401 });
    }

    // Search for tracks
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to search Spotify');
    }

    const searchData = await searchResponse.json();
    const tracks = searchData.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(', '),
      album: track.album.name,
      preview_url: track.preview_url,
      external_urls: track.external_urls,
    }));

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error('Spotify search error:', error);
    return NextResponse.json({ error: error.message || 'Failed to search' }, { status: 500 });
  }
}

