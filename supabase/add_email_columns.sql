-- Add email delivery columns to letters table
-- Run this migration to enable automatic email delivery

ALTER TABLE letters 
ADD COLUMN IF NOT EXISTS auto_email_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recipient_email TEXT;

CREATE INDEX IF NOT EXISTS idx_letters_email_sent ON letters(email_sent);
CREATE INDEX IF NOT EXISTS idx_letters_auto_email ON letters(auto_email_enabled);

COMMENT ON COLUMN letters.auto_email_enabled IS 'Whether to automatically email this letter when released';
COMMENT ON COLUMN letters.email_sent IS 'Whether the email has been sent';
COMMENT ON COLUMN letters.email_sent_at IS 'Timestamp when email was sent';
COMMENT ON COLUMN letters.recipient_email IS 'Email address of the recipient (cached from trusted_contacts)';


