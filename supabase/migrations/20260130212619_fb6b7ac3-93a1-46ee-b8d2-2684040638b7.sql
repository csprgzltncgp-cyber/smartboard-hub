-- Client Dashboard felhasználók tábla
CREATE TABLE public.client_dashboard_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  password TEXT, -- Egyszerű jelszó tárolás (később hash-elhető)
  language_id TEXT,
  is_superuser BOOLEAN DEFAULT false,
  can_view_aggregated BOOLEAN DEFAULT false, -- User-szintű aggregált nézet beállítás
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Client Dashboard felhasználó scope-ok - meghatározza mit láthat az adott user
CREATE TABLE public.client_dashboard_user_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES client_dashboard_users(id) ON DELETE CASCADE NOT NULL,
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  contracted_entity_id UUID REFERENCES company_contracted_entities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT scope_has_target CHECK (country_id IS NOT NULL OR contracted_entity_id IS NOT NULL)
);

-- Client Dashboard felhasználó jogosultságok - menüpont szintű
CREATE TABLE public.client_dashboard_user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES client_dashboard_users(id) ON DELETE CASCADE NOT NULL,
  menu_item TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, menu_item)
);

-- Cég riport konfiguráció - meghatározza a riport struktúrát
CREATE TABLE public.company_report_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  report_type TEXT NOT NULL DEFAULT 'single', -- 'single', 'per_country', 'per_entity', 'custom'
  configuration JSONB DEFAULT '{}', -- Részletes konfiguráció
  access_type TEXT NOT NULL DEFAULT 'single_user', -- 'single_user', 'per_report', 'with_superuser'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS engedélyezés
ALTER TABLE public.client_dashboard_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_dashboard_user_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_dashboard_user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_report_configuration ENABLE ROW LEVEL SECURITY;

-- RLS policies - publikus hozzáférés (admin rendszer)
CREATE POLICY "Allow all access to client_dashboard_users" ON public.client_dashboard_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to client_dashboard_user_scopes" ON public.client_dashboard_user_scopes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to client_dashboard_user_permissions" ON public.client_dashboard_user_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to company_report_configuration" ON public.company_report_configuration FOR ALL USING (true) WITH CHECK (true);

-- Timestamp trigger
CREATE TRIGGER update_client_dashboard_users_updated_at
  BEFORE UPDATE ON public.client_dashboard_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_report_configuration_updated_at
  BEFORE UPDATE ON public.company_report_configuration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();