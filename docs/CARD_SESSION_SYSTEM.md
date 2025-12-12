# Card Session System - Extended Features

## Overview

The card session system now supports persistent sessions that allow users to complete action cards, navigate to sections, and return to remaining cards without forcing navigation.

## Key Features

### 1. Card Sessions
- Each mobile login creates a `card_session_id`
- Session contains 5-7 cards maximum
- Session persists until all cards are completed/snoozed OR user explicitly exits

### 2. Action Card Flow
When user swipes right on an action card:
- Card is marked as `engaged`
- User navigates to `linked_section` with query params:
  - `from_card=true`
  - `card_id=<card_id>`
  - `session_id=<session_id>`
- Flow pauses (doesn't complete)

### 3. Completion State
After user completes/exits a section:
- If accessed from card (`from_card=true`), redirects to `/dashboard/cards` with same params
- `CardCompletionState` component shows with options:
  - **Continue** → Returns to next card in session
  - **Go to Dashboard** → Ends session, goes to dashboard

### 4. Early Exit Handling
If user:
- Uses back navigation
- Closes section
- Leaves mid-task

Then:
- Partial progress is saved (if any)
- Card marked as `engaged` with `exited_early=true`
- User routed to dashboard by default
- No auto-return to cards

### 5. Resume Card Button
- Floating button appears on dashboard when:
  - Active session exists
  - Pending cards remain
  - Not already in card flow
- Clicking resumes session at next card

## Database Schema

### New Tables

**`card_sessions`**
- `id` (UUID)
- `user_id` (UUID)
- `created_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ, nullable)
- `is_active` (BOOLEAN)

**`card_session_items`**
- `id` (UUID)
- `session_id` (UUID)
- `card_id` (UUID)
- `status` ('pending' | 'engaged' | 'completed' | 'snoozed')
- `origin` ('card' | 'dashboard')
- `exited_early` (BOOLEAN)
- `completed_at` (TIMESTAMPTZ, nullable)
- `engaged_at` (TIMESTAMPTZ, nullable)

## API Routes

### Session Management

**`GET /api/user/cards/session`**
- Gets or creates active session
- Returns session and items

**`POST /api/user/cards/session`**
- Creates new session with card_ids array
- Deactivates existing active sessions

**`POST /api/user/cards/session/item`**
- Updates session item status
- Fields: `session_id`, `card_id`, `status`, `exited_early`

**`POST /api/user/cards/session/complete`**
- Marks session as completed
- Sets `is_active=false`, `completed_at=now()`

### Card Fetching

**`GET /api/user/cards?session_id=<id>`**
- Returns pending cards for existing session
- Filters by `status='pending'`

## Components

### `useCardSession` Hook
```typescript
const {
  session,
  sessionItems,
  loading,
  getOrCreateSession,
  markCardEngaged,
  markCardCompleted,
  getNextPendingCard,
  hasPendingCards,
  completeSession,
  resumeSession,
} = useCardSession();
```

### `useCardNavigation` Hook
```typescript
const {
  fromCard,
  cardId,
  sessionId,
  completeCardTask,
  exitCardTask,
  isFromCard,
  getCardId,
} = useCardNavigation();
```

### `CardCompletionState` Component
Shows after completing/exiting a section accessed from a card.

### `ResumeCardButton` Component
Floating button on dashboard to resume card session.

## Integration Guide for Sections

### Option 1: Using `useCardNavigation` Hook

```typescript
import { useCardNavigation } from '@/hooks/useCardNavigation';

export default function MySectionPage() {
  const { fromCard, completeCardTask, exitCardTask } = useCardNavigation();
  
  const handleSave = async () => {
    // ... save logic ...
    
    if (fromCard) {
      // Redirect to card completion state
      completeCardTask();
    } else {
      router.push('/dashboard');
    }
  };
  
  const handleBack = () => {
    if (fromCard) {
      // Mark as exited early
      exitCardTask();
    } else {
      router.back();
    }
  };
}
```

### Option 2: Manual Query Param Check

```typescript
import { useSearchParams, useRouter } from 'next/navigation';

export default function MySectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromCard = searchParams.get('from_card') === 'true';
  const cardId = searchParams.get('card_id');
  
  const handleSave = async () => {
    // ... save logic ...
    
    if (fromCard && cardId) {
      // Redirect to card completion state
      router.push(`/dashboard/cards?from_card=true&card_id=${cardId}`);
    } else {
      router.push('/dashboard');
    }
  };
}
```

## Card Status Flow

1. **Pending** → Initial state when card added to session
2. **Engaged** → User navigated to linked section
   - `engaged_at` set
   - `exited_early` set if user left before completing
3. **Completed** → User finished the task
   - `completed_at` set
   - Card removed from pending list
4. **Snoozed** → User swiped left
   - Card snoozed for 7 days
   - Removed from session

## Session Lifecycle

1. **Creation**: On mobile login, if cards available
2. **Active**: User interacting with cards
3. **Paused**: User navigated to section from action card
4. **Resumed**: User returns via completion state or resume button
5. **Completed**: All cards completed/snoozed OR user explicitly exits

## Best Practices

1. **Always save progress** before redirecting
2. **Check `from_card`** before redirecting after save
3. **Use `completeCardTask()`** for successful completion
4. **Use `exitCardTask()`** for early exits
5. **Don't force navigation** - let user choose via completion state

## Testing Checklist

- [ ] Card session created on mobile login
- [ ] Action card navigates to section with params
- [ ] Completion state shows after section save
- [ ] Continue button returns to next card
- [ ] Dashboard button ends session
- [ ] Resume button appears when session active
- [ ] Early exit marks card as engaged
- [ ] Session completes when all cards done
- [ ] No auto-return on early exit

