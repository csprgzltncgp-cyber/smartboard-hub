-- Add group_name column to companies table
-- This field is used when country-specific basic data is enabled, to determine which name appears in the company list
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS group_name TEXT;