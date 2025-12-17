-- Mark all existing users as having completed onboarding
-- This prevents existing users from seeing the onboarding flow
UPDATE users 
SET onboarding_complete = TRUE 
WHERE onboarding_complete IS NULL OR onboarding_complete = FALSE;

COMMENT ON COLUMN users.onboarding_complete IS 'Set to TRUE for all existing users to skip onboarding';







