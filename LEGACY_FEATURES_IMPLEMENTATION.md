# Legacy Features Implementation Plan

## Overview
This document outlines the emotional, legacy-focused features to enhance user engagement and create deep emotional investment in the Going Home app.

## ✅ Already Implemented

1. **Legacy Letters (Basic)** - ✅ Basic letters functionality exists
2. **Memory Vault** - ✅ `legacy_messages` table for video/audio messages
3. **Funeral Playlist** - ✅ Part of funeral planning features
4. **Ceremony Script Builder** - ✅ Part of funeral planning features
5. **Emergency Summary** - ✅ `final-summary` page exists
6. **Life Story Builder** - ✅ `personal_biography` table and page
7. **Funeral Vision Board** - ✅ Moodboard feature in funeral planning
8. **Trusted Contacts** - ✅ Basic trusted contacts with executor functionality
9. **Peace Score (Basic)** - ✅ Completion tracking on dashboard

## 🆕 New Features to Implement

### High Priority (Emotional Hooks)

#### 1. **Timed Release Letters** 🎁
- **Status**: Database schema ✅, UI pending
- **Features**:
  - Release on specific dates (birthdays, anniversaries)
  - Release on milestones (graduation, wedding, first child)
  - "In case I pass unexpectedly" letters
  - Set who receives each letter
- **Impact**: Users write letters for future events → never cancel

#### 2. **My Last Gift Feature** 💝
- **Status**: Database schema ✅, UI pending
- **Features**:
  - Special messages: notes, blessings, funny messages, private memories
  - Trigger conditions: after death, on date, on milestone
  - Photo attachments
  - One final message to loved ones
- **Impact**: Deeply emotional, creates lasting connection

#### 3. **What I Want You To Know** 📝
- **Status**: Database schema ✅, UI pending
- **Features**:
  - Guided journaling prompts:
    - "What I want my children to remember about me"
    - "The five values I hope you live out"
    - "The wisdom I wish someone told me sooner"
    - "What I hope you do with your life"
  - AI-assisted prompts for reflection
  - Organized by category (values, wisdom, memories, hopes)
- **Impact**: Creates living legacy document

#### 4. **Comfort Messages** 💌
- **Status**: Database schema ✅, UI + delivery system pending
- **Features**:
  - Pre-written messages sent automatically when user passes
  - Can include: note, memory, blessing, Bible verse
  - Delivery via email/text
  - Curated messages per recipient
- **Impact**: Immediate comfort to loved ones during grief

#### 5. **Enhanced Peace Score** 📊
- **Status**: Database schema ✅, UI pending
- **Features**:
  - Detailed breakdown: "You're 78% prepared"
  - Motivational messaging: "Your loved ones will feel peace—well done"
  - Visual progress indicators
  - Suggestions for improvement
- **Impact**: Gamification motivates completion

### Medium Priority (Feature Enhancements)

#### 6. **Faith Preferences Section** ✝️
- **Status**: Database schema ✅, UI pending
- **Features**:
  - Favorite Bible verses
  - Service preferences
  - Prayer instructions
  - Preferred pastor/church contacts
  - Worship songs
  - Faith story/testimonial
- **Impact**: Spiritual grounding for faith-centered users

#### 7. **Guardian Angel Contacts** 👼
- **Status**: Database schema ✅, UI pending
- **Features**:
  - Designate special trusted contact
  - Special letter thanking them
  - Emergency access instructions
  - Funeral preference handler
- **Impact**: Creates emotional buy-in from both sides

#### 8. **Enhanced Memory Vault** 🎙️
- **Status**: Schema enhancement ✅, UI updates pending
- **Features**:
  - Categories: spouse, children, prayers, blessings, advice, final words
  - Better organization
  - Quick recording prompts
- **Impact**: More organized, easier to create

#### 9. **AI-Guided Life Story Builder** 🤖
- **Status**: Biography exists, AI prompts pending
- **Features**:
  - Reflective questions:
    - "What was the happiest moment in your life?"
    - "Who changed your life the most?"
    - "What are you most proud of?"
  - Progressive building over time
  - AI helps organize and expand
- **Impact**: Transforms biography into emotional journey

## Implementation Order

### Phase 1: Core Emotional Features (Week 1-2)
1. Timed Release Letters - Enhanced letter form with release options
2. My Last Gift - New feature page and creation form
3. What I Want You To Know - Journaling page with prompts

### Phase 2: Delivery & Comfort (Week 3)
4. Comfort Messages - Creation UI and delivery system
5. Enhanced Peace Score - Dashboard integration

### Phase 3: Faith & Organization (Week 4)
6. Faith Preferences - New dedicated section
7. Guardian Angel - Enhanced trusted contacts
8. Enhanced Memory Vault - UI improvements

### Phase 4: AI Enhancement (Week 5)
9. AI-Guided Life Story Builder - Enhanced biography with prompts

## Database Schema

The complete schema is in `supabase/legacy_features_schema.sql` and includes:
- Enhanced `letters` table with timed release
- Enhanced `legacy_messages` with categories
- New `last_gifts` table
- New `legacy_journal` table
- New `faith_preferences` table
- New `comfort_messages` table
- Enhanced `trusted_contacts` with guardian angel
- New `peace_score` table for tracking

## Next Steps

1. ✅ Database schema created
2. ⏭️ Run schema migration in Supabase
3. ⏭️ Create API routes for new features
4. ⏭️ Build UI components
5. ⏭️ Integrate into dashboard
6. ⏭️ Test timed release logic
7. ⏭️ Set up delivery system for comfort messages

