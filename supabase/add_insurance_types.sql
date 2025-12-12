-- Migration: Add new insurance types to insurance_financial_contacts table
-- Run this in your Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE insurance_financial_contacts 
DROP CONSTRAINT IF EXISTS insurance_financial_contacts_contact_type_check;

-- Add new constraint with expanded insurance types
ALTER TABLE insurance_financial_contacts 
ADD CONSTRAINT insurance_financial_contacts_contact_type_check 
CHECK (contact_type IN (
  'health_insurance',
  'life_insurance',
  'auto_insurance',
  'home_insurance',
  'burial_insurance',
  'disability_insurance',
  'retirement_account',
  'employer_benefits',
  'financial_advisor',
  'other'
));

