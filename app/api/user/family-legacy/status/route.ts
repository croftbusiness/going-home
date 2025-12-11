import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    // Check completion status for each section
    const [
      recipesRes,
      storiesRes,
      heirloomsRes,
      traditionsRes,
      adviceRes,
      lettersRes,
      playlistsRes,
      routinesRes,
      instructionsRes,
    ] = await Promise.all([
      supabase.from('legacy_recipes').select('id').eq('user_id', auth.userId).limit(1),
      supabase.from('legacy_stories').select('id').eq('user_id', auth.userId).limit(1),
      supabase.from('legacy_heirlooms').select('id').eq('user_id', auth.userId).limit(1),
      supabase.from('legacy_traditions').select('id').eq('user_id', auth.userId).limit(1),
      supabase.from('legacy_advice').select('id').eq('user_id', auth.userId).limit(1),
      supabase.from('legacy_family_letters').select('id').eq('user_id', auth.userId).limit(1),
      supabase.from('legacy_playlists').select('id').eq('user_id', auth.userId).limit(1),
      supabase.from('legacy_routines').select('id').eq('user_id', auth.userId).limit(1),
      supabase.from('legacy_instructions').select('id').eq('user_id', auth.userId).limit(1),
    ]);

    return NextResponse.json({
      status: {
        recipes: (recipesRes.data?.length || 0) > 0,
        stories: (storiesRes.data?.length || 0) > 0,
        heirlooms: (heirloomsRes.data?.length || 0) > 0,
        traditions: (traditionsRes.data?.length || 0) > 0,
        advice: (adviceRes.data?.length || 0) > 0,
        letters: (lettersRes.data?.length || 0) > 0,
        playlists: (playlistsRes.data?.length || 0) > 0,
        routines: (routinesRes.data?.length || 0) > 0,
        instructions: (instructionsRes.data?.length || 0) > 0,
      },
    });
  } catch (error: any) {
    console.error('Family Legacy status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load status' },
      { status: 500 }
    );
  }
}



