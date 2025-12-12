# StillReady Navigation Tree

## Public Routes
```
/
├── /auth/login
├── /auth/signup
├── /auth/verify-2fa
└── /onboarding
```

## Main Dashboard Navigation (Sidebar)

### Quick Start
- `/dashboard` - Dashboard
- `/dashboard/if-something-happens` - If Something Happens
- `/dashboard/personal-details` - Personal Details
- `/dashboard/letters` - Messages & Guidance
- `/dashboard/documents` - Important Documents
- `/dashboard/trusted-contacts` - Emergency & Trusted Contacts

### Life Events & Memorial
- `/dashboard/life-event-planning` - Life Event Planning
- `/dashboard/funeral-preferences` - Life Event Preferences
- `/dashboard/my-music` - My Music
- `/dashboard/funeral-cost-calculator` - Life Event Cost Calculator

### Legacy & Messages
- `/dashboard/family-legacy` - Family Legacy
  - `/dashboard/family-legacy/recipes` - Recipes
  - `/dashboard/family-legacy/stories` - Stories
  - `/dashboard/family-legacy/traditions` - Traditions
  - `/dashboard/family-legacy/routines` - Routines
  - `/dashboard/family-legacy/heirlooms` - Heirlooms
  - `/dashboard/family-legacy/advice` - Advice
  - `/dashboard/family-legacy/instructions` - Instructions
  - `/dashboard/family-legacy/letters` - Letters
  - `/dashboard/family-legacy/playlists` - Playlists
- `/dashboard/legacy-messages` - Legacy Messages
- `/dashboard/biography` - Biography

### Health & Care
- `/dashboard/medical-contacts` - Medical & Legal
- `/dashboard/end-of-life-directives` - Care Preferences & Directives
  - `/dashboard/end-of-life-directives/care-location` - Care Location
  - `/dashboard/end-of-life-directives/visitors` - Visitors
  - `/dashboard/end-of-life-directives/spiritual-care` - Spiritual Care
  - `/dashboard/end-of-life-directives/pain-management` - Pain Management
  - `/dashboard/end-of-life-directives/life-sustaining` - Life Sustaining Treatment
  - `/dashboard/end-of-life-directives/organ-donation` - Organ Donation
  - `/dashboard/end-of-life-directives/sensory-environment` - Sensory Environment
  - `/dashboard/end-of-life-directives/final-moments` - Final Moments
  - `/dashboard/end-of-life-directives/emergency-instructions` - Emergency Instructions
- `/dashboard/end-of-life-checklist` - Care Checklist

### Financial & Legal
- `/dashboard/assets` - Assets
- `/dashboard/insurance-financial` - Insurance & Financial
- `/dashboard/digital-accounts` - Digital Accounts
- `/dashboard/will-questionnaire` - Will Questionnaire
  - `/dashboard/will-questionnaire/edit` - Edit Will Questionnaire

### Personal & Family
- `/dashboard/children-wishes` - Children's Wishes
- `/dashboard/household` - Household Info

### Settings
- `/dashboard/access-overview` - Access Overview
- `/dashboard/shared-with-me` - Shared With Me
- `/dashboard/final-summary` - Complete Summary
- `/dashboard/release-settings` - Access Rules
- `/dashboard/account-settings` - Account Settings

## Additional Dashboard Routes (Not in Sidebar)

### Funeral Planning (Legacy/Internal Routes)
- `/dashboard/funeral-planning` - Funeral Planning
  - `/dashboard/funeral-planning/story` - Life Story
  - `/dashboard/funeral-planning/themes` - Themes
  - `/dashboard/funeral-planning/moodboard` - Mood Board
  - `/dashboard/funeral-planning/playlist` - Playlist
  - `/dashboard/funeral-planning/script` - Ceremony Script
  - `/dashboard/funeral-planning/eulogy` - Eulogy
  - `/dashboard/funeral-planning/letters` - Letters
  - `/dashboard/funeral-planning/planning-board` - Planning Board

## Viewer Routes (Read-Only Access)
```
/viewer
├── /viewer/login
├── /viewer/dashboard
├── /viewer/access
├── /viewer/personal-details
├── /viewer/medical-contacts
├── /viewer/funeral-preferences
├── /viewer/documents
├── /viewer/letters
├── /viewer/legacy-messages
├── /viewer/biography
├── /viewer/family-legacy
├── /viewer/end-of-life-checklist
├── /viewer/end-of-life-directives
├── /viewer/will-questionnaire
├── /viewer/assets
├── /viewer/insurance-financial
├── /viewer/digital-accounts
├── /viewer/children-wishes
├── /viewer/household
├── /viewer/final-summary
└── /viewer/release-settings
```

## Executor Routes
```
/executor
├── /executor/login
├── /executor/dashboard
├── /executor/access
├── /executor/accounts
└── /executor/invite/accept
```

## API Routes Structure

### Authentication
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/signup`
- `/api/auth/status`
- `/api/auth/verify-2fa`

### User Data
- `/api/user/status`
- `/api/user/personal-details`
- `/api/user/trusted-contacts`
- `/api/user/medical-contacts`
- `/api/user/insurance-financial`
- `/api/user/documents`
- `/api/user/letters`
- `/api/user/funeral-preferences`
- `/api/user/family-legacy/*` (12 sub-routes)
- `/api/user/legacy-messages`
- `/api/user/biography`
- `/api/user/assets`
- `/api/user/digital-accounts`
- `/api/user/will-questionnaire`
- `/api/user/end-of-life-directives`
- `/api/user/end-of-life-checklist`
- `/api/user/children-wishes`
- `/api/user/household`
- `/api/user/final-summary`
- `/api/user/release-settings`
- `/api/user/granted-access`
- `/api/user/shared-with-me`
- `/api/user/profile-picture`
- `/api/user/photo`
- `/api/user/upload-photo`
- `/api/user/saved-songs`
- `/api/user/playlist`
- `/api/user/onboarding`
- `/api/user/delete-account`

### AI Services
- `/api/ai/onboarding`
- `/api/ai/biography`
- `/api/ai/checklist`
- `/api/ai/letters`
- `/api/ai/legacy-message`
- `/api/ai/funeral-preferences`
- `/api/ai/document-summary`
- `/api/ai/executor-guide`

### Funeral Planning Tools
- `/api/funeral/cost-calculator`
- `/api/funeral/story`
- `/api/funeral/life-themes`
- `/api/funeral/moodboard`
- `/api/funeral/playlist`
- `/api/funeral/script`
- `/api/funeral/eulogy`
- `/api/funeral/letter`
- `/api/funeral/planning-board`

### Spotify Integration
- `/api/spotify/auth`
- `/api/spotify/callback`
- `/api/spotify/access-token`
- `/api/spotify/playlists`
- `/api/spotify/playlist-tracks`
- `/api/spotify/search`
- `/api/spotify/premium-status`

### Viewer Access
- `/api/viewer/access`
- `/api/viewer/invite`
- `/api/viewer/verify-token`
- `/api/viewer/data`

### Executor Access
- `/api/executor/invite`
- `/api/executor/verify`
- `/api/executor/accounts`
- `/api/executor/account-info`
- `/api/executor/data`

### Utilities
- `/api/documents/extract-text`
- `/api/export-will-questionnaire`

## Navigation Hierarchy Summary

### Primary User Flow
1. **Landing** → `/` → `/auth/login` or `/auth/signup`
2. **Onboarding** → `/onboarding`
3. **Dashboard** → `/dashboard` (main hub)
4. **Feature Pages** → Various `/dashboard/*` routes

### Access Modes
- **Owner Mode**: Full access to `/dashboard/*` routes
- **Viewer Mode**: Read-only access to `/viewer/*` routes
- **Executor Mode**: Special access to `/executor/*` routes

### Section Organization (Sidebar)
1. **Quick Start** (6 items) - Essential preparedness items
2. **Life Events & Memorial** (4 items) - Event planning and preferences
3. **Legacy & Messages** (3 items) - Stories, messages, biography
4. **Health & Care** (3 items) - Medical and care directives
5. **Financial & Legal** (4 items) - Assets, insurance, legal docs
6. **Personal & Family** (2 items) - Family-specific information
7. **Settings** (5 items) - Access control and account management

