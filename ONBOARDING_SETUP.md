# Onboarding System Setup

## Overview
A fun animated onboarding experience that guides new users through an intro animation and questionnaire before they reach the dashboard.

## Features Implemented

### 1. Animated Intro Screen
- Beautiful animated heart icon with sparkles
- Smooth fade-in transitions
- Welcome message with staggered animations
- Gradient backgrounds matching app theme

### 2. Onboarding Questionnaire
- Preferred name
- Family status (with/without family)
- Children status (if applicable)
- Primary goal selection
- Emergency contact information (name, phone, relationship)

### 3. Database Changes
- Added `onboarding_complete` field to `users` table
- Indexed for performance

### 4. API Routes
- `/api/user/onboarding` - POST to save questionnaire responses
- `/api/user/onboarding/complete` - POST to mark onboarding complete, GET to check status

### 5. Routing Logic
- Dashboard checks onboarding status on load
- Login checks onboarding status
- Signup always redirects to onboarding
- OAuth callback checks onboarding status
- Once complete, users skip onboarding on future logins

## Setup Instructions

### 1. Run Database Migration
Run the SQL migration in Supabase SQL Editor:
```sql
-- File: supabase/add_onboarding_field.sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_onboarding_complete ON users(onboarding_complete);
```

### 2. Files Created
- `app/onboarding/page.tsx` - Main onboarding page with intro and questionnaire
- `app/api/user/onboarding/route.ts` - Save questionnaire data
- `app/api/user/onboarding/complete/route.ts` - Mark onboarding complete
- `supabase/add_onboarding_field.sql` - Database migration
- `app/globals.css` - Added fadeIn animation

### 3. Files Modified
- `app/dashboard/page.tsx` - Added onboarding check
- `app/auth/login/page.tsx` - Added onboarding check
- `app/auth/signup/page.tsx` - Always redirect to onboarding
- `app/auth/callback/route.ts` - Added onboarding check for OAuth

## User Flow

1. **New User Signs Up/Logs In**
   - Redirected to `/onboarding`

2. **Animated Intro**
   - Sees welcome animation
   - Clicks "Let's Get Started"

3. **Questionnaire**
   - Answers basic questions
   - Fills in emergency contact
   - Submits form

4. **Completion**
   - Sees success message
   - Automatically redirected to dashboard

5. **Future Logins**
   - Skips onboarding (onboarding_complete = true)
   - Goes directly to dashboard

## Questionnaire Data Saved
The questionnaire responses are saved to:
- `personal_details.preferred_name`
- `personal_details.emergency_contact_name`
- `personal_details.emergency_contact_phone`
- `personal_details.emergency_contact_relationship`

Note: Other personal_details fields are set to placeholders that users can update later.

## Customization
You can easily customize:
- Intro animation timing (in `useEffect` hooks)
- Questionnaire questions (add/remove fields)
- Questionnaire styling (gradient colors, spacing)
- Success message text

## Testing
1. Create a new account
2. Should see animated intro
3. Complete questionnaire
4. Should redirect to dashboard
5. Log out and log back in
6. Should skip onboarding and go directly to dashboard







