import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateAIResponse } from '@/lib/utils/ai';
import type { ExecutorGuideRequest, ExecutorGuideResponse } from '@/types/ai';

/**
 * Executor/Trusted Contact Assistant
 * 
 * Provides AI-based guidance for executors when release_settings.release_activated = true
 * - Next steps checklist
 * - Legal/financial to-dos
 * - Funeral guidance based on user preferences
 */
export async function POST(request: Request) {
  try {
    // Note: This endpoint might be called by executors, not the original user
    // You may need different auth logic here depending on your executor auth system
    const body: ExecutorGuideRequest = await request.json();
    const { userId, executorId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify release is activated
    const { data: releaseSettings } = await supabase
      .from('release_settings')
      .select('release_activated, release_activated_at')
      .eq('user_id', userId)
      .single();

    if (!releaseSettings?.release_activated) {
      return NextResponse.json(
        { error: 'Release has not been activated for this account' },
        { status: 403 }
      );
    }

    // Gather all relevant user data
    const [personalDetails, funeralPreferences, medicalContacts, trustedContacts, documents] = await Promise.all([
      supabase.from('personal_details').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('funeral_preferences').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('medical_contacts').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('trusted_contacts').select('*').eq('user_id', userId),
      supabase.from('documents').select('document_type, file_name').eq('user_id', userId),
    ]);

    const userData = {
      personalDetails: personalDetails.data,
      funeralPreferences: funeralPreferences.data,
      medicalContacts: medicalContacts.data,
      trustedContacts: trustedContacts.data || [],
      documents: documents.data || [],
    };

    // Generate executor guide with AI
    const systemPrompt = `You are helping an executor/trusted contact navigate next steps after someone's passing.
Provide clear, compassionate, and actionable guidance.
Organize tasks by priority (high, medium, low) and category (legal, financial, funeral, personal).
Be specific but not overwhelming.`;

    const dataSummary = `
Personal Details Available: ${userData.personalDetails ? 'Yes' : 'No'}
Funeral Preferences Available: ${userData.funeralPreferences ? 'Yes' : 'No'}
Medical Contacts Available: ${userData.medicalContacts ? 'Yes' : 'No'}
Number of Trusted Contacts: ${userData.trustedContacts.length}
Documents Available: ${userData.documents.length} (types: ${userData.documents.map((d: any) => d.document_type).join(', ') || 'none'})

Funeral Preferences:
${userData.funeralPreferences ? JSON.stringify(userData.funeralPreferences, null, 2) : 'Not specified'}
`;

    const userPrompt = `Based on the available information, create a comprehensive executor guide with:
1. A prioritized checklist of next steps
2. Specific tasks organized by category (legal, financial, funeral, personal)
3. Funeral guidance based on the preferences (if available)
4. Recommended songs for the service (if preferences exist)
5. A draft obituary (if enough information is available)

User Data Summary:
${dataSummary}`;

    const guideText = await generateAIResponse(
      systemPrompt,
      userPrompt,
      'gpt-4.1-mini',
      0.5,
      3000
    );

    // Parse the AI response into structured format
    // This is a simplified parser - you might want to use structured output
    const nextSteps: ExecutorGuideResponse['nextSteps'] = [];
    const checklist: string[] = [];

    // Extract tasks from the response
    const taskMatches = guideText.matchAll(/(?:high|medium|low) priority[:\-]?\s*(.+?)(?=\n\n|$)/gi);
    for (const match of taskMatches) {
      checklist.push(match[1].trim());
    }

    // Fallback: Split by lines if structure parsing fails
    if (checklist.length === 0) {
      const lines = guideText.split('\n').filter(l => l.trim().length > 20);
      checklist.push(...lines.slice(0, 15));
    }

    // Build structured response
    const response: ExecutorGuideResponse = {
      nextSteps: [
        {
          priority: 'high',
          title: 'Immediate Legal Tasks',
          description: 'Contact attorney, locate will, notify court',
          category: 'legal',
        },
        {
          priority: 'high',
          title: 'Funeral Arrangements',
          description: guideText.includes('funeral') ? 'Follow funeral preferences' : 'Make initial arrangements',
          category: 'funeral',
        },
        {
          priority: 'medium',
          title: 'Financial Matters',
          description: 'Notify banks, review accounts, cancel subscriptions',
          category: 'financial',
        },
        {
          priority: 'medium',
          title: 'Notify Trusted Contacts',
          description: `Notify ${userData.trustedContacts.length} trusted contact(s)`,
          category: 'personal',
        },
      ],
      funeralGuidance: userData.funeralPreferences ? {
        atmosphereDescription: guideText.match(/atmosphere[:\-]?\s*(.+?)(?=\n\n|$)/i)?.[1]?.trim() || 'Follow the specified preferences',
      } : undefined,
      checklist,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Executor guide error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate executor guide' },
      { status: 500 }
    );
  }
}







