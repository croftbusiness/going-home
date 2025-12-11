-- ============================================================================
-- FAMILY LEGACY SECTION - DATABASE SCHEMA
-- ============================================================================
-- This schema creates all tables for the Family Legacy section
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Legacy Recipes
CREATE TABLE IF NOT EXISTS legacy_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  instructions TEXT NOT NULL,
  photo_url TEXT,
  story_behind_recipe TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_recipes_user_id ON legacy_recipes(user_id);

-- 2. Legacy Stories
CREATE TABLE IF NOT EXISTS legacy_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_title TEXT NOT NULL,
  story_text TEXT NOT NULL,
  audio_url TEXT,
  photo_urls TEXT[], -- Array of photo URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_stories_user_id ON legacy_stories(user_id);

-- 3. Legacy Heirlooms & Keepsakes
CREATE TABLE IF NOT EXISTS legacy_heirlooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  item_photo TEXT,
  item_story TEXT,
  recipient_name TEXT, -- Who it should go to
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_heirlooms_user_id ON legacy_heirlooms(user_id);

-- 4. Legacy Traditions
CREATE TABLE IF NOT EXISTS legacy_traditions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tradition_name TEXT NOT NULL,
  description TEXT NOT NULL,
  when_it_occurs TEXT, -- e.g., "Every Christmas", "On birthdays"
  personal_meaning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_traditions_user_id ON legacy_traditions(user_id);

-- 5. Legacy Advice
CREATE TABLE IF NOT EXISTS legacy_advice (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('marriage', 'parenting', 'faith', 'money', 'work', 'life', 'other')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_advice_user_id ON legacy_advice(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_advice_category ON legacy_advice(category);

-- 6. Legacy Letters (separate from main letters table for this section)
CREATE TABLE IF NOT EXISTS legacy_family_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_name TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_release_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_family_letters_user_id ON legacy_family_letters(user_id);

-- 7. Legacy Playlists
CREATE TABLE IF NOT EXISTS legacy_playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_title TEXT NOT NULL,
  artist TEXT,
  link TEXT, -- Spotify/YouTube link
  emotional_meaning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_playlists_user_id ON legacy_playlists(user_id);

-- 8. Legacy Routines & Comforts
CREATE TABLE IF NOT EXISTS legacy_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL, -- One record per user
  morning_routine TEXT,
  evening_routine TEXT,
  favorite_foods TEXT,
  quirks TEXT,
  special_habits TEXT,
  things_to_remember TEXT, -- "things I want my family to remember about me"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_routines_user_id ON legacy_routines(user_id);

-- 9. Legacy Instructions
CREATE TABLE IF NOT EXISTS legacy_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL, -- One record per user
  what_to_do_first TEXT,
  where_things_are_located TEXT,
  important_contacts TEXT,
  home_quirks TEXT,
  pet_care TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_instructions_user_id ON legacy_instructions(user_id);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_legacy_recipes_updated_at ON legacy_recipes;
CREATE TRIGGER update_legacy_recipes_updated_at BEFORE UPDATE ON legacy_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_stories_updated_at ON legacy_stories;
CREATE TRIGGER update_legacy_stories_updated_at BEFORE UPDATE ON legacy_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_heirlooms_updated_at ON legacy_heirlooms;
CREATE TRIGGER update_legacy_heirlooms_updated_at BEFORE UPDATE ON legacy_heirlooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_traditions_updated_at ON legacy_traditions;
CREATE TRIGGER update_legacy_traditions_updated_at BEFORE UPDATE ON legacy_traditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_advice_updated_at ON legacy_advice;
CREATE TRIGGER update_legacy_advice_updated_at BEFORE UPDATE ON legacy_advice
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_family_letters_updated_at ON legacy_family_letters;
CREATE TRIGGER update_legacy_family_letters_updated_at BEFORE UPDATE ON legacy_family_letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_playlists_updated_at ON legacy_playlists;
CREATE TRIGGER update_legacy_playlists_updated_at BEFORE UPDATE ON legacy_playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_routines_updated_at ON legacy_routines;
CREATE TRIGGER update_legacy_routines_updated_at BEFORE UPDATE ON legacy_routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_instructions_updated_at ON legacy_instructions;
CREATE TRIGGER update_legacy_instructions_updated_at BEFORE UPDATE ON legacy_instructions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE legacy_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_heirlooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_traditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_family_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_instructions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own records

DROP POLICY IF EXISTS "Users can manage own legacy recipes" ON legacy_recipes;
CREATE POLICY "Users can manage own legacy recipes" ON legacy_recipes
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy stories" ON legacy_stories;
CREATE POLICY "Users can manage own legacy stories" ON legacy_stories
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy heirlooms" ON legacy_heirlooms;
CREATE POLICY "Users can manage own legacy heirlooms" ON legacy_heirlooms
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy traditions" ON legacy_traditions;
CREATE POLICY "Users can manage own legacy traditions" ON legacy_traditions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy advice" ON legacy_advice;
CREATE POLICY "Users can manage own legacy advice" ON legacy_advice
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy family letters" ON legacy_family_letters;
CREATE POLICY "Users can manage own legacy family letters" ON legacy_family_letters
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy playlists" ON legacy_playlists;
CREATE POLICY "Users can manage own legacy playlists" ON legacy_playlists
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy routines" ON legacy_routines;
CREATE POLICY "Users can manage own legacy routines" ON legacy_routines
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy instructions" ON legacy_instructions;
CREATE POLICY "Users can manage own legacy instructions" ON legacy_instructions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STORAGE BUCKET FOR LEGACY MEDIA
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('legacy-media', 'legacy-media', false) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies for legacy-media bucket
DROP POLICY IF EXISTS "Users can upload own legacy media" ON storage.objects;
CREATE POLICY "Users can upload own legacy media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'legacy-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view own legacy media" ON storage.objects;
CREATE POLICY "Users can view own legacy media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'legacy-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own legacy media" ON storage.objects;
CREATE POLICY "Users can delete own legacy media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'legacy-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE legacy_recipes IS 'Favorite recipes with stories and photos';
COMMENT ON TABLE legacy_stories IS 'Family stories and memories';
COMMENT ON TABLE legacy_heirlooms IS 'Heirlooms and keepsakes with recipients';
COMMENT ON TABLE legacy_traditions IS 'Family traditions to continue';
COMMENT ON TABLE legacy_advice IS 'Life advice organized by category';
COMMENT ON TABLE legacy_family_letters IS 'Letters to loved ones for legacy section';
COMMENT ON TABLE legacy_playlists IS 'Favorite music with emotional meaning';
COMMENT ON TABLE legacy_routines IS 'Daily routines and things to remember';
COMMENT ON TABLE legacy_instructions IS 'Important instructions for loved ones';


