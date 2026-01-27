-- Add start date and indefinite flag to expert_inactivity table
ALTER TABLE public.expert_inactivity 
ADD COLUMN start_date timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN is_indefinite boolean NOT NULL DEFAULT false;

-- Make 'until' nullable for indefinite periods
ALTER TABLE public.expert_inactivity 
ALTER COLUMN until DROP NOT NULL;