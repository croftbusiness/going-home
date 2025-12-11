# Will Questionnaire Module - Setup Instructions

This document explains how to set up and deploy the Will Questionnaire feature.

## 📁 File Locations

### 1. Database Schema
**File**: `supabase_complete_master_schema.sql`
- Already updated with the `will_questionnaires` table
- Includes RLS policies
- Run this SQL file in your Supabase SQL Editor

### 2. API Routes
**Files**:
- `app/api/user/will-questionnaire/route.ts` - CRUD operations (GET, POST)
- `app/api/export-will-questionnaire/route.ts` - Proxy to Edge Function for PDF export

### 3. Client Functions
**File**: `lib/api/willQuestionnaire.ts`
- `createWillQuestionnaire(data)` - Create new questionnaire
- `getWillQuestionnaire()` - Get user's questionnaire
- `updateWillQuestionnaire(id, data)` - Update existing questionnaire
- `exportWillQuestionnaire(id)` - Export PDF

### 4. Dashboard Pages
**Files**:
- `app/dashboard/will-questionnaire/page.tsx` - Index/list view
- `app/dashboard/will-questionnaire/edit/page.tsx` - Multi-step form editor

### 5. Edge Function
**File**: `supabase/functions/export-will-questionnaire/index.ts`
- Generates PDF from questionnaire data
- Uses pdf-lib for PDF creation

## 🚀 Setup Steps

### Step 1: Run Database Schema
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the updated `supabase_complete_master_schema.sql` file
3. Click "Run"
4. Verify the `will_questionnaires` table was created

### Step 2: Deploy Edge Function
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy export-will-questionnaire
```

Alternatively, deploy via Supabase Dashboard:
1. Go to Edge Functions
2. Create new function: `export-will-questionnaire`
3. Copy the code from `supabase/functions/export-will-questionnaire/index.ts`
4. Deploy

### Step 3: Verify Environment Variables
Make sure these are set in your `.env.local` and Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for Edge Function)

### Step 4: Test the Module
1. Start your Next.js dev server: `npm run dev`
2. Navigate to `/dashboard/will-questionnaire`
3. Click "Start Questionnaire"
4. Fill out the form steps
5. Save and test PDF export

## 📋 Form Steps Overview

The multi-step form includes:
1. **Personal Information** - Name, DOB, address, marital status
2. **Executor** - Primary and backup executor details
3. **Guardianship** - Guardian information for children
4. **Bequests** - Specific gifts, residual estate, charitable giving
5. **Digital Assets** - Social media, email accounts, instructions
6. **Additional Notes** - Free text field
7. **Review** - Summary of all answers
8. **Save & Export** - Final step to save and download PDF

## 🔒 Security

- RLS policies ensure users can only access their own questionnaires
- Authentication required for all API routes
- Edge Function validates user ownership before generating PDF

## ⚠️ Legal Disclaimer

The disclaimer is displayed:
- At the top of the dashboard index page
- At the top of the edit form
- On every exported PDF

**Important**: This is a planning tool only. It does NOT create legally binding documents.

## 🐛 Troubleshooting

### PDF Export Not Working
1. Check Edge Function is deployed: `supabase functions list`
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Verify Supabase service role key has correct permissions

### Form Not Saving
1. Check API route is accessible: `/api/user/will-questionnaire`
2. Verify RLS policies are correctly set
3. Check browser network tab for error responses

### Edge Function Errors
1. Check function logs: `supabase functions logs export-will-questionnaire`
2. Verify pdf-lib import is working (may need to adjust import URL)
3. Check that questionnaire ID is being passed correctly

## 📝 Notes

- All form data is stored as JSONB in the database
- Progress is saved on each step (automatic save button on step 8)
- PDF export includes all questionnaire data in a clean format
- The module follows the same patterns as other dashboard features


