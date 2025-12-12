-- ============================================================================
-- ONBOARDING COMPLETE SETUP
-- ============================================================================
-- This script:
-- 1. Adds the onboarding_complete column to the users table (if it doesn't exist)
-- 2. Marks all existing users as having completed onboarding
-- Safe to run multiple times
-- ============================================================================

-- Step 1: Add the onboarding_complete column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Step 2: Mark all existing users as having completed onboarding
-- This prevents existing users from seeing the onboarding flow
UPDATE users 
SET onboarding_complete = TRUE 
WHERE onboarding_complete IS NULL OR onboarding_complete = FALSE;

-- Add a comment for documentation
COMMENT ON COLUMN users.onboarding_complete IS 
  'Indicates whether the user has completed the onboarding questionnaire. Existing users are automatically marked as complete.';

-- Verify the update (optional - you can run this separately to check)
-- SELECT id, email, onboarding_complete FROM users;






