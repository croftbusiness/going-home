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
      .from('legacy_playlists')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const playlists = data?.map((song: any) => ({
      id: song.id,
      songTitle: song.song_title,
      artist: song.artist,
      link: song.link,
      emotionalMeaning: song.emotional_meaning,
      createdAt: song.created_at,
      updatedAt: song.updated_at,
    })) || [];

    return NextResponse.json({ playlists });
  } catch (error: any) {
    console.error('Playlists GET error:', error);
    return NextResponse.json({ error: 'Failed to load playlists' }, { status: 500 });
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

    const { data, error } = await supabase
      .from('legacy_playlists')
      .insert({
        user_id: auth.userId,
        song_title: body.songTitle,
        artist: body.artist || null,
        link: body.link || null,
        emotional_meaning: body.emotionalMeaning || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      playlist: {
        id: data.id,
        songTitle: data.song_title,
        artist: data.artist,
        link: data.link,
        emotionalMeaning: data.emotional_meaning,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Playlists POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save song' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('legacy_playlists')
      .update({
        song_title: body.songTitle,
        artist: body.artist || null,
        link: body.link || null,
        emotional_meaning: body.emotionalMeaning || null,
      })
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      playlist: {
        id: data.id,
        songTitle: data.song_title,
        artist: data.artist,
        link: data.link,
        emotionalMeaning: data.emotional_meaning,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Playlists PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update song' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Song ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('legacy_playlists')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Playlists DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete song' },
      { status: 500 }
    );
  }
}





