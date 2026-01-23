-- Create enum for lead statuses
CREATE TYPE public.lead_status AS ENUM ('lead', 'offer', 'deal', 'signed');

-- Create enum for meeting types
CREATE TYPE public.meeting_type AS ENUM ('email', 'video', 'phone', 'personal');

-- Create CRM leads table
CREATE TABLE public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    status lead_status NOT NULL DEFAULT 'lead',
    notes TEXT,
    details JSONB DEFAULT '{}',
    contacts JSONB DEFAULT '[]',
    meetings JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table for user management (not auth, just user profiles/settings)
CREATE TABLE public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    language TEXT DEFAULT 'hu',
    avatar_url TEXT,
    smartboard_permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create operators table
CREATE TABLE public.app_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    language TEXT DEFAULT 'hu',
    avatar_url TEXT,
    smartboard_permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for now since no auth)
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_operators ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies (will restrict later with auth)
CREATE POLICY "Allow public read on crm_leads" ON public.crm_leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert on crm_leads" ON public.crm_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on crm_leads" ON public.crm_leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on crm_leads" ON public.crm_leads FOR DELETE USING (true);

CREATE POLICY "Allow public read on app_users" ON public.app_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on app_users" ON public.app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on app_users" ON public.app_users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on app_users" ON public.app_users FOR DELETE USING (true);

CREATE POLICY "Allow public read on app_operators" ON public.app_operators FOR SELECT USING (true);
CREATE POLICY "Allow public insert on app_operators" ON public.app_operators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on app_operators" ON public.app_operators FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on app_operators" ON public.app_operators FOR DELETE USING (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_crm_leads_updated_at
    BEFORE UPDATE ON public.crm_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON public.app_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_operators_updated_at
    BEFORE UPDATE ON public.app_operators
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();