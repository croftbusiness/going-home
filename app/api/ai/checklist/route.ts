import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateAIJSON } from '@/lib/utils/ai';
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
      supabase.from('household_information').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('digital_accounts').select('*').eq('user_id', userId),
      supabase.from('insurance_financial_contacts').select('*').eq('user_id', userId),
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

    // Use OpenAI directly with JSON mode for faster, structured responses
    const systemPrompt = `You are analyzing a user's end-of-life planning profile. Return ONLY a valid JSON array.
Each item: {"title":"max 100 chars","description":"max 200 chars","priority":"high|medium|low","category":"personal_info|documents|letters|contacts|preferences"}.
Be gentle, supportive, specific. Focus on peace of mind. Return max 8 items.`;

    const userPrompt = `User profile:
${dataSummary}

Generate actionable suggestions as JSON array only.`;

    // Update prompt to request JSON object with items array (required for JSON mode)
    const jsonSystemPrompt = `You are analyzing a user's end-of-life planning profile. Return a JSON object with an "items" array.
Each item: {"title":"max 100 chars","description":"max 200 chars","priority":"high|medium|low","category":"personal_info|documents|letters|contacts|preferences"}.
Be gentle, supportive, specific. Focus on peace of mind. Return max 8 items.
Format: {"items": [{"title":"...","description":"...","priority":"high","category":"documents"},...]}`;

    let parsedItems: any[] = [];
    
    try {
      const suggestionsData = await generateAIJSON<{ items?: any[]; suggestions?: any[] }>(
        jsonSystemPrompt,
        userPrompt,
        'gpt-4.1-mini',
        0.7
      );
      parsedItems = suggestionsData.items || suggestionsData.suggestions || [];
    } catch (e) {
      console.error('Failed to generate or parse AI JSON response:', e);
    }

    // Parse JSON response into structured items
    const items: ChecklistResponse['items'] = [];
    
    // Always generate fallback suggestions based on actual missing data
    // This ensures suggestions are shown even if AI returns empty or fails
    const fallbackItems: ChecklistResponse['items'] = [];
    
    // Check for missing data and create fallback suggestions
    if (!personalDetails.data || 
        !personalDetails.data.full_name || 
        personalDetails.data.full_name === 'User' ||
        !personalDetails.data.date_of_birth ||
        personalDetails.data.date_of_birth === '1900-01-01') {
      fallbackItems.push({
        id: 'fallback-1',
        category: 'personal_info',
        priority: 'high',
        title: 'Complete your personal details',
        description: 'Add your full name, date of birth, address, and contact information to ensure your profile is complete',
        actionUrl: '/dashboard/personal-details',
      });
    }
    
    if (!funeralPreferences.data) {
      fallbackItems.push({
        id: 'fallback-2',
        category: 'preferences',
        priority: 'medium',
        title: 'Add your funeral preferences',
        description: 'Share your wishes for services, ceremonies, and how you want to be remembered',
        actionUrl: '/dashboard/funeral-preferences',
      });
    }
    
    if (!documents.data || documents.data.length === 0) {
      fallbackItems.push({
        id: 'fallback-3',
        category: 'documents',
        priority: 'high',
        title: 'Upload important documents',
        description: 'Store wills, IDs, insurance policies, deeds, and other essential paperwork securely',
        actionUrl: '/dashboard/documents',
      });
    }
    
    if (!letters.data || letters.data.length === 0) {
      fallbackItems.push({
        id: 'fallback-4',
        category: 'letters',
        priority: 'medium',
        title: 'Write a letter to a loved one',
        description: 'Create personal messages, memories, or words of wisdom for family and friends',
        actionUrl: '/dashboard/letters',
      });
    }
    
    if (!trustedContacts.data || trustedContacts.data.length === 0) {
      fallbackItems.push({
        id: 'fallback-5',
        category: 'contacts',
        priority: 'high',
        title: 'Add trusted contacts',
        description: 'Grant access to trusted family members or friends who may need to help in the future',
        actionUrl: '/dashboard/trusted-contacts',
      });
    }
    
    if (!medicalContacts.data) {
      fallbackItems.push({
        id: 'fallback-6',
        category: 'contacts',
        priority: 'medium',
        title: 'Add medical and legal contacts',
        description: 'Store information about your physician, lawyer, and other important professionals',
        actionUrl: '/dashboard/medical-contacts',
      });
    }
    
    if (!willQuestionnaire.data) {
      fallbackItems.push({
        id: 'fallback-7',
        category: 'documents',
        priority: 'high',
        title: 'Complete your will questionnaire',
        description: 'Document your wishes for asset distribution, guardianship, and executors',
        actionUrl: '/dashboard/will-questionnaire/edit',
      });
    }
    
    if (!household.data) {
      fallbackItems.push({
        id: 'fallback-8',
        category: 'personal_info',
        priority: 'medium',
        title: 'Add household information',
        description: 'Include pet care instructions, access codes, utility accounts, and monthly bills',
        actionUrl: '/dashboard/household-information',
      });
    }

    // Process AI-generated items if available
    if (parsedItems && Array.isArray(parsedItems) && parsedItems.length > 0) {
      parsedItems.slice(0, 8).forEach((item: any, idx: number) => {
        const categoryMap: Record<string, ChecklistResponse['items'][0]['category']> = {
          'personal_info': 'personal_info',
          'documents': 'documents',
          'letters': 'letters',
          'contacts': 'contacts',
          'preferences': 'preferences',
        };
        
        const category = categoryMap[item.category] || 'personal_info';
        const priority = ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium';
        
        // Map category to action URL
        const actionUrlMap: Record<string, string> = {
          'personal_info': '/dashboard/personal-details',
          'documents': '/dashboard/documents',
          'letters': '/dashboard/letters',
          'contacts': '/dashboard/trusted-contacts',
          'preferences': '/dashboard/funeral-preferences',
        };
        
        items.push({
          id: `ai-item-${idx + 1}`,
          category,
          priority,
          title: (item.title || '').trim().substring(0, 100),
          description: (item.description || '').trim().substring(0, 200),
          actionUrl: actionUrlMap[category] || '/dashboard',
        });
      });
    }

    // Combine AI suggestions with fallback suggestions
    // Deduplicate by checking if we already have a suggestion for the same category/priority
    const existingCategories = new Set(items.map(item => `${item.category}-${item.actionUrl}`));
    
    fallbackItems.forEach(fallbackItem => {
      const key = `${fallbackItem.category}-${fallbackItem.actionUrl}`;
      if (!existingCategories.has(key)) {
        items.push(fallbackItem);
        existingCategories.add(key);
      }
    });

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

