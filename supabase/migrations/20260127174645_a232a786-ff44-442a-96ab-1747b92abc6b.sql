-- Add parent_id column to specializations table for hierarchical structure
ALTER TABLE public.specializations 
ADD COLUMN parent_id uuid REFERENCES public.specializations(id) ON DELETE CASCADE;

-- Add index for faster parent lookups
CREATE INDEX idx_specializations_parent_id ON public.specializations(parent_id);

-- Update existing specializations to be under Psychology parent (will be inserted next)
-- First, let's add the main categories and update existing ones