-- Create card_sessions table
CREATE TABLE IF NOT EXISTS card_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create user_cards table
CREATE TABLE IF NOT EXISTS user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('action', 'affirmation', 'reflection')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  linked_section VARCHAR(255),
  priority INTEGER NOT NULL DEFAULT 0,
  emotional_weight VARCHAR(10) NOT NULL DEFAULT 'light' CHECK (emotional_weight IN ('light', 'medium', 'heavy')),
  snoozed_until TIMESTAMPTZ,
  last_shown_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create card_session_items table (tracks cards in a session)
CREATE TABLE IF NOT EXISTS card_session_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES card_sessions(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'engaged', 'completed', 'snoozed')),
  origin VARCHAR(20) DEFAULT 'card' CHECK (origin IN ('card', 'dashboard')),
  exited_early BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  engaged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create card_interactions table
CREATE TABLE IF NOT EXISTS card_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns to users table if they don't exist
DO $$ 
BEGIN
  -- Add show_cards_on_login column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'show_cards_on_login'
  ) THEN
    ALTER TABLE users ADD COLUMN show_cards_on_login BOOLEAN DEFAULT TRUE;
  END IF;

  -- Add login_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'login_count'
  ) THEN
    ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_snoozed ON user_cards(user_id, snoozed_until);
CREATE INDEX IF NOT EXISTS idx_card_interactions_user_id ON card_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_interactions_card_id ON card_interactions(card_id);
CREATE INDEX IF NOT EXISTS idx_card_sessions_user_id ON card_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_sessions_active ON card_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_card_session_items_session_id ON card_session_items(session_id);
CREATE INDEX IF NOT EXISTS idx_card_session_items_status ON card_session_items(session_id, status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_cards
DROP TRIGGER IF EXISTS update_user_cards_updated_at ON user_cards;
CREATE TRIGGER update_user_cards_updated_at
  BEFORE UPDATE ON user_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for card_session_items
DROP TRIGGER IF EXISTS update_card_session_items_updated_at ON card_session_items;
CREATE TRIGGER update_card_session_items_updated_at
  BEFORE UPDATE ON card_session_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

