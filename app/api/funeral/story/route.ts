import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateFuneralStory } from '@/lib/utils/funeral-ai';
import { z } from 'zod';

const storyInputSchema = z.object({
  atmosphere: z.string().optional(),
  musicChoices: z.array(z.string()).optional(),
  toneTheme: z.string().optional(),
  readingsScriptures: z.array(z.string()).optional(),
  eulogyNotes: z.string().optional(),
  messagesToAudience: z.string().optional(),
  desiredFeeling: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validatedInput = storyInputSchema.parse(body);

    // Generate AI story
    const aiOutput = await generateFuneralStory(validatedInput);

    // Save to database
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('funeral_stories')
      .upsert({
        user_id: auth.userId,
        atmosphere: validatedInput.atmosphere,
        music_choices: validatedInput.musicChoices || null,
        tone_theme: validatedInput.toneTheme,
        readings_scriptures: validatedInput.readingsScriptures || null,
        eulogy_notes: validatedInput.eulogyNotes,
        messages_to_audience: validatedInput.messagesToAudience,
        desired_feeling: validatedInput.desiredFeeling,
        ceremony_script: aiOutput.ceremonyScript,
        memorial_narrative: aiOutput.memorialNarrative,
        playlist_suggestions: aiOutput.playlistSuggestions || null,
        slideshow_captions: aiOutput.slideshowCaptions || null,
        mood_description: aiOutput.moodDescription,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
    }

    return NextResponse.json({ story: data, aiOutput });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Story generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate story' }, { status: 500 });
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
      .from('funeral_stories')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to load story' }, { status: 500 });
    }

    return NextResponse.json({ story: data });
  } catch (error: any) {
    console.error('Story fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

