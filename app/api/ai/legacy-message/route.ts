import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { generateAIResponse } from '@/lib/utils/ai';
import type { LegacyMessageRequest, LegacyMessageResponse } from '@/types/ai';

/**
 * Legacy Message Coach
 * 
 * Helps users improve their legacy messages (text, audio, video)
 * - Transcribes audio/video (placeholder - you'd use a transcription service)
 * - Improves wording
 * - Suggests additional content
 * - Generates titles
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body: LegacyMessageRequest = await request.json();
    const { messageText, audioUrl, videoUrl, transcript, action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (improve, suggest, or transcribe)' },
        { status: 400 }
      );
    }

    let textToWorkWith = messageText || transcript || '';

    // For transcribe action, we'd integrate with a transcription service
    // For now, we'll return an error if no transcript is provided
    if (action === 'transcribe') {
      if (audioUrl || videoUrl) {
        // Placeholder: You'd use a service like Whisper API, AssemblyAI, etc.
        return NextResponse.json(
          { error: 'Audio/Video transcription not yet implemented. Please provide transcript text.' },
          { status: 501 }
        );
      }
      return NextResponse.json(
        { error: 'Audio URL, video URL, or transcript is required for transcription' },
        { status: 400 }
      );
    }

    if (!textToWorkWith || textToWorkWith.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message text or transcript is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    const response: LegacyMessageResponse = {};

    if (action === 'improve') {
      // Improve the wording while maintaining authenticity
      const systemPrompt = `You are helping someone improve a personal legacy message to loved ones.
Keep the authentic voice and meaning, but suggest clearer, more impactful wording.
Maintain the emotional tone and personal style.
Do not change the core message or add content that wasn't there.`;

      const userPrompt = `Improve the following legacy message while keeping it authentic and personal:

"${textToWorkWith}"

Provide the improved version, keeping the same meaning and voice.`;

      response.improvedText = await generateAIResponse(
        systemPrompt,
        userPrompt,
        'gpt-4.1-mini',
        0.6
      );

      // Generate a title suggestion
      const titlePrompt = `Generate a brief, meaningful title (3-6 words) for this legacy message:

${response.improvedText?.substring(0, 300)}`;

      try {
        response.title = await generateAIResponse(
          'Generate brief, meaningful titles for personal messages.',
          titlePrompt,
          'gpt-4.1-mini',
          0.7,
          50
        ).then(title => title.replace(/["']/g, '').trim());
      } catch (error) {
        // Title is optional
        console.warn('Failed to generate title:', error);
      }
    }

    if (action === 'suggest') {
      // Suggest additional content ideas
      const systemPrompt = `You are helping someone write a legacy message.
Based on what they've written, suggest 3-5 specific topics, memories, or thoughts they might want to include.
Be gentle and supportive - these are suggestions, not requirements.`;

      const userPrompt = `The user has written this legacy message:

"${textToWorkWith}"

What else might they want to include? Suggest 3-5 specific topics, memories, or thoughts that would make this message more complete.`;

      const suggestionsText = await generateAIResponse(
        systemPrompt,
        userPrompt,
        'gpt-4.1-mini',
        0.7,
        400
      );

      response.suggestions = suggestionsText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[•\-\d+\.]\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 5);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Legacy message AI error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}




