# Going Home App - Complete Project Summary for ChatGPT

## PROJECT OVERVIEW
"Going Home" is a peaceful, end-of-life planning web application built with Next.js, React, TypeScript, Supabase, and OpenAI. The app helps users securely store their end-of-life information, documents, preferences, and messages for loved ones. It emphasizes simplicity, emotional safety, and trustworthiness.

**GitHub Repository:** https://github.com/croftbusiness/going-home
**Deployment:** Vercel (production)

---

## TECHNOLOGY STACK

### Frontend
- **Framework:** Next.js 15.1.3 (App Router)
- **UI Library:** React 19.0.0
- **Language:** TypeScript 5.7.2
- **Styling:** Tailwind CSS 3.4.17
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email/password + OAuth)
- **Storage:** Supabase Storage (documents, photos, legacy messages)
- **API Routes:** Next.js API Routes (server-side)

### AI Integration
- **AI Provider:** OpenAI (gpt-4o-mini model)
- **Features:** Checklist generation, letter generation, document analysis, funeral preferences, legacy message coaching

### Additional Libraries
- `pdf-lib` - PDF generation for Will Questionnaire
- `bcryptjs` - Password hashing
- `nodemailer` - Email notifications
- `@googlemaps/js-api-loader` - Google Maps integration

---

## CORE FEATURES IMPLEMENTED

### 1. User Authentication & Accounts
- Email/password authentication
- Google OAuth integration
- Session management
- Password hashing with bcrypt
- Two-factor authentication support (structure in place)

### 2. Dashboard Sections (18 Total Sections)

#### Personal Information
- **Personal Details:** Full name, date of birth, address, emergency contact, phone, email
- **Medical & Legal Contacts:** Physician name/phone, lawyer contact, medical notes
- **Biography:** Life story and personal history

#### Planning & Preferences
- **Funeral Preferences:** Burial/cremation, funeral home, service type, songs (3 choices), atmosphere wishes, clothing preferences
- **Will Questionnaire:** Multi-step questionnaire (8 steps) with PDF export - collects personal info, executor, guardians, bequests, digital assets
- **End-of-Life Checklist:** User-managed checklist items

#### Documents & Content
- **Documents:** Upload and manage documents (Will, ID, Insurance, Deed, Other) - PDF, JPG, PNG, DOCX supported
- **Letters to Loved Ones:** Write personal messages to trusted contacts, assign recipients, set visibility after death
- **Legacy Messages:** Audio/video message support structure

#### Contacts & Access
- **Trusted Contacts:** Add contacts with granular permissions (view personal details, medical contacts, funeral preferences, documents, letters)
- **Release Settings:** Manual release mechanism with executor contact and unlock code

#### Financial & Legal
- **Assets:** Track physical and financial assets
- **Digital Accounts:** Store account information (banking, social media, subscriptions)
- **Insurance & Financial:** Contact information for insurance and financial accounts

#### Additional Sections
- **Household Info:** Household and property information
- **Children's Wishes:** Special instructions for children and guardians
- **Final Summary:** Overview of all completed information

### 3. AI-Powered Features

#### AI Checklist Builder
- Analyzes user profile completeness
- Generates personalized suggestions based on missing data
- Categories: personal_info, documents, letters, contacts, preferences
- Priority levels: high, medium, low
- Action links to relevant dashboard sections
- Fast generation using OpenAI JSON mode

#### AI Letter Generator
- Generate letters to loved ones based on recipient, relationship, tone, and topics
- Tone options: heartfelt, spiritual, humorous, legacy
- Integrated into Letters page

#### Legacy Message Coach
- Improve existing messages with AI suggestions
- Generate ideas for what to include
- Integrated into Letters page message editor

#### Document Analyzer
- AI-powered document analysis (placeholder - structure ready)
- Summarize uploaded documents
- Extract key points

#### AI Funeral Preference Generator
- Generate funeral preferences based on tone, music, cultural background
- Integrated into Funeral Preferences page

#### AI-Guided Onboarding Assistant
- Conversational onboarding flow (structure in place)

### 4. Data Management Features

#### Auto-Population
- Personal details auto-populate in Will Questionnaire
- Emergency contact details pre-fill in Trusted Contacts
- Reduces duplicate data entry

