-- Add onboarding_complete field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_onboarding_complete ON users(onboarding_complete);

COMMENT ON COLUMN users.onboarding_complete IS 'Tracks whether user has completed the initial onboarding questionnaire';




