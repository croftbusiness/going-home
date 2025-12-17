-- End of Life Directives Schema
-- This table stores comprehensive end-of-life care preferences

CREATE TABLE IF NOT EXISTS end_of_life_directives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- 1. Care Location
  preferred_place_to_pass TEXT, -- home, hospital, hospice_facility
  secondary_option TEXT,
  notes_for_family TEXT,
  environment_preferences TEXT, -- natural light, candles, no TV, etc.
  
  -- 2. Visitors & Personal Presence
  who_want_present TEXT,
  who_not_want_present TEXT,
  max_visitors INTEGER,
  visitor_hours TEXT,
  privacy_quiet_preferences TEXT,
  
  -- 3. Pain Management Preferences
  preferred_pain_medications TEXT,
  medications_not_wanted TEXT,
  comfort_measures TEXT, -- massage, warm blankets, aromatherapy, etc.
  sedation_level TEXT, -- alert, moderate, fully_sedated
  
  -- 4. Life-Sustaining Treatment Decisions
  cpr_preference TEXT CHECK (cpr_preference IN ('yes', 'no', 'conditional')),
  ventilator_preference TEXT CHECK (ventilator_preference IN ('yes', 'no', 'conditional')),
  feeding_tube_preference TEXT CHECK (feeding_tube_preference IN ('yes', 'no', 'conditional')),
  iv_hydration_preference TEXT CHECK (iv_hydration_preference IN ('yes', 'no', 'conditional')),
  antibiotics_preference TEXT CHECK (antibiotics_preference IN ('yes', 'no', 'conditional')),
  conditional_decisions TEXT, -- "only if recovery is likely" type notes
  notes_for_doctors TEXT,
  
  -- 5. Organ Donation Wishes
  donor_status TEXT CHECK (donor_status IN ('yes', 'no', 'partial')),
  organs_tissues_consent TEXT,
  religious_philosophical_notes TEXT,
  organ_donation_org_contact TEXT,
  
  -- 6. Spiritual Care
  preferred_spiritual_leader TEXT,
  specific_prayers_rituals TEXT,
  favorite_bible_verses TEXT,
  worship_music_preferences TEXT,
  notes_for_spiritual_caregivers TEXT,
  
  -- 7. Sensory Environment Preferences
  lighting_preferences TEXT, -- dim, natural light, candles, etc.
  sound_preferences TEXT, -- silence, music, nature sounds
  scent_preferences TEXT,
  clothing_blankets_comfort TEXT,
  items_want_around TEXT, -- Bible, photos, etc.
  
  -- 8. Emergency Instructions
  who_to_call_first TEXT,
  when_not_to_call_911 TEXT,
  hospice_instructions TEXT,
  under_no_circumstances TEXT,
  important_documents_location TEXT,
  
  -- 9. Final Moments Wishes
  what_loved_ones_should_know TEXT,
  last_rights_rituals_traditions TEXT,
  touch_holding_hands_preference TEXT,
  what_to_say_read_aloud TEXT,
  final_message_for_family TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_end_of_life_directives_user_id ON end_of_life_directives(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_end_of_life_directives_updated_at ON end_of_life_directives;
CREATE TRIGGER update_end_of_life_directives_updated_at 
    BEFORE UPDATE ON end_of_life_directives
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();





