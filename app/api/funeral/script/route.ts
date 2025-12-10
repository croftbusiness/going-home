import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateCeremonyScript } from '@/lib/utils/funeral-ai';
import { z } from 'zod';

const scriptInputSchema = z.object({
  tone: z.enum(['celebratory', 'traditional', 'spiritual', 'casual', 'formal']).optional(),
  includePrayers: z.boolean().optional(),
  includeReadings: z.boolean().optional(),
  customRequests: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validatedInput = scriptInputSchema.parse(body);

    // Generate AI script
    const aiOutput = await generateCeremonyScript(validatedInput);

    // Save to database
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('funeral_scripts')
      .upsert({
        user_id: auth.userId,
        tone_variation: validatedInput.tone,
        opening_words: aiOutput.openingWords,
        closing_blessing: aiOutput.closingBlessing,
        prayers: aiOutput.prayers || null,
        readings: aiOutput.readings || null,
        transitions: aiOutput.transitions || null,
        full_script: aiOutput.fullScript,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save script' }, { status: 500 });
    }

    return NextResponse.json({ script: data, aiOutput });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Script generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate script' }, { status: 500 });
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
      .from('funeral_scripts')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to load script' }, { status: 500 });
    }

    return NextResponse.json({ script: data });
  } catch (error: any) {
    console.error('Script fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch script' }, { status: 500 });
  }
}

