-- Add is_cgp_employee and is_eap_online_expert columns to expert_team_members table
ALTER TABLE public.expert_team_members 
ADD COLUMN is_cgp_employee boolean DEFAULT false,
ADD COLUMN is_eap_online_expert boolean DEFAULT false;