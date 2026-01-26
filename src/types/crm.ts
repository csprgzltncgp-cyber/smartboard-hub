// CRM Module Types - Based on UXPin designs and Laravel structure

export type CrmStage = 'lead' | 'offer' | 'deal' | 'signed';

export type ContactType = 'email' | 'video' | 'phone' | 'in_person' | 'personal';

export type MeetingMood = 'happy' | 'neutral' | 'confused' | 'negative';

// Status icons that control which tab the lead appears in
export type LeadStatus = 'lead' | 'offer' | 'deal' | 'signed' | 'incoming_company' | 'cancelled';

export interface CrmContact {
  id: string;
  name: string;
  title: string;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  address?: string;
  isPrimary?: boolean;
}

export interface CrmMeeting {
  id: string;
  date: string;
  time: string;
  contactId: string;
  contactName: string;
  contactTitle: string;
  contactType: ContactType;
  pillars: number;
  sessions: number;
  mood?: MeetingMood;
  status?: 'cancelled' | 'scheduled' | 'completed' | 'thumbs_up';
  hasNotification?: boolean;
  note?: string;
}

export interface CrmDetail {
  id: string;
  label: string;
  value: string;
}

export interface CrmCompanyDetails {
  name: string;
  city: string;
  country: string;
  industry: string;
  headcount: number;
  pillars: number;
  sessions: number;
}

export interface CrmNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface CrmLead {
  id: string;
  companyName: string;
  assignedTo: string;
  assignedToId: string;
  status: LeadStatus; // Controls which tab the lead appears in
  progress: number; // 0-100 percentage
  contacts: CrmContact[];
  meetings: CrmMeeting[];
  details: CrmCompanyDetails;
  customDetails: CrmDetail[];
  notes: CrmNote[];
  hasAlert?: boolean;
  isMuted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// For signed companies - additional dashboard data
export interface CrmDashboardInfo {
  countries: {
    name: string;
    pillar: string;
    sessions: number;
    hasPhone: boolean;
    hasVideo: boolean;
    hasCrisis: boolean;
  }[];
  contractHolder: string;
  contractDate: string;
  isActive: boolean;
  workshopsNumber: number;
  crisisInterventionsNumber: number;
}

export interface CrmSignedCompany extends CrmLead {
  pricing: string;
  cgpResponsible: string;
  dashboardInfo: CrmDashboardInfo;
}

// Filter state
export interface CrmFilters {
  country: string | null;
  colleague: string | null;
}

// Tab types
export type CrmTab = 'leads' | 'offers' | 'deals' | 'signed' | 'todolist' | 'reports';

// Form data for creating new lead
export interface NewLeadFormData {
  companyName: string;
  assignedTo: string;
  assignedToId: string;
}
