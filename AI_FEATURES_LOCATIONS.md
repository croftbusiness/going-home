# Where to Find AI Features in the App

## ✅ Currently Integrated Features

### 1. **AI Checklist** 
- **Location**: Main Dashboard (`/dashboard`)
- **What to look for**: A card titled "Your Suggested To-Do List" with personalized recommendations
- **Appears**: Right below the progress overview card
- **Shows**: AI-generated suggestions for completing your profile

### 2. **AI Letter Generator**
- **Location**: Letters Page (`/dashboard/letters`)
- **What to look for**: 
  - A blue button labeled "AI Generate" next to "Write Letter" button in the header
  - Click it to open the AI Letter Generator modal
- **Features**:
  - Enter recipient name and relationship
  - Choose tone (heartfelt, spiritual, humorous, legacy)
  - Add topics to include
  - Generate draft letter

## 📍 Other AI Components Available (Ready to Integrate)

These components are built and ready, but need to be added to their respective pages:

### 3. **AI Document Analyzer**
- **Component**: `components/ai/DocumentAnalyzer.tsx`
- **To integrate**: Add to `/dashboard/documents` page
- **Usage**: Shows AI analysis after uploading a document

### 4. **Legacy Message Coach**
- **Component**: `components/ai/LegacyMessageCoach.tsx`
- **To integrate**: Add to legacy messages or letters page
- **Usage**: Helps improve and enhance legacy messages

### 5. **Funeral Preference Generator**
- **Component**: `components/ai/FuneralPreferenceGenerator.tsx`
- **To integrate**: Add to `/dashboard/funeral-preferences` page
- **Usage**: Generates song recommendations and atmosphere descriptions

### 6. **Onboarding Assistant**
- **Component**: `components/ai/OnboardingAssistant.tsx`
- **To integrate**: Add to welcome page or first-time user flow
- **Usage**: Guides new users through setup

## 🚨 Troubleshooting

### Not seeing AI features?

1. **Check environment variable**:
   - Make sure `OPENAI_API_KEY` is set in `.env.local`
   - Restart your dev server after adding it

2. **Check browser console**:
   - Open browser DevTools (F12)
   - Look for any errors in the Console tab

3. **Check if components are rendering**:
   - Dashboard: Scroll down past the progress bar - you should see "Your Suggested To-Do List"
   - Letters page: Look for the blue "AI Generate" button in the header

4. **If still not visible**:
   - Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear browser cache
   - Check that you're logged in

## 🔍 Visual Indicators

**AI Checklist on Dashboard**:
- White card with rounded corners
- Title: "Your Suggested To-Do List"
- Progress bar showing completion percentage
- List of suggested tasks with priorities

**AI Generate Button on Letters Page**:
- Blue button (`bg-[#93B0C8]`)
- Sparkles icon (✨)
- Text: "AI Generate"
- Located next to the "Write Letter" button in the header






