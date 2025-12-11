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

// Define onboarding flow steps
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
    question: 'Welcome to Going Home. This is a safe space to organize your important information. Would you like a gentle walkthrough?',
    explanation: 'We\'ll help you step-by-step. You can skip any section and come back later.',
    fieldType: 'select',
    options: ['Yes, guide me', 'I\'d like to explore on my own'],
  },
  {
    id: 'personal-basics',
    section: 'personal_details',
    question: 'Let\'s start with the basics. What name would you like us to use? (Your preferred name or full legal name)',
    explanation: 'This helps us personalize your experience. You can update this anytime.',
    fieldName: 'preferred_name',
    fieldType: 'text',
  },
  {
    id: 'personal-dob',
    section: 'personal_details',
    question: 'What is your date of birth?',
    explanation: 'This helps with legal documentation and planning.',
    fieldName: 'date_of_birth',
    fieldType: 'date',
  },
  {
    id: 'personal-address',
    section: 'personal_details',
    question: 'What is your current address?',
    explanation: 'This helps with estate planning and legal matters.',
    fieldName: 'address',
    fieldType: 'text',
  },
  {
    id: 'emergency-contact',
    section: 'personal_details',
    question: 'Who should be your emergency contact? (Name and relationship)',
    explanation: 'This person can be notified in case of emergencies.',
    fieldName: 'emergency_contact_name',
    fieldType: 'text',
  },
  {
    id: 'trusted-contacts-intro',
    section: 'trusted_contacts',
    question: 'Would you like to add trusted contacts who can access your information after you pass?',
    explanation: 'These are people you trust to handle your affairs. You can add multiple contacts.',
    fieldType: 'select',
    options: ['Yes, I\'ll add some', 'Not right now'],
  },
  {
    id: 'funeral-preferences',
    section: 'funeral_preferences',
    question: 'Have you thought about funeral or memorial service preferences?',
    explanation: 'This helps your loved ones honor your wishes. You can be as detailed or brief as you like.',
    fieldType: 'select',
    options: ['Yes, I have preferences', 'Not yet, but I\'d like help', 'I\'ll skip this for now'],
  },
  {
    id: 'documents',
    section: 'documents',
    question: 'Do you have important documents to upload? (Wills, IDs, insurance policies, deeds, etc.)',
    explanation: 'Storing documents securely helps your executor when the time comes.',
    fieldType: 'select',
    options: ['Yes, I\'ll upload some', 'Not right now'],
  },
  {
    id: 'letters',
    section: 'letters',
    question: 'Would you like to write letters to loved ones? These can be shared after you pass.',
    explanation: 'Letters are a beautiful way to leave messages of love, wisdom, and closure.',
    fieldType: 'select',
    options: ['Yes, I\'d like to write some', 'Maybe later', 'Not for me'],
  },
  {
    id: 'complete',
    section: 'complete',
    question: 'You\'re all set! You can always add more information later. Is there anything else you\'d like help with?',
    explanation: 'Take your time. This is your journey, and we\'re here to support you whenever you need.',
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

      // Save the response to the appropriate table
      if (currentStepData.section === 'personal_details') {
        // Check if personal details exist
        const { data: existing } = await supabase
          .from('personal_details')
          .select('id')
          .eq('user_id', auth.userId)
          .maybeSingle();

        const updateData: any = { user_id: auth.userId };
        updateData[currentStepData.fieldName!] = userResponse;

        if (existing) {
          await supabase
            .from('personal_details')
            .update(updateData)
            .eq('user_id', auth.userId);
        } else {
          // Set required fields with defaults
          updateData.full_name = userResponse; // Fallback
          updateData.date_of_birth = '1900-01-01'; // Temporary
          updateData.address = '';
          updateData.city = '';
          updateData.state = '';
          updateData.zip_code = '';
          updateData.phone = '';
          updateData.email = '';
          updateData.emergency_contact_name = '';
          updateData.emergency_contact_phone = '';
          updateData.emergency_contact_relationship = '';

          await supabase.from('personal_details').insert(updateData);
        }
      }

      // Move to next step
      stepIndex++;
    } else if (userResponse) {
      // Non-field question - move to next based on response
      if (userResponse.toLowerCase().includes('yes') || userResponse.toLowerCase().includes('guide')) {
        stepIndex++;
      } else if (userResponse.toLowerCase().includes('skip') || userResponse.toLowerCase().includes('later')) {
        // Skip related steps
        stepIndex += 2;
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


