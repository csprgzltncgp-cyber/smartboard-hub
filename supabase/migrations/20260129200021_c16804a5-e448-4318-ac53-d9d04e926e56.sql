-- Create company_contracted_entities table
-- This table stores contracted legal entities within a country
-- Each entity has its own contract data, reporting settings, and billing

CREATE TABLE public.company_contracted_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  
  -- Entity identification
  name TEXT NOT NULL,
  
  -- Country-specific settings (moved from company_country_settings)
  org_id TEXT,
  contract_date DATE,
  contract_end_date DATE,
  reporting_data JSONB DEFAULT '{}'::jsonb,
  
  -- Contract data (moved from company level)
  contract_holder_type TEXT,
  contract_price NUMERIC,
  price_type TEXT, -- 'pepm' or 'package'
  contract_currency TEXT,
  pillars INTEGER,
  occasions INTEGER,
  industry TEXT,
  consultation_rows JSONB DEFAULT '[]'::jsonb,
  price_history JSONB DEFAULT '[]'::jsonb,
  
  -- Workshop & Crisis data
  workshop_data JSONB DEFAULT '{}'::jsonb,
  crisis_data JSONB DEFAULT '{}'::jsonb,
  
  -- Headcount
  headcount INTEGER,
  inactive_headcount INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient lookups
CREATE INDEX idx_contracted_entities_company_country 
  ON public.company_contracted_entities(company_id, country_id);

-- Enable RLS
ALTER TABLE public.company_contracted_entities ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations on company_contracted_entities"
  ON public.company_contracted_entities
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_company_contracted_entities_updated_at
  BEFORE UPDATE ON public.company_contracted_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add contracted_entity_id to billing-related tables
ALTER TABLE public.company_billing_data 
  ADD COLUMN contracted_entity_id UUID REFERENCES public.company_contracted_entities(id) ON DELETE CASCADE;

ALTER TABLE public.company_invoice_templates 
  ADD COLUMN contracted_entity_id UUID REFERENCES public.company_contracted_entities(id) ON DELETE CASCADE;

ALTER TABLE public.company_invoice_items 
  ADD COLUMN contracted_entity_id UUID REFERENCES public.company_contracted_entities(id) ON DELETE CASCADE;

ALTER TABLE public.company_invoice_comments 
  ADD COLUMN contracted_entity_id UUID REFERENCES public.company_contracted_entities(id) ON DELETE CASCADE;

-- Add flag to company_country_differentiates for multi-entity support
ALTER TABLE public.company_country_differentiates
  ADD COLUMN has_multiple_entities BOOLEAN NOT NULL DEFAULT false;