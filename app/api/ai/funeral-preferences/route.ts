import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateAIResponse } from '@/lib/utils/ai';
import type { FuneralPreferenceRequest, FuneralPreferenceResponse } from '@/types/ai';

/**
 * AI Funeral Preference Generator
 * 
 * Generates funeral preferences based on user inputs:
 * - Recommended songs
 * - Atmosphere description
 * - Optional obituary draft
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body: FuneralPreferenceRequest = await request.json();
    const { tone, musicPreferences, culturalBackground, existingPreferences } = body;

    // Get user's existing preferences if not provided
    const supabase = createServerClient();
    let existingPrefs = existingPreferences;

    if (!existingPrefs) {
      const { data: prefs } = await supabase
        .from('funeral_preferences')
        .select('*')
        .eq('user_id', auth.userId)
        .maybeSingle();
      existingPrefs = prefs;
    }

    // Get personal details for context
    const { data: personalDetails } = await supabase
      .from('personal_details')
      .select('full_name, preferred_name, date_of_birth')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const systemPrompt = `You are helping someone plan their funeral preferences in a gentle, supportive way.
Suggest songs, describe atmosphere, and optionally draft an obituary.
Be respectful, culturally sensitive, and honor the person's wishes.`;

    const toneDescriptions: Record<string, string> = {
      celebration: 'joyful celebration of life with uplifting music and memories',
      spiritual: 'spiritual or religious service with meaningful hymns and readings',
      military: 'military honors and traditional patriotic elements',
      quiet: 'intimate, peaceful gathering with gentle music',
    };

    const toneDescription = tone && toneDescriptions[tone]
      ? toneDescriptions[tone]
      : 'meaningful and personal';

    const userPrompt = `Generate funeral preference recommendations for someone planning their service.

Tone: ${tone || 'not specified'} (${toneDescription})
${musicPreferences ? `Music Preferences: ${musicPreferences.join(', ')}` : ''}
${culturalBackground ? `Cultural Background: ${culturalBackground}` : ''}
${existingPreferences ? `Existing Preferences: ${JSON.stringify(existingPreferences)}` : ''}
${personalDetails ? `Name: ${personalDetails.preferred_name || personalDetails.full_name}` : ''}

Please provide:
1. 5-8 recommended songs appropriate for this type of service
2. A description of the atmosphere (2-3 sentences)
3. A brief obituary draft (3-4 paragraphs, if enough information is available)
4. Additional suggestions for making the service meaningful

Format your response clearly with sections.`;

    const responseText = await generateAIResponse(
      systemPrompt,
      userPrompt,
      'gpt-4.1-mini',
      0.7,
      2000
    );

    // Parse the response
    const songsMatch = responseText.match(/(?:recommended songs|songs)[:\-]?\s*((?:.+\n)+?)(?=\n\n|atmosphere|description|obituary|suggestions|$)/is);
    const atmosphereMatch = responseText.match(/(?:atmosphere|description)[:\-]?\s*(.+?)(?=\n\n|obituary|suggestions|$)/is);
    const obituaryMatch = responseText.match(/(?:obituary)[:\-]?\s*(.+?)(?=\n\n|suggestions|$)/is);
    const suggestionsMatch = responseText.match(/(?:suggestions|additional)[:\-]?\s*(.+?)(?=$)/is);

    // Extract songs
    const recommendedSongs: string[] = [];
    if (songsMatch) {
      const songsText = songsMatch[1];
      recommendedSongs.push(
        ...songsText
          .split('\n')
          .map(line => line.replace(/^[•\-\d+\.]\s*["']?/g, '').replace(/["']\s*$/g, '').trim())
          .filter(line => line.length > 5 && !line.toLowerCase().includes('recommended'))
          .slice(0, 8)
      );
    }

    // Fallback: try to extract from numbered list
    if (recommendedSongs.length === 0) {
      const numberedSongs = responseText.matchAll(/\d+[\.\)]\s*["']?([^"\n]+)["']?\s*\n/g);
      for (const match of numberedSongs) {
        if (recommendedSongs.length < 8) {
          recommendedSongs.push(match[1].trim());
        }
      }
    }

    const response: FuneralPreferenceResponse = {
      recommendedSongs: recommendedSongs.length > 0 ? recommendedSongs : [
        'Amazing Grace',
        'Somewhere Over the Rainbow',
        'Hallelujah',
        'What a Wonderful World',
        'Time to Say Goodbye',
      ],
      atmosphereDescription: atmosphereMatch?.[1]?.trim() || 'A meaningful service that honors the life and memory',
      obituaryDraft: obituaryMatch?.[1]?.trim() || undefined,
      suggestions: suggestionsMatch?.[1]
        ?.split('\n')
        .map(line => line.replace(/^[•\-\d+\.]\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 5) || [],
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Funeral preference generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate funeral preferences' },
      { status: 500 }
    );
  }
}


