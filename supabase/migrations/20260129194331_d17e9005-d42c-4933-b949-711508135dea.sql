-- Cég elnevezése kiközvetítéshez mező hozzáadása
ALTER TABLE public.companies
ADD COLUMN dispatch_name TEXT DEFAULT NULL;

COMMENT ON COLUMN public.companies.dispatch_name IS 'Cég elnevezése kiközvetítéshez - ahogy az operátorok listájában megjelenik';