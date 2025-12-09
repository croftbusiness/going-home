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
      .from('personal_biography')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return NextResponse.json({ biography: null });
    }

    const biography = {
      id: data.id,
      lifeStory: data.life_story,
      majorAccomplishments: data.major_accomplishments,
      familyHistory: data.family_history,
      faithStory: data.faith_story,
      lessonsLearned: data.lessons_learned,
      favoriteMemories: data.favorite_memories,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ biography });
  } catch (error) {
    console.error('Biography GET error:', error);
    return NextResponse.json({ error: 'Failed to load biography' }, { status: 500 });
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

    // Check if record exists
    const { data: existing } = await supabase
      .from('personal_biography')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const biographyData: any = {
      user_id: auth.userId,
      life_story: body.lifeStory,
      major_accomplishments: body.majorAccomplishments,
      family_history: body.familyHistory,
      faith_story: body.faithStory,
      lessons_learned: body.lessonsLearned,
      favorite_memories: body.favoriteMemories,
    };

    let data, error;
    if (existing) {
      const result = await supabase
        .from('personal_biography')
        .update(biographyData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('personal_biography')
        .insert(biographyData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    return NextResponse.json({ biography: data });
  } catch (error) {
    console.error('Biography POST error:', error);
    return NextResponse.json({ error: 'Failed to save biography' }, { status: 500 });
  }
}

