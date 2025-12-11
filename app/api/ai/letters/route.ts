import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateAIResponse } from '@/lib/utils/ai';
import type { AILetterRequest, AILetterResponse } from '@/types/ai';

/**
 * AI Letter Generator
 * 
 * Generates personalized letters to loved ones with various tones.
 * User must confirm before saving - this endpoint only generates drafts.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body: AILetterRequest = await request.json();

    if (!body.recipientName || !body.relationship || !body.tone) {
      return NextResponse.json(
        { error: 'Recipient name, relationship, and tone are required' },
        { status: 400 }
      );
    }

    // Get user's personal details for context (optional, makes letter more personal)
    const supabase = createServerClient();
    const { data: personalDetails } = await supabase
      .from('personal_details')
      .select('preferred_name, full_name')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const userName = personalDetails?.preferred_name || personalDetails?.full_name || 'you';

    // Build the prompt
    const topicsText = body.topics && body.topics.length > 0
      ? `Topics to include: ${body.topics.join(', ')}`
      : 'Cover meaningful topics that would bring comfort and closure.';

    const toneDescriptions = {
      heartfelt: 'warm, emotional, and deeply personal',
      spiritual: 'reflective, meaningful, and connected to faith or life philosophy',
      humorous: 'light-hearted, with fond memories and gentle humor',
      legacy: 'thoughtful, sharing wisdom, values, and life lessons',
    };

    const systemPrompt = `You are helping someone write a ${body.tone} letter to their ${body.relationship}. 
The letter should be ${toneDescriptions[body.tone]}.
Keep it authentic, personal, and appropriate for the relationship.
Length should be meaningful but not overwhelming (300-500 words).`;

    const userPrompt = `Write a ${body.tone} letter from ${userName} to ${body.recipientName}, their ${body.relationship}.

${topicsText}

Make it feel genuine and from the heart. Include specific memories or feelings that would be meaningful.`;

    // Generate the letter
    const draftText = await generateAIResponse(
      systemPrompt,
      userPrompt,
      'gpt-4.1-mini',
      0.8 // Higher temperature for more creativity
    );

    // Generate suggestions for improvement (optional)
    const suggestionsPrompt = `The following letter was generated. Provide 2-3 brief suggestions for making it more personal or meaningful:

${draftText.substring(0, 500)}...`;

    let suggestions: string[] = [];
    try {
      const suggestionsText = await generateAIResponse(
        'Provide 2-3 brief, actionable suggestions for improving a letter.',
        suggestionsPrompt,
        'gpt-4.1-mini',
        0.7,
        300
      );
      suggestions = suggestionsText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 3);
    } catch (error) {
      // Suggestions are optional, continue without them
      console.warn('Failed to generate suggestions:', error);
    }

    const response: AILetterResponse = {
      draftText,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('AI letter generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate letter' },
      { status: 500 }
    );
  }
}


