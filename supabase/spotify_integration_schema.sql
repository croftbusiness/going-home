-- Spotify Integration Schema
-- Run this in your Supabase SQL Editor

-- Create spotify_tokens table to store user's Spotify OAuth tokens
CREATE TABLE IF NOT EXISTS spotify_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spotify_tokens_user_id ON spotify_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_tokens_expires_at ON spotify_tokens(expires_at);

-- Enable RLS
ALTER TABLE spotify_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own Spotify tokens
DROP POLICY IF EXISTS "Users can manage own spotify tokens" ON spotify_tokens;
CREATE POLICY "Users can manage own spotify tokens" ON spotify_tokens
  FOR ALL
  USING (user_id = auth.uid());

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_spotify_tokens_updated_at ON spotify_tokens;
CREATE TRIGGER update_spotify_tokens_updated_at 
    BEFORE UPDATE ON spotify_tokens
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE spotify_tokens IS 'Stores Spotify OAuth tokens for users who connect their Spotify account';
COMMENT ON COLUMN spotify_tokens.access_token IS 'Spotify API access token';
COMMENT ON COLUMN spotify_tokens.refresh_token IS 'Token used to refresh the access token when it expires';
COMMENT ON COLUMN spotify_tokens.expires_at IS 'When the access token expires';

