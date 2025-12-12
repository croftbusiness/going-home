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

    // Check if life_story contains a JSON object with finalBiography
    let finalBiography = null;
    let uploadedDocument = null;
    let sections = {
      lifeStory: data.life_story,
      majorAccomplishments: data.major_accomplishments,
      familyHistory: data.family_history,
      faithStory: data.faith_story,
      lessonsLearned: data.lessons_learned,
      favoriteMemories: data.favorite_memories,
    };

    try {
      // Try to parse life_story as JSON for new format
      if (data.life_story && data.life_story.startsWith('{')) {
        const parsed = JSON.parse(data.life_story);
        if (parsed.finalBiography) {
          finalBiography = parsed.finalBiography;
          uploadedDocument = parsed.uploadedDocument || null;
          sections = parsed.sections || sections;
        }
      }
    } catch (e) {
      // Not JSON, use as-is
    }

    const biography = {
      id: data.id,
      lifeStory: sections.lifeStory,
      majorAccomplishments: sections.majorAccomplishments,
      familyHistory: sections.familyHistory,
      faithStory: sections.faithStory,
      lessonsLearned: sections.lessonsLearned,
      favoriteMemories: sections.favoriteMemories,
      finalBiography,
      uploadedDocument,
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

    // Store new format data in life_story as JSON, or use individual fields for backward compatibility
    let biographyData: any;
    
    if (body.finalBiography || body.uploadedDocument) {
      // New format - store as JSON in life_story
      biographyData = {
        user_id: auth.userId,
        life_story: JSON.stringify({
          sections: {
            lifeStory: body.lifeStory || '',
            majorAccomplishments: body.majorAccomplishments || '',
            familyHistory: body.familyHistory || '',
            faithStory: body.faithStory || '',
            lessonsLearned: body.lessonsLearned || '',
            favoriteMemories: body.favoriteMemories || '',
          },
          finalBiography: body.finalBiography || null,
          uploadedDocument: body.uploadedDocument || null,
        }),
        major_accomplishments: body.majorAccomplishments || null,
        family_history: body.familyHistory || null,
        faith_story: body.faithStory || null,
        lessons_learned: body.lessonsLearned || null,
        favorite_memories: body.favoriteMemories || null,
      };
    } else {
      // Old format - store in individual fields
      biographyData = {
        user_id: auth.userId,
        life_story: body.lifeStory || null,
        major_accomplishments: body.majorAccomplishments || null,
        family_history: body.familyHistory || null,
        faith_story: body.faithStory || null,
        lessons_learned: body.lessonsLearned || null,
        favorite_memories: body.favoriteMemories || null,
      };
    }

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

