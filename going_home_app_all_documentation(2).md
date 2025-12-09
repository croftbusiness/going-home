# Going Home App

## Project Description
I want to build a simple first version of an app where users can securely store their end-of-life information in one place. This includes things like personal details, important documents, funeral preferences, songs they want played, photos, and written messages for loved ones.

The MVP should allow the user to create an account, fill out basic forms, upload files, and choose which family members can view the information. The goal is to make it extremely simple, peaceful, and easy to use.

## Product Requirements Document
# Product Requirements Document (PRD): Going Home App (MVP)

**Version:** 1.0
**Date:** October 26, 2023
**Author:** [Your Name/Team]
**Project Name:** Going Home App

---

## 1. Introduction and Goals

### 1.1 Project Overview
The Going Home App is designed to provide users with a simple, secure, and peaceful platform to digitally store and organize their end-of-life preferences and essential personal documentation. The primary goal is to mitigate the organizational burden placed on loved ones during times of grief.

### 1.2 MVP Goals
The Minimum Viable Product (MVP) must achieve the following:
1. Allow users to create a secure account.
2. Enable users to input core personal, medical, and funeral preference data via simple forms.
3. Allow users to securely upload essential documents (PDF, JPG, PNG, DOCX).
4. Allow users to designate Trusted Contacts and set view permissions.
5. Implement a simple, manual mechanism for authorized release of information to Trusted Contacts post-passing.
6. Deliver an experience characterized by simplicity, calm, and trustworthiness.

### 1.3 Out of Scope for MVP (Future Considerations)
The following features are explicitly deferred to Phase 2 or later to maintain development simplicity and focus:
*   Advanced Collaboration or Multi-User Editing.
*   Audio or Video Legacy Messages.
*   Automated Death Verification Systems (e.g., integration with SSDI).
*   Legal Document Generation or Templates (e.g., auto-generated wills).
*   Third-Party Integrations (Cloud drives, funeral home systems).
*   Payment or Subscription Systems.
*   Complex Permission Systems (e.g., granular editing rights, time-based access).
*   AI-Powered Features (Summarization, tagging).
*   Document Scanning, OCR, or Auto-cropping.
*   Offline Mode.

---

## 2. User Stories and Features

### 2.1 Core User Flow (Authenticated User)
| ID | User Story | Priority |
| :--- | :--- | :--- |
| US-001 | As a user, I want to securely create an account so I can begin organizing my information privately. | High |
| US-002 | As a user, I want to easily enter my basic identifying information so my family knows who I am. | High |
| US-003 | As a user, I want to record my funeral and service preferences so my loved ones do not have to guess my wishes. | High |
| US-004 | As a user, I want to upload photos of important documents (like insurance or deeds) so they are secured alongside my instructions. | High |
| US-005 | As a user, I want to write private letters to specific people so they receive a personal message after I am gone. | High |
| US-006 | As a user, I want to designate Trusted Contacts and set their access level (View Only) so I control who sees my information. | High |
| US-007 | As a user, I want to set a manual "Post-Death Release Mode" so my information is only shared when I explicitly allow the trigger mechanism. | High |

### 2.2 Feature Specifications

#### 2.2.1 Account Creation & Management
*   **F-AUTH-001:** Must support standard Email + Password login.
*   **F-AUTH-002:** Must enforce strong password rules (minimum length, character variety).
*   **F-AUTH-003:** Must require SMS or Email Two-Factor Authentication (2FA) upon account creation.
*   **F-AUTH-004:** Sessions must auto-logout after 15 minutes of inactivity.

#### 2.2.2 Personal Details Section
*   **F-DATA-001:** Capture Full Legal Name (Required).
*   **F-DATA-002:** Capture Date of Birth (Required).
*   **F-DATA-003:** Capture Address (Required).
*   **F-DATA-004:** Capture Primary Phone Number (Required).
*   **F-DATA-005:** Capture Primary Email (Required).
*   **F-DATA-006:** Capture Emergency Contact Name + Phone + Relationship (Required).
*   **F-DATA-007:** Capture Preferred Name (Optional).

#### 2.2.3 Medical & Legal Contacts Section
*   **F-DATA-008:** Capture Primary Physician Name and Phone.
*   **F-DATA-009:** Capture Lawyer/Estate Contact (Optional).
*   **F-DATA-010:** Provide a free-text field for important general medical notes (e.g., allergies, DNR status confirmation).

#### 2.2.4 Funeral Preferences Section
*   **F-DATA-011:** Capture Burial or Cremation Preference.
*   **F-DATA-012:** Capture Preferred Funeral Home (if any).
*   **F-DATA-013:** Capture Preferred Service Type (e.g., religious, non-religious).
*   **F-DATA-014:** Capture free-text field for Wishes regarding atmosphere/tone.
*   **F-DATA-015:** Provide up to 3 separate text-entry fields for Song Choices.
*   **F-DATA-016:** Allow file upload for Photo Preference for obituary/memorial.
*   **F-DATA-017:** Optional text field for Preferred Clothing or Items.

#### 2.2.5 Important Documents Upload Section
*   **F-DOC-001:** Simple Yes/No prompt regarding document upload.
*   **F-DOC-002:** Must allow selection of Document Type (Will, ID, Insurance, Deed, Other).
*   **F-DOC-003:** Must allow file upload with an optional note about the document.
*   **F-DOC-004:** **Required File Types:** PDF, JPG, PNG, DOCX.

#### 2.2.6 Letters to Loved Ones (Private Messages)
*   **F-LET-001:** User must select a recipient from the designated Trusted Contacts list.
*   **F-LET-002:** User must specify the recipient’s relationship.
*   **F-LET-003:** User must input the message text OR upload a file (PDF, JPG, PNG, DOCX).
*   **F-LET-004:** Must include a clear checkbox: “Visible only after death release is triggered.”

#### 2.2.7 Final Message / Legacy Note
*   **F-LET-005:** Capture Title of message.
*   **F-LET-006:** Capture Written Message Text.
*   **F-LET-007:** Visibility control: Public to all assigned contacts OR Restricted (based on assignment in F-LET-001).

