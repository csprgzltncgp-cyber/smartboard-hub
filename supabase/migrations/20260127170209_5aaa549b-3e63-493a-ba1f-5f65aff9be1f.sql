-- Add consultation type preferences to experts table
ALTER TABLE public.experts
ADD COLUMN IF NOT EXISTS accepts_personal_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_video_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_phone_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_chat_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS video_consultation_type text DEFAULT 'both' CHECK (video_consultation_type IN ('eap_online_only', 'operator_only', 'both')),
ADD COLUMN IF NOT EXISTS accepts_onsite_consultation boolean DEFAULT false;

-- Add consultation type preferences to expert_team_members table
ALTER TABLE public.expert_team_members
ADD COLUMN IF NOT EXISTS accepts_personal_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_video_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_phone_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_chat_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS video_consultation_type text DEFAULT 'both' CHECK (video_consultation_type IN ('eap_online_only', 'operator_only', 'both')),
ADD COLUMN IF NOT EXISTS accepts_onsite_consultation boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.experts.accepts_personal_consultation IS 'Whether the expert accepts personal (in-person) consultations';
COMMENT ON COLUMN public.experts.accepts_video_consultation IS 'Whether the expert accepts video consultations';
COMMENT ON COLUMN public.experts.accepts_phone_consultation IS 'Whether the expert accepts phone consultations';
COMMENT ON COLUMN public.experts.accepts_chat_consultation IS 'Whether the expert accepts chat-based consultations';
COMMENT ON COLUMN public.experts.video_consultation_type IS 'For video consultations: eap_online_only, operator_only, or both';
COMMENT ON COLUMN public.experts.accepts_onsite_consultation IS 'For personal consultations: whether they accept on-site visits';