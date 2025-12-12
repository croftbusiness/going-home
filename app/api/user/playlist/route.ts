import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('funeral_playlists')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return NextResponse.json({ playlist: null });
    }

    // Extract songs from ceremony_music column
    const songs = Array.isArray(data.ceremony_music) 
      ? data.ceremony_music 
      : (data.ceremony_music ? [data.ceremony_music] : []);

    return NextResponse.json({
      playlist: {
        id: data.id,
        songs: songs,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Playlist GET error:', error);
    return NextResponse.json({ error: 'Failed to load playlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    if (!body.songs || !Array.isArray(body.songs)) {
      return NextResponse.json({ error: 'Songs array is required' }, { status: 400 });
    }

    // Check if playlist exists
    const { data: existing } = await supabase
      .from('funeral_playlists')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    // Store songs in a simple JSONB column - we'll use ceremony_music as the main playlist
    // since we removed the AI generation that used multiple columns
    const playlistData = {
      user_id: auth.userId,
      ceremony_music: body.songs, // Store the playlist in ceremony_music column
      updated_at: new Date().toISOString(),
    };

    let data, error;
    if (existing) {
      // Update existing playlist
      const result = await supabase
        .from('funeral_playlists')
        .update(playlistData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new playlist
      const result = await supabase
        .from('funeral_playlists')
        .insert(playlistData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Extract songs from ceremony_music column
    const songs = Array.isArray(data.ceremony_music) 
      ? data.ceremony_music 
      : (data.ceremony_music ? [data.ceremony_music] : []);

    return NextResponse.json({
      playlist: {
        id: data.id,
        songs: songs,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Playlist POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save playlist' }, { status: 500 });
  }
}