#### 2.2.8 Trusted Contacts and Access Control
*   **F-ACCESS-001:** User must be able to add a contact with Name, Relationship, Phone, and Email.
*   **F-ACCESS-002:** User must assign a global permission level for the MVP: **View Only (Read Access)**. (No Edit/Delete allowed).
*   **F-ACCESS-003:** User must be able to assign Category-Level Permissions (e.g., Trusted Contact A can see Funeral Preferences but not Documents).
*   **F-ACCESS-004:** The system must default all new contacts to **No Access**.

---

## 3. Non-Functional Requirements (NFRs)

### 3.1 Performance and Latency
*   **NFR-PERF-001:** General data retrieval (text fields, preference loading) must complete within **2.0 seconds**.
*   **NFR-PERF-002:** Simple text field loads/updates must be **< 500 milliseconds**.
*   **NFR-PERF-003:** Document preview/photo loading must be **< 2.0 seconds**.
*   **NFR-PERF-004:** Large PDF downloads (1–5 MB) must be **< 3 seconds**.

### 3.2 Availability and Reliability
*   **NFR-AVAIL-001:** MVP Uptime Target: **99.5%** per month (maximum ~3.6 hours downtime).
*   **NFR-AVAIL-002:** Critical: The system must not experience prolonged outages (> 1 hour) during a manually triggered release event.

### 3.3 Security and Data Handling
*   **NFR-SEC-001:** All data transmission must use **HTTPS/TLS**.
*   **NFR-SEC-002:** All sensitive stored content (Personal info, Documents, Messages) must be **Encrypted At Rest**.
*   **NFR-SEC-003:** Must implement an audit log tracking who viewed what information, when, and from where, accessible to the user pre-release.
*   **NFR-SEC-004:** Must support **View Only (Read Access)** permission level for Trusted Contacts.
*   **NFR-SEC-005:** Must notify the user when a new device successfully logs into their account.

### 3.4 Data Storage and Hosting
*   **NFR-HOST-001:** All user data and uploaded files must be hosted within the **United States** to simplify initial compliance.
*   **NFR-HOST-002:** **HIPAA, GDPR, and SOC 2 compliance are explicitly NOT required** for MVP scope.

---

## 4. Release and Activation Strategy (MVP)

### 4.1 Post-Passing Access Mechanism (Manual Release)
The MVP will rely solely on user-controlled, manual activation to release data. Automated death detection is strictly out of scope.

*   **ACT-001 (Release State):** Each user account must have a boolean flag `is_released = false` (default).
*   **ACT-002 (Release Trigger - Required):** The user must designate one **Executor Contact** who is authorized to initiate the release process.
*   **ACT-003 (Release Mechanism):** The release must be triggered by the Executor Contact using one of the following methods (Executor enters Unlock Key OR Executor submits simple request form).
*   **ACT-004 (Access Grant):** Once triggered, the `is_released` flag changes to `true`, and the system immediately grants category-level **View Only** access to all pre-approved Trusted Contacts.
*   **ACT-005 (Logging):** All subsequent access attempts by Trusted Contacts after release must be logged and visible to the user (pre-release) or the Executor (post-release).

---

## 5. User Experience (UX) and Design Constraints

### 5.1 Tone and Emotion
The application design must prioritize **peace, simplicity, comfort, and effortless navigation**. The experience must actively reduce anxiety, not introduce friction or confusion.

### 5.2 Visual and Interface Guidelines
*   **UX-001 (Aesthetics):** Highly minimalist design with abundant white space and uncluttered screens.
*   **UX-002 (Color Palette):** Utilize soft neutrals (warm white, ivory, cream) with calming accent colors (muted sage, dusty blue). Avoid harsh contrast.
*   **UX-003 (Animation):** Use slow, gentle fade animations; avoid loud, "poppy," or fast motion.
*   **UX-004 (Typography):** Use rounded, modern, non-intimidating fonts (e.g., Inter, Nunito). Ensure large line spacing for readability.
*   **UX-005 (Navigation):** Employ clean, card-style layouts. Each screen must have a single, clearly defined primary call-to-action.

---

## 6. Data Model Considerations (MVP Summary)

The backend structure must support the following primary entities:

1.  **User:** Authentication credentials, account settings, User State (`is_released`).
2.  **PersonalData:** Stores all structured data from Sections 2.2.2 and 2.2.3.
3.  **PreferenceData:** Stores structured funeral wishes (Section 2.2.4).
4.  **Document:** Stores metadata (type, note, file path reference) for all uploaded files (Section 2.2.5).
5.  **TrustedContact:** Stores contact details (Name, Email, Phone, Relationship).
6.  **PermissionMapping:** Links Users, TrustedContacts, and Data Categories, defining the **View Only** access level.
7.  **AuditLog:** Records all data access attempts (Who, What, When, Where).
8.  **Letter:** Stores recipient link, content/file path, and `visible_post_release` flag.

## Technology Stack
# TECHNOLOGY STACK DOCUMENTATION: Going Home App (MVP)

## 1. Overview and Guiding Principles

The technology stack for the Going Home MVP prioritizes **simplicity, rapid development, emotional stability, and airtight security** for sensitive data. Given the low budget (<$500 startup cost) and the need for a peaceful user experience, we will leverage managed Backend-as-a-Service (BaaS) solutions to minimize infrastructure overhead.

| Component | Recommended Technology | Justification |
| :--- | :--- | :--- |
| **Frontend (Mobile)** | React Native or Flutter | Enables a single codebase for both iOS and Android, accelerating MVP deployment and reducing initial development cost. |
| **Backend/Database** | Firebase (or Supabase as an alternative) | Provides managed authentication, real-time database (Firestore/Realtime DB or Postgres/PostgREST), and cloud storage (Cloud Storage/S3) out of the box, fitting the budget and U.S. hosting requirements. |
| **Authentication** | Firebase Auth / Supabase Auth | Handles standard email/password login and simplifies 2FA implementation, crucial for security. |
| **File Storage** | Firebase Cloud Storage / Supabase Storage | Secure, geo-restricted storage for user documents (PDF, JPG, PNG, DOCX) with built-in encryption at rest. |
| **Hosting/Region** | U.S.-based Cloud Infrastructure | Required to keep compliance simple (avoiding GDPR/international laws) and aligning with user data locality needs. |

---

## 2. Frontend Technologies (Client Application)

**Goal:** Build a cross-platform application that delivers a minimalist, calming, and responsive user interface (UX/UI).

| Technology | Version/Details | Justification & Constraints |
| :--- | :--- | :--- |
| **Framework** | React Native (Recommended) or Flutter | **Justification:** Cross-platform compilation minimizes cost and speeds up time-to-market. **Constraint:** Must adhere strictly to the requested **UX_tone_and_design_constraints** (minimalist, ample whitespace, soft colors). |
| **Styling** | Styled Components or Theme Provider | Allows for consistent application of the muted, warm color palette and ensures large, clear typography. |
| **State Management** | Context API (React Native) or Provider (Flutter) | Kept simple for MVP; avoids the complexity of Redux or advanced solutions. |
| **Navigation** | React Navigation (if using React Native) | Standardized, reliable navigation capable of handling the simple, linear flows required for form completion. |
| **Security (Client-Side)** | HTTPS/TLS only | Mandatory for all data transfer. No offline mode is required, simplifying caching logic. |

---

## 3. Backend & Database Technologies

**Goal:** Securely store structured data (personal details, preferences) and unstructured files (documents, photos) with high availability (99.5% uptime target).

| Technology | Version/Details | Justification & Constraints |
| :--- | :--- | :--- |
| **Primary BaaS Platform** | Firebase (Google Cloud) | **Justification:** Excellent integration between Auth, Firestore (for structured data), and Storage. Quick setup aligns with the zero budget expectation. **Constraint:** Must utilize U.S.-regional hosting settings. |
| **Database (Structured Data)** | Cloud Firestore (NoSQL) | **Justification:** Flexible schema supports simple form entries easily. **Constraint:** Data retrieval latency must meet the **< 2 second** non-functional requirement. |
| **File Storage** | Firebase Cloud Storage | **Justification:** Secure storage buckets configured for Encrypt-at-Rest. **Constraint:** Must limit uploads to **PDF, JPG, PNG, and DOCX** for MVP. |
| **Security Rules** | Firestore Security Rules / Storage Rules | Essential for implementing **Category-Level Permissions** and ensuring only authenticated users can read/write their own data. |
| **Audit Logging** | Firebase Platform Logs (or custom collection) | Required to log every access event after the manual release trigger, meeting the **Audit Records** requirement. |

---

## 4. Data Management & Security Stack

Security is paramount given the sensitive nature of the stored information (Wills, IDs, private messages).

| Security Feature | Implementation Detail | Rationale / Requirement Met |
| :--- | :--- | :--- |
| **Encryption (Transit)** | TLS 1.2+ enforced via Firebase/HTTPS | Meets general security requirement for data in motion. |
| **Encryption (Rest)** | Default Encryption-at-Rest provided by Firebase Storage/Firestore | Meets MVP level requirement for personal info and documents. |
| **Authentication** | Firebase Email/Password Auth | Supports basic credentials required for MVP. |
| **Two-Factor Auth (2FA)** | SMS or Email OTP via Firebase Auth | Required for all users to enhance security over simple passwords. |
| **Session Management** | Configured Auto-Logout (15 minutes inactivity) | Meets the non-functional requirement for session timeout. |
| **Data Granularity** | Firestore Security Rules mapped to **Category-Level Permissions** | Rules must be configured to check the user's granted access level (View Only) against the requested document category before returning data. |
| **Access Release** | Backed by a single, user-controlled `is_released` boolean flag. | Directly supports the **Manual Executor Unlock** MVP activation strategy. |

---

## 5. Out of Scope Technologies (Phase 2+)

The following technologies or features are explicitly excluded from the MVP scope to maintain budget, simplicity, and focus on core functionality:

*   **Audio/Video Processing:** No libraries for MP3/M4A/MP4 handling (e.g., FFmpeg, dedicated transcoding services).
*   **External Integrations:** No SDKs or APIs for Google Drive, Dropbox, legal software, or funeral homes.
*   **Advanced Database Features:** No relational joins (ruling out pure PostgreSQL for MVP if using Firebase), complex triggers, or advanced search indexing tools like Algolia.
*   **Payment Processing:** No integration with Stripe, PayPal, or any subscription management tools.
*   **Advanced UI/Animation Libraries:** Complex 3D effects or high-performance graphing libraries. Focus remains on simplicity and soft motion.
*   **AI/ML Services:** No integration with Google Vision AI (for OCR) or any language models.
*   **Offline Synchronization:** No local database persistence layers (e.g., Realm, SQLite).

## Project Structure
# PROJECT STRUCTURE DOCUMENT: Going Home App (MVP)

## 1. Overview and Documentation Scope

This document details the organizational structure of the Going Home App MVP codebase, filesystem layout, and configuration files. This structure is designed to support rapid development, adhere to the minimalist UX requirements, and prioritize security for sensitive PII and end-of-life data.

The technology stack is assumed to be modern (e.g., React Native/Flutter for cross-platform mobile, or a modern web framework like React/Vue paired with a Backend-as-a-Service like Firebase/Supabase). The structure below reflects a typical setup for such an application.

## 2. Top-Level Directory Structure

The root directory contains essential configuration files, source code, and documentation assets.

```
/going-home-app
├── .github/                   # CI/CD configuration and workflows
├── docs/                      # Project documentation (this section lives here)
│   ├── projectStructure.md    # This file
│   ├── securityGuidelines.md
│   └── designSystem.md
├── src/                       # Core application source code
├── tests/                     # Unit, integration, and end-to-end tests
├── .env.example               # Example environment variables template
├── .gitignore
├── package.json               # Project dependencies and scripts (if using Node ecosystem)
└── README.md                  # General project overview
```

