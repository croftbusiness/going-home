-- Add role column to personal_details table
ALTER TABLE personal_details 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'User' 
CHECK (role IN ('User', 'Executor', 'Spouse', 'Child', 'Attorney', 'Custom'));

COMMENT ON COLUMN personal_details.role IS 'User role that appears to trusted contacts';




