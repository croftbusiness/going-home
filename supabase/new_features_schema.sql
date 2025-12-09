-- New Features Database Schema
-- Run this in your Supabase SQL Editor after the main schema.sql

-- 1. Digital Accounts & Passwords
CREATE TABLE IF NOT EXISTS digital_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('email', 'banking', 'social_media', 'subscription', 'device', 'cloud_storage', 'other')),
  account_name TEXT NOT NULL,
  username TEXT,
  email TEXT,
  url TEXT,
  notes TEXT,
  -- Encrypted password storage (should be encrypted at application level)
  password_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_accounts_user_id ON digital_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_accounts_account_type ON digital_accounts(account_type);

-- 2. Asset Overview
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('vehicle', 'property', 'bank_account', 'insurance', 'investment', 'business', 'other')),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  account_number TEXT,
  institution_name TEXT,
  contact_info TEXT,
  estimated_value TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON assets(asset_type);

-- 3. Legacy Messages (video/audio)
CREATE TABLE IF NOT EXISTS legacy_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('video', 'audio')),
  title TEXT NOT NULL,
  recipient_type TEXT CHECK (recipient_type IN ('family', 'children', 'specific_person', 'general')),
  recipient_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  recipient_name TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  duration_seconds INTEGER,
  description TEXT,
  play_on_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legacy_messages_user_id ON legacy_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_messages_recipient_type ON legacy_messages(recipient_type);

-- 4. End-of-Life Checklist
CREATE TABLE IF NOT EXISTS end_of_life_checklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  organ_donation_preference TEXT,
  organ_donation_details TEXT,
  last_words TEXT,
  final_notes TEXT,
  prayers TEXT,
  scriptures TEXT,
  songs TEXT,
  poems TEXT,
  readings TEXT,
  immediate_notifications JSONB, -- Array of people to notify
  do_not_do_list TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_end_of_life_checklist_user_id ON end_of_life_checklist(user_id);

-- 5. Personal Biography
CREATE TABLE IF NOT EXISTS personal_biography (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  life_story TEXT,
  major_accomplishments TEXT,
  family_history TEXT,
  faith_story TEXT,
  lessons_learned TEXT,
  favorite_memories TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_biography_user_id ON personal_biography(user_id);

-- 6. Insurance & Financial Contacts
CREATE TABLE IF NOT EXISTS insurance_financial_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('life_insurance', 'burial_insurance', 'retirement_account', 'employer_benefits', 'financial_advisor', 'other')),
  company_name TEXT,
  policy_number TEXT,
  account_number TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_financial_contacts_user_id ON insurance_financial_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_financial_contacts_contact_type ON insurance_financial_contacts(contact_type);

-- 7. Household Information
CREATE TABLE IF NOT EXISTS household_information (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  pet_care_instructions TEXT,
  home_access_codes TEXT,
  vehicle_locations TEXT,
  monthly_bills JSONB, -- Array of bill information
  service_cancellation_instructions TEXT,
  utility_accounts TEXT,
  home_maintenance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_household_information_user_id ON household_information(user_id);

-- 8. Wishes for Children / Guardianship Notes
CREATE TABLE IF NOT EXISTS children_wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT,
  guardian_preferences TEXT,
  guardian_name TEXT,
  guardian_contact TEXT,
  milestone_messages JSONB, -- Messages for specific milestones (birthdays, graduations, etc.)
  important_principles TEXT,
  personal_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_children_wishes_user_id ON children_wishes(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_digital_accounts_updated_at BEFORE UPDATE ON digital_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legacy_messages_updated_at BEFORE UPDATE ON legacy_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_end_of_life_checklist_updated_at BEFORE UPDATE ON end_of_life_checklist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_biography_updated_at BEFORE UPDATE ON personal_biography
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_financial_contacts_updated_at BEFORE UPDATE ON insurance_financial_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_information_updated_at BEFORE UPDATE ON household_information
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_wishes_updated_at BEFORE UPDATE ON children_wishes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE digital_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE end_of_life_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_biography ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_financial_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE children_wishes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using auth.uid() - adjust if using custom auth)
CREATE POLICY "Users can manage own digital accounts" ON digital_accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own assets" ON assets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own legacy messages" ON legacy_messages
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own end of life checklist" ON end_of_life_checklist
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own personal biography" ON personal_biography
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own insurance financial contacts" ON insurance_financial_contacts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own household information" ON household_information
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own children wishes" ON children_wishes
    FOR ALL USING (auth.uid() = user_id);

