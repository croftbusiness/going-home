-- Executor Accounts Table
-- Links executor's Google account to accounts they're executor for
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

-- Trigger for updated_at (safe: drop if exists before creating)
DROP TRIGGER IF EXISTS update_executor_accounts_updated_at ON executor_accounts;
CREATE TRIGGER update_executor_accounts_updated_at 
    BEFORE UPDATE ON executor_accounts
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

