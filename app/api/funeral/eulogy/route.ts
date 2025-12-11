import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateEulogy } from '@/lib/utils/funeral-ai';
import { z } from 'zod';

const eulogyInputSchema = z.object({
  biography: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  faithBased: z.boolean().optional(),
  desiredLength: z.enum(['short', 'medium', 'long']).optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validatedInput = eulogyInputSchema.parse(body);

    // Generate AI eulogy
    const aiOutput = await generateEulogy(validatedInput);

    // Note: Eulogy is typically part of funeral_stories or can be stored separately
    // For now, we'll update funeral_stories with eulogy content
    const supabase = createServerClient();
    const { error } = await supabase
      .from('funeral_stories')
      .update({
        eulogy_notes: validatedInput.biography || '',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', auth.userId);

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save eulogy' }, { status: 500 });
    }

    return NextResponse.json({ eulogy: aiOutput });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Eulogy generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate eulogy' }, { status: 500 });
  }
}




