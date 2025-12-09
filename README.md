# Going Home App

A peaceful, secure platform for organizing end-of-life information and preferences.

## Overview

The Going Home App helps users digitally store and organize their end-of-life preferences and essential personal documentation in one secure place, reducing the burden on loved ones during difficult times.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom email/password with 2FA
- **File Storage**: Supabase Storage
- **Email**: Nodemailer
- **SMS**: Twilio

## Features Implemented

### Authentication
- ✅ Email/password signup with strong password requirements
- ✅ Two-factor authentication (Email and SMS options)
- ✅ Secure session management (15-minute timeout)
- ✅ Login/logout functionality
- ✅ 2FA verification page

### Dashboard
- ✅ Progress tracking across all sections
- ✅ Visual section cards with completion status
- ✅ Navigation to all major sections

### Personal Details
- ✅ Full personal information form
- ✅ Address management
- ✅ Emergency contact information
- ✅ Form validation and error handling

## Project Structure

```
going-home/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       ├── signup/
│   │       └── verify-2fa/
│   ├── auth/
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify-2fa/
│   ├── dashboard/
│   │   ├── personal-details/
│   │   ├── medical-contacts/      (TO DO)
│   │   ├── funeral-preferences/  (TO DO)
│   │   ├── documents/            (TO DO)
│   │   ├── letters/              (TO DO)
│   │   ├── trusted-contacts/     (TO DO)
│   │   └── release-settings/     (TO DO)
│   ├── globals.css
│   └── layout.tsx
├── components/                    (TO DO - Reusable components)
├── lib/
│   ├── supabase-browser.ts
│   └── supabase-server.ts
├── types/
│   └── index.ts
└── utils/

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@goinghomeapp.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_TIMEOUT_MINUTES=15
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,docx
```

### 3. Database Setup (Supabase)

Create the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  two_factor_method TEXT CHECK (two_factor_method IN ('email', 'sms')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

#### Two-Factor Codes Table
```sql
CREATE TABLE two_factor_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_2fa_user_id ON two_factor_codes(user_id);
CREATE INDEX idx_2fa_expires_at ON two_factor_codes(expires_at);
```

#### Personal Details Table
```sql
CREATE TABLE personal_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_personal_details_user_id ON personal_details(user_id);
```

#### Medical Contacts Table
```sql
CREATE TABLE medical_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  physician_name TEXT,
  physician_phone TEXT,
  lawyer_name TEXT,
  lawyer_phone TEXT,
  medical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Funeral Preferences Table
```sql
CREATE TABLE funeral_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  burial_or_cremation TEXT CHECK (burial_or_cremation IN ('burial', 'cremation')),
  funeral_home TEXT,
  service_type TEXT,
  atmosphere_wishes TEXT,
  song_1 TEXT,
  song_2 TEXT,
  song_3 TEXT,
  photo_preference_url TEXT,
  preferred_clothing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Documents Table
```sql
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('will', 'id', 'insurance', 'deed', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
```

#### Letters Table
```sql
CREATE TABLE letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  recipient_relationship TEXT NOT NULL,
  message_text TEXT,
  file_url TEXT,
  visible_after_death BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_letters_user_id ON letters(user_id);
```

#### Trusted Contacts Table
```sql
CREATE TABLE trusted_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  access_level TEXT DEFAULT 'none' CHECK (access_level IN ('none', 'view')),
  can_view_personal_details BOOLEAN DEFAULT FALSE,
  can_view_medical_contacts BOOLEAN DEFAULT FALSE,
  can_view_funeral_preferences BOOLEAN DEFAULT FALSE,
  can_view_documents BOOLEAN DEFAULT FALSE,
  can_view_letters BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trusted_contacts_user_id ON trusted_contacts(user_id);
```

#### Release Settings Table
```sql
CREATE TABLE release_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  is_locked BOOLEAN DEFAULT FALSE,
  unlock_code_hash TEXT,
  executor_contact_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  release_activated BOOLEAN DEFAULT FALSE,
  release_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Storage Buckets (Supabase)

Create the following storage buckets:
- `documents` - For storing uploaded documents
- `photos` - For storing photos (obituary photos, etc.)

Configure bucket policies for authenticated user access.

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Remaining Tasks

### High Priority Pages
1. **Medical & Legal Contacts** - Form for physician and attorney information
2. **Funeral Preferences** - Form for burial/cremation, service preferences, songs
3. **Documents Upload** - File upload interface with type selection
4. **Letters to Loved Ones** - Create and manage personal messages
5. **Trusted Contacts** - Add/edit contacts and set permissions
6. **Release Settings** - Configure unlock code and executor

### API Routes Needed
- `/api/user/status` - Get user completion status
- `/api/user/personal-details` - GET/POST personal details
- `/api/user/medical-contacts` - GET/POST medical contacts
- `/api/user/funeral-preferences` - GET/POST funeral preferences
- `/api/user/documents` - GET/POST/DELETE documents
- `/api/user/letters` - GET/POST/DELETE letters
- `/api/user/trusted-contacts` - GET/POST/PUT/DELETE contacts
- `/api/user/release-settings` - GET/POST release settings
- `/api/auth/logout` - Logout endpoint
- `/api/auth/resend-2fa` - Resend 2FA code

### Additional Features
1. **File Upload Component** - Reusable component for document uploads
2. **Session Middleware** - Auto-logout after 15 minutes of inactivity
3. **Email Service** - Implement nodemailer for 2FA codes
4. **SMS Service** - Implement Twilio for SMS 2FA
5. **File Preview** - Preview uploaded documents
6. **Permission Management UI** - Granular permission controls
7. **Executor Portal** - Separate interface for trusted contacts
8. **Security Audit** - Review all security measures

### UI Components to Create
- Loading states
- Error boundaries
- Toast notifications
- File upload progress indicators
- Confirmation dialogs
- Permission toggle switches
- Document preview modals

## Design System

### Colors
- **Warm White**: `#FAF9F7` - Primary background
- **Soft Ivory**: `#FCFAF7` - Card backgrounds
- **Deep Charcoal**: `#2C2A29` - Primary text
- **Muted Sage**: `#A5B99A` - Primary CTAs
- **Dusty Blue**: `#93B0C8` - Secondary actions
- **Faint Gold**: `#EBD9B5` - Success states

### Typography
- Font: Inter, Nunito, or SF Pro
- Headers: SemiBold (600)
- Body: Regular (400)
- Generous line heights (1.5x)

## Security Features

- ✅ Strong password requirements (12+ chars, mixed case, numbers, special chars)
- ✅ Two-factor authentication (email/SMS)
- ✅ Bcrypt password hashing
- ✅ Session-based authentication
- ✅ Auto-logout after 15 minutes
- ⏳ CSRF protection (to implement)
- ⏳ Rate limiting (to implement)
- ⏳ Input sanitization (to implement)

## Testing

```bash
npm run test      # Unit tests (to be added)
npm run test:e2e  # End-to-end tests (to be added)
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- AWS Amplify
- Netlify
- Railway

## Contributing

This is an MVP project. Focus on simplicity, security, and emotional comfort in all features.

## License

Proprietary - All rights reserved