#### Progress Tracking
- Dashboard shows completion percentage
- Visual progress bar
- Section-by-section completion status

---

## DATABASE SCHEMA (Supabase PostgreSQL)

### Core Tables
- **users:** User accounts, authentication data
- **sessions:** User session management
- **two_factor_codes:** 2FA code storage
- **personal_details:** Personal information (name, DOB, address, emergency contact)
- **medical_contacts:** Physician and lawyer information
- **funeral_preferences:** Funeral wishes, songs, service preferences
- **trusted_contacts:** Trusted contact list with permissions
- **documents:** Document metadata (links to Supabase Storage)
- **letters:** Personal letters to loved ones
- **release_settings:** Release mechanism configuration

### Additional Tables
- **will_questionnaires:** Multi-step will questionnaire data (JSONB fields)
- **assets:** Physical and financial assets
- **digital_accounts:** Online account information
- **insurance_financial:** Insurance and financial contacts
- **household:** Household information
- **children_wishes:** Children's wishes and guardian info
- **biography:** Life story text
- **end_of_life_checklist:** User checklist items
- **legacy_messages:** Legacy message metadata
- **activity_log:** Audit trail for access tracking

### Storage Buckets (Supabase Storage)
- **documents:** Document uploads (PDF, JPG, PNG, DOCX)
- **photos:** Photo uploads
- **legacy-messages:** Legacy message media files

### Security
- Row Level Security (RLS) enabled on all tables
- Policies ensure users can only access their own data
- Storage bucket policies enforce user isolation

---

## DESIGN SYSTEM

### Color Palette
- **Background:** #FAF9F7 (Warm White)
- **Cards:** #FCFAF7 (Soft Ivory)
- **Text:** #2C2A29 (Deep Charcoal)
- **Primary CTA:** #A5B99A (Muted Sage)
- **Secondary Action:** #93B0C8 (Dusty Blue)
- **Highlight/Success:** #EBD9B5 (Faint Gold)

### Typography
- Font families: Inter, Nunito (system font fallbacks)
- Large, generous line heights
- Clear visual hierarchy
- Rounded, approachable feel

### UI Principles
- Minimalist design with abundant whitespace
- Gentle animations (slow fades, subtle transitions)
- Card-based layouts
- Mobile-first responsive design
- Touch-friendly (minimum 44px touch targets)
- Large, clear form inputs (16px font size to prevent iOS zoom)

### Mobile Optimization
- Responsive grid layouts (1 column mobile, 2-3 columns desktop)
- Collapsible sidebar navigation
- Full-width buttons on mobile
- Optimized spacing and typography for small screens
- Touch-optimized input fields and buttons

---

## API STRUCTURE

### Authentication Routes
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/signup` - Create account
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check auth status

### User Data Routes
- `GET/POST /api/user/personal-details`
- `GET/POST /api/user/medical-contacts`
- `GET/POST /api/user/funeral-preferences`
- `GET/POST /api/user/trusted-contacts`
- `GET/POST /api/user/documents`
- `GET/POST /api/user/letters`
- `GET/POST /api/user/will-questionnaire`
- `GET/POST /api/user/assets`
- `GET/POST /api/user/digital-accounts`
- `GET /api/user/status` - Get completion status for all sections

### AI Routes
- `POST /api/ai/checklist` - Generate personalized checklist
- `POST /api/ai/letters` - Generate letter drafts
- `POST /api/ai/legacy-message` - Legacy message coaching
- `POST /api/ai/document-summary` - Document analysis
- `POST /api/ai/funeral-preferences` - Generate funeral preferences
- `POST /api/ai/onboarding` - Onboarding assistant

### Export Routes
- `POST /api/export-will-questionnaire` - Generate PDF from questionnaire

---

## FILE STRUCTURE

```
app/
├── api/                    # API routes
│   ├── auth/              # Authentication
│   ├── user/              # User data CRUD
│   ├── ai/                # AI features
│   └── export-will-questionnaire/
├── dashboard/             # Dashboard pages (18 sections)
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Dashboard layout with sidebar
│   └── [section]/        # Individual section pages
├── auth/                  # Auth pages (login, signup)
├── executor/              # Executor access views
└── globals.css           # Global styles

