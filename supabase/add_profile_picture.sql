-- Add profile picture field to personal_details table
ALTER TABLE personal_details 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

COMMENT ON COLUMN personal_details.profile_picture_url IS 'URL to user profile picture stored in Supabase Storage';






