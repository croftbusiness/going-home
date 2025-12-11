/**
 * AI Feature Types
 */

export interface AILetterRequest {
  recipientName: string;
  relationship: string;
  tone: 'heartfelt' | 'spiritual' | 'humorous' | 'legacy';
  topics: string[];
  userId?: string; // For context
}

export interface AILetterResponse {
  draftText: string;
  suggestions?: string[];
}

export interface DocumentSummary {
  extractedText: string;
  summary: string;
  documentType?: string;
  suggestedTags: string[];
  missingInformation: string[];
  keyPoints: string[];
}

export interface LegacyMessageRequest {
  messageText?: string;
  audioUrl?: string;
  videoUrl?: string;
  transcript?: string;
  action: 'improve' | 'suggest' | 'transcribe';
}

export interface LegacyMessageResponse {
  improvedText?: string;
  suggestions?: string[];
  transcript?: string;
  title?: string;
}

export interface ExecutorGuideRequest {
  userId: string; // User who has passed away
  executorId: string; // Executor requesting guidance
}

export interface ExecutorGuideResponse {
  nextSteps: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    category: 'legal' | 'financial' | 'funeral' | 'personal';
  }>;
  funeralGuidance?: {
    recommendedSongs?: string[];
    atmosphereDescription?: string;
    obituaryDraft?: string;
  };
  checklist: string[];
}

export interface FuneralPreferenceRequest {
  tone?: 'celebration' | 'spiritual' | 'military' | 'quiet';
  musicPreferences?: string[];
  culturalBackground?: string;
  existingPreferences?: any;
}

export interface FuneralPreferenceResponse {
  recommendedSongs: string[];
  atmosphereDescription: string;
  obituaryDraft?: string;
  suggestions: string[];
}

export interface ChecklistRequest {
  userId: string;
}

export interface ChecklistItem {
  id: string;
  category: 'personal_info' | 'documents' | 'letters' | 'contacts' | 'preferences';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionUrl?: string;
}

export interface ChecklistResponse {
  items: ChecklistItem[];
  completionPercentage: number;
  suggestions: string[];
}

export interface OnboardingStep {
  id: string;
  section: string;
  question: string;
  explanation?: string;
  fieldName?: string;
  fieldType?: 'text' | 'select' | 'textarea' | 'date';
  options?: string[];
}

export interface OnboardingResponse {
  currentStep: OnboardingStep;
  progress: number;
  completed: boolean;
  suggestedValue?: string;
  explanation?: string;
}

export interface OnboardingConversationRequest {
  userId: string;
  currentStep?: string;
  userResponse?: string;
  section?: string;
}



