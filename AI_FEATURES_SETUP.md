# AI Features Setup Guide

This document explains how to set up and use all AI features in the Going Home app.

## Environment Variables

Add the following to your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

You can get your OpenAI API key from: https://platform.openai.com/api-keys

**Important**: This key should only be used server-side. It's automatically protected because all AI endpoints are API routes (server-side only).

## AI Features Overview

### 1. AI-Guided Onboarding Assistant
- **Location**: `components/ai/OnboardingAssistant.tsx`
- **API**: `/api/ai/onboarding`
- **Usage**: Walks new users through setup with a conversational interface
- **Integration**: Add to welcome page or dashboard for first-time users

### 2. AI Letter Generator
- **Location**: `components/ai/AILetterGenerator.tsx`
- **API**: `/api/ai/letters`
- **Usage**: Generates personalized letters with different tones
- **Integration**: Add to letters page (`app/dashboard/letters/page.tsx`)

```tsx
import AILetterGenerator from '@/components/ai/AILetterGenerator';

// In your component:
<AILetterGenerator
  onSave={(draftText) => {
    // Save to letters table
    setFormData({ ...formData, messageText: draftText });
  }}
  onClose={() => setShowAIHelper(false)}
/>
```

### 3. Document Analyzer + Summarizer
- **Location**: `components/ai/DocumentAnalyzer.tsx`
- **API**: `/api/ai/document-summary`
- **Usage**: Analyzes uploaded documents, extracts text, summarizes
- **Integration**: Add to documents page after upload

```tsx
import DocumentAnalyzer from '@/components/ai/DocumentAnalyzer';

<DocumentAnalyzer
  documentId={document.id}
  onAnalyzeComplete={(summary) => {
    // Update document with AI insights
    console.log(summary);
  }}
/>
```

### 4. Legacy Message Coach
- **Location**: `components/ai/LegacyMessageCoach.tsx`
- **API**: `/api/ai/legacy-message`
- **Usage**: Improves legacy messages, suggests content, generates titles
- **Integration**: Add to legacy messages or letters pages

```tsx
import LegacyMessageCoach from '@/components/ai/LegacyMessageCoach';

<LegacyMessageCoach
  initialText={messageText}
  onSave={(improvedText, title) => {
    // Save improved message
    setFormData({ ...formData, messageText: improvedText, title });
  }}
/>
```

### 5. Executor/Trusted Contact Assistant
- **API**: `/api/ai/executor-guide`
- **Usage**: Provides guidance for executors when release is activated
- **Integration**: Add to executor dashboard

```tsx
const response = await fetch('/api/ai/executor-guide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, executorId }),
});
```

### 6. AI Funeral Preference Generator
- **Location**: `components/ai/FuneralPreferenceGenerator.tsx`
- **API**: `/api/ai/funeral-preferences`
- **Usage**: Generates song recommendations and atmosphere descriptions
- **Integration**: Add to funeral preferences page

```tsx
import FuneralPreferenceGenerator from '@/components/ai/FuneralPreferenceGenerator';

<FuneralPreferenceGenerator
  onApply={(preferences) => {
    // Apply to funeral preferences
    setFormData({
      ...formData,
      song1: preferences.recommendedSongs[0],
      song2: preferences.recommendedSongs[1],
      // etc.
    });
  }}
/>
```

### 7. Checklist Builder
- **Location**: `components/ai/AIChecklist.tsx`
- **API**: `/api/ai/checklist`
- **Usage**: AI-generated personalized checklist based on profile completeness
- **Integration**: Add to dashboard

```tsx
import AIChecklist from '@/components/ai/AIChecklist';

<AIChecklist />
```

## Security Considerations

1. **All AI calls are server-side**: API routes ensure API keys are never exposed to the client
2. **Authentication required**: All endpoints use `requireAuth()` to verify user identity
3. **RLS-safe**: Supabase queries respect Row Level Security policies
4. **User confirmation**: Generated content (like letters) requires user review before saving
5. **No raw storage**: AI responses are only stored after user confirmation

## API Route Structure

All AI API routes follow this pattern:

```typescript
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Validate request body
    // Call AI utility functions
    // Return structured response
  } catch (error) {
    // Handle errors gracefully
  }
}
```

## AI Utility Functions

Centralized AI functions are in `lib/utils/ai.ts`:

- `generateAIResponse()` - Basic text generation
- `generateAIJSON()` - Structured JSON responses
- `extractTextFromFile()` - OCR for images (PDF support can be added)

All functions use a consistent tone system prompt that ensures:
- Gentle and calming language
- Supportive and emotionally aware
- Non-legal-advice
- Privacy-conscious

## Cost Considerations

- **gpt-4.1-mini** (default): Lower cost, faster, good for most use cases
- **gpt-4.1** (gpt-4-turbo-preview): Higher quality, use for complex tasks

Adjust models in individual API routes based on needs.

## Testing

1. Ensure `OPENAI_API_KEY` is set in `.env.local`
2. Test each feature individually
3. Verify error handling (try with invalid inputs)
4. Check that user confirmation is required before saving AI-generated content

## Troubleshooting

**Error: "OpenAI API key not configured"**
- Check that `OPENAI_API_KEY` is in `.env.local`
- Restart your Next.js dev server after adding the key

**Error: "Failed to generate AI response"**
- Check your OpenAI account has credits
- Verify API key permissions
- Check network connectivity

**Document analysis fails**
- Ensure file is readable and not corrupted
- For images, ensure they're clear and readable
- PDF text extraction requires additional setup (currently placeholder)

## Future Enhancements

- [ ] PDF text extraction using pdf-parse or similar
- [ ] Audio/video transcription for legacy messages
- [ ] Structured output using OpenAI function calling
- [ ] Caching AI responses for common requests
- [ ] Rate limiting for AI endpoints
- [ ] User preference for AI tone/sensitivity


