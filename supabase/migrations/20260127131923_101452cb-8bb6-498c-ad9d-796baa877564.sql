-- Create cities table for expert city assignments
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on cities"
ON public.cities
FOR ALL
USING (true)
WITH CHECK (true);

-- Create expert_cities junction table
CREATE TABLE IF NOT EXISTS public.expert_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(expert_id, city_id)
);

-- Enable RLS
ALTER TABLE public.expert_cities ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on expert_cities"
ON public.expert_cities
FOR ALL
USING (true)
WITH CHECK (true);

-- Create expert_outsource_countries junction table for WS/CI/O countries
CREATE TABLE IF NOT EXISTS public.expert_outsource_countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(expert_id, country_id)
);

-- Enable RLS
ALTER TABLE public.expert_outsource_countries ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on expert_outsource_countries"
ON public.expert_outsource_countries
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert some sample cities
INSERT INTO public.cities (name, country_id) 
SELECT 'Budapest', id FROM public.countries WHERE code = 'HU'
ON CONFLICT DO NOTHING;
INSERT INTO public.cities (name, country_id) 
SELECT 'Debrecen', id FROM public.countries WHERE code = 'HU'
ON CONFLICT DO NOTHING;
INSERT INTO public.cities (name, country_id) 
SELECT 'Szeged', id FROM public.countries WHERE code = 'HU'
ON CONFLICT DO NOTHING;
INSERT INTO public.cities (name, country_id) 
SELECT 'Praha', id FROM public.countries WHERE code = 'CZ'
ON CONFLICT DO NOTHING;
INSERT INTO public.cities (name, country_id) 
SELECT 'Brno', id FROM public.countries WHERE code = 'CZ'
ON CONFLICT DO NOTHING;
INSERT INTO public.cities (name, country_id) 
SELECT 'Bratislava', id FROM public.countries WHERE code = 'SK'
ON CONFLICT DO NOTHING;
INSERT INTO public.cities (name, country_id) 
SELECT 'București', id FROM public.countries WHERE code = 'RO'
ON CONFLICT DO NOTHING;
INSERT INTO public.cities (name, country_id) 
SELECT 'Beograd', id FROM public.countries WHERE code = 'RS'
ON CONFLICT DO NOTHING;