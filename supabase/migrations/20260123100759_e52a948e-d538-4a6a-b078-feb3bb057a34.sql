-- Add missing lead status values to the enum
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'incoming_company';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'cancelled';