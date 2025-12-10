import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generatePlaylist } from '@/lib/utils/funeral-ai';
import { z } from 'zod';

const playlistInputSchema = z.object({
  favoriteSongs: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  mood: z.string().optional(),
  era: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validatedInput = playlistInputSchema.parse(body);

    // Generate AI playlist
    const aiOutput = await generatePlaylist(validatedInput);

    // Save to database
    const supabase = createServerClient();
    
    // Check if playlist exists
    const { data: existing } = await supabase
      .from('funeral_playlists')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const playlistData = {
      user_id: auth.userId,
      ceremony_music: aiOutput.ceremonyMusic || null,
      slideshow_songs: aiOutput.slideshowSongs || null,
      reception_playlist: aiOutput.receptionPlaylist || null,
      personalized_explanations: aiOutput.explanations || null,
      updated_at: new Date().toISOString(),
    };

    let data, error;
    if (existing) {
      const result = await supabase
        .from('funeral_playlists')
        .update(playlistData)
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('funeral_playlists')
        .insert(playlistData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save playlist' }, { status: 500 });
    }

    return NextResponse.json({ playlist: data, aiOutput });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Playlist generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate playlist' }, { status: 500 });
  }
}

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

    if (error) {
      return NextResponse.json({ error: 'Failed to load playlist' }, { status: 500 });
    }

    return NextResponse.json({ playlist: data });
  } catch (error: any) {
    console.error('Playlist fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}

