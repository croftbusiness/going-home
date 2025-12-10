-- ============================================================================
-- FUNERAL FEATURES SCHEMA
-- AI-guided funeral planning tables for Going Home App
-- ============================================================================

-- Funeral Stories (Core feature - ceremony planning)
CREATE TABLE IF NOT EXISTS funeral_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  atmosphere TEXT,
  music_choices JSONB,
  tone_theme TEXT,
  readings_scriptures JSONB,
  eulogy_notes TEXT,
  messages_to_audience TEXT,
  desired_feeling TEXT,
  ceremony_script TEXT,
  memorial_narrative TEXT,
  playlist_suggestions JSONB,
  slideshow_captions JSONB,
  mood_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funeral_stories_user_id ON funeral_stories(user_id);

DROP TRIGGER IF EXISTS update_funeral_stories_updated_at ON funeral_stories;
CREATE TRIGGER update_funeral_stories_updated_at
    BEFORE UPDATE ON funeral_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Funeral Moodboards
CREATE TABLE IF NOT EXISTS funeral_moodboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  colors JSONB,
  flowers JSONB,
  clothing_preferences TEXT,
  aesthetic_style TEXT,
  venue_type TEXT,
  vibe_guide TEXT,
  decor_suggestions JSONB,
  invitation_wording TEXT,
  moodboard_layout JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funeral_moodboards_user_id ON funeral_moodboards(user_id);

DROP TRIGGER IF EXISTS update_funeral_moodboards_updated_at ON funeral_moodboards;
CREATE TRIGGER update_funeral_moodboards_updated_at
    BEFORE UPDATE ON funeral_moodboards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Funeral Scripts (ceremony scripts)
CREATE TABLE IF NOT EXISTS funeral_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  opening_words TEXT,
  closing_blessing TEXT,
  prayers JSONB,
  readings JSONB,
  transitions JSONB,
  tone_variation TEXT,
  full_script TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funeral_scripts_user_id ON funeral_scripts(user_id);

DROP TRIGGER IF EXISTS update_funeral_scripts_updated_at ON funeral_scripts;
CREATE TRIGGER update_funeral_scripts_updated_at
    BEFORE UPDATE ON funeral_scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Funeral Playlists
CREATE TABLE IF NOT EXISTS funeral_playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  ceremony_music JSONB,
  slideshow_songs JSONB,
  reception_playlist JSONB,
  personalized_explanations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funeral_playlists_user_id ON funeral_playlists(user_id);

DROP TRIGGER IF EXISTS update_funeral_playlists_updated_at ON funeral_playlists;
CREATE TRIGGER update_funeral_playlists_updated_at
    BEFORE UPDATE ON funeral_playlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Funeral Letters (letters to be read at funeral)
CREATE TABLE IF NOT EXISTS funeral_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  letter_type TEXT CHECK (letter_type IN ('friends', 'spouse', 'children', 'everyone', 'final_words')),
  recipient_description TEXT,
  draft_content TEXT,
  final_content TEXT,
  ai_suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funeral_letters_user_id ON funeral_letters(user_id);

DROP TRIGGER IF EXISTS update_funeral_letters_updated_at ON funeral_letters;
CREATE TRIGGER update_funeral_letters_updated_at
    BEFORE UPDATE ON funeral_letters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Funeral Slideshows
CREATE TABLE IF NOT EXISTS funeral_slideshows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  photo_order JSONB,
  captions JSONB,
  groupings JSONB,
  song_matches JSONB,
  slideshow_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funeral_slideshows_user_id ON funeral_slideshows(user_id);

DROP TRIGGER IF EXISTS update_funeral_slideshows_updated_at ON funeral_slideshows;
CREATE TRIGGER update_funeral_slideshows_updated_at
    BEFORE UPDATE ON funeral_slideshows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Life Themes
CREATE TABLE IF NOT EXISTS life_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  key_memories JSONB,
  core_values JSONB,
  tone_themes JSONB,
  life_lessons JSONB,
  identity_motifs JSONB,
  applied_to_eulogy BOOLEAN DEFAULT FALSE,
  applied_to_ceremony BOOLEAN DEFAULT FALSE,
  applied_to_playlist BOOLEAN DEFAULT FALSE,
  applied_to_letters BOOLEAN DEFAULT FALSE,
  applied_to_obituary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_life_themes_user_id ON life_themes(user_id);

DROP TRIGGER IF EXISTS update_life_themes_updated_at ON life_themes;
CREATE TRIGGER update_life_themes_updated_at
    BEFORE UPDATE ON life_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE funeral_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_moodboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_slideshows ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_themes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Funeral Stories
DROP POLICY IF EXISTS "Users can manage own funeral stories" ON funeral_stories;
CREATE POLICY "Users can manage own funeral stories" ON funeral_stories
    FOR ALL USING (auth.uid() = user_id);

-- Funeral Moodboards
DROP POLICY IF EXISTS "Users can manage own funeral moodboards" ON funeral_moodboards;
CREATE POLICY "Users can manage own funeral moodboards" ON funeral_moodboards
    FOR ALL USING (auth.uid() = user_id);

-- Funeral Scripts
DROP POLICY IF EXISTS "Users can manage own funeral scripts" ON funeral_scripts;
CREATE POLICY "Users can manage own funeral scripts" ON funeral_scripts
    FOR ALL USING (auth.uid() = user_id);

-- Funeral Playlists
DROP POLICY IF EXISTS "Users can manage own funeral playlists" ON funeral_playlists;
CREATE POLICY "Users can manage own funeral playlists" ON funeral_playlists
    FOR ALL USING (auth.uid() = user_id);

-- Funeral Letters
DROP POLICY IF EXISTS "Users can manage own funeral letters" ON funeral_letters;
CREATE POLICY "Users can manage own funeral letters" ON funeral_letters
    FOR ALL USING (auth.uid() = user_id);

-- Funeral Slideshows
DROP POLICY IF EXISTS "Users can manage own funeral slideshows" ON funeral_slideshows;
CREATE POLICY "Users can manage own funeral slideshows" ON funeral_slideshows
    FOR ALL USING (auth.uid() = user_id);

-- Life Themes
DROP POLICY IF EXISTS "Users can manage own life themes" ON life_themes;
CREATE POLICY "Users can manage own life themes" ON life_themes
    FOR ALL USING (auth.uid() = user_id);

