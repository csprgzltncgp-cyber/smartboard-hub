-- Add missing country-specific basic data fields to company_country_settings
ALTER TABLE public.company_country_settings 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS dispatch_name TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS contract_holder_id TEXT,
ADD COLUMN IF NOT EXISTS contract_reminder_email TEXT,
ADD COLUMN IF NOT EXISTS head_count INTEGER,
ADD COLUMN IF NOT EXISTS contract_file_url TEXT,
ADD COLUMN IF NOT EXISTS contract_price NUMERIC,
ADD COLUMN IF NOT EXISTS contract_price_type TEXT,
ADD COLUMN IF NOT EXISTS contract_currency TEXT,
ADD COLUMN IF NOT EXISTS pillar_count INTEGER,
ADD COLUMN IF NOT EXISTS session_count INTEGER,
ADD COLUMN IF NOT EXISTS consultation_rows JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS price_history JSONB DEFAULT '[]'::jsonb;