-- ============================================================================
-- GOING HOME APP – COMPLETE MASTER DATABASE SCHEMA (UPDATED WITH PROFILE PICTURE)
-- ============================================================================
-- This is the FULL, complete schema with ALL tables, triggers, policies, and storage
-- Safe to run multiple times - uses IF NOT EXISTS and DROP IF EXISTS patterns
-- Run this ENTIRE file in Supabase SQL Editor (copy and paste everything)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  two_factor_method TEXT CHECK (two_factor_method IN ('email', 'sms')) DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Two-factor authentication codes
CREATE TABLE IF NOT EXISTS two_factor_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_2fa_user_id ON two_factor_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_expires_at ON two_factor_codes(expires_at);

-- Personal details (UPDATED: Added profile_picture_url field)
CREATE TABLE IF NOT EXISTS personal_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_details_user_id ON personal_details(user_id);

-- Add profile_picture_url column if it doesn't exist (for existing databases)
ALTER TABLE personal_details 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

COMMENT ON COLUMN personal_details.profile_picture_url IS 'URL to user profile picture stored in Supabase Storage';

-- Medical contacts
CREATE TABLE IF NOT EXISTS medical_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  physician_name TEXT,
  physician_phone TEXT,
  lawyer_name TEXT,
  lawyer_phone TEXT,
  medical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_contacts_user_id ON medical_contacts(user_id);

-- Funeral preferences
CREATE TABLE IF NOT EXISTS funeral_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  burial_or_cremation TEXT CHECK (burial_or_cremation IN ('burial', 'cremation')),
  funeral_home TEXT,
  service_type TEXT,
  atmosphere_wishes TEXT,
  song_1 TEXT,
  song_2 TEXT,
  song_3 TEXT,
  photo_preference_url TEXT,
  preferred_clothing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funeral_preferences_user_id ON funeral_preferences(user_id);

-- Trusted contacts (must be created before letters and release_settings)
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  access_level TEXT DEFAULT 'none' CHECK (access_level IN ('none', 'view')),
  can_view_personal_details BOOLEAN DEFAULT FALSE,
  can_view_medical_contacts BOOLEAN DEFAULT FALSE,
  can_view_funeral_preferences BOOLEAN DEFAULT FALSE,
  can_view_documents BOOLEAN DEFAULT FALSE,
  can_view_letters BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON trusted_contacts(user_id);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT CHECK (document_type IN ('will', 'id', 'insurance', 'deed', 'other')) NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- Letters to loved ones
CREATE TABLE IF NOT EXISTS letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  recipient_relationship TEXT NOT NULL,
  title TEXT,
  message_text TEXT,
  file_url TEXT,
  visible_after_death BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_letters_user_id ON letters(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_recipient_id ON letters(recipient_id);

-- Release settings
CREATE TABLE IF NOT EXISTS release_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  unlock_code_hash TEXT,
  executor_contact_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  release_activated BOOLEAN DEFAULT FALSE,
  release_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_release_settings_user_id ON release_settings(user_id);

-- Activity log for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- ============================================================================
-- NEW FEATURES TABLES
-- ============================================================================

-- Digital Accounts & Passwords
CREATE TABLE IF NOT EXISTS digital_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('email', 'banking', 'social_media', 'subscription', 'device', 'cloud_storage', 'other')),
  account_name TEXT NOT NULL,
  username TEXT,
  email TEXT,
  url TEXT,
  notes TEXT,
  password_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_accounts_user_id ON digital_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_accounts_account_type ON digital_accounts(account_type);

-- Asset Overview
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

-- Legacy Messages (video/audio)
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

-- End-of-Life Checklist
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
  immediate_notifications JSONB,
  do_not_do_list TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_end_of_life_checklist_user_id ON end_of_life_checklist(user_id);

-- Personal Biography
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

-- Insurance & Financial Contacts
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

-- Household Information
CREATE TABLE IF NOT EXISTS household_information (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  pet_care_instructions TEXT,
  home_access_codes TEXT,
  vehicle_locations TEXT,
  monthly_bills JSONB,
  service_cancellation_instructions TEXT,
  utility_accounts TEXT,
  home_maintenance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_household_information_user_id ON household_information(user_id);

-- Wishes for Children / Guardianship Notes
CREATE TABLE IF NOT EXISTS children_wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT,
  guardian_preferences TEXT,
  guardian_name TEXT,
  guardian_contact TEXT,
  milestone_messages JSONB,
  important_principles TEXT,
  personal_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_children_wishes_user_id ON children_wishes(user_id);

-- ============================================================================
-- EXECUTOR FEATURES TABLE
-- ============================================================================

-- Executor Accounts Table
CREATE TABLE IF NOT EXISTS executor_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  executor_email TEXT NOT NULL,
  executor_google_id TEXT,
  account_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  executor_contact_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  invitation_token TEXT UNIQUE,
  invitation_sent_at TIMESTAMPTZ,
  invitation_accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_executor_accounts_executor_email ON executor_accounts(executor_email);
CREATE INDEX IF NOT EXISTS idx_executor_accounts_account_user_id ON executor_accounts(account_user_id);
CREATE INDEX IF NOT EXISTS idx_executor_accounts_invitation_token ON executor_accounts(invitation_token);

-- ============================================================================
-- WILL QUESTIONNAIRE TABLE
-- ============================================================================

-- Will Questionnaire Table (for planning purposes only - NOT legally binding)
CREATE TABLE IF NOT EXISTS will_questionnaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  personal_info JSONB,
  executor JSONB,
  guardians JSONB,
  bequests JSONB,
  digital_assets JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_will_questionnaires_user_id ON will_questionnaires(user_id);

-- ============================================================================
-- UPDATE TIMESTAMP FUNCTION & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Core table triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personal_details_updated_at ON personal_details;
CREATE TRIGGER update_personal_details_updated_at BEFORE UPDATE ON personal_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_contacts_updated_at ON medical_contacts;
CREATE TRIGGER update_medical_contacts_updated_at BEFORE UPDATE ON medical_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_funeral_preferences_updated_at ON funeral_preferences;
CREATE TRIGGER update_funeral_preferences_updated_at BEFORE UPDATE ON funeral_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trusted_contacts_updated_at ON trusted_contacts;
CREATE TRIGGER update_trusted_contacts_updated_at BEFORE UPDATE ON trusted_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_letters_updated_at ON letters;
CREATE TRIGGER update_letters_updated_at BEFORE UPDATE ON letters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_release_settings_updated_at ON release_settings;
CREATE TRIGGER update_release_settings_updated_at BEFORE UPDATE ON release_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Will questionnaire table triggers
DROP TRIGGER IF EXISTS update_will_questionnaires_updated_at ON will_questionnaires;
CREATE TRIGGER update_will_questionnaires_updated_at BEFORE UPDATE ON will_questionnaires
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- New features table triggers
DROP TRIGGER IF EXISTS update_digital_accounts_updated_at ON digital_accounts;
CREATE TRIGGER update_digital_accounts_updated_at BEFORE UPDATE ON digital_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_messages_updated_at ON legacy_messages;
CREATE TRIGGER update_legacy_messages_updated_at BEFORE UPDATE ON legacy_messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_end_of_life_checklist_updated_at ON end_of_life_checklist;
CREATE TRIGGER update_end_of_life_checklist_updated_at BEFORE UPDATE ON end_of_life_checklist
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personal_biography_updated_at ON personal_biography;
CREATE TRIGGER update_personal_biography_updated_at BEFORE UPDATE ON personal_biography
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_financial_contacts_updated_at ON insurance_financial_contacts;
CREATE TRIGGER update_insurance_financial_contacts_updated_at BEFORE UPDATE ON insurance_financial_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_household_information_updated_at ON household_information;
CREATE TRIGGER update_household_information_updated_at BEFORE UPDATE ON household_information
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_children_wishes_updated_at ON children_wishes;
CREATE TRIGGER update_children_wishes_updated_at BEFORE UPDATE ON children_wishes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Executor table triggers
DROP TRIGGER IF EXISTS update_executor_accounts_updated_at ON executor_accounts;
CREATE TRIGGER update_executor_accounts_updated_at BEFORE UPDATE ON executor_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE end_of_life_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_biography ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_financial_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE children_wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE executor_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_questionnaires ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - CORE TABLES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
CREATE POLICY "Users can manage own sessions" ON sessions FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own 2FA codes" ON two_factor_codes;
CREATE POLICY "Users can manage own 2FA codes" ON two_factor_codes FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own personal details" ON personal_details;
CREATE POLICY "Users can view own personal details" ON personal_details FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own personal details" ON personal_details;
CREATE POLICY "Users can insert own personal details" ON personal_details FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own personal details" ON personal_details;
CREATE POLICY "Users can update own personal details" ON personal_details FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own medical contacts" ON medical_contacts;
CREATE POLICY "Users can view own medical contacts" ON medical_contacts FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own funeral preferences" ON funeral_preferences;
CREATE POLICY "Users can view own funeral preferences" ON funeral_preferences FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own documents" ON documents;
CREATE POLICY "Users can manage own documents" ON documents FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own letters" ON letters;
CREATE POLICY "Users can manage own letters" ON letters FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own trusted contacts" ON trusted_contacts;
CREATE POLICY "Users can manage own trusted contacts" ON trusted_contacts FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own release settings" ON release_settings;
CREATE POLICY "Users can manage own release settings" ON release_settings FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own activity log" ON activity_log;
CREATE POLICY "Users can view own activity log" ON activity_log FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activity log" ON activity_log;
CREATE POLICY "System can insert activity log" ON activity_log FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES - NEW FEATURES TABLES
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own digital accounts" ON digital_accounts;
CREATE POLICY "Users can manage own digital accounts" ON digital_accounts FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own assets" ON assets;
CREATE POLICY "Users can manage own assets" ON assets FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own legacy messages" ON legacy_messages;
CREATE POLICY "Users can manage own legacy messages" ON legacy_messages FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own end of life checklist" ON end_of_life_checklist;
CREATE POLICY "Users can manage own end of life checklist" ON end_of_life_checklist FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own personal biography" ON personal_biography;
CREATE POLICY "Users can manage own personal biography" ON personal_biography FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own insurance financial contacts" ON insurance_financial_contacts;
CREATE POLICY "Users can manage own insurance financial contacts" ON insurance_financial_contacts FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own household information" ON household_information;
CREATE POLICY "Users can manage own household information" ON household_information FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own children wishes" ON children_wishes;
CREATE POLICY "Users can manage own children wishes" ON children_wishes FOR ALL
USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - EXECUTOR TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own executor accounts" ON executor_accounts;
CREATE POLICY "Users can manage own executor accounts" ON executor_accounts FOR ALL
USING (auth.uid() = account_user_id);

-- ============================================================================
-- RLS POLICIES - WILL QUESTIONNAIRE TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can insert own will questionnaire" ON will_questionnaires;
CREATE POLICY "Users can insert own will questionnaire" ON will_questionnaires FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own will questionnaire" ON will_questionnaires;
CREATE POLICY "Users can update own will questionnaire" ON will_questionnaires FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select own will questionnaire" ON will_questionnaires;
CREATE POLICY "Users can select own will questionnaire" ON will_questionnaires FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('legacy-messages', 'legacy-messages', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Documents bucket policies
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Photos bucket policies
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own photos" ON storage.objects;
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Legacy Messages bucket policies
DROP POLICY IF EXISTS "Users can upload own legacy messages" ON storage.objects;
CREATE POLICY "Users can upload own legacy messages"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'legacy-messages'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own legacy messages" ON storage.objects;
CREATE POLICY "Users can view own legacy messages"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'legacy-messages'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own legacy messages" ON storage.objects;
CREATE POLICY "Users can delete own legacy messages"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'legacy-messages'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

