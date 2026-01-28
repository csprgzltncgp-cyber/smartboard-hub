-- Company-country many-to-many relationship
CREATE TABLE public.company_countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, country_id)
);

-- Country differentiate flags per company
CREATE TABLE public.company_country_differentiates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  contract_holder BOOLEAN NOT NULL DEFAULT false,
  org_id BOOLEAN NOT NULL DEFAULT false,
  contract_date BOOLEAN NOT NULL DEFAULT false,
  reporting BOOLEAN NOT NULL DEFAULT false,
  invoicing BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Company basic data extensions (connected company, lead account, contract holder type)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS connected_company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS lead_account_user_id UUID REFERENCES public.app_users(id),
ADD COLUMN IF NOT EXISTS contract_holder_type TEXT CHECK (contract_holder_type IN ('telus', 'cgp', null));

-- Country-specific settings per company
CREATE TABLE public.company_country_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  contract_date DATE,
  contract_end_date DATE,
  org_id TEXT,
  reporting_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, country_id)
);

-- Company billing data (global or per-country)
CREATE TABLE public.company_billing_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  -- Billing info
  billing_name TEXT,
  billing_address TEXT,
  billing_city TEXT,
  billing_postal_code TEXT,
  billing_country_id UUID REFERENCES public.countries(id),
  tax_number TEXT,
  eu_tax_number TEXT,
  payment_deadline INTEGER DEFAULT 30,
  -- Invoicing settings
  billing_frequency INTEGER DEFAULT 1,
  invoice_language TEXT DEFAULT 'hu',
  currency TEXT DEFAULT 'EUR',
  vat_rate NUMERIC DEFAULT 0,
  -- Delivery settings
  send_invoice_by_post BOOLEAN DEFAULT false,
  send_invoice_by_email BOOLEAN DEFAULT false,
  upload_invoice_online BOOLEAN DEFAULT false,
  invoice_online_url TEXT,
  post_address TEXT,
  post_city TEXT,
  post_postal_code TEXT,
  post_country_id UUID REFERENCES public.countries(id),
  contact_holder_name TEXT,
  show_contact_holder_name_on_post BOOLEAN DEFAULT false,
  custom_email_subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, country_id)
);

-- Billing email addresses
CREATE TABLE public.company_billing_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  billing_data_id UUID NOT NULL REFERENCES public.company_billing_data(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoice items per company (global or per-country)
CREATE TABLE public.company_invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoice comments per company
CREATE TABLE public.company_invoice_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.company_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_country_differentiates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_country_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_billing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_billing_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_invoice_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for all tables
CREATE POLICY "Allow all operations on company_countries" ON public.company_countries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on company_country_differentiates" ON public.company_country_differentiates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on company_country_settings" ON public.company_country_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on company_billing_data" ON public.company_billing_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on company_billing_emails" ON public.company_billing_emails FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on company_invoice_items" ON public.company_invoice_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on company_invoice_comments" ON public.company_invoice_comments FOR ALL USING (true) WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_company_country_differentiates_updated_at
  BEFORE UPDATE ON public.company_country_differentiates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_country_settings_updated_at
  BEFORE UPDATE ON public.company_country_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_billing_data_updated_at
  BEFORE UPDATE ON public.company_billing_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_invoice_items_updated_at
  BEFORE UPDATE ON public.company_invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();