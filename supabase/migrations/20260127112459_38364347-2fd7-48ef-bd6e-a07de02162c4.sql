-- Create experts table
CREATE TABLE public.experts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    phone_prefix TEXT,
    phone_number TEXT,
    country_id UUID REFERENCES public.countries(id),
    language TEXT DEFAULT 'hu',
    is_cgp_employee BOOLEAN DEFAULT false,
    is_eap_online_expert BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false,
    contract_canceled BOOLEAN DEFAULT false,
    crisis_psychologist BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expert_data table for additional expert information (address, etc.)
CREATE TABLE public.expert_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
    post_code TEXT,
    city_id UUID,
    street TEXT,
    street_suffix TEXT,
    house_number TEXT,
    native_language TEXT,
    min_inprogress_cases INTEGER DEFAULT 0,
    max_inprogress_cases INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(expert_id)
);

-- Create invoice_data table for expert billing information
CREATE TABLE public.expert_invoice_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
    invoicing_type TEXT DEFAULT 'normal', -- normal, fixed, custom
    currency TEXT DEFAULT 'eur',
    hourly_rate_50 DECIMAL(10,2),
    hourly_rate_30 DECIMAL(10,2),
    hourly_rate_15 DECIMAL(10,2),
    fixed_wage DECIMAL(10,2),
    ranking_hourly_rate DECIMAL(10,2),
    single_session_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(expert_id)
);

-- Create permissions table
CREATE TABLE public.permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create specializations table
CREATE TABLE public.specializations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create language_skills table
CREATE TABLE public.language_skills (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expert_countries junction table (which countries the expert can work in)
CREATE TABLE public.expert_countries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(expert_id, country_id)
);

-- Create expert_crisis_countries junction table
CREATE TABLE public.expert_crisis_countries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(expert_id, country_id)
);

-- Create expert_permissions junction table
CREATE TABLE public.expert_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(expert_id, permission_id)
);

-- Create expert_specializations junction table
CREATE TABLE public.expert_specializations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
    specialization_id UUID NOT NULL REFERENCES public.specializations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(expert_id, specialization_id)
);

-- Create expert_language_skills junction table
CREATE TABLE public.expert_language_skills (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
    language_skill_id UUID NOT NULL REFERENCES public.language_skills(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(expert_id, language_skill_id)
);

-- Create expert_files table for contracts and certificates
CREATE TABLE public.expert_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
    file_type TEXT NOT NULL, -- 'contract' or 'certificate'
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inactivity table for tracking expert inactivity periods
CREATE TABLE public.expert_inactivity (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
    until TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_invoice_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_crisis_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_language_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_inactivity ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - adjust based on your auth requirements)
CREATE POLICY "Allow all operations on experts" ON public.experts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expert_data" ON public.expert_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expert_invoice_data" ON public.expert_invoice_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on permissions" ON public.permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on specializations" ON public.specializations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on language_skills" ON public.language_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expert_countries" ON public.expert_countries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expert_crisis_countries" ON public.expert_crisis_countries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expert_permissions" ON public.expert_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expert_specializations" ON public.expert_specializations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expert_language_skills" ON public.expert_language_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expert_files" ON public.expert_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expert_inactivity" ON public.expert_inactivity FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON public.experts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expert_data_updated_at BEFORE UPDATE ON public.expert_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expert_invoice_data_updated_at BEFORE UPDATE ON public.expert_invoice_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default permissions (based on Laravel reference)
INSERT INTO public.permissions (name, description) VALUES
    ('Pszichológus', 'Psychologist permission'),
    ('EAP tanácsadó', 'EAP counselor permission'),
    ('Coaching', 'Coaching permission'),
    ('Work-Life Balance', 'Work-Life Balance permission'),
    ('Jogi tanácsadás', 'Legal counseling permission'),
    ('Pénzügyi tanácsadás', 'Financial counseling permission'),
    ('Krízis', 'Crisis permission'),
    ('HR tanácsadás', 'HR counseling permission'),
    ('Workshop', 'Workshop permission'),
    ('Egészségügyi tanácsadás', 'Health counseling permission');

-- Insert default specializations
INSERT INTO public.specializations (name) VALUES
    ('Stresszkezelés'),
    ('Párkapcsolati tanácsadás'),
    ('Családterápia'),
    ('Munkahelyi konfliktusok'),
    ('Szorongás'),
    ('Depresszió'),
    ('Burnout'),
    ('Traumafeldolgozás');

-- Insert default language skills
INSERT INTO public.language_skills (name, code) VALUES
    ('Magyar', 'hu'),
    ('Angol', 'en'),
    ('Német', 'de'),
    ('Francia', 'fr'),
    ('Spanyol', 'es'),
    ('Olasz', 'it'),
    ('Román', 'ro'),
    ('Cseh', 'cs'),
    ('Lengyel', 'pl'),
    ('Szlovák', 'sk');