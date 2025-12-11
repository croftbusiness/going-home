import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { generateAIResponse } from '@/lib/utils/ai';
import type { OnboardingConversationRequest, OnboardingResponse } from '@/types/ai';

/**
 * AI-Guided Onboarding Assistant
 * 
 * Conversational assistant that walks users through setup,
 * explains each section, and helps them complete their profile.
 */

// Simplified onboarding flow - just 3 simple questions
const ONBOARDING_STEPS: Array<{
  id: string;
  section: string;
  question: string;
  explanation: string;
  fieldName?: string;
  fieldType?: 'text' | 'select' | 'textarea' | 'date';
  options?: string[];
}> = [
  {
    id: 'welcome',
    section: 'welcome',
    question: 'Welcome to Going Home! This is your secure space to organize what matters most. Ready to get started?',
    explanation: 'We\'ll help you step-by-step. You can skip any section and come back later.',
    fieldType: 'select',
    options: ['Yes, let\'s begin', 'I\'ll explore on my own'],
  },
  {
    id: 'trusted-contact',
    section: 'trusted_contacts',
    question: 'Who should be your primary trusted contact? (This person can access your information when needed)',
    explanation: 'This is someone you trust to handle your affairs. You can add more contacts later.',
    fieldName: 'primary_contact_name',
    fieldType: 'text',
  },
  {
    id: 'complete',
    section: 'complete',
    question: 'Perfect! You\'re all set to start organizing your information.',
    explanation: 'Take your time exploring the dashboard. You can add information at your own pace.',
  },
];

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body: OnboardingConversationRequest = await request.json();
    const { currentStep, userResponse, section } = body;

    // Determine current step
    let stepIndex = 0;
    if (currentStep) {
      const foundIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStep);
      if (foundIndex >= 0) {
        stepIndex = foundIndex;
      }
    }

    const currentStepData = ONBOARDING_STEPS[stepIndex];

    // If user provided a response, process it
    if (userResponse && currentStepData.fieldName) {
      const supabase = createServerClient();

      // Save the response to trusted contacts if it's the primary contact
      if (currentStepData.section === 'trusted_contacts' && currentStepData.fieldName === 'primary_contact_name') {
        // Check if trusted contact exists
        const { data: existing } = await supabase
          .from('trusted_contacts')
          .select('id')
          .eq('user_id', auth.userId)
          .eq('is_primary', true)
          .maybeSingle();

        const contactData: any = {
          user_id: auth.userId,
          name: userResponse,
          is_primary: true,
          relationship: 'Primary Contact',
        };

        if (existing) {
          await supabase
            .from('trusted_contacts')
            .update(contactData)
            .eq('id', existing.id);
        } else {
          await supabase.from('trusted_contacts').insert(contactData);
        }
      }

      // Move to next step
      stepIndex++;
    } else if (userResponse) {
      // Non-field question - move to next based on response
      if (userResponse.toLowerCase().includes('yes') || userResponse.toLowerCase().includes('begin') || userResponse.toLowerCase().includes('let\'s')) {
        stepIndex++;
      } else if (userResponse.toLowerCase().includes('explore') || userResponse.toLowerCase().includes('own')) {
        // Skip to complete
        stepIndex = ONBOARDING_STEPS.length - 1;
      } else {
        stepIndex++;
      }
    }

    // Get next step
    const nextStep = ONBOARDING_STEPS[stepIndex] || ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
    const isComplete = stepIndex >= ONBOARDING_STEPS.length - 1;

    // Generate AI explanation/suggestions for the current step
    let suggestedValue: string | undefined;
    let explanation: string | undefined;

    if (!isComplete && userResponse) {
      // Generate helpful explanation or suggestion
      try {
        const suggestionPrompt = `The user is filling out their end-of-life planning profile.
Current question: "${nextStep.question}"
User's previous response: "${userResponse}"

Provide a brief, gentle suggestion or encouragement (1-2 sentences) to help them continue.
Be supportive and calm.`;

        explanation = await generateAIResponse(
          'You are a gentle, supportive onboarding assistant.',
          suggestionPrompt,
          'gpt-4.1-mini',
          0.7,
          150
        );
      } catch (error) {
        // Use default explanation if AI fails
        explanation = nextStep.explanation;
      }
    }

    const response: OnboardingResponse = {
      currentStep: {
        id: nextStep.id,
        section: nextStep.section,
        question: nextStep.question,
        explanation: explanation || nextStep.explanation,
        fieldName: nextStep.fieldName,
        fieldType: nextStep.fieldType,
        options: nextStep.options,
      },
      progress: Math.round(((stepIndex + 1) / ONBOARDING_STEPS.length) * 100),
      completed: isComplete,
      suggestedValue,
      explanation,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Onboarding assistant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process onboarding step' },
      { status: 500 }
    );
  }
}



