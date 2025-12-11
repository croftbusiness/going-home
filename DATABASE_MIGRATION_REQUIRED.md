# ⚠️ Database Migration Required

## To see the new Timed Release Letters feature, you MUST run the database migration first!

### Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to: SQL Editor

2. **Run the migration script**
   - Open the file: `supabase/legacy_features_schema.sql`
   - Copy the ENTIRE file contents
   - Paste into Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter

### What the migration adds:

- **Enhanced `letters` table** with:
  - `release_type` (after_death, on_date, on_milestone, immediate)
  - `release_date` (for date-based releases)
  - `milestone_type` (birthday, graduation, wedding, etc.)
  - `milestone_date` (for milestone-based releases)
  - `milestone_description` (for custom milestones)
  - `letter_category` (in_case_i_pass, birthday, milestone, etc.)

- **New tables** for future features:
  - `last_gifts`
  - `legacy_journal`
  - `faith_preferences`
  - `comfort_messages`
  - `peace_score`

### After running the migration:

1. **Refresh your app** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. **Go to Letters page** (`/dashboard/letters`)
3. **Click "Write Letter"** - you should now see:
   - Letter Type dropdown
   - Release timing options
   - Date/milestone pickers (when applicable)

### If you don't see the fields:

1. Make sure the migration ran successfully (check Supabase for errors)
2. Hard refresh your browser
3. Clear browser cache if needed
4. Check browser console for any errors

### Need help?

If the migration fails, check:
- Do you have the `letters` table already?
- Are there any existing data conflicts?
- Check the Supabase SQL Editor for specific error messages