## 3. Source Code Structure (`src/`)

The `src` directory is organized around modularity, separating presentation, business logic, data handling, and shared utilities.

```
/src
├── assets/                    # Static media used in the application
│   ├── fonts/
│   ├── images/                # Logos, onboarding graphics (minimalist style)
│   └── icons/                 # Minimal set of SVG or relevant icons
│
├── components/                # Reusable UI elements (adhering to calm aesthetic)
│   ├── common/                # Primitives (Buttons, Inputs, Cards, Modals)
│   │   ├── Button.tsx
│   │   ├── InputField.tsx
│   │   └── Card.tsx
│   ├── navigation/            # Tab bars, headers, specialized navigation elements
│   └── layout/                # Structural components (e.g., CenteredContainer, FormWrapper)
│
├── config/                    # Application-wide configuration
│   ├── constants.ts           # Hardcoded values (e.g., max upload size, API keys placeholder)
│   ├── theme.ts               # Color palette, typography scales (muted, soft)
│   └── routes.ts              # Application routing definitions
│
├── features/                  # Domain-specific modules (Core MVP Functionality)
│   ├── auth/                  # Account creation, login, 2FA handling
│   │   ├── components/
│   │   ├── hooks/
│   │   └── AuthAPI.ts         # Handles Firebase/Supabase authentication calls
│   │
│   ├── profile/               # Personal Details (Section 1)
│   │   ├── ProfileForm.tsx
│   │   └── ProfileService.ts  # Data logic for updating personal info
│   │
│   ├── contacts/              # Trusted Contacts Management (Section 7)
│   │   ├── ContactList.tsx
│   │   ├── PermissionSelector.tsx # Component for View Only settings
│   │   └── ContactsAPI.ts
│   │
│   ├── legacy/                # Content sections (Sections 2, 3, 5, 6)
│   │   ├── MedicalLegalForm.tsx
│   │   ├── FuneralPrefsForm.tsx
│   │   ├── LegacyMessages.tsx # Handles Letters to Loved Ones & Final Message
│   │   └── LegacyAPI.ts
│   │
│   └── documents/             # File Upload Management (Section 4)
│       ├── UploadManager.tsx  # Handles file type validation (PDF, JPG, PNG, DOCX)
│       ├── DocumentList.tsx
│       └── DocumentsAPI.ts    # Handles secure storage interaction (e.g., Firebase Storage)
│
├── hooks/                     # Reusable custom hooks (e.g., useAuthStatus, useFormState)
│
├── services/                  # Non-UI specific business logic or external communication handlers
│   ├── encryptionService.ts   # Handlers for encrypt-at-rest logic (implementation dependent)
│   ├── auditLogService.ts     # Logic for recording access events
│   └── notificationService.ts # Email/SMS wrappers for release notifications
│
└── screens/                   # Top-level screen components (mapping to primary navigation views)
    ├── SplashScreen.tsx
    ├── OnboardingScreen.tsx
    ├── DashboardScreen.tsx    # Main landing view post-login
    ├── SettingsScreen.tsx     # Access control & account management
    └── ReleaseControlScreen.tsx # Manual release trigger interface
```

## 4. Backend Service Configuration (Conceptual/Platform Specific)

Since the MVP leans heavily on BaaS (Firebase/Supabase), specific configuration points are critical.

### 4.1 Database Structure (e.g., Firestore/Supabase Tables)

| Table/Collection | Primary Purpose | Key Fields for MVP | Security Notes |
| :--- | :--- | :--- | :--- |
| `Users` | User Auth & Profile Data | UID, Email, LegalName, CreationDate, `is_released` (Boolean) | Row-level security required. Only User can read/write their own row. |
| `TrustedContacts` | Access Control List | UserUID, ContactName, Relationship, ContactEmail/Phone, AccessLevel (View Only) | Secured by UserUID. |
| `PersonalDetails` | Section 1 Data | UserUID, DOB, Address, EmergencyContactName | Encrypted at rest if stored outside standard BaaS fields. |
| `LegacyData` | Sections 2 & 3 (Structured) | UserUID, BurialPreference, SongChoices (Array), FuneralHome | Encrypted at rest. |
| `Documents` | Section 4 (Metadata) | UserUID, FileName, StoragePath, DocumentType (Enum), AccessList (Array of ContactUIDs) | Storage Bucket access strictly controlled by paths/metadata. |
| `Letters` | Section 5 & 6 (Private Messages) | UserUID, RecipientUID (if applicable), MessageContent, VisibilityFlag, is_after_death | Encrypted. Access determined by item-level permissions if implemented. |
| `AuditLogs` | Security Monitoring | ActorUID, TargetUID, ActionType (View/Update), Timestamp, IPAddress/Device | Write access highly restricted, read access for User profile settings. |

### 4.2 Storage Configuration (e.g., Firebase Storage Buckets)

File storage must enforce strict partitioning and encryption.

```
/storage_root
├── user_data/
│   ├── [USER_UID]/
│   │   ├── documents/        # Section 4 uploads (Will, ID, Insurance)
│   │   └── letters/          # Section 5 & 6 uploads (Messages, Photos)
└── assets/                   # Static application assets (read-only by public/app)
```

**Security Rule Enforcement:** No public read access whatsoever. Access must be verified via backend security rules matching the `Documents.AccessList` metadata against the requesting user's UID.

## 5. MVP Release Mechanism Structure (`src/screens/ReleaseControlScreen.tsx`)

The structure around data release is critical, as it dictates the transition from Locked to Released state.

```
/release_logic
├── ManualReleaseHandler.ts  # Orchestrates the process when trigger is pulled
├── ExecutorUnlockComponent.tsx # UI for entering the offline-shared key
└── DeathNotificationForm.tsx # Simple form for an executor to initiate the request
```

**MVP Trigger Flow:**

