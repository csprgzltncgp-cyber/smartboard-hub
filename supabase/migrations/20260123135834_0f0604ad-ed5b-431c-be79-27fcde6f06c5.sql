-- Add unique constraint on company_id to ensure one client can only be assigned to one user
ALTER TABLE public.user_client_assignments
ADD CONSTRAINT user_client_assignments_company_id_unique UNIQUE (company_id);