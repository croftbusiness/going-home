-- Going Home App Database Schema
-- Run this in your Supabase SQL Editor
-- This version includes all fixes and can be run multiple times safely

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Personal details
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_details_user_id ON personal_details(user_id);

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

-- Function to update updated_at timestamp (safe to replace)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at (safe: drop if exists before creating)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personal_details_updated_at ON personal_details;
CREATE TRIGGER update_personal_details_updated_at 
    BEFORE UPDATE ON personal_details
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_contacts_updated_at ON medical_contacts;
CREATE TRIGGER update_medical_contacts_updated_at 
    BEFORE UPDATE ON medical_contacts
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_funeral_preferences_updated_at ON funeral_preferences;
CREATE TRIGGER update_funeral_preferences_updated_at 
    BEFORE UPDATE ON funeral_preferences
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trusted_contacts_updated_at ON trusted_contacts;
CREATE TRIGGER update_trusted_contacts_updated_at 
    BEFORE UPDATE ON trusted_contacts
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_letters_updated_at ON letters;
CREATE TRIGGER update_letters_updated_at 
    BEFORE UPDATE ON letters
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_release_settings_updated_at ON release_settings;
CREATE TRIGGER update_release_settings_updated_at 
    BEFORE UPDATE ON release_settings
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- NOTE: These policies use auth.uid() which requires Supabase Auth to be enabled
-- If you're using custom authentication only, you may need to disable RLS or 
-- create custom policies using your session-based authentication
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

-- Policies for users to access their own data
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Sessions policies (users can only access their own sessions)
DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
CREATE POLICY "Users can manage own sessions" ON sessions
    FOR ALL USING (auth.uid() = user_id);

-- Two-factor codes policies (users can only access their own codes)
DROP POLICY IF EXISTS "Users can manage own 2FA codes" ON two_factor_codes;
CREATE POLICY "Users can manage own 2FA codes" ON two_factor_codes
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own personal details" ON personal_details;
CREATE POLICY "Users can view own personal details" ON personal_details
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own personal details" ON personal_details;
CREATE POLICY "Users can insert own personal details" ON personal_details
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own personal details" ON personal_details;
CREATE POLICY "Users can update own personal details" ON personal_details
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own medical contacts" ON medical_contacts;
CREATE POLICY "Users can view own medical contacts" ON medical_contacts
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own funeral preferences" ON funeral_preferences;
CREATE POLICY "Users can view own funeral preferences" ON funeral_preferences
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own documents" ON documents;
CREATE POLICY "Users can manage own documents" ON documents
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own letters" ON letters;
CREATE POLICY "Users can manage own letters" ON letters
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own trusted contacts" ON trusted_contacts;
CREATE POLICY "Users can manage own trusted contacts" ON trusted_contacts
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own release settings" ON release_settings;
CREATE POLICY "Users can manage own release settings" ON release_settings
    FOR ALL USING (auth.uid() = user_id);

-- Activity log policies (users can only view their own activity)
DROP POLICY IF EXISTS "Users can view own activity log" ON activity_log;
CREATE POLICY "Users can view own activity log" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activity log" ON activity_log;
CREATE POLICY "System can insert activity log" ON activity_log
    FOR INSERT WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with authentication credentials';
COMMENT ON TABLE sessions IS 'Active user sessions with 15-minute timeout';
COMMENT ON TABLE two_factor_codes IS 'Temporary codes for 2FA verification';
COMMENT ON TABLE personal_details IS 'User personal and contact information';
COMMENT ON TABLE medical_contacts IS 'Medical and legal contact information';
COMMENT ON TABLE funeral_preferences IS 'User funeral and service preferences';
COMMENT ON TABLE documents IS 'Uploaded important documents';
COMMENT ON TABLE letters IS 'Personal messages for loved ones';
COMMENT ON TABLE trusted_contacts IS 'People who can access user information post-death';
COMMENT ON TABLE release_settings IS 'Configuration for post-death information release';
COMMENT ON TABLE activity_log IS 'Audit trail of user actions';

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired 2FA codes
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM two_factor_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STORAGE BUCKETS SETUP (Run these in Supabase Dashboard > Storage)
-- ============================================================================

-- Create storage buckets for file uploads
-- Note: Run these commands in the Supabase SQL Editor or via the Storage UI

-- Documents bucket (for wills, IDs, insurance, deeds, etc.)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Photos bucket (for obituary photos, letter attachments, etc.)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', false);

-- Legacy messages bucket (for video/audio messages)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('legacy-messages', 'legacy-messages', false);

-- Storage policies (run after creating buckets)
-- These policies allow authenticated users to upload/manage their own files

-- Documents bucket policies
-- CREATE POLICY "Users can upload own documents"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own documents"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own documents"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Photos bucket policies
-- CREATE POLICY "Users can upload own photos"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own photos"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own photos"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Legacy messages bucket policies
-- CREATE POLICY "Users can upload own legacy messages"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'legacy-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own legacy messages"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'legacy-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own legacy messages"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'legacy-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- OPTIONAL: SCHEDULED CLEANUP (using pg_cron extension)
-- ============================================================================

-- Enable pg_cron extension (if available)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup of expired sessions (runs daily at 2 AM)
-- SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

-- Schedule cleanup of expired 2FA codes (runs every hour)
-- SELECT cron.schedule('cleanup-expired-2fa', '0 * * * *', 'SELECT cleanup_expired_2fa_codes();');

