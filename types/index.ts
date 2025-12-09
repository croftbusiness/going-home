// User and Authentication Types
export interface User {
  id: string
  email: string
  full_name: string
  phone_number?: string
  created_at: string
  updated_at: string
  two_factor_enabled: boolean
  account_locked: boolean
}

export interface Session {
  user: User
  access_token: string
  refresh_token: string
  expires_at: number
}

// Personal Details Types
export interface PersonalDetails {
  id: string
  user_id: string
  full_legal_name: string
  preferred_name?: string
  date_of_birth: string
  address: string
  primary_phone: string
  primary_email: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  created_at: string
  updated_at: string
}

// Medical and Legal Contacts Types
export interface MedicalContacts {
  id: string
  user_id: string
  primary_physician_name?: string
  primary_physician_phone?: string
  lawyer_name?: string
  lawyer_phone?: string
  medical_notes?: string
  created_at: string
  updated_at: string
}

// Funeral Preferences Types
export interface FuneralPreferences {
  id: string
  user_id: string
  burial_or_cremation?: 'burial' | 'cremation'
  preferred_funeral_home?: string
  service_type?: 'religious' | 'non-religious' | 'celebration_of_life' | 'other'
  atmosphere_wishes?: string
  song_choice_1?: string
  song_choice_2?: string
  song_choice_3?: string
  photo_preference_url?: string
  preferred_clothing?: string
  created_at: string
  updated_at: string
}

// Document Types
export interface Document {
  id: string
  user_id: string
  document_type: 'will' | 'id' | 'insurance' | 'deed' | 'other'
  file_name: string
  file_url: string
  file_size: number
  notes?: string
  created_at: string
  updated_at: string
}

// Letter Types
export interface Letter {
  id: string
  user_id: string
  recipient_contact_id: string
  recipient_name: string
  recipient_relationship: string
  message_text?: string
  message_file_url?: string
  visible_after_death: boolean
  created_at: string
  updated_at: string
}

// Legacy Message Types
export interface LegacyMessage {
  id: string
  user_id: string
  title: string
  message_text: string
  visibility: 'all_contacts' | 'restricted'
  created_at: string
  updated_at: string
}

// Trusted Contact Types
export interface TrustedContact {
  id: string
  user_id: string
  contact_name: string
  relationship: string
  contact_phone: string
  contact_email: string
  created_at: string
  updated_at: string
}

// Permission Types
export type PermissionLevel = 'view' | 'no_access'
export type CategoryType = 
  | 'personal_details'
  | 'medical_contacts'
  | 'funeral_preferences'
  | 'documents'
  | 'messages'
  | 'legacy_message'

export interface ContactPermission {
  id: string
  user_id: string
  contact_id: string
  category: CategoryType
  permission_level: PermissionLevel
  created_at: string
  updated_at: string
}

// Release Mechanism Types
export interface ReleaseMechanism {
  id: string
  user_id: string
  unlock_code_hash?: string
  executor_contact_id?: string
  is_locked: boolean
  release_triggered: boolean
  release_triggered_at?: string
  created_at: string
  updated_at: string
}

// Form Validation Types
export interface PersonalDetailsFormData {
  full_legal_name: string
  preferred_name?: string
  date_of_birth: string
  address: string
  primary_phone: string
  primary_email: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
}

export interface FuneralPreferencesFormData {
  burial_or_cremation?: 'burial' | 'cremation'
  preferred_funeral_home?: string
  service_type?: 'religious' | 'non-religious' | 'celebration_of_life' | 'other'
  atmosphere_wishes?: string
  song_choice_1?: string
  song_choice_2?: string
  song_choice_3?: string
  preferred_clothing?: string
}

export interface TrustedContactFormData {
  contact_name: string
  relationship: string
  contact_phone: string
  contact_email: string
}
