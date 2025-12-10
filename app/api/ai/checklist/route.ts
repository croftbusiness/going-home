import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateAIResponse } from '@/lib/utils/ai';
import type { ChecklistRequest, ChecklistResponse } from '@/types/ai';

/**
 * AI Checklist Builder
 * 
 * Analyzes all user data and recommends:
 * - Missing uploads
 * - Missing personal info
 * - Reminders
 * - Suggested letters to write
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body: ChecklistRequest = await request.json();
    const userId = body.userId || auth.userId;

    const supabase = createServerClient();

    // Gather all user data to analyze completeness
    const [
      personalDetails,
      medicalContacts,
      funeralPreferences,
      trustedContacts,
      documents,
      letters,
      willQuestionnaire,
      household,
      assets,
      digitalAccounts,
      insuranceFinancial,
    ] = await Promise.all([
      supabase.from('personal_details').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('medical_contacts').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('funeral_preferences').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('trusted_contacts').select('*').eq('user_id', userId),
      supabase.from('documents').select('*').eq('user_id', userId),
      supabase.from('letters').select('*').eq('user_id', userId),
      supabase.from('will_questionnaires').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('household').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('digital_accounts').select('*').eq('user_id', userId),
      supabase.from('insurance_financial').select('*').eq('user_id', userId),
    ]);

    // Build data summary for AI analysis
    const dataSummary = `
Personal Details: ${personalDetails.data ? 'Complete' : 'Missing'}
Medical Contacts: ${medicalContacts.data ? 'Complete' : 'Missing'}
Funeral Preferences: ${funeralPreferences.data ? 'Complete' : 'Missing'}
Trusted Contacts: ${trustedContacts.data?.length || 0}
Documents: ${documents.data?.length || 0} (types: ${documents.data?.map((d: any) => d.document_type).join(', ') || 'none'})
Letters: ${letters.data?.length || 0}
Will Questionnaire: ${willQuestionnaire.data ? 'Complete' : 'Missing'}
Household Info: ${household.data ? 'Complete' : 'Missing'}
Assets: ${assets.data?.length || 0}
Digital Accounts: ${digitalAccounts.data?.length || 0}
Insurance/Financial: ${insuranceFinancial.data?.length || 0}
`;

    const systemPrompt = `You are analyzing a user's end-of-life planning profile to suggest what they might want to add or complete.
Be gentle, supportive, and specific. Focus on what would bring peace of mind, not what's required.
Prioritize by importance and emotional value.`;

    const userPrompt = `Based on this user's profile completeness, suggest:
1. Missing information they might want to add (prioritize high/medium/low)
2. Documents they might want to upload
3. Letters they might want to write to loved ones
4. Other reminders or suggestions

Current Profile:
${dataSummary}

Provide specific, actionable suggestions organized by category (personal_info, documents, letters, contacts, preferences).
For each suggestion, indicate priority (high/medium/low) and why it might be helpful.`;

    const suggestionsText = await generateAIResponse(
      systemPrompt,
      userPrompt,
      'gpt-4.1-mini',
      0.6,
      2500
    );

    // Parse suggestions into structured format
    const items: ChecklistResponse['items'] = [];
    
    // Extract items from response
    const categoryMatches = suggestionsText.matchAll(
      /(?:personal_info|documents|letters|contacts|preferences)[:\-]?\s*((?:.+\n)+?)(?=\n\n|personal_info|documents|letters|contacts|preferences|$)/gi
    );

    let itemId = 1;
    const categories: Record<string, ChecklistResponse['items'][0]['category']> = {
      'personal_info': 'personal_info',
      'documents': 'documents',
      'letters': 'letters',
      'contacts': 'contacts',
      'preferences': 'personal_info',
    };

    for (const match of categoryMatches) {
      const categoryText = match[0].split(/[:\-]/)[0].toLowerCase().replace(/s$/, '');
      const category = categories[categoryText] || 'personal_info';
      const content = match[1];

      // Extract individual items with priorities
      const itemMatches = content.matchAll(/(?:high|medium|low) priority[:\-]?\s*(.+?)(?=\n\n|\n(?:high|medium|low)|$)/gi);
      
      for (const itemMatch of itemMatches) {
        const priorityText = itemMatch[0].split(/[:\-]/)[0].toLowerCase().trim();
        const priority = (priorityText === 'high' || priorityText === 'medium' || priorityText === 'low')
          ? priorityText
          : 'medium';
        
        const description = itemMatch[1].trim();
        const titleMatch = description.match(/^(.+?)[:\-]/);
        const title = titleMatch ? titleMatch[1].trim() : description.substring(0, 60);
        const desc = titleMatch ? description.substring(titleMatch[0].length).trim() : '';

        items.push({
          id: `item-${itemId++}`,
          category,
          priority,
          title: title.length > 80 ? title.substring(0, 77) + '...' : title,
          description: desc || description,
        });
      }
    }

    // Fallback: parse as simple list if structured parsing fails
    if (items.length === 0) {
      const lines = suggestionsText
        .split('\n')
        .filter(line => line.trim().length > 15 && !line.toLowerCase().includes('category'))
        .slice(0, 10);

      lines.forEach((line, idx) => {
        const priority = idx < 3 ? 'high' : idx < 6 ? 'medium' : 'low';
        const title = line.replace(/^[•\-\d+\.]\s*/, '').trim();
        items.push({
          id: `item-${idx + 1}`,
          category: 'personal_info',
          priority,
          title: title.length > 80 ? title.substring(0, 77) + '...' : title,
          description: '',
        });
      });
    }

    // Calculate completion percentage (rough estimate)
    const totalSections = 11;
    let completedSections = 0;
    if (personalDetails.data) completedSections++;
    if (medicalContacts.data) completedSections++;
    if (funeralPreferences.data) completedSections++;
    if (trustedContacts.data && trustedContacts.data.length > 0) completedSections++;
    if (documents.data && documents.data.length > 0) completedSections++;
    if (letters.data && letters.data.length > 0) completedSections++;
    if (willQuestionnaire.data) completedSections++;
    if (household.data) completedSections++;
    if (assets.data && assets.data.length > 0) completedSections++;
    if (digitalAccounts.data && digitalAccounts.data.length > 0) completedSections++;
    if (insuranceFinancial.data && insuranceFinancial.data.length > 0) completedSections++;

    const completionPercentage = Math.round((completedSections / totalSections) * 100);

    const response: ChecklistResponse = {
      items: items.slice(0, 15), // Limit to 15 items
      completionPercentage,
      suggestions: items
        .filter(item => item.priority === 'high')
        .slice(0, 3)
        .map(item => item.title),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Checklist generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate checklist' },
      { status: 500 }
    );
  }
}

