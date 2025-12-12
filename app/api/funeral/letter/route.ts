import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateFuneralLetter } from '@/lib/utils/funeral-ai';
import { z } from 'zod';

const letterInputSchema = z.object({
  letterType: z.enum(['friends', 'spouse', 'children', 'everyone', 'final_words']),
  recipientDescription: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
  tone: z.enum(['loving', 'encouraging', 'reflective', 'grateful', 'hopeful']).optional(),
  id: z.string().optional(), // For updating existing letters
});

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validatedInput = letterInputSchema.parse(body);

    // Generate AI letter
    const aiOutput = await generateFuneralLetter(validatedInput);

    // Save to database
    const supabase = createServerClient();
    const letterData: any = {
      user_id: auth.userId,
      letter_type: validatedInput.letterType,
      recipient_description: validatedInput.recipientDescription,
      draft_content: aiOutput.draft,
      ai_suggestions: JSON.stringify(aiOutput.suggestions || []),
      updated_at: new Date().toISOString(),
    };

    let data;
    if (validatedInput.id) {
      // Update existing
      const { data: updated, error } = await supabase
        .from('funeral_letters')
        .update(letterData)
        .eq('id', validatedInput.id)
        .eq('user_id', auth.userId)
        .select()
        .single();
      
      if (error) throw error;
      data = updated;
    } else {
      // Create new
      const { data: created, error } = await supabase
        .from('funeral_letters')
        .insert(letterData)
        .select()
        .single();
      
      if (error) throw error;
      data = created;
    }

    return NextResponse.json({ letter: data, aiOutput });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Letter generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate letter' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const supabase = createServerClient();
    
    if (id) {
      // Get specific letter
      const { data, error } = await supabase
        .from('funeral_letters')
        .select('*')
        .eq('id', id)
        .eq('user_id', auth.userId)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: 'Failed to load letter' }, { status: 500 });
      }

      return NextResponse.json({ letter: data });
    } else {
      // Get all letters
      const { data, error } = await supabase
        .from('funeral_letters')
        .select('*')
        .eq('user_id', auth.userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: 'Failed to load letters' }, { status: 500 });
      }

      return NextResponse.json({ letters: data });
    }
  } catch (error: any) {
    console.error('Letter fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch letter' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, finalContent } = body;

    if (!id || !finalContent) {
      return NextResponse.json({ error: 'ID and final content required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('funeral_letters')
      .update({
        final_content: finalContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update letter' }, { status: 500 });
    }

    return NextResponse.json({ letter: data });
  } catch (error: any) {
    console.error('Letter update error:', error);
    return NextResponse.json({ error: 'Failed to update letter' }, { status: 500 });
  }
}






