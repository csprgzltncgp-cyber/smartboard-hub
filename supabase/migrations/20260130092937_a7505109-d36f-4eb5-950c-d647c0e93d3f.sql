-- Entitás-specifikus mezők hozzáadása
-- dispatch_name, is_active, contract_reminder_email, client_dashboard_users

ALTER TABLE public.company_contracted_entities
ADD COLUMN IF NOT EXISTS dispatch_name TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS contract_reminder_email TEXT,
ADD COLUMN IF NOT EXISTS client_dashboard_users JSONB DEFAULT '[]'::jsonb;

-- Komment a mezőkhöz
COMMENT ON COLUMN public.company_contracted_entities.dispatch_name IS 'Cég elnevezése kiközvetítéshez - ahogy az operátorok listájában megjelenik';
COMMENT ON COLUMN public.company_contracted_entities.is_active IS 'Az entitás aktív-e';
COMMENT ON COLUMN public.company_contracted_entities.contract_reminder_email IS 'Emlékeztető e-mail a szerződés lejáratáról';
COMMENT ON COLUMN public.company_contracted_entities.client_dashboard_users IS 'Client Dashboard felhasználók JSON tömb: [{username, password_hash, language_id}]';