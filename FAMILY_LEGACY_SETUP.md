# Family Legacy Section - Setup Guide

## ✅ Completed

1. **Database Schema** (`supabase/family_legacy_schema.sql`)
   - All 9 tables created with proper structure
   - RLS policies enabled
   - Storage bucket for legacy-media
   - Update triggers configured

2. **Main Page** (`app/dashboard/family-legacy/page.tsx`)
   - Beautiful overview page with section cards
   - Progress indicator
   - Links to all sub-sections

3. **Navigation** 
   - Added to sidebar in Planning & Legacy section
   - Uses Gift icon

4. **API Routes Created**
   - `/api/user/family-legacy/status/route.ts` - Section completion status
   - `/api/user/family-legacy/recipes/route.ts` - Full CRUD for recipes

5. **Pages Created**
   - `app/dashboard/family-legacy/recipes/page.tsx` - Complete implementation with:
     - Photo upload
     - Form validation
     - Grid layout
     - CRUD operations

## 🚧 Next Steps

### API Routes Needed (Follow Recipes pattern)

Create the following API routes following the same pattern as recipes:

- `/app/api/user/family-legacy/stories/route.ts`
- `/app/api/user/family-legacy/heirlooms/route.ts`
- `/app/api/user/family-legacy/traditions/route.ts`
- `/app/api/user/family-legacy/advice/route.ts`
- `/app/api/user/family-legacy/letters/route.ts`
- `/app/api/user/family-legacy/playlists/route.ts`
- `/app/api/user/family-legacy/routines/route.ts`
- `/app/api/user/family-legacy/instructions/route.ts`

### Pages Needed (Follow Recipes page pattern)

Each page should include:
- List/grid view of items
- Add/Edit form
- Delete functionality
- Empty state
- Mobile-responsive design

Create pages:
- `app/dashboard/family-legacy/stories/page.tsx`
- `app/dashboard/family-legacy/heirlooms/page.tsx`
- `app/dashboard/family-legacy/traditions/page.tsx`
- `app/dashboard/family-legacy/advice/page.tsx` (accordion layout)
- `app/dashboard/family-legacy/letters/page.tsx`
- `app/dashboard/family-legacy/playlists/page.tsx`
- `app/dashboard/family-legacy/routines/page.tsx` (single record, not list)
- `app/dashboard/family-legacy/instructions/page.tsx` (single record, not list)

## 🗄️ Database Setup

Run this SQL in Supabase SQL Editor:
```sql
-- Copy contents of supabase/family_legacy_schema.sql
```

## 📋 Field Mappings

### Recipes ✅
- title, ingredients, instructions, photo_url, story_behind_recipe

### Stories
- story_title, story_text, audio_url, photo_urls (array)

### Heirlooms
- item_name, item_photo, item_story, recipient_name, video_url

### Traditions
- tradition_name, description, when_it_occurs, personal_meaning

### Advice
- category (marriage, parenting, faith, money, work, life, other), message

### Letters
- recipient_name, message, scheduled_release_date

### Playlists
- song_title, artist, link, emotional_meaning

### Routines (single record per user)
- morning_routine, evening_routine, favorite_foods, quirks, special_habits, things_to_remember

### Instructions (single record per user)
- what_to_do_first, where_things_are_located, important_contacts, home_quirks, pet_care

## 🎨 Design Guidelines

- Follow existing Going Home design system
- Use soft gradients: `from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7]`
- Colors: `#A5B99A`, `#93B0C8`, `#EBD9B5`
- Rounded cards: `rounded-2xl`
- Mobile-first responsive design
- Peaceful, emotionally safe feeling

## 📸 File Uploads

For photos/audio/video, use:
- Bucket: `legacy-media`
- API route: `/api/user/upload-photo` (may need extension for audio/video)
- Store URL in database field

## 🔐 Security

All tables have RLS enabled:
- Users can only access their own records
- Use `auth.uid() = user_id` in policies





