import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateMoodboard } from '@/lib/utils/funeral-ai';
import { z } from 'zod';

const moodboardInputSchema = z.object({
  colors: z.array(z.string()).optional(),
  flowers: z.array(z.string()).optional(),
  clothingPreferences: z.string().optional(),
  aestheticStyle: z.string().optional(),
  venueType: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validatedInput = moodboardInputSchema.parse(body);

    // Generate AI moodboard
    const aiOutput = await generateMoodboard(validatedInput);

    // Save to database
    const supabase = createServerClient();
    
    // Check if moodboard exists
    const { data: existing } = await supabase
      .from('funeral_moodboards')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const moodboardData = {
      user_id: auth.userId,
      colors: validatedInput.colors || null,
      flowers: validatedInput.flowers || null,
      clothing_preferences: validatedInput.clothingPreferences,
      aesthetic_style: validatedInput.aestheticStyle,
      venue_type: validatedInput.venueType,
      vibe_guide: aiOutput.vibeGuide,
      decor_suggestions: aiOutput.decorSuggestions || null,
      invitation_wording: aiOutput.invitationWording,
      moodboard_layout: aiOutput.moodboardLayout || null,
      updated_at: new Date().toISOString(),
    };

    let data, error;
    if (existing) {
      const result = await supabase
        .from('funeral_moodboards')
        .update(moodboardData)
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('funeral_moodboards')
        .insert(moodboardData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save moodboard' }, { status: 500 });
    }

    return NextResponse.json({ moodboard: data, aiOutput });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Moodboard generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate moodboard' }, { status: 500 });
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
      .from('funeral_moodboards')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to load moodboard' }, { status: 500 });
    }

    return NextResponse.json({ moodboard: data });
  } catch (error: any) {
    console.error('Moodboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch moodboard' }, { status: 500 });
  }
}

