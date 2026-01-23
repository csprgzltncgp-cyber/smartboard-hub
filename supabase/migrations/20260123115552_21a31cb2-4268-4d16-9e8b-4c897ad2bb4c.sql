-- Országok tábla
CREATE TABLE public.countries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cégek tábla
CREATE TABLE public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Esemény típusok enum
CREATE TYPE public.activity_event_type AS ENUM (
    'workshop',
    'webinar',
    'meeting',
    'health_day',
    'orientation',
    'communication_refresh',
    'other'
);

-- Esemény státusz enum
CREATE TYPE public.activity_event_status AS ENUM (
    'planned',
    'approved',
    'in_progress',
    'completed',
    'archived'
);

-- Meeting hangulat enum
CREATE TYPE public.meeting_mood AS ENUM (
    'very_positive',
    'positive',
    'neutral',
    'negative',
    'very_negative'
);

-- Felhasználó-ügyfél hozzárendelések
CREATE TABLE public.user_client_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, company_id)
);

-- Activity Plan-ek
CREATE TABLE public.activity_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    period_type TEXT NOT NULL DEFAULT 'yearly', -- 'yearly', 'half_yearly', 'custom'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity Plan események
CREATE TABLE public.activity_plan_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_plan_id UUID NOT NULL REFERENCES public.activity_plans(id) ON DELETE CASCADE,
    event_type public.activity_event_type NOT NULL,
    custom_type_name TEXT, -- Ha event_type = 'other', akkor itt van az egyedi név
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    is_free BOOLEAN NOT NULL DEFAULT false,
    price DECIMAL(10,2),
    status public.activity_event_status NOT NULL DEFAULT 'planned',
    notes TEXT,
    -- Meeting specifikus mezők
    meeting_location TEXT,
    meeting_type TEXT, -- 'personal', 'online'
    meeting_mood public.meeting_mood,
    meeting_summary TEXT,
    -- Metaadatok
    completed_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Director jogosultság hozzáadása az app_users táblához
ALTER TABLE public.app_users 
ADD COLUMN is_client_director BOOLEAN NOT NULL DEFAULT false;

-- RLS engedélyezése
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_plan_events ENABLE ROW LEVEL SECURITY;

-- Countries - publikus olvasás
CREATE POLICY "Allow public read on countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on countries" ON public.countries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on countries" ON public.countries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on countries" ON public.countries FOR DELETE USING (true);

-- Companies - publikus olvasás
CREATE POLICY "Allow public read on companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow public insert on companies" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on companies" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on companies" ON public.companies FOR DELETE USING (true);

-- User Client Assignments
CREATE POLICY "Allow public read on user_client_assignments" ON public.user_client_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on user_client_assignments" ON public.user_client_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on user_client_assignments" ON public.user_client_assignments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on user_client_assignments" ON public.user_client_assignments FOR DELETE USING (true);

-- Activity Plans
CREATE POLICY "Allow public read on activity_plans" ON public.activity_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert on activity_plans" ON public.activity_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on activity_plans" ON public.activity_plans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on activity_plans" ON public.activity_plans FOR DELETE USING (true);

-- Activity Plan Events
CREATE POLICY "Allow public read on activity_plan_events" ON public.activity_plan_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert on activity_plan_events" ON public.activity_plan_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on activity_plan_events" ON public.activity_plan_events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on activity_plan_events" ON public.activity_plan_events FOR DELETE USING (true);

-- Indexek a gyorsabb lekérdezésekhez
CREATE INDEX idx_companies_country ON public.companies(country_id);
CREATE INDEX idx_user_client_assignments_user ON public.user_client_assignments(user_id);
CREATE INDEX idx_user_client_assignments_company ON public.user_client_assignments(company_id);
CREATE INDEX idx_activity_plans_user ON public.activity_plans(user_id);
CREATE INDEX idx_activity_plans_company ON public.activity_plans(company_id);
CREATE INDEX idx_activity_plan_events_plan ON public.activity_plan_events(activity_plan_id);
CREATE INDEX idx_activity_plan_events_date ON public.activity_plan_events(event_date);
CREATE INDEX idx_activity_plan_events_status ON public.activity_plan_events(status);

-- Trigger az updated_at frissítéshez
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON public.countries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_client_assignments_updated_at BEFORE UPDATE ON public.user_client_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_plans_updated_at BEFORE UPDATE ON public.activity_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_plan_events_updated_at BEFORE UPDATE ON public.activity_plan_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();