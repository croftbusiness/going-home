import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import OpenAI from 'openai';

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your-') || apiKey.includes('placeholder')) {
    return null;
  }
  return new OpenAI({ apiKey });
}

const BASE_PROMPT = `You are a compassionate AI assistant helping users write their personal biography through the "StillReady" app.

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
    const { action, section, content, existingContent, answers } = body;

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        { error: 'AI service is currently unavailable. Please configure OPENAI_API_KEY in your environment variables.' },
        { status: 503 }
      );
    }

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

      case 'generate':
        const { sections, document } = body;
        
        if (document) {
          // Generate from uploaded document
          prompt = `The user has uploaded a document containing their biography. Please format and enhance it into a complete, well-written personal biography that:

- Maintains the original content and voice
- Improves clarity, flow, and structure
- Adds appropriate transitions and context where needed
- Is warm, authentic, and engaging
- Is appropriate for a personal biography that will be shared with loved ones
- Preserves all important information and details

Here is the document content:

${document}

Create a complete, polished biography from this content.`;
        } else if (sections && Object.keys(sections).length > 0) {
          // Generate from filled sections
          const sectionsText = Object.entries(sections)
            .filter(([_, value]) => value && value.trim().length > 0)
            .map(([key, value]) => {
              const sectionName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
              return `${sectionName}:\n${value}`;
            })
            .join('\n\n');
          
          if (sectionsText.length === 0) {
            return NextResponse.json({ error: 'Please fill out at least one section or upload a document' }, { status: 400 });
          }
          
          prompt = `The user has filled out sections of their biography. Based on the information provided, write a comprehensive, well-written complete biography that:

- Tells their story in a warm, authentic, and engaging way
- Weaves together all the information from different sections
- Maintains their voice and perspective
- Is well-structured and flows naturally
- Captures the essence of their experiences and memories
- Is appropriate for a personal biography that will be shared with loved ones
- Creates a cohesive narrative from the various sections

Here is the information they provided:

${sectionsText}

Write a complete, meaningful biography that incorporates all of this information into a beautiful, flowing narrative.`;
        } else if (answers && Object.keys(answers).length > 0) {
          // Legacy support for questionnaire answers
          const answersText = Object.entries(answers)
            .map(([key, value]) => {
              const question = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return `${question}:\n${value}`;
            })
            .join('\n\n');
          
          prompt = `The user has answered a questionnaire about their ${section} section. Based on their answers, write a comprehensive, well-written biography section that:

- Tells their story in a warm, authentic, and engaging way
- Weaves together all the information they provided
- Maintains their voice and perspective
- Is well-structured and flows naturally
- Captures the essence of their experiences and memories
- Is appropriate for a personal biography that will be shared with loved ones

Here are their answers:

${answersText}

Write the complete ${section} section based on these answers. Make it meaningful, personal, and well-written.`;
        } else {
          return NextResponse.json({ error: 'Please provide sections, a document, or answers' }, { status: 400 });
        }
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
    let errorMessage = 'AI service is currently unavailable';
    let statusCode = 503;
    
    if (error.message?.includes('OPENAI_API_KEY') || error.message?.includes('not configured')) {
      errorMessage = 'AI service is not configured. Please contact support or check your environment settings.';
      statusCode = 503;
    } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      errorMessage = 'AI service is temporarily busy. Please try again in a moment.';
      statusCode = 429;
    } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      errorMessage = 'AI service authentication failed. Please check your API key configuration.';
      statusCode = 401;
    } else if (error.message) {
      errorMessage = `AI service error: ${error.message}`;
      statusCode = 500;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

