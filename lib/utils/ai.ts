/**
 * AI Utility Functions
 * 
 * Centralized OpenAI client wrapper for all AI features in the Going Home app.
 * All functions maintain a gentle, supportive, non-legal-advice tone.
 */

import OpenAI from 'openai';

// Lazy initialization function to avoid build-time errors
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

/**
 * Base system prompt that ensures all AI outputs are:
 * - Gentle and calming
 * - Supportive and emotionally aware
 * - Non-legal-advice
 * - Privacy-conscious
 */
const BASE_SYSTEM_PROMPT = `You are a compassionate AI assistant helping users prepare for end-of-life planning through the "Going Home" app. 

Guidelines:
- Be gentle, calming, and supportive in all interactions
- Show emotional awareness and sensitivity
- Never provide legal advice - always encourage consulting qualified attorneys
- Respect privacy and confidentiality
- Use warm, understanding language
- Help users feel at peace and in control
- Focus on what brings comfort and clarity`;

/**
 * Generate AI completion with consistent tone and error handling
 */
export async function generateAIResponse(
  systemPrompt: string,
  userPrompt: string,
  model: 'gpt-4.1' | 'gpt-4.1-mini' = 'gpt-4.1-mini',
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: model === 'gpt-4.1' ? 'gpt-4-turbo-preview' : 'gpt-4o-mini', // Using available models
      messages: [
        { role: 'system', content: `${BASE_SYSTEM_PROMPT}\n\n${systemPrompt}` },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return content;
  } catch (error: any) {
    console.error('AI generation error:', error);
    throw new Error(
      error.message || 'Failed to generate AI response. Please try again.'
    );
  }
}

/**
 * Generate structured JSON response from AI
 */
export async function generateAIJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model: 'gpt-4.1' | 'gpt-4.1-mini' = 'gpt-4.1-mini',
  temperature: number = 0.7
): Promise<T> {
  const fullSystemPrompt = `${systemPrompt}\n\nRespond with valid JSON only, no additional text.`;
  
  const response = await generateAIResponse(
    fullSystemPrompt,
    userPrompt,
    model,
    temperature,
    4000
  );

  try {
    // Extract JSON from response (handle cases where AI adds markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse AI JSON response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

/**
 * Extract text from PDF/Image for document analysis
 * Note: This is a placeholder - you may want to use specialized OCR services
 * For now, we'll use OpenAI's vision API for images
 */
export async function extractTextFromFile(
  fileUrl: string,
  mimeType: string
): Promise<string> {
  // For PDFs, you'd typically use a PDF parser library
  // For images, we can use OpenAI vision API
  // This is a simplified version - you may want to enhance this
  
  if (mimeType.startsWith('image/')) {
    try {
      // Download the file
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');

      const openai = getOpenAIClient();
      const visionResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this image. Return the text exactly as it appears.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
      });

      return visionResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  // For PDFs, you'd need a PDF parsing library
  throw new Error('PDF text extraction not yet implemented. Please use images for now.');
}

