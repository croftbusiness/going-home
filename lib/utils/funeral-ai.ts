/**
 * AI Utility Functions for Funeral Planning
 * Centralized OpenAI prompts and helpers for funeral features
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
 * Base system prompt for all funeral AI features
 * Ensures gentle, warm, supportive tone
 */
const BASE_FUNERAL_PROMPT = `You are a compassionate AI assistant helping users plan a meaningful life event or memorial service through the "StillReady" app.

CRITICAL TONE GUIDELINES:
- Always speak in a calm, warm, supportive tone
- Never give legal advice
- Never pressure the user
- Emphasize comfort, clarity, and emotional safety
- Produce readable, human-first language for emotional content
- Never use dark, grim, or fear-based language
- Focus on beauty, meaning, celebration of life, and love

Example tone: "Let's create something beautiful and meaningful together — something that reflects who you are and the love you've shared."

Your responses should feel like a gentle guide helping someone create something beautiful and meaningful.`;

/**
 * Generate funeral story (ceremony planning)
 */
export async function generateFuneralStory(input: {
  atmosphere?: string;
  musicChoices?: string[];
  toneTheme?: string;
  readingsScriptures?: string[];
  eulogyNotes?: string;
  messagesToAudience?: string;
  desiredFeeling?: string;
}): Promise<any> {
  const userPrompt = `Create a meaningful funeral ceremony plan based on these preferences:
${JSON.stringify(input, null, 2)}

Generate a complete ceremony plan including:
1. A warm, welcoming ceremony script
2. A beautiful memorial narrative about their life
3. Playlist suggestions with explanations
4. Slideshow caption ideas
5. A mood description that captures the desired feeling

Return as JSON with these keys: ceremonyScript, memorialNarrative, playlistSuggestions (array), slideshowCaptions (array), moodDescription.

Keep everything gentle, warm, and focused on celebrating life and love.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BASE_FUNERAL_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

/**
 * Generate moodboard and vibe guide
 */
export async function generateMoodboard(input: {
  colors?: string[];
  flowers?: string[];
  clothingPreferences?: string;
  aestheticStyle?: string;
  venueType?: string;
}): Promise<any> {
  const userPrompt = `Create a funeral moodboard and vibe guide based on:
${JSON.stringify(input, null, 2)}

Generate:
1. A written "vibe guide" describing the atmosphere
2. Décor suggestions with placement and reasoning
3. Suggested invitation wording that matches the style
4. A moodboard layout description (colors, style, atmosphere)

Return as JSON with keys: vibeGuide, decorSuggestions (array), invitationWording, moodboardLayout (object).

Keep the tone warm, beautiful, and respectful.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BASE_FUNERAL_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

/**
 * Generate eulogy drafts
 */
export async function generateEulogy(input: {
  biography?: string;
  highlights?: string[];
  faithBased?: boolean;
  desiredLength?: 'short' | 'medium' | 'long';
}): Promise<any> {
  const userPrompt = `Create a beautiful eulogy based on:
Biography: ${input.biography || 'Not provided'}
Highlights: ${input.highlights?.join(', ') || 'Not provided'}
Faith-based: ${input.faithBased ? 'Yes' : 'No'}
Desired length: ${input.desiredLength || 'medium'}

Generate:
1. A full draft eulogy
2. A shorter version (if desiredLength is long or medium)
3. Speech pacing suggestions
4. An optional faith-based variation (if requested)

Return as JSON with keys: fullDraft, shortVersion (if applicable), mediumVersion (if applicable), speechPacing, faithBasedVariation (if applicable).

Write with warmth, respect, and celebration of their life.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BASE_FUNERAL_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

/**
 * Generate ceremony script
 */
export async function generateCeremonyScript(input: {
  tone?: 'celebratory' | 'traditional' | 'spiritual' | 'casual' | 'formal';
  includePrayers?: boolean;
  includeReadings?: boolean;
  customRequests?: string;
}): Promise<any> {
  const userPrompt = `Create a complete ceremony script with:
Tone: ${input.tone || 'warm and welcoming'}
Include prayers: ${input.includePrayers ? 'Yes' : 'No'}
Include readings: ${input.includeReadings ? 'Yes' : 'No'}
Custom requests: ${input.customRequests || 'None'}

Generate:
1. Opening words
2. Closing blessing
3. Optional prayers (if requested)
4. Optional readings (if requested)
5. Transitions between sections
6. Full complete script

Return as JSON with keys: openingWords, closingBlessing, prayers (array, if applicable), readings (array, if applicable), transitions (array), fullScript.

Keep everything gentle, warm, and comforting.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BASE_FUNERAL_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

/**
 * Generate funeral letter
 */
export async function generateFuneralLetter(input: {
  letterType: 'friends' | 'spouse' | 'children' | 'everyone' | 'final_words';
  recipientDescription?: string;
  keyPoints?: string[];
  tone?: 'loving' | 'encouraging' | 'reflective' | 'grateful' | 'hopeful';
}): Promise<any> {
  const recipientMap = {
    friends: 'your friends',
    spouse: 'your spouse or partner',
    children: 'your children',
    everyone: 'everyone attending',
    final_words: 'everyone as your final words of encouragement',
  };

  const userPrompt = `Write a beautiful letter to ${recipientMap[input.letterType]} that will be read at your funeral.

Recipient details: ${input.recipientDescription || 'Not specified'}
Key points to include: ${input.keyPoints?.join(', ') || 'Express love and gratitude'}
Tone: ${input.tone || 'loving and encouraging'}

Generate a draft letter that is:
- Warm and heartfelt
- Appropriate for being read aloud
- Full of love and encouragement
- Comforting to those who will hear it

Return as JSON with keys: draft, suggestions (optional array of improvement ideas).

Write with deep warmth and care.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BASE_FUNERAL_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

/**
 * Analyze life themes from memories
 */
export async function analyzeLifeThemes(input: {
  keyMemories: string[];
  values?: string[];
  preferences?: string;
}): Promise<any> {
  const userPrompt = `Analyze these key memories and extract life themes:
Memories: ${input.keyMemories.join('\n- ')}
Values mentioned: ${input.values?.join(', ') || 'None specified'}
Preferences: ${input.preferences || 'None specified'}

Extract and return as JSON:
1. Core values (array of 5-7 values)
2. Tone themes (array of themes like "warmth", "adventure", "family")
3. Life lessons (array of lessons learned)
4. Identity motifs (array of recurring themes or patterns)
5. A theme description (2-3 sentences)

These themes will be applied to eulogy, ceremony, playlist, letters, and obituary to create consistency.

Return as JSON with keys: coreValues (array), toneThemes (array), lifeLessons (array), identityMotifs (array), themeDescription (string).

Be thoughtful and insightful.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BASE_FUNERAL_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

/**
 * Generate funeral playlists
 */
export async function generatePlaylist(input: {
  favoriteSongs?: string[];
  genres?: string[];
  mood?: string;
  era?: string;
}): Promise<any> {
  const userPrompt = `Create funeral playlists based on:
Favorite songs: ${input.favoriteSongs?.join(', ') || 'Not specified'}
Genres: ${input.genres?.join(', ') || 'Open to suggestions'}
Mood: ${input.mood || 'Reflective and celebratory'}
Era: ${input.era || 'Various'}

Generate three playlists:
1. Ceremony music (songs for during the service with timing and reasoning)
2. Slideshow songs (songs for photo slideshow with explanations)
3. Reception playlist (songs for gathering afterward)

Return as JSON with keys: ceremonyMusic (array), slideshowSongs (array), receptionPlaylist (array), explanations (string).

Include personalized explanations for why each song fits.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BASE_FUNERAL_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

/**
 * Generate slideshow organization
 */
export async function generateSlideshow(input: {
  photoIds?: string[];
  themes?: string[];
  desiredOrder?: string[];
}): Promise<any> {
  const userPrompt = `Organize a funeral slideshow:
Photos to include: ${input.photoIds?.length || 0} photos
Themes: ${input.themes?.join(', ') || 'Life journey'}
Desired order: ${input.desiredOrder?.join(', ') || 'Chronological suggested'}

Generate:
1. Photo order (suggested sequence)
2. Captions for photos (warm, meaningful)
3. Groupings (logical photo groups with themes)
4. Song matches (which songs go with which groups)

Return as JSON with keys: photoOrder (array), captions (array), groupings (array), songMatches (array).

Make it tell a beautiful story of their life.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BASE_FUNERAL_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

