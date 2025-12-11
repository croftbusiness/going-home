-- ============================================================================
-- LEGACY FEATURES ENHANCEMENTS
-- ============================================================================
-- Enhanced features for emotional engagement and timed release
-- Run this after the main schema is set up
-- ============================================================================

-- Enhanced Letters table: Add timed release, release conditions, milestone tracking
ALTER TABLE letters 
ADD COLUMN IF NOT EXISTS release_type TEXT DEFAULT 'after_death' CHECK (release_type IN ('after_death', 'on_date', 'on_milestone', 'immediate')),
ADD COLUMN IF NOT EXISTS release_date DATE,
ADD COLUMN IF NOT EXISTS milestone_type TEXT CHECK (milestone_type IN ('birthday', 'graduation', 'wedding', 'first_child', 'anniversary', 'custom')),
ADD COLUMN IF NOT EXISTS milestone_date DATE,
ADD COLUMN IF NOT EXISTS milestone_description TEXT,
ADD COLUMN IF NOT EXISTS letter_category TEXT CHECK (letter_category IN ('in_case_i_pass', 'birthday', 'milestone', 'encouragement', 'final_words', 'love_letter', 'other'));

CREATE INDEX IF NOT EXISTS idx_letters_release_date ON letters(release_date);
CREATE INDEX IF NOT EXISTS idx_letters_milestone_date ON letters(milestone_date);

-- Enhanced Legacy Messages: Add categories and special types
ALTER TABLE legacy_messages
ADD COLUMN IF NOT EXISTS message_category TEXT CHECK (message_category IN ('spouse', 'children', 'prayer', 'blessing', 'advice', 'final_words', 'memory', 'encouragement')),
ADD COLUMN IF NOT EXISTS release_type TEXT DEFAULT 'after_death' CHECK (release_type IN ('after_death', 'on_date', 'immediate')),
ADD COLUMN IF NOT EXISTS release_date DATE;

CREATE INDEX IF NOT EXISTS idx_legacy_messages_release_date ON legacy_messages(release_date);

-- My Last Gift feature - Special messages with triggers
CREATE TABLE IF NOT EXISTS last_gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  gift_type TEXT NOT NULL CHECK (gift_type IN ('note', 'blessing', 'funny_message', 'private_memory', 'photo', 'video_message')),
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  recipient_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  recipient_type TEXT CHECK (recipient_type IN ('everyone', 'family', 'children', 'specific_person')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('after_death', 'on_date', 'on_milestone')),
  trigger_date DATE,
  milestone_type TEXT CHECK (milestone_type IN ('birthday', 'graduation', 'wedding', 'first_child', 'anniversary', 'custom')),
  milestone_date DATE,
  milestone_description TEXT,
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_last_gifts_user_id ON last_gifts(user_id);
CREATE INDEX IF NOT EXISTS idx_last_gifts_trigger_date ON last_gifts(trigger_date);
CREATE INDEX IF NOT EXISTS idx_last_gifts_milestone_date ON last_gifts(milestone_date);
CREATE INDEX IF NOT EXISTS idx_last_gifts_delivered ON last_gifts(delivered);

-- What I Want You To Know - Journaling prompts and responses
CREATE TABLE IF NOT EXISTS legacy_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  prompt_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  response TEXT NOT NULL,
  recipient_type TEXT CHECK (recipient_type IN ('children', 'family', 'everyone', 'spouse', 'specific_person')),
  recipient_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('values', 'wisdom', 'memories', 'hopes', 'gratitude', 'encouragement')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_journal_user_id ON legacy_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_journal_category ON legacy_journal(category);

-- Faith Preferences - Dedicated section
CREATE TABLE IF NOT EXISTS faith_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  favorite_verses JSONB, -- Array of {verse: string, reference: string}
  service_preferences TEXT,
  prayer_instructions TEXT,
  preferred_pastor_name TEXT,
  preferred_pastor_contact TEXT,
  church_family_contacts JSONB, -- Array of {name: string, contact: string, relationship: string}
  worship_songs JSONB, -- Array of song titles/artists
  faith_story TEXT,
  testimonial TEXT,
  baptism_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faith_preferences_user_id ON faith_preferences(user_id);

