-- Add entity_country_ids column to track which countries have multiple entities enabled
ALTER TABLE public.company_country_differentiates 
ADD COLUMN entity_country_ids TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.company_country_differentiates.entity_country_ids IS 'Array of country IDs where multiple entities mode is enabled';