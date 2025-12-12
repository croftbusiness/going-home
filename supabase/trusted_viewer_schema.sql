-- Trusted Viewer System Schema
-- Extends existing trusted_contacts table and adds viewer token system

-- Update trusted_contacts table to support viewer system
-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add owner_id (alias for user_id, but clearer for viewer context)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trusted_contacts' AND column_name = 'owner_id') THEN
    ALTER TABLE trusted_contacts ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE CASCADE;
    -- Copy user_id to owner_id for existing records
    UPDATE trusted_contacts SET owner_id = user_id WHERE owner_id IS NULL;
    -- Make owner_id NOT NULL after migration
    ALTER TABLE trusted_contacts ALTER COLUMN owner_id SET NOT NULL;
  END IF;

  -- Add role column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trusted_contacts' AND column_name = 'role') THEN
    ALTER TABLE trusted_contacts ADD COLUMN role TEXT DEFAULT 'Custom';
  END IF;

  -- Add status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trusted_contacts' AND column_name = 'status') THEN
    ALTER TABLE trusted_contacts ADD COLUMN status TEXT DEFAULT 'invited' 
      CHECK (status IN ('invited', 'accepted', 'removed'));
  END IF;

  -- Add permissions JSONB column (alternative to individual boolean columns)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trusted_contacts' AND column_name = 'permissions') THEN
    ALTER TABLE trusted_contacts ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create viewer_tokens table for temporary login tokens
CREATE TABLE IF NOT EXISTS viewer_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trusted_contact_id UUID REFERENCES trusted_contacts(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_viewer_tokens_token ON viewer_tokens(token);
CREATE INDEX IF NOT EXISTS idx_viewer_tokens_trusted_contact_id ON viewer_tokens(trusted_contact_id);
CREATE INDEX IF NOT EXISTS idx_viewer_tokens_expires_at ON viewer_tokens(expires_at);

-- RLS Policies for trusted_contacts (viewer access)
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can manage own trusted contacts" ON trusted_contacts;
DROP POLICY IF EXISTS "Viewers can view their own contact record" ON trusted_contacts;

-- Owner can CRUD their trusted contacts
CREATE POLICY "Owners can manage their trusted contacts" ON trusted_contacts
  FOR ALL
  USING (owner_id = auth.uid());

-- Viewers can view their own contact record (for checking permissions)
CREATE POLICY "Viewers can view their own contact record" ON trusted_contacts
  FOR SELECT
  USING (
    id IN (
      SELECT trusted_contact_id 
      FROM viewer_tokens 
      WHERE token = current_setting('app.viewer_token', TRUE)::TEXT
      AND expires_at > NOW()
      AND used = FALSE
    )
  );

-- RLS Policies for viewer_tokens
ALTER TABLE viewer_tokens ENABLE ROW LEVEL SECURITY;

-- Owners can manage tokens for their contacts
CREATE POLICY "Owners can manage viewer tokens" ON viewer_tokens
  FOR ALL
  USING (
    trusted_contact_id IN (
      SELECT id FROM trusted_contacts WHERE owner_id = auth.uid()
    )
  );

-- Viewers can read their own token (for verification)
CREATE POLICY "Viewers can read their token" ON viewer_tokens
  FOR SELECT
  USING (token = current_setting('app.viewer_token', TRUE)::TEXT);

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION generate_viewer_token()
RETURNS TEXT AS $$
DECLARE
  token_value TEXT;
BEGIN
  -- Generate a secure random token (32 characters, base64url safe)
  token_value := encode(gen_random_bytes(24), 'base64');
  -- Replace URL-unsafe characters
  token_value := replace(replace(replace(token_value, '+', '-'), '/', '_'), '=', '');
  RETURN token_value;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE viewer_tokens IS 'Temporary login tokens for trusted viewers';
COMMENT ON COLUMN viewer_tokens.token IS 'Secure random token for viewer login';
COMMENT ON COLUMN viewer_tokens.expires_at IS 'Token expiration timestamp (typically 7 days)';
COMMENT ON COLUMN viewer_tokens.used IS 'Whether the token has been used for login';



