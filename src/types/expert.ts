// Expert types based on Laravel reference (Admin/Expert/Edit.php and list.blade.php)

export interface Expert {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone_prefix: string | null;
  phone_number: string | null;
  country_id: string | null;
  language: string;
  is_cgp_employee: boolean;
  is_eap_online_expert: boolean;
  is_active: boolean;
  is_locked: boolean;
  contract_canceled: boolean;
  crisis_psychologist: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (loaded separately)
  country?: Country;
  expert_data?: ExpertData;
  invoice_data?: ExpertInvoiceData;
  inactivity?: ExpertInactivity;
  expert_countries?: Country[];
  expert_crisis_countries?: Country[];
  permissions?: Permission[];
  specializations?: Specialization[];
  language_skills?: LanguageSkill[];
}

export interface ExpertData {
  id: string;
  expert_id: string;
  post_code: string | null;
  city_id: string | null;
  street: string | null;
  street_suffix: string | null;
  house_number: string | null;
  native_language: string | null;
  min_inprogress_cases: number;
  max_inprogress_cases: number;
  created_at: string;
  updated_at: string;
}

export interface ExpertInvoiceData {
  id: string;
  expert_id: string;
  invoicing_type: 'normal' | 'fixed' | 'custom';
  currency: string;
  hourly_rate_50: number | null;
  hourly_rate_30: number | null;
  hourly_rate_15: number | null;
  fixed_wage: number | null;
  ranking_hourly_rate: number | null;
  single_session_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Specialization {
  id: string;
  name: string;
  created_at: string;
}

export interface LanguageSkill {
  id: string;
  name: string;
  code: string | null;
  created_at: string;
}

export interface ExpertInactivity {
  id: string;
  expert_id: string;
  until: string;
  reason: string | null;
  created_at: string;
}

export interface ExpertFile {
  id: string;
  expert_id: string;
  file_type: 'contract' | 'certificate';
  filename: string;
  file_path: string;
  created_at: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

// Form data for creating/editing an expert
export interface ExpertFormData {
  name: string;
  email: string;
  username: string;
  phone_prefix: string;
  phone_number: string;
  country_id: string;
  language: string;
  is_cgp_employee: boolean;
  is_eap_online_expert: boolean;
  // Address data (only for non-CGP employees)
  post_code: string;
  city_id: string;
  street: string;
  street_suffix: string;
  house_number: string;
  native_language: string;
  min_inprogress_cases: number;
  max_inprogress_cases: number;
  // Invoice data
  invoicing_type: 'normal' | 'fixed' | 'custom';
  currency: string;
  hourly_rate_50: number | null;
  hourly_rate_30: number | null;
  hourly_rate_15: number | null;
  fixed_wage: number | null;
  ranking_hourly_rate: number | null;
  single_session_rate: number | null;
  // Relations
  expert_country_ids: string[];
  crisis_country_ids: string[];
  permission_ids: string[];
  specialization_ids: string[];
  language_skill_ids: string[];
  crisis_psychologist: boolean;
}

// Expert grouped by country for list view
export interface ExpertsByCountry {
  country: Country;
  experts: Expert[];
}
