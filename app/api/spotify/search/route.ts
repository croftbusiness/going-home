import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Get client credentials token for public search (no user auth required)
async function getClientCredentialsToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Client credentials token error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '20';

    if (!query) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 });
    }

    // Use client credentials for public search (no user auth needed)
    const accessToken = await getClientCredentialsToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Spotify service unavailable' }, { status: 503 });
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
    const tracks = (searchData.tracks?.items || [])
      .filter((track: any) => {
        // Filter out error objects and invalid tracks
        if (!track || !track.id || !track.name) return false;
        // Check if it's an error object (has reason/title but shouldn't be here)
        if (track.reason) return false;
        return true;
      })
      .map((track: any) => ({
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
      }));

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error('Spotify search error:', error);
    return NextResponse.json({ error: error.message || 'Failed to search' }, { status: 500 });
  }
}

