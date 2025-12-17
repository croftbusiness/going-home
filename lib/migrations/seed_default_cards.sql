-- Seed default cards for users
-- This creates cards based on common incomplete sections
-- Run this after creating the cards tables

-- Example: Create cards for Personal Details section
-- You can customize these based on your needs

-- Note: Replace 'USER_ID_HERE' with actual user IDs or use a function to create cards for all users
-- Or create cards dynamically when user first logs in

-- Example card for Personal Details
INSERT INTO user_cards (user_id, card_type, title, description, linked_section, priority, emotional_weight)
SELECT 
  id as user_id,
  'action' as card_type,
  'Complete Your Personal Details' as title,
  'Add your name, address, and contact information to get started with your planning.' as description,
  '/dashboard/personal-details' as linked_section,
  10 as priority,
  'light' as emotional_weight
FROM users
WHERE id NOT IN (
  SELECT DISTINCT user_id FROM user_cards WHERE linked_section = '/dashboard/personal-details'
)
AND id NOT IN (
  SELECT DISTINCT user_id FROM personal_details
);

-- Example card for Documents
INSERT INTO user_cards (user_id, card_type, title, description, linked_section, priority, emotional_weight)
SELECT 
  id as user_id,
  'action' as card_type,
  'Upload Important Documents' as title,
  'Store your will, IDs, insurance papers, and other important documents securely.' as description,
  '/dashboard/documents' as linked_section,
  9 as priority,
  'light' as emotional_weight
FROM users
WHERE id NOT IN (
  SELECT DISTINCT user_id FROM user_cards WHERE linked_section = '/dashboard/documents'
)
AND id NOT IN (
  SELECT DISTINCT user_id FROM documents
);

-- Example card for Trusted Contacts
INSERT INTO user_cards (user_id, card_type, title, description, linked_section, priority, emotional_weight)
SELECT 
  id as user_id,
  'action' as card_type,
  'Add Trusted Contacts' as title,
  'Designate family members or friends who should have access to your information.' as description,
  '/dashboard/trusted-contacts' as linked_section,
  8 as priority,
  'light' as emotional_weight
FROM users
WHERE id NOT IN (
  SELECT DISTINCT user_id FROM user_cards WHERE linked_section = '/dashboard/trusted-contacts'
)
AND id NOT IN (
  SELECT DISTINCT user_id FROM trusted_contacts
);

-- Example affirmation card
INSERT INTO user_cards (user_id, card_type, title, description, priority, emotional_weight)
SELECT 
  id as user_id,
  'affirmation' as card_type,
  'You're Taking Important Steps' as title,
  'Planning ahead is a gift to your loved ones. Every detail you add helps ensure your wishes are honored.' as description,
  5 as priority,
  'light' as emotional_weight
FROM users
WHERE id NOT IN (
  SELECT DISTINCT user_id FROM user_cards WHERE card_type = 'affirmation' AND title = 'You''re Taking Important Steps'
);

-- Example reflection card
INSERT INTO user_cards (user_id, card_type, title, description, priority, emotional_weight)
SELECT 
  id as user_id,
  'reflection' as card_type,
  'What Matters Most?' as title,
  'Take a moment to reflect: What legacy do you want to leave? What stories do you want to share?' as description,
  4 as priority,
  'medium' as emotional_weight
FROM users
WHERE id NOT IN (
  SELECT DISTINCT user_id FROM user_cards WHERE card_type = 'reflection' AND title = 'What Matters Most?'
);