1.  **User Setup:** User populates `TrustedContacts` and optionally sets an `UnlockKey` (stored securely, hashed).
2.  **Trigger:** Executor initiates the process via `DeathNotificationForm` or `ExecutorUnlockComponent`.
3.  **Verification (Manual MVP):** System validates the key OR logs the request (if using request method).
4.  **State Change:** If successful, `Users.is_released` flips to `true`.
5.  **Access Grant:** Backend security rules immediately apply the new access permissions based on the `TrustedContacts` list for all future document/data requests.
6.  **Notification:** Email/SMS sent to all permitted contacts that access is now available.

## Database Schema Design
# SCHEMADESIGN: Going Home App (MVP)

## 1. Overview and Design Philosophy

This schema design focuses on the Minimum Viable Product (MVP) for the "Going Home App." The primary goals are simplicity, security, and emotional safety, prioritizing easy data input and secure access control over complex relational integrity or advanced features.

The database structure is designed to support the seven core user input sections, manage trusted contacts, and securely store uploaded files, while strictly enforcing MVP-level permissions (View Only access post-release).

**Technology Assumption:** Backend platform like Firebase (Firestore/Realtime DB) or Supabase (PostgreSQL) is used, influencing how relationships (like file attachments or permissions) are modeled (e.g., using document references or foreign keys).

## 2. Core Data Models (Tables/Collections)

We define the main entities required to store user data and manage access.

### 2.1. Users (User Authentication & Profile Core)

Stores core user account information and authentication status.

| Field Name | Data Type | Description | Constraints/Notes |
| :--- | :--- | :--- | :--- |
| `user_id` | String/UUID | Primary Key (Auth Provider ID) | Required, Unique |
| `full_legal_name` | String | User's full legal name | Required (Per Questionnaire 1) |
| `preferred_name` | String | Optional display name | Optional |
| `date_of_birth` | Date | User's DOB | Required |
| `address` | String | Primary residence address | Required |
| `primary_phone` | String | Primary contact phone | Required |
| `primary_email` | String | Primary contact email | Required, Unique |
| `emergency_contact_name` | String | Name of emergency contact | Required |
| `emergency_contact_phone` | String | Phone of emergency contact | Required |
| `emergency_contact_relationship`| String | Relationship to emergency contact | Required |
| `account_status` | Enum | Locked, Active, Released | Default: Active. Controls access release. |
| `release_triggered_at` | Timestamp | When the account moved to Released state | Nullable |
| `unlock_key` | String (Hashed) | Optional offline key for executor release | Hashed for security (MVP Manual Unlock) |
| `created_at` | Timestamp | Record creation time | System generated |

### 2.2. Trusted_Contacts (Access Control List)

Stores individuals the user explicitly trusts to access their data upon release.

| Field Name | Data Type | Description | Constraints/Notes |
| :--- | :--- | :--- | :--- |
| `contact_id` | String/UUID | Primary Key | Required, Unique |
| `user_id` | Foreign Key (Users) | The owner of this data | Indexed |
| `contact_name` | String | Trusted contact's name | Required (Per Questionnaire 7) |
| `relationship` | String | Relationship to the user | Required |
| `phone_number` | String | Contact's phone | Required |
| `email` | String | Contact's email | Required |
| `default_access_level`| Enum | MVP: View_Only, No_Access | Default: No_Access (Per Questionnaire 7) |
| `is_executor` | Boolean | Designated person for manual release | Default: False |

### 2.3. User_Permissions (Granular Category Access)

Links Contacts to specific data categories, overriding the `default_access_level` in `Trusted_Contacts` if necessary, although MVP heavily favors global View_Only access per contact.

For MVP simplicity, this links `user_id` to `contact_id` and defines the categories they can see *if* the account is released.

| Field Name | Data Type | Description | Constraints/Notes |
| :--- | :--- | :--- | :--- |
| `permission_id` | String/UUID | Primary Key | |
| `user_id` | Foreign Key (Users) | Owner | Indexed |
| `contact_id` | Foreign Key (Trusted_Contacts) | The authorized contact | Indexed |
| `can_view_personal` | Boolean | Access to Section 1 data | Default: False |
| `can_view_medical_legal`| Boolean | Access to Section 2 data | Default: False |
| `can_view_funeral_prefs`| Boolean | Access to Section 3 data | Default: False |
| `can_view_documents` | Boolean | Access to Section 4 data | Default: False |
| `can_view_letters` | Boolean | Access to Section 5 data | Default: False |
| `can_view_legacy_note` | Boolean | Access to Section 6 data | Default: False |
| `note_on_access` | String | Explanation for the contact (if set) | Optional |

### 2.4. Core_Content (Personal, Medical, Funeral, Legacy)

A consolidated or categorized approach for simple text content. Given the MVP focus on simplicity, we might use separate sub-collections, but modeling them here for completeness.

**2.4.1. Personal_Medical_Legal**

| Field Name | Data Type | Description | Source Questionnaire |
| :--- | :--- | :--- | :--- |
| `user_id` | Foreign Key (Users) | Owner | N/A |
| `physician_name` | String | Primary Physician Name | 2 |
| `physician_phone` | String | Physician Phone | 2 |
| `estate_contact` | String | Lawyer/Estate Contact (Optional) | 2 |
| `medical_notes` | Text | Free text notes (e.g., DNR status) | 2 |

**2.4.2. Funeral_Preferences**

| Field Name | Data Type | Description | Source Questionnaire |
| :--- | :--- | :--- | :--- |
| `user_id` | Foreign Key (Users) | Owner | N/A |
| `cremation_or_burial` | Enum/String | Burial or Cremation | 3 |
| `funeral_home` | String | Preferred funeral home | 3 |
| `service_type` | String | Religious, Non-religious, etc. | 3 |
| `atmosphere_wishes` | Text | Short text description of mood | 3 |
| `song_choice_1` | String | Song 1 Title/Artist | 3 |
| `song_choice_2` | String | Song 2 Title/Artist | 3 |
| `song_choice_3` | String | Song 3 Title/Artist | 3 |
| `clothing_preference` | String | Preferred attire/items | 3 |
| `obituary_photo_ref` | Foreign Key (Media) | Link to preferred photo file | 3 (Linked via Media) |