components/
├── ai/                    # AI feature components
│   ├── AIChecklist.tsx
│   ├── AILetterGenerator.tsx
│   ├── LegacyMessageCoach.tsx
│   ├── DocumentAnalyzer.tsx
│   ├── FuneralPreferenceGenerator.tsx
│   └── OnboardingAssistant.tsx

lib/
├── auth.ts               # Authentication utilities
├── supabase-server.ts    # Supabase client creation
├── utils/
│   └── ai.ts            # OpenAI integration
└── email.ts             # Email sending utilities

types/
├── index.ts             # TypeScript interfaces
└── ai.ts                # AI-related types

supabase/
├── functions/           # Supabase Edge Functions (optional)
└── schema.sql          # Database schema (for reference)
```

---

## ENVIRONMENT VARIABLES REQUIRED

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Email (optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Twilio (optional, for SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

---

## KEY IMPLEMENTATION DETAILS

### Authentication Flow
1. User signs up → Supabase Auth creates account
2. User record created in custom `users` table (for foreign key compatibility)
3. Session created and stored in `sessions` table
4. Session cookie set for subsequent requests

### Data Release Mechanism
- Manual release via Release Settings page
- Executor contact designated with unlock code
- Once triggered, `release_activated` flag set to true
- Trusted contacts gain access based on permissions

### AI Checklist Optimization
- Uses OpenAI JSON mode for fast, structured responses
- Reduced token usage (600 max tokens)
- Fallback suggestions if AI parsing fails
- Action URLs map to correct dashboard sections
- Full text display (no truncation)

### Mobile-First Design
- All components optimized for mobile screens
- Touch targets minimum 44-48px
- Inputs use 16px font to prevent iOS zoom
- Responsive grids and layouts
- Collapsible sidebar on mobile

### File Uploads
- Supabase Storage for file storage
- User-isolated buckets (files stored per user ID)
- Supported formats: PDF, JPG, PNG, DOCX
- File size validation
- Secure download URLs

---

## CURRENT STATUS

### ✅ Fully Implemented
- User authentication (email/password + OAuth)
- All 18 dashboard sections with CRUD operations
- AI checklist builder (optimized for speed)
- AI letter generator
- Legacy message coach
- AI funeral preference generator
- Document upload and management
- Will Questionnaire with PDF export
- Trusted contacts with granular permissions
- Release settings mechanism
- Mobile-optimized UI
- Progress tracking
- Auto-population features

### 🔄 Partially Implemented / Structure Ready
- Document analyzer (structure in place, needs OCR implementation)
- Onboarding assistant (structure in place)
- 2FA (structure in place, needs full implementation)
- Executor portal (basic structure)

### 📋 Future Considerations
- Audio/video legacy messages processing
- Advanced document OCR
- Automated death verification
- Payment/subscription system
- Advanced collaboration features

---

## RECENT UPDATES & OPTIMIZATIONS

1. **Mobile Optimization (Latest)**
   - Comprehensive mobile responsiveness across all pages
   - Touch-optimized inputs and buttons
   - Improved spacing and typography for small screens

2. **AI Checklist Performance**
   - Optimized for faster generation (JSON mode)
   - Fixed action links to navigate correctly
   - Removed text truncation issues

3. **Auto-Population**
   - Personal details pre-fill in Will Questionnaire
   - Emergency contact pre-fills in Trusted Contacts

4. **PDF Generation**
   - Will Questionnaire PDF export working
   - Moved from Edge Function to Next.js API route for reliability

---

## DEPLOYMENT

- **Platform:** Vercel
- **Build Command:** `npm run build`
- **Node Version:** 18+ (check Vercel settings)
- **Environment Variables:** Set in Vercel dashboard

---

## NOTES FOR DEVELOPMENT

- The app emphasizes emotional safety and simplicity
- All AI outputs maintain a gentle, supportive, non-legal-advice tone
- Security is paramount - RLS policies ensure data isolation
- Mobile experience is prioritized
- Code follows TypeScript best practices
- Error handling and loading states are implemented throughout

---

**This is a comprehensive summary of the Going Home app. Use this as context for any questions or feature development requests.**



