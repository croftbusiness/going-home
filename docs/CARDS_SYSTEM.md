# Swipeable Cards System

## Overview

The swipeable cards system provides mobile users with a guided experience after login, showing actionable cards that help them navigate through incomplete sections and important tasks.

## Architecture

### Components

1. **`SwipeCard`** (`components/cards/SwipeCard.tsx`)
   - Individual card component with swipe gestures
   - Supports touch and mouse interactions
   - Handles swipe left (snooze) and swipe right (action/acknowledge)

2. **`SwipeCardFlow`** (`components/cards/SwipeCardFlow.tsx`)
   - Manages the card stack
   - Handles card fetching and selection
   - Tracks interactions and snoozes
   - Shows preference prompt after 2-3 logins

3. **`CardPreferencePrompt`** (`components/cards/CardPreferencePrompt.tsx`)
   - Modal prompt asking users if they want to see cards on login
   - Appears after 2-3 logins

### Hooks

- **`useDeviceDetection`** (`hooks/useDeviceDetection.ts`)
  - Detects mobile vs desktop using viewport width and user agent
  - Returns `{ isMobile }` boolean

### API Routes

1. **`GET /api/user/cards`**
   - Fetches available cards for the user
   - Filters based on snooze status, recent shows, and incomplete sections
   - Returns up to 7 cards per session

2. **`POST /api/user/cards/interact`**
   - Records card swipe interactions
   - Stores direction (left/right) and timestamp

3. **`POST /api/user/cards/snooze`**
   - Snoozes a card for 7 days
   - Updates `snoozed_until` timestamp

4. **`GET /api/user/cards/preference`**
   - Gets user preference for showing cards
   - Returns `show_cards` and `login_count`

5. **`POST /api/user/cards/preference`**
   - Updates user preference for showing cards

### Database Schema

Run the migration SQL file: `lib/migrations/create_cards_tables.sql`

**Tables:**

1. **`user_cards`**
   - Stores card definitions per user
   - Fields: id, user_id, card_type, title, description, linked_section, priority, emotional_weight, snoozed_until, last_shown_at

2. **`card_interactions`**
   - Tracks all swipe interactions
   - Fields: id, user_id, card_id, direction, created_at

3. **`users`** (additions)
   - `show_cards_on_login` (boolean) - User preference
   - `login_count` (integer) - Tracks login count for preference prompt

## Card Types

1. **`action`** - Links to a specific section/task
   - Swipe right navigates to `linked_section`
   - Example: "Complete your Personal Details"

2. **`affirmation`** - Non-interactive encouragement
   - Swipe right acknowledges and advances
   - Example: "You're making great progress!"

3. **`reflection`** - Optional thought prompt
   - Swipe right acknowledges and advances
   - Example: "Take a moment to reflect on..."

## Card Selection Logic

Cards are selected based on:

1. **Incomplete Sections** - Prioritizes action cards for incomplete sections
2. **Emotional Weight** - Only one "heavy" card per session
3. **Snooze Status** - Excludes snoozed cards
4. **Recent Shows** - Excludes cards shown in last 24 hours
5. **Priority** - Higher priority cards shown first
6. **Maximum** - Maximum 7 cards per session

## Integration Points

### Login Flow

1. **`app/auth/login/page.tsx`**
   - After successful login, checks if mobile
   - If mobile and preference allows, redirects to `/dashboard/cards`
   - Otherwise redirects to `/dashboard`

2. **`app/auth/callback/route.ts`**
   - OAuth callback handler
   - Increments login count
   - Checks mobile and preference
   - Redirects to cards if appropriate

### Dashboard

- **`app/dashboard/cards/page.tsx`**
  - Card flow page
  - Redirects to dashboard when complete

## Usage

### Creating Cards

Insert cards into `user_cards` table:

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
  'user-uuid',
  'action',
  'Complete Personal Details',
  'Add your name, address, and contact information to get started.',
  '/dashboard/personal-details',
  10,
  'light'
);
```

### Card Priority

- Higher numbers = higher priority
- Range typically 0-10
- Action cards for incomplete sections should have priority 8-10

### Emotional Weight

- **`light`** - Casual, encouraging (can show multiple)
- **`medium`** - Moderate emotional impact
- **`heavy`** - Deep, emotional content (max 1 per session)

## User Preferences

After 2-3 logins, users see a prompt asking if they want to continue seeing cards. This preference is stored in `users.show_cards_on_login`.

Users can always skip cards by:
1. Clicking the X button on any card
2. Swiping left to snooze
3. Disabling in preferences

## Future Enhancements

- Card templates for common scenarios
- A/B testing different card content
- Analytics on card effectiveness
- Custom card creation UI
- Card scheduling based on user progress

