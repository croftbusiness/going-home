-- Saved Songs Schema
-- Run this in your Supabase SQL Editor

-- Create saved_songs table to store full Spotify track metadata
CREATE TABLE IF NOT EXISTS saved_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  spotify_id TEXT NOT NULL,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  preview_url TEXT,
  spotify_url TEXT,
  album_art_url TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate songs for the same user
  UNIQUE(user_id, spotify_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_songs_user_id ON saved_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_songs_spotify_id ON saved_songs(spotify_id);
CREATE INDEX IF NOT EXISTS idx_saved_songs_created_at ON saved_songs(created_at DESC);

-- Enable RLS
ALTER TABLE saved_songs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own saved songs
DROP POLICY IF EXISTS "Users can manage own saved songs" ON saved_songs;
CREATE POLICY "Users can manage own saved songs" ON saved_songs
  FOR ALL
  USING (user_id = auth.uid());

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_saved_songs_updated_at ON saved_songs;
CREATE TRIGGER update_saved_songs_updated_at 
    BEFORE UPDATE ON saved_songs
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE saved_songs IS 'Stores user-saved Spotify songs with full metadata for playback';
COMMENT ON COLUMN saved_songs.spotify_id IS 'Spotify track ID';
COMMENT ON COLUMN saved_songs.preview_url IS '30-second preview audio URL';
COMMENT ON COLUMN saved_songs.spotify_url IS 'Full Spotify track URL';

