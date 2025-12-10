import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { analyzeLifeThemes } from '@/lib/utils/funeral-ai';
import { z } from 'zod';

const themeInputSchema = z.object({
  keyMemories: z.array(z.string()).min(1, 'At least one memory is required'),
  values: z.array(z.string()).optional(),
  preferences: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validatedInput = themeInputSchema.parse(body);

    // Generate AI theme analysis
    const aiOutput = await analyzeLifeThemes(validatedInput);

    // Save to database
    const supabase = createServerClient();
    
    // Check if themes exist
    const { data: existing } = await supabase
      .from('life_themes')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const themeData = {
      user_id: auth.userId,
      key_memories: validatedInput.keyMemories,
      core_values: aiOutput.coreValues || null,
      tone_themes: aiOutput.toneThemes || null,
      life_lessons: aiOutput.lifeLessons || null,
      identity_motifs: aiOutput.identityMotifs || null,
      updated_at: new Date().toISOString(),
    };

    let data, error;
    if (existing) {
      const result = await supabase
        .from('life_themes')
        .update(themeData)
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('life_themes')
        .insert(themeData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save themes' }, { status: 500 });
    }

    return NextResponse.json({ themes: data, analysis: aiOutput });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Theme analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze themes' }, { status: 500 });
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
      .from('life_themes')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to load themes' }, { status: 500 });
    }

    return NextResponse.json({ themes: data });
  } catch (error: any) {
    console.error('Theme fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