**2.4.3. Legacy_Note**

| Field Name | Data Type | Description | Source Questionnaire |
| :--- | :--- | :--- | :--- |
| `user_id` | Foreign Key (Users) | Owner | N/A |
| `title` | String | Title of the final message | 6 |
| `message_text` | Text | The written legacy note | 6 |
| `visibility` | Enum | Public_to_Contacts / Restricted | 6 |

### 2.5. Letters_To_Loved_Ones (Private Messages)

This is a collection of specific messages targeted at individuals.

| Field Name | Data Type | Description | Constraints/Notes |
| :--- | :--- | :--- | :--- |
| `letter_id` | String/UUID | Primary Key | |
| `user_id` | Foreign Key (Users) | Owner | Indexed |
| `recipient_contact_id` | Foreign Key (Trusted_Contacts) | Explicit recipient | Allows 1:1 message linkage |
| `relationship_to_user` | String | Stored relationship for context | Required |
| `message_text` | Text | The core message body | Can be null if file uploaded |
| `is_visible_after_death`| Boolean | Visibility flag | Required (Q5) |
| `primary_media_ref` | Foreign Key (Media) | Link to attached file/document | Nullable |
| `created_at` | Timestamp | | |

### 2.6. Media_Assets (Document Storage Reference)

Stores metadata for all uploaded files (Documents and Obituary Photos). **Actual files stored in an encrypted, region-restricted object store (e.g., S3 bucket in US-East).**

| Field Name | Data Type | Description | Constraints/Notes |
| :--- | :--- | :--- | :--- |
| `media_id` | String/UUID | Primary Key | |
| `user_id` | Foreign Key (Users) | Owner | Indexed |
| `file_storage_url` | String | Secure URL/Path to the object store | Required |
| `file_name` | String | Original file name | |
| `file_type` | Enum | PDF, JPG, PNG, DOCX (MVP Types) | Enforced validation on upload |
| `document_type` | String | Category for document uploads (Will, ID, Insurance, etc.) | Used for Section 4 |
| `optional_note` | Text | Note about the document content | |
| `associated_letter_id`| Foreign Key (Letters) | Link if this is an attachment to a letter | Nullable |
| `upload_timestamp` | Timestamp | | |

## 3. Data Relationships and Relationships Summary

The schema is generally denormalized where appropriate for fast retrieval (as per performance Non-Functional Requirements), but relationships are crucial for security and access control.

| Relationship | Source Table | Target Table | Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| User Ownership | Trusted_Contacts | Users | One-to-Many | One user has many contacts. |
| User Ownership | Core_Content | Users | One-to-One | User owns their preferences/notes. |
| User Ownership | Media_Assets | Users | One-to-Many | One user uploads many files. |
| Document Link | Letters_To_Loved_Ones | Media_Assets | One-to-One (Optional) | A letter can point to one attachment. |
| Permission Mapping| User_Permissions | Trusted_Contacts | Many-to-One | Maps contact access rights back to the user. |
| Permission Mapping| User_Permissions | Users | Many-to-One | Permissions are always tied to a user's account. |
| Obituary Photo | Funeral_Preferences | Media_Assets | One-to-One (Optional) | Specific link for the obituary photo. |

## 4. Security and Access Control Schema Implementation

Security is enforced primarily through the `User_Permissions` model and backend application logic layered on top of database access rules (like Firestore Security Rules or PostgreSQL Row Level Security).

1.  **Default Deny:** All entries in `User_Permissions` default to `False` for visibility flags. Contacts only gain access when the `Users.account_status` is set to `Released`.
2.  **Item-Level Restriction (via Letters):** The `Letters_To_Loved_Ones` table allows tying a specific message (`letter_id`) to a specific recipient (`recipient_contact_id`). Even if the general `can_view_letters` flag is set, the application logic must check if a specific letter is explicitly assigned to that contact before displaying it.
3.  **Audit Trail (Non-Persistent Model Detail):** A separate, append-only collection/table named `Access_Logs` must exist to track every read operation against the `Users`, `Media_Assets`, and `Core_Content` tables once `account_status` is `Released`.
    *   Fields: `timestamp`, `user_id` (the viewer), `viewed_entity_id`, `entity_type`, `ip_address`.

## User Flow
USERFLOW DOCUMENTATION: GOING HOME APP (MVP)

1. INTRODUCTION & GOAL

This document outlines the essential user flows for the Minimum Viable Product (MVP) of the Going Home App. The primary goal is to create an extremely simple, peaceful, and secure environment for users to store essential end-of-life information and assign trusted viewers.

UX Tone: Minimalist, comforting, trustworthy, and effortless. Latency must be low (under 2 seconds) to maintain a calm experience.

2. CORE USER JOURNEY MAP (MVP)