-- Comfort Messages - Messages to be sent to loved ones automatically
CREATE TABLE IF NOT EXISTS comfort_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  recipient_type TEXT CHECK (recipient_type IN ('everyone', 'family', 'children', 'spouse', 'specific_person')),
  message_type TEXT NOT NULL CHECK (message_type IN ('note', 'memory', 'blessing', 'verse', 'instruction', 'custom')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  verse_reference TEXT,
  verse_text TEXT,
  attached_photo_url TEXT,
  delivery_method TEXT DEFAULT 'email' CHECK (delivery_method IN ('email', 'text', 'both')),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comfort_messages_user_id ON comfort_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_comfort_messages_recipient_id ON comfort_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_comfort_messages_delivery_status ON comfort_messages(delivery_status);

-- Guardian Angel Contacts - Enhanced trusted contacts with special permissions
ALTER TABLE trusted_contacts
ADD COLUMN IF NOT EXISTS is_guardian_angel BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS guardian_letter TEXT,
ADD COLUMN IF NOT EXISTS emergency_access_enabled BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_trusted_contacts_guardian_angel ON trusted_contacts(is_guardian_angel);

-- Peace Score tracking - Enhanced completion tracking
CREATE TABLE IF NOT EXISTS peace_score (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  personal_details_complete BOOLEAN DEFAULT FALSE,
  medical_contacts_complete BOOLEAN DEFAULT FALSE,
  funeral_preferences_complete BOOLEAN DEFAULT FALSE,
  documents_uploaded BOOLEAN DEFAULT FALSE,
  letters_written BOOLEAN DEFAULT FALSE,
  legacy_messages_recorded BOOLEAN DEFAULT FALSE,
  will_questionnaire_complete BOOLEAN DEFAULT FALSE,
  trusted_contacts_added BOOLEAN DEFAULT FALSE,
  release_settings_configured BOOLEAN DEFAULT FALSE,
  faith_preferences_complete BOOLEAN DEFAULT FALSE,
  biography_written BOOLEAN DEFAULT FALSE,
  last_gifts_created BOOLEAN DEFAULT FALSE,
  comfort_messages_created BOOLEAN DEFAULT FALSE,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peace_score_user_id ON peace_score(user_id);

-- Update triggers
DROP TRIGGER IF EXISTS update_last_gifts_updated_at ON last_gifts;
CREATE TRIGGER update_last_gifts_updated_at BEFORE UPDATE ON last_gifts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_journal_updated_at ON legacy_journal;
CREATE TRIGGER update_legacy_journal_updated_at BEFORE UPDATE ON legacy_journal
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faith_preferences_updated_at ON faith_preferences;
CREATE TRIGGER update_faith_preferences_updated_at BEFORE UPDATE ON faith_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_peace_score_updated_at ON peace_score;
CREATE TRIGGER update_peace_score_updated_at BEFORE UPDATE ON peace_score
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE last_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE faith_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE comfort_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE peace_score ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own last gifts" ON last_gifts;
CREATE POLICY "Users can manage own last gifts" ON last_gifts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy journal" ON legacy_journal;
CREATE POLICY "Users can manage own legacy journal" ON legacy_journal FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own faith preferences" ON faith_preferences;
CREATE POLICY "Users can manage own faith preferences" ON faith_preferences FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own comfort messages" ON comfort_messages;
CREATE POLICY "Users can manage own comfort messages" ON comfort_messages FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own peace score" ON peace_score;
CREATE POLICY "Users can manage own peace score" ON peace_score FOR ALL USING (auth.uid() = user_id);

COMMENT ON TABLE last_gifts IS 'My Last Gift feature - Special messages with trigger conditions';
COMMENT ON TABLE legacy_journal IS 'What I Want You To Know - Journaling prompts and responses';
COMMENT ON TABLE faith_preferences IS 'Faith Preferences - Dedicated section for spiritual/religious preferences';
COMMENT ON TABLE comfort_messages IS 'Comfort Messages - Messages to be automatically sent to loved ones';
COMMENT ON TABLE peace_score IS 'Peace Score - Enhanced completion tracking and motivation';

