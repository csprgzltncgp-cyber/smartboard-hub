-- Create contract_holders enum for fixed list
CREATE TYPE public.contract_holder_type AS ENUM ('cgp_europe', 'telus', 'telus_wpo', 'compsych');

-- Create expense categories enum
CREATE TYPE public.expense_category AS ENUM (
  'gross_salary',
  'corporate_tax',
  'innovation_fee',
  'vat',
  'car_tax',
  'local_business_tax',
  'other_costs',
  'supplier_invoices',
  'custom'
);

-- Create entry type enum (income/expense)
CREATE TYPE public.entry_type AS ENUM ('income', 'expense');

-- Monthly expenses table for fixed monthly costs
CREATE TABLE public.monthly_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  category expense_category NOT NULL,
  custom_category_name TEXT, -- For 'custom' category
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes TEXT,
  created_by UUID REFERENCES public.app_operators(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(year, month, category, custom_category_name)
);

-- Manual entries table for ad-hoc income/expense items
CREATE TABLE public.manual_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  entry_type entry_type NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  contract_holder contract_holder_type,
  country_id UUID REFERENCES public.countries(id),
  notes TEXT,
  created_by UUID REFERENCES public.app_operators(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contract holder revenue data (mock data for now, later from Laravel)
CREATE TABLE public.contract_holder_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  contract_holder contract_holder_type NOT NULL,
  country_id UUID REFERENCES public.countries(id),
  revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
  consultation_count INTEGER NOT NULL DEFAULT 0,
  consultation_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(year, month, contract_holder, country_id)
);

-- Enable RLS on all tables
ALTER TABLE public.monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_holder_revenue ENABLE ROW LEVEL SECURITY;

-- RLS policies: Only operators with admin or financial permissions can access
-- For now, we allow all authenticated operators to access (can be refined later)
CREATE POLICY "Operators can view monthly_expenses"
  ON public.monthly_expenses FOR SELECT
  USING (true);

CREATE POLICY "Operators can insert monthly_expenses"
  ON public.monthly_expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Operators can update monthly_expenses"
  ON public.monthly_expenses FOR UPDATE
  USING (true);

CREATE POLICY "Operators can delete monthly_expenses"
  ON public.monthly_expenses FOR DELETE
  USING (true);

CREATE POLICY "Operators can view manual_entries"
  ON public.manual_entries FOR SELECT
  USING (true);

CREATE POLICY "Operators can insert manual_entries"
  ON public.manual_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Operators can update manual_entries"
  ON public.manual_entries FOR UPDATE
  USING (true);

CREATE POLICY "Operators can delete manual_entries"
  ON public.manual_entries FOR DELETE
  USING (true);

CREATE POLICY "Operators can view contract_holder_revenue"
  ON public.contract_holder_revenue FOR SELECT
  USING (true);

CREATE POLICY "Operators can insert contract_holder_revenue"
  ON public.contract_holder_revenue FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Operators can update contract_holder_revenue"
  ON public.contract_holder_revenue FOR UPDATE
  USING (true);

CREATE POLICY "Operators can delete contract_holder_revenue"
  ON public.contract_holder_revenue FOR DELETE
  USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_monthly_expenses_updated_at
  BEFORE UPDATE ON public.monthly_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manual_entries_updated_at
  BEFORE UPDATE ON public.manual_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_holder_revenue_updated_at
  BEFORE UPDATE ON public.contract_holder_revenue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();