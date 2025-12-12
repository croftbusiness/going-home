import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('saved_songs')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ songs: data || [] });
  } catch (error) {
    console.error('Error fetching saved songs:', error);
    return NextResponse.json({ error: 'Failed to fetch saved songs' }, { status: 500 });
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

    // Validate required fields
    if (!body.spotify_id || !body.name || !body.artist) {
      return NextResponse.json(
        { error: 'Missing required fields: spotify_id, name, artist' },
        { status: 400 }
      );
    }

    // Check if song already exists for this user
    const { data: existing } = await supabase
      .from('saved_songs')
      .select('id')
      .eq('user_id', auth.userId)
      .eq('spotify_id', body.spotify_id)
      .maybeSingle();

    if (existing) {
      // Update existing song
      const { data, error } = await supabase
        .from('saved_songs')
        .update({
          name: body.name,
          artist: body.artist,
          album: body.album || null,
          preview_url: body.preview_url || null,
          spotify_url: body.spotify_url || null,
          album_art_url: body.album_art_url || null,
          duration_ms: body.duration_ms || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ song: data, message: 'Song updated' });
    } else {
      // Insert new song
      const { data, error } = await supabase
        .from('saved_songs')
        .insert({
          user_id: auth.userId,
          spotify_id: body.spotify_id,
          name: body.name,
          artist: body.artist,
          album: body.album || null,
          preview_url: body.preview_url || null,
          spotify_url: body.spotify_url || null,
          album_art_url: body.album_art_url || null,
          duration_ms: body.duration_ms || null,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ song: data, message: 'Song saved' });
    }
  } catch (error: any) {
    console.error('Error saving song:', error);
    if (error.code === '23505') {
      // Unique constraint violation
      return NextResponse.json({ error: 'Song already saved' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to save song' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('id');

    if (!songId) {
      return NextResponse.json({ error: 'Song ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saved_songs')
      .delete()
      .eq('id', songId)
      .eq('user_id', auth.userId); // Ensure user can only delete their own songs

    if (error) throw error;

    return NextResponse.json({ message: 'Song deleted' });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
}

