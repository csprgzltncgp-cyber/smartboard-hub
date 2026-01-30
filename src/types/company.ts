// Cég típusok a Companies modulhoz

// Consultation row structure - each row has a type with associated durations and formats
export interface ConsultationRow {
  id: string;
  type: string | null;
  durations: string[];
  formats: string[];
}

// Price history entry - tracks contract price changes over time
export interface PriceHistoryEntry {
  id: string;
  effective_date: string; // YYYY-MM-DD format
  price: number;
  price_type: string | null; // 'pepm' | 'package'
  currency: string | null;
  notes: string | null;
}

export interface Company {
  id: string;
  name: string;
  dispatch_name: string | null; // Cég elnevezése kiközvetítéshez
  group_name: string | null; // Cégcsoport név - a Cégek menüben ezzel jelenik meg (ha országonként különböző)
  active: boolean;
  country_ids: string[];
  contract_holder_id: string | null;
  org_id: string | null;
  contract_start: string | null;
  contract_end: string | null;
  contract_reminder_email: string | null;
  lead_account_id: string | null;
  is_connected: boolean;
  connected_company_id: string | null; // Kapcsolt cég
  // New contract data fields
  contract_file_url: string | null; // PDF fájl URL
  contract_price: number | null; // Szerződéses ár
  contract_price_type: string | null; // Ár típusa (PEPM / Csomagár)
  contract_currency: string | null; // Szerződéses ár devizanem
  pillar_count: number | null; // Pillér szám
  session_count: number | null; // Alkalom szám
  consultation_rows: ConsultationRow[]; // Tanácsadás sorok (típus + időtartam + forma)
  industry: string | null; // Iparág
  price_history: PriceHistoryEntry[]; // Árváltozás előzmények
  // Newcomer status from CRM
  isNewcomer?: boolean; // CRM-ből érkező "Új érkező" státusz
  onboardingData?: any; // CRM-ből átvett onboarding adatok
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
  basic_data: boolean; // Ha true, minden alapadat (szerződés, ár, stb.) országonként különböző
  has_multiple_entities: boolean; // Ha true, egy vagy több országban több szerződött entitás van
  entity_country_ids: string[]; // Mely országokban van több entitás
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
  // When this country was added to the company
  added_at: string | null;
  // Country-specific basic data (when basic_data differentiate is true)
  name: string | null; // Cégnév az adott országban
  dispatch_name: string | null; // Cég elnevezése kiközvetítéshez
  is_active: boolean; // Aktív státusz az adott országban
  contract_file_url: string | null;
  contract_price: number | null;
  contract_price_type: string | null;
  contract_currency: string | null;
  pillar_count: number | null;
  session_count: number | null;
  consultation_rows: ConsultationRow[];
  industry: string | null;
  price_history: PriceHistoryEntry[];
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

// Billing Data - Számlázási adatok (DirectInvoiceData alapján)
export interface BillingData {
  id: string;
  company_id: string;
  country_id: string | null;
  contracted_entity_id?: string | null; // Entitás-specifikus számlázáshoz
  admin_identifier: string | null;
  name: string | null;
  is_name_shown: boolean;
  country: string | null; // Célország
  postal_code: string | null;
  city: string | null;
  street: string | null;
  house_number: string | null;
  is_address_shown: boolean;
  po_number: string | null;
  is_po_number_shown: boolean;
  is_po_number_changing: boolean;
  is_po_number_required: boolean;
  tax_number: string | null;
  community_tax_number: string | null;
  is_tax_number_shown: boolean;
  group_id: string | null;
  payment_deadline: number | null;
  is_payment_deadline_shown: boolean;
  invoicing_inactive: boolean;
  invoicing_inactive_from: string | null;
  invoicing_inactive_to: string | null;
}

// Invoicing Data - Számlázás beállítások (DirectBillingData alapján)
export interface InvoicingData {
  id: string;
  company_id: string;
  country_id: string | null;
  contracted_entity_id?: string | null; // Entitás-specifikus számlázáshoz
  billing_frequency: "monthly" | "quarterly" | "semi-annually" | "yearly" | null;
  billing_in_advance: boolean;
  invoice_language: string | null;
  currency: string | null;
  vat_rate: number | null;
  inside_eu: boolean;
  outside_eu: boolean;
  send_invoice_by_post: boolean;
  send_completion_certificate_by_post: boolean;
  post_code: string | null;
  city: string | null;
  street: string | null;
  house_number: string | null;
  send_invoice_by_email: boolean;
  send_completion_certificate_by_email: boolean;
  custom_email_subject: string | null;
  invoice_emails: string[];
  upload_invoice_online: boolean;
  invoice_online_url: string | null;
  upload_completion_certificate_online: boolean;
  completion_certificate_online_url: string | null;
  contact_holder_name: string | null;
  show_contact_holder_name_on_post: boolean;
}

// Invoice Item - Számlára kerülő tétel (Laravel referencia alapján)
export interface InvoiceItem {
  id: string;
  invoicing_data_id: string;
  item_name: string;
  item_type: InvoiceItemType;
  // Szorzás/Összeg mezők
  amount_name: string | null;
  amount_value: string | null;
  volume_name: string | null;
  volume_value: string | null;
  is_amount_changing: boolean;
  is_volume_changing: boolean;
  // Beállítások
  show_by_item: boolean;
  show_activity_id: boolean;
  with_timestamp: boolean;
  // Megjegyzés
  comment: string | null;
  // Adatbekérés (ha változó)
  data_request_email: string | null;
  data_request_salutation: string | null;
}

export type InvoiceItemType =
  | "multiplication"
  | "workshop"
  | "crisis"
  | "other-activity"
  | "amount"
  | "optum-psychology-consultations"
  | "optum-law-consultations"
  | "optum-finance-consultations"
  | "compsych-psychology-consultations"
  | "compsych-law-consultations"
  | "compsych-finance-consultations"
  | "compsych-well-being-coaching-consultations-30"
  | "compsych-well-being-coaching-consultations-15";

// Invoice Comment - Számlára kerülő megjegyzés
export interface InvoiceComment {
  id: string;
  invoicing_data_id: string;
  comment: string;
}

// Invoice Template - Számla sablon (DirectInvoiceData megfelelője)
// Egy cégnek több sablonja lehet, mindegyik külön tételekkel és megjegyzésekkel
export interface InvoiceTemplate {
  id: string;
  company_id: string;
  country_id: string | null;
  admin_identifier: string | null;
  name: string;
  is_name_shown: boolean;
  country: string | null;
  postal_code: string | null;
  city: string | null;
  street: string | null;
  house_number: string | null;
  is_address_shown: boolean;
  po_number: string | null;
  is_po_number_shown: boolean;
  is_po_number_changing: boolean;
  is_po_number_required: boolean;
  tax_number: string | null;
  community_tax_number: string | null;
  is_tax_number_shown: boolean;
  group_id: string | null;
  payment_deadline: number | null;
  is_payment_deadline_shown: boolean;
  invoicing_inactive: boolean;
  invoicing_inactive_from: string | null;
  invoicing_inactive_to: string | null;
  // Kapcsolódó tételek és megjegyzések
  items: InvoiceItem[];
  comments: InvoiceComment[];
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
  connected_company_id: string | null;
  countryDifferentiates: CountryDifferentiate;
  countrySettings: CompanyCountrySettings[];
  billingData: BillingData | null;
  invoicingData: InvoicingData | null;
  invoiceItems: InvoiceItem[];
  invoiceComments: InvoiceComment[];
  // Új: Számla sablonok (többsablonos számlázás)
  invoiceTemplates: InvoiceTemplate[];
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
  { id: "semi-annually", name: "Féléves" },
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

// Iparágak
export const INDUSTRIES = [
  { id: "it", name: "IT / Technológia" },
  { id: "finance", name: "Pénzügy / Bank" },
  { id: "healthcare", name: "Egészségügy" },
  { id: "manufacturing", name: "Gyártás / Ipar" },
  { id: "retail", name: "Kereskedelem" },
  { id: "services", name: "Szolgáltatások" },
  { id: "education", name: "Oktatás" },
  { id: "government", name: "Közigazgatás" },
  { id: "telecom", name: "Telekommunikáció" },
  { id: "energy", name: "Energia" },
  { id: "transport", name: "Szállítás / Logisztika" },
  { id: "pharma", name: "Gyógyszeripar" },
  { id: "other", name: "Egyéb" },
];

// ÁFA kulcsok
export const VAT_RATES = [
  { id: "0", name: "0%" },
  { id: "5", name: "5%" },
  { id: "18", name: "18%" },
  { id: "27", name: "27%" },
];

// Számla nyelvek
export const INVOICE_LANGUAGES = [
  { id: "hu", name: "Magyar" },
  { id: "en", name: "English" },
  { id: "de", name: "Deutsch" },
];

// Invoice item típusok
export const INVOICE_ITEM_TYPES = [
  { id: "multiplication", name: "Szorzás" },
  { id: "workshop", name: "Workshop" },
  { id: "crisis", name: "Krízisintervenció" },
  { id: "other-activity", name: "Other activity" },
  { id: "amount", name: "Összeg" },
  { id: "optum-psychology-consultations", name: "Optum lezárt pszichológiai tanácsadások száma" },
  { id: "optum-law-consultations", name: "Optum lezárt jogi tanácsadások száma" },
  { id: "optum-finance-consultations", name: "Optum lezárt pénzügyi tanácsadások száma" },
  { id: "compsych-psychology-consultations", name: "Compsych pszichológiai tanácsadások száma" },
  { id: "compsych-law-consultations", name: "Compsych jogi tanácsadások száma" },
  { id: "compsych-finance-consultations", name: "Compsych pénzügyi tanácsadások száma" },
  { id: "compsych-well-being-coaching-consultations-30", name: "Compsych well being coaching tanácsadások száma (30 perces)" },
  { id: "compsych-well-being-coaching-consultations-15", name: "Compsych well being coaching tanácsadások száma (15 perces)" },
];
