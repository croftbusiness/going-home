import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import OpenAI from 'openai';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

const BASE_PROMPT = `You are a compassionate AI assistant helping users write their personal biography through the "Going Home" app.

CRITICAL TONE GUIDELINES:
- Always speak in a calm, warm, supportive tone
- Be encouraging and helpful
- Provide thoughtful, meaningful suggestions
- Focus on preserving legacy and memories
- Never pressure the user
- Emphasize the value of their story

Your responses should feel like a gentle guide helping someone preserve their life story.`;

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { action, section, content, existingContent } = body;

    const openai = getOpenAIClient();

    let prompt = '';
    let systemPrompt = BASE_PROMPT;

    switch (action) {
      case 'suggest':
        prompt = `Generate thoughtful questions and prompts to help someone write their ${section} section of their biography. 
        Provide 5-7 specific, meaningful questions that would help them think about what to include. 
        Make the questions warm, encouraging, and easy to answer.`;
        break;

      case 'expand':
        if (!content || content.trim().length === 0) {
          return NextResponse.json({ error: 'Please write something first before expanding' }, { status: 400 });
        }
        prompt = `The user has written this for their ${section} section:
        
"${content}"

Please expand and elaborate on this content, making it more detailed and meaningful while preserving their voice and style. 
Add depth, context, and richness to help tell their story more fully. Keep it authentic and true to their original writing.`;
        break;

      case 'questions':
        prompt = `Generate 8-10 thoughtful, reflective questions to help someone think about what to include in their ${section} section. 
        The questions should be:
        - Warm and encouraging
        - Specific enough to be helpful
        - Open-ended to allow personal reflection
        - Focused on preserving meaningful memories and stories
        
        Format as a numbered list.`;
        break;

      case 'improve':
        if (!content || content.trim().length === 0) {
          return NextResponse.json({ error: 'Please write something first before improving' }, { status: 400 });
        }
        prompt = `The user has written this for their ${section} section:
        
"${content}"

Please help improve this writing by:
- Enhancing clarity and flow
- Adding more detail where appropriate
- Ensuring it captures the essence of their story
- Making it more engaging while keeping their authentic voice
- Preserving all important information they've shared

Return the improved version.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const result = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Biography AI error:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to generate AI content';
    if (error.message?.includes('OPENAI_API_KEY')) {
      errorMessage = 'AI service is not configured. Please contact support.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'AI service is temporarily busy. Please try again in a moment.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

