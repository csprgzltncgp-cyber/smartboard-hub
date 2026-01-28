// Cég típusok a Companies modulhoz

export interface Company {
  id: string;
  name: string;
  active: boolean;
  country_ids: string[];
  contract_holder_id: string | null;
  org_id: string | null;
  contract_start: string | null;
  contract_end: string | null;
  contract_reminder_email: string | null;
  lead_account_id: string | null;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface CountryDifferentiate {
  contract_holder: boolean;
  org_id: boolean;
  contract_date: boolean;
  reporting: boolean;
  invoicing: boolean;
  contract_date_reminder_email: boolean;
}

export interface ContractHolder {
  id: string;
  name: string;
}

export interface CompanyCountrySettings {
  id: string;
  company_id: string;
  country_id: string;
  contract_holder_id: string | null;
  org_id: string | null;
  contract_start: string | null;
  contract_end: string | null;
  contract_reminder_email: string | null;
  head_count: number | null;
  activity_plan_user_id: string | null;
  // Client Dashboard settings
  client_username: string | null;
  client_password_set: boolean;
  client_language_id: string | null;
  all_country_access: boolean;
}

export interface Workshop {
  id: string;
  company_id: string;
  country_id: string;
  name: string;
  sessions_available: number;
  price: number | null;
  currency: string | null;
}

export interface CrisisIntervention {
  id: string;
  company_id: string;
  country_id: string;
  name: string;
  sessions_available: number;
  price: number | null;
  currency: string | null;
}

export interface InvoicingData {
  id: string;
  company_id: string;
  country_id: string | null;
  billing_name: string | null;
  billing_address: string | null;
  postal_code: string | null;
  tax_number: string | null;
  po_number: string | null;
  billing_frequency: "monthly" | "quarterly" | "yearly" | null;
  invoice_language: string | null;
  currency: string | null;
  vat_rate: number | null;
  payment_deadline_days: number | null;
  send_invoice_by_post: boolean;
  send_invoice_by_email: boolean;
  invoice_emails: string[];
  upload_invoice_online: boolean;
  upload_url: string | null;
}

export interface InvoiceItem {
  id: string;
  invoicing_data_id: string;
  item_name: string;
  item_type: string;
  amount: number | null;
  volume: number | null;
  is_variable: boolean;
  show_by_item: boolean;
  is_required: boolean;
}

// Form state típusok
export interface CompanyFormData {
  name: string;
  active: boolean;
  country_ids: string[];
  contract_holder_id: string | null;
  org_id: string | null;
  contract_start: string | null;
  contract_end: string | null;
  contract_reminder_email: string | null;
  lead_account_id: string | null;
  countryDifferentiates: CountryDifferentiate;
  countrySettings: CompanyCountrySettings[];
  invoicingData: InvoicingData | null;
}

// Account admin típus (Lead Account választóhoz)
export interface AccountAdmin {
  id: string;
  name: string;
}

// Client Dashboard nyelvek
export const CLIENT_DASHBOARD_LANGUAGES = [
  { id: "3", name: "English" },
  { id: "1", name: "Magyar" },
  { id: "2", name: "Polska" },
  { id: "4", name: "Slovenský" },
  { id: "5", name: "Česky" },
  { id: "6", name: "Українська" },
];

// Számlázási gyakoriságok
export const BILLING_FREQUENCIES = [
  { id: "monthly", name: "Havi" },
  { id: "quarterly", name: "Negyedéves" },
  { id: "yearly", name: "Éves" },
];

// Devizanemek
export const CURRENCIES = [
  { id: "huf", name: "HUF" },
  { id: "eur", name: "EUR" },
  { id: "usd", name: "USD" },
  { id: "czk", name: "CZK" },
  { id: "pln", name: "PLN" },
  { id: "ron", name: "RON" },
  { id: "rsd", name: "RSD" },
  { id: "mdl", name: "MDL" },
  { id: "chf", name: "CHF" },
];

// ÁFA kulcsok
export const VAT_RATES = [
  { id: "0", name: "0%" },
  { id: "5", name: "5%" },
  { id: "18", name: "18%" },
  { id: "27", name: "27%" },
  { id: "ahk", name: "AHK (Áfa hatályán kívül)" },
];

// Számla nyelvek
export const INVOICE_LANGUAGES = [
  { id: "hu", name: "Magyar" },
  { id: "en", name: "English" },
  { id: "de", name: "Deutsch" },
];
