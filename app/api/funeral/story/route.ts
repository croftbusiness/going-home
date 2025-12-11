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
  serviceStructure: z.string().optional(),
  visualElements: z.string().optional(),
  specialMoments: z.array(z.string()).optional(),
  memorialKeepsakes: z.string().optional(),
  receptionDetails: z.string().optional(),
  dressCode: z.string().optional(),
  photographyPreferences: z.string().optional(),
  guestParticipation: z.string().optional(),
  ceremonyTiming: z.string().optional(),
  venuePreferences: z.string().optional(),
  flowerPreferences: z.array(z.string()).optional(),
  colorPreferences: z.array(z.string()).optional(),
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
    
    // Check if story exists
    const { data: existing } = await supabase
      .from('funeral_stories')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const storyData = {
      user_id: auth.userId,
      atmosphere: validatedInput.atmosphere,
      music_choices: validatedInput.musicChoices || null,
      tone_theme: validatedInput.toneTheme,
      readings_scriptures: validatedInput.readingsScriptures || null,
      eulogy_notes: validatedInput.eulogyNotes,
      messages_to_audience: validatedInput.messagesToAudience,
      desired_feeling: validatedInput.desiredFeeling,
      service_structure: validatedInput.serviceStructure,
      visual_elements: validatedInput.visualElements,
      special_moments: validatedInput.specialMoments || null,
      memorial_keepsakes: validatedInput.memorialKeepsakes,
      reception_details: validatedInput.receptionDetails,
      dress_code: validatedInput.dressCode,
      photography_preferences: validatedInput.photographyPreferences,
      guest_participation: validatedInput.guestParticipation,
      ceremony_timing: validatedInput.ceremonyTiming,
      venue_preferences: validatedInput.venuePreferences,
      flower_preferences: validatedInput.flowerPreferences || null,
      color_preferences: validatedInput.colorPreferences || null,
      ceremony_script: aiOutput.ceremonyScript,
      memorial_narrative: aiOutput.memorialNarrative,
      playlist_suggestions: aiOutput.playlistSuggestions || null,
      slideshow_captions: aiOutput.slideshowCaptions || null,
      mood_description: aiOutput.moodDescription,
      updated_at: new Date().toISOString(),
    };

    let data, error;
    if (existing) {
      // Update existing
      const result = await supabase
        .from('funeral_stories')
        .update(storyData)
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('funeral_stories')
        .insert(storyData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

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

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validatedInput = storyInputSchema.parse(body);

    const supabase = createServerClient();
    
    // Check if story exists
    const { data: existing } = await supabase
      .from('funeral_stories')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const storyData = {
      user_id: auth.userId,
      atmosphere: validatedInput.atmosphere,
      music_choices: validatedInput.musicChoices || null,
      tone_theme: validatedInput.toneTheme,
      readings_scriptures: validatedInput.readingsScriptures || null,
      eulogy_notes: validatedInput.eulogyNotes,
      messages_to_audience: validatedInput.messagesToAudience,
      desired_feeling: validatedInput.desiredFeeling,
      service_structure: validatedInput.serviceStructure,
      visual_elements: validatedInput.visualElements,
      special_moments: validatedInput.specialMoments || null,
      memorial_keepsakes: validatedInput.memorialKeepsakes,
      reception_details: validatedInput.receptionDetails,
      dress_code: validatedInput.dressCode,
      photography_preferences: validatedInput.photographyPreferences,
      guest_participation: validatedInput.guestParticipation,
      ceremony_timing: validatedInput.ceremonyTiming,
      venue_preferences: validatedInput.venuePreferences,
      flower_preferences: validatedInput.flowerPreferences || null,
      color_preferences: validatedInput.colorPreferences || null,
      updated_at: new Date().toISOString(),
    };

    let data, error;
    if (existing) {
      // Update existing (preserve AI-generated content)
      const result = await supabase
        .from('funeral_stories')
        .update(storyData)
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('funeral_stories')
        .insert(storyData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
    }

    return NextResponse.json({ story: data });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Story save error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save story' }, { status: 500 });
  }
}