| Step | Screen/State | User Action | System Response / Next State | Key Consideration |
|---|---|---|---|---|
| 1 | Welcome / Splash | Launch App | Displays gentle branding/value proposition. | Warm, soft visuals (Calm/Notion inspiration). |
| 2 | Sign Up / Log In | Select Sign Up | Presents Email/Password fields. | Enforce strong password rules. Must enable 2FA setup immediately after creation. |
| 3 | Account Setup (2FA) | Enters 2FA Code (SMS/Email) | Verifies code; creates secure user session. | Critical security checkpoint. Must be fast (<1s). |
| 4 | Onboarding Flow (Guided Tour) | Completes 3-step intro | Briefly explains the 7 core sections and the manual release mechanism. | Reduce anxiety by explaining the *how* and *why* simply. |
| 5 | Dashboard (Home) | Views Dashboard | Displays progress bar (e.g., 3/7 sections complete) and primary CTA: \"Start Organizing.\" | High whitespace, minimal clutter. Large, clear navigation cards. |
| 6 | Section Navigation | Taps on a Core Section (e.g., \"Personal Details\") | Navigates directly to the relevant setup form. | Easy jump between sections. |
| 7 | Data Entry (Form Completion) | Fills out required fields | Auto-saves data in real-time (to maintain stability). | Keep forms fast; use simple input types. |
| 8 | Document Upload | Selects \"Upload File\" | Opens native file picker (limited to PDF, JPG, PNG, DOCX). | Display file size/type validation immediately. File preview loads in <2s. |
| 9 | Trusted Contacts Setup | Adds a new Contact | Enters Name, Relationship, Email, Phone. | Mandatory step before system can be \"ready.\" |
| 10 | Setting Permissions | Assigns permissions to a Contact | Selects Category-Level Access: View Only or No Access for Personal, Medical, Funeral, Documents, Messages. | Must be intuitive (checkboxes or simple toggles per category). |
| 11 | Final Review / Lock State | Navigates to \"Release Settings\" | Views status: Data is stored but *Locked*. | User sets the MVP Manual Release mechanism (e.g., sets Executor Unlock Code or confirms Executor Contact). |
| 12 | Dashboard (Completed State) | Confirms all core sections filled | Progress bar shows 100%. Primary CTA changes to \"Edit Plan\" or \"Review Settings.\" | User knows the essentials are captured and secure. |

3. DETAILED FLOWS & INTERACTION PATTERNS

3.1. Onboarding & Profile Creation Flow (High Focus on Peacefulness)

*   **Screen 1: Welcome:** Full-screen, gentle background animation/illustration. Text: \"Peace of mind starts here.\" Primary CTA: \"Begin Securely.\"
*   **Screen 2: Sign Up:** Email/Password entry. Secondary CTA: \"Log In\" (for returning users).
*   **Screen 3: Security Setup (Mandatory 2FA):** Prompt: \"To protect your wishes, please verify your identity with a code sent to [masked email/phone].\" User enters code.
    *   *Interaction Pattern:* If SMS fails, auto-switch to Email option after 30s.
*   **Screen 4: Initial Contact Setup:** Prompt: \"Who is your primary contact for final release? (Name & Phone)\" This person is defaulted as the MVP Executor Contact.
*   **Screen 5: Dashboard Introduction:** Card-based overview. Each card is a major category (Personal, Medical, Documents, etc.). Completed sections fade slightly or show a soft green checkmark.

3.2. Data Entry Flow (Example: Funeral Preferences)

*   **Screen:** Dedicated section, clean layout. Fields are presented sequentially, one primary question per visible block to avoid overwhelming the user.
*   **Interaction Pattern (Funeral Preferences):**
    *   Q1: Burial or Cremation? (Large toggle buttons, not radio dots.)
    *   Q2: Preferred Funeral Home (Text Input).
    *   Q3: Song Choices: Displays three distinct input boxes labeled 1, 2, 3. If the user types in box 2, box 3 becomes visible (progressive disclosure).
*   **Save Pattern:** Data saves instantly upon field exit, indicated by a very subtle, temporary notification banner at the bottom: \"Saved.\" (Must meet <500ms latency target).

3.3. Document Upload Flow

*   **Screen:** Section titled \"Important Documents.\" Large CTA button: \"Add Document.\"
*   **Interaction Pattern:**
    1.  User taps \"Add Document.\"
    2.  Modal appears: Document Type (Dropdown: Will, ID, Insurance, Other) and Optional Note.
    3.  User taps \"Choose File.\" Native OS selector appears.
    4.  User selects file (must be PDF, JPG, PNG, DOCX).
    5.  File uploads. System displays document name, type, and upload time.
    6.  *Security Constraint:* If a user uploads a document marked as \"Will,\" the system flags this internally for heightened security, but the UI remains identical.
*   **Latency Constraint:** The display of the uploaded file thumbnail/name must complete within 2 seconds.

3.4. Trusted Contacts & Permissions Flow (Access Control)

This flow governs who sees what *after* the release trigger.

*   **Screen 1: Trusted Contacts List:** Shows existing contacts (if any) and a large \"Add New Contact\" button.
*   **Interaction Pattern (Adding Contact):**
    1.  Enter Name, Email, Phone, Relationship.
    2.  Contact is added but assigned **No Access** by default.
*   **Screen 2: Assign Permissions (Triggered upon saving a new contact or tapping an existing one):**
    *   Contact Name displayed prominently at the top.
    *   Category List (Personal Details, Medical Contacts, Funeral Prefs, Documents, Messages).
    *   Next to each category: A large toggle switch or clear radio selection for **View Only** or **No Access**.
    *   *Constraint:* No Edit, No Download, No Share options visible in MVP.
*   **Item-Level Example (Letters to Loved Ones):** When creating a letter, a mandatory selector appears: \"Who can read this?\" (Dropdown populated only with contacts granted at least View Access to this *category*).

3.5. Manual Release Activation Flow (MVP Trigger)

This is the final, critical setup step, designed to be deliberate.

*   **Screen:** \"Finalizing Your Release.\"
*   **State Check:** System verifies if all 7 core sections are populated and at least one trusted contact exists. If incomplete, prompts user to finish.
*   **Interaction Pattern (Setting Unlock):**
    1.  User reads a calming statement: \"Your information is safe until you decide otherwise, or until your Executor confirms your passing.\"
    2.  **Option A (Executor Code):** User creates a 6-digit alphanumeric Unlock Code, which is *not* stored on the server, only hashed. User is explicitly told: *\"You must securely share this code offline with your Executor Contact.\"*
    3.  **Option B (Executor Contact):** User confirms the contact designated during setup is authorized to initiate the request.
    4.  **Final Lock:** User taps: \"Securely Lock My Plan.\"
*   **Result:** Account moves to **Locked State**. Dashboard CTA changes to \"Review Plan & Security Settings.\"

4. OUT OF SCOPE INTERACTIONS (For MVP Clarity)

The following actions must be explicitly unavailable or disabled in the MVP interface:

*   Uploading or playing audio/video files.
*   Creating new contacts or assigning permissions *after* the system enters the Locked State (editing requires re-unlocking the entire system for security review).
*   Any reference to payment, subscription, or premium features.
*   Editing pre-set file type restrictions (PDF, JPG, PNG, DOCX).
*   Downloading documents directly from the Trusted Contact access portal (Phase 2).

## Styling Guidelines
# Going Home App: Styling Guidelines Document (Design System & UI/UX)

## 1. Design Philosophy: Peace, Simplicity, and Trust

The core goal of the Going Home App MVP is to serve as a calm, trustworthy repository for vital end-of-life information. The styling must actively work to reduce user anxiety, making the process feel guided, effortless, and emotionally safe.

*   **Primary Driver:** Emotional Resonance (Calmness, Support, Trustworthiness)
*   **Secondary Driver:** Simplicity and Effortless Navigation
*   **Avoid:** Clinical, overwhelming, loud, or overly formal aesthetics.

## 2. Color Palette: Muted & Grounded

The palette relies heavily on soft neutrals to provide a clean, spacious foundation, accented by very muted colors that evoke gentle warmth and security.

### Primary Palette: Neutrals & Backgrounds

| Color Name | Hex Code | Usage | Rationale |
| :--- | :--- | :--- | :--- |
| Warm White (Canvas) | #FAF9F7 | Primary background, main content areas. | Softer than stark white; feels organic and less sterile. |
| Soft Ivory (Cards) | #FCFAF7 | Card backgrounds, section containers, subtle segmentation. | Provides slight lift from the canvas without creating harsh borders. |
| Deep Charcoal (Text) | #2C2A29 | Primary body text, essential labels, high-priority information. | Offers excellent readability (meeting contrast needs) without the harshness of true black (#000000). |

### Accent Palette: Calming Accents (Used Sparingly)

These colors should be used only for primary CTAs, status indicators, and section headers.

| Color Name | Hex Code | Usage | Rationale |
| :--- | :--- | :--- | :--- |
| Muted Sage (Primary CTA) | #A5B99A | Primary Call-to-Action buttons (e.g., "Save," "Continue"). | Evokes nature, growth, and peace; very calming. |
| Dusty Blue (Secondary Action) | #93B0C8 | Secondary buttons, link indicators, non-critical action icons. | Suggests stability and dependability. |
| Faint Gold (Highlight/Success) | #EBD9B5 | Success notifications, completed steps, subtle highlights. | Warmth and acknowledgment, used extremely lightly. |

**Contrast Note:** All text must maintain WCAG AA compliance contrast ratio against its background, prioritized by using Deep Charcoal on Warm White/Soft Ivory. Avoid using accent colors for essential text labels.

## 3. Typography: Approachable and Clear

The typeface should be highly readable, modern, and feature rounded elements to feel less imposing or legalistic.

*   **Font Families Recommended:** Inter, Nunito, SF Pro (system font fallback).
*   **Key Principle:** Prioritize large point sizes, generous line heights, and clear visual hierarchy.

| Element | Example Use | Font Weight | Size (Relative) | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **H1: Page Title** | Main section titles (e.g., "Funeral Preferences") | SemiBold (600) | Large (28pt - 36pt) | Generous (1.2x) |
| **H2: Card/Section Header** | Inside a card, sub-section title (e.g., "Your Contacts") | Medium (500) | Medium (20pt - 24pt) | Generous (1.3x) |
| **Body Text** | Form instructions, paragraphs, notes. | Regular (400) | Standard (16pt - 18pt) | Increased (1.5x) |
| **Form Labels/Input** | Field labels, placeholder text. | Regular (400) | Standard (16pt) | Standard (1.4x) |
| **CTAs/Buttons** | Button text. | SemiBold (600) | Slightly Larger (17pt) | Tight (1.1x) |

## 4. Interface and Layout Principles (UI/UX)

The interface structure must enforce simplicity and reduce cognitive load, aligning with the non-functional requirements for quick, stable responsiveness.

### 4.1. Whitespace and Density
*   **Breathing Room:** Screens must feel airy. Margins and padding should be generous (aiming for 24pt minimum padding on major containers).
*   **Information Grouping:** Use the **Soft Ivory** cards to visually group related fields (e.g., all "Personal Details" fields reside in one large, clearly separated card).

### 4.2. Forms and Inputs
*   **Clarity over Compactness:** Inputs should be large enough to tap easily, supporting users who may be accessing the app under stress.
*   **Single Focus:** Each screen or major card should focus on one primary task or set of related information. Avoid loading too many fields onto one view.
*   **Labeling:** Labels should be persistently visible above the input field, not hidden as placeholder text, to ensure visibility even after typing begins (per UX Inspiration: Apple Health/Google Tasks simplicity).
*   **Required Fields:** Mark required fields clearly with an asterisk (*) using **Deep Charcoal**, but avoid excessive use of red warning colors.

### 4.3. Navigation and Icons
*   **Minimalist Navigation:** Favor a clean Tab Bar or a very simple top-level navigation structure. Avoid deep, complex menu trees.
*   **Iconography:** Icons should be simple line-art style (outline preferred over filled) and used sparingly—only where they add immediate clarity (e.g., a file icon next to document upload). They must align with the soft aesthetic (avoid sharp corners).

### 4.4. Motion and Feedback
*   **Gentle Animations:** All transitions (screen loads, modal openings, state changes) must use slow, subtle fading or sliding motions.
    *   **Goal:** To signal progress without drawing urgent attention.
    *   **Avoid:** Bouncing, stretching, flashing, or fast-panning animations.
*   **Feedback:** Success states (e.g., a document successfully uploaded) should use the **Faint Gold** or a soft green success indicator that fades quickly. Errors should use a very subdued, non-alarming color (e.g., a muted terracotta) and appear near the relevant field.

## 5. UI/UX Inspiration Summary

The desired visual feeling is a merger of high-trust security with personal comfort:

1.  **Calm (Meditation App):** For overall color mood, gentle motion, and soft gradients (if used at all).
2.  **Apple Health Medical ID Setup:** For extreme clarity in data input, large spacing, and non-cluttered forms.
3.  **Notion:** For leveraging white space and minimalist, modular content blocks (cards).
4.  **Reflectly:** For the use of rounded elements and a warm, supportive tone.
