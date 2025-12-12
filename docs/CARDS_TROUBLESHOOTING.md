# Cards System Troubleshooting

## Cards Not Showing Up

If cards aren't appearing when you log in, check the following:

### 1. Check Database Tables

Make sure you've run the migration SQL:
```sql
-- Run this in Supabase SQL Editor
-- File: lib/migrations/create_cards_tables.sql
```

### 2. Check User Preference

Cards won't show if `show_cards_on_login` is set to `false`:

```sql
SELECT id, email, show_cards_on_login, login_count 
FROM users 
WHERE id = 'your-user-id';
```

### 3. Check if Cards Exist

```sql
SELECT * FROM user_cards WHERE user_id = 'your-user-id';
```

If no cards exist, they should be automatically created on first fetch. Check server logs for:
- "Creating X default cards for user..."
- "Successfully created default cards"

### 4. Check Console Logs

In browser console, look for:
- "Fetched cards: X"
- "No cards available, redirecting to dashboard"

In server logs, look for:
- "Returning X cards for user..."
- Any errors creating cards

### 5. Check Mobile Detection

Cards only show on mobile. Verify:
- Window width < 768px OR
- User agent contains mobile keywords

### 6. Manual Card Creation

If cards aren't being created automatically, you can create them manually:

```sql
INSERT INTO user_cards (
  user_id,
  card_type,
  title,
  description,
  linked_section,
  priority,
  emotional_weight
) VALUES (
  'your-user-id',
  'action',
  'Complete Your Personal Details',
  'Add your name, address, and contact information.',
  '/dashboard/personal-details',
  10,
  'light'
);
```

### 7. Check Section Completion

Cards are filtered based on incomplete sections. If all sections are complete, only affirmation/reflection cards will show.

Check incomplete sections:
```sql
-- This is what the API checks
SELECT * FROM personal_details WHERE user_id = 'your-user-id';
SELECT * FROM documents WHERE user_id = 'your-user-id';
-- etc.
```

### 8. Common Issues

**Issue**: Cards created but not showing
- **Fix**: Check `last_shown_at` - cards shown in last 24 hours are filtered out
- **Fix**: Check `snoozed_until` - snoozed cards are filtered out

**Issue**: No cards being created
- **Fix**: Check server logs for errors
- **Fix**: Verify user_id is correct
- **Fix**: Check if cards already exist (might be duplicates)

**Issue**: Cards show but disappear immediately
- **Fix**: Check if `selectCards` is filtering them out
- **Fix**: Verify section key matching logic

### 9. Debug Endpoint

You can test the cards API directly:

```bash
# Get your session cookie first, then:
curl -H "Cookie: session=your-session-id" \
  http://localhost:3000/api/user/cards
```

### 10. Force Card Creation

To force create cards for a user:

```sql
-- Delete existing cards
DELETE FROM user_cards WHERE user_id = 'your-user-id';

-- Cards will be recreated on next API call
```

