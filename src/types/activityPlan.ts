// Activity Plan types

export type ActivityEventType = 
  | 'workshop'
  | 'webinar'
  | 'meeting'
  | 'health_day'
  | 'orientation'
  | 'communication_refresh'
  | 'other';

export type ActivityEventStatus = 
  | 'planned'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'archived';

export type MeetingMood = 
  | 'very_positive'
  | 'positive'
  | 'neutral'
  | 'negative'
  | 'very_negative';

export type PeriodType = 'yearly' | 'half_yearly' | 'custom';

export interface Country {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  country_id: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  country?: Country;
}

export interface UserClientAssignment {
  id: string;
  user_id: string;
  company_id: string;
  assigned_at: string;
  assigned_by?: string;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface ActivityPlan {
  id: string;
  user_id: string;
  company_id: string;
  title: string;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: Company;
  events?: ActivityPlanEvent[];
}

export interface ActivityPlanEvent {
  id: string;
  activity_plan_id: string;
  event_type: ActivityEventType;
  custom_type_name?: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  is_free: boolean;
  price?: number;
  status: ActivityEventStatus;
  notes?: string;
  // Meeting specific fields
  meeting_location?: string;
  meeting_type?: 'personal' | 'online';
  meeting_mood?: MeetingMood;
  meeting_summary?: string;
  // Metadata
  completed_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

// UI helper types
export const EVENT_TYPE_LABELS: Record<ActivityEventType, string> = {
  workshop: 'Workshop',
  webinar: 'Élő Webinár',
  meeting: 'Meeting',
  health_day: 'Egészségnap',
  orientation: 'Extra Orientáció',
  communication_refresh: 'Kommunikáció frissítés',
  other: 'Egyéb',
};

// Icon names for Lucide - import and use these in components
export const EVENT_TYPE_ICON_NAMES: Record<ActivityEventType, string> = {
  workshop: 'BookOpen',
  webinar: 'Video',
  meeting: 'Users',
  health_day: 'Heart',
  orientation: 'Target',
  communication_refresh: 'MessageSquare',
  other: 'Pin',
};

export const STATUS_LABELS: Record<ActivityEventStatus, string> = {
  planned: 'Tervezett',
  approved: 'Jóváhagyott',
  in_progress: 'Folyamatban',
  completed: 'Lezajlott',
  archived: 'Archivált',
};

export const STATUS_COLORS: Record<ActivityEventStatus, string> = {
  planned: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/10 text-primary',
  in_progress: 'bg-cgp-teal-light/20 text-foreground',
  completed: 'bg-cgp-badge-new/20 text-foreground',
  archived: 'bg-cgp-task-completed-purple/20 text-foreground',
};

export const MOOD_LABELS: Record<MeetingMood, string> = {
  very_positive: 'Nagyon pozitív',
  positive: 'Pozitív',
  neutral: 'Semleges',
  negative: 'Negatív',
  very_negative: 'Nagyon negatív',
};

// Mood icon names for Lucide
export const MOOD_ICON_NAMES: Record<MeetingMood, string> = {
  very_positive: 'SmilePlus',
  positive: 'Smile',
  neutral: 'Meh',
  negative: 'Frown',
  very_negative: 'Angry',
};

export const PERIOD_LABELS: Record<PeriodType, string> = {
  yearly: 'Éves',
  half_yearly: 'Féléves',
  custom: 'Egyedi',
};
