// Szerződött Entitás típusok - Contracted Entities
// Egy cégen belül, egy országon belül több jogi entitással is szerződhetnek

import { ConsultationRow, PriceHistoryEntry } from './company';

/**
 * Szerződött Entitás - egy konkrét jogi személy, akivel a cég szerződést köt
 * Egy országon belül lehet több ilyen entitás is
 */
export interface ContractedEntity {
  id: string;
  company_id: string;
  country_id: string;
  
  // Entitás azonosítás
  name: string; // Szabadon megadható név (pl. "Henkel Hungary Kft.")
  dispatch_name: string | null; // Cég elnevezése kiközvetítéshez
  is_active: boolean; // Az entitás aktív-e
  
  // Ország-specifikus beállítások (korábban CompanyCountrySettings-ben voltak)
  org_id: string | null;
  contract_date: string | null; // Szerződés kezdete
  contract_end_date: string | null; // Szerződés vége
  contract_reminder_email: string | null; // Emlékeztető e-mail
  reporting_data: any; // JSON - reporting adatok
  
  // Szerződés adatai
  contract_holder_type: string | null; // 'cgp' | 'telus' | etc.
  contract_price: number | null;
  price_type: string | null; // 'pepm' | 'package'
  contract_currency: string | null;
  pillars: number | null;
  occasions: number | null;
  industry: string | null;
  consultation_rows: ConsultationRow[];
  price_history: PriceHistoryEntry[];
  
  // Workshop & Krízis adatok
  workshop_data: WorkshopData;
  crisis_data: CrisisData;
  
  // Létszám
  headcount: number | null;
  inactive_headcount: number | null;
  
  // Client Dashboard felhasználók
  client_dashboard_users: EntityClientDashboardUser[];
  
  created_at: string;
  updated_at: string;
}

/**
 * Entitás-specifikus Client Dashboard felhasználó
 */
export interface EntityClientDashboardUser {
  id: string;
  username: string;
  password?: string;
  language_id: string | null;
}

/**
 * Workshop adatok JSON struktúra
 */
export interface WorkshopData {
  sessions_available?: number;
  price?: number;
  currency?: string;
  notes?: string;
}

/**
 * Krízis adatok JSON struktúra
 */
export interface CrisisData {
  sessions_available?: number;
  price?: number;
  currency?: string;
  notes?: string;
}

/**
 * Szerződött Entitás számlázási adatokkal együtt
 */
export interface ContractedEntityWithBilling extends ContractedEntity {
  billing_data: EntityBillingData | null;
  invoice_templates: EntityInvoiceTemplate[];
}

/**
 * Entitás-specifikus számlázási adatok
 */
export interface EntityBillingData {
  id: string;
  contracted_entity_id: string;
  billing_name: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_postal_code: string | null;
  billing_country_id: string | null;
  tax_number: string | null;
  eu_tax_number: string | null;
  payment_deadline: number | null;
  billing_frequency: number | null;
  invoice_language: string | null;
  currency: string | null;
  vat_rate: number | null;
  send_invoice_by_post: boolean;
  send_invoice_by_email: boolean;
  upload_invoice_online: boolean;
  invoice_online_url: string | null;
  invoice_emails: string[];
}

/**
 * Entitás-specifikus számla sablon
 */
export interface EntityInvoiceTemplate {
  id: string;
  contracted_entity_id: string;
  admin_identifier: string | null;
  name: string;
  // ... többi mező a meglévő InvoiceTemplate-ből
}

/**
 * Országonkénti entitás csoport - UI megjelenítéshez
 */
export interface CountryEntities {
  country_id: string;
  country_name: string;
  country_code: string;
  entities: ContractedEntity[];
  has_multiple_entities: boolean;
}

/**
 * Alapértelmezett üres entitás létrehozása
 */
export const createDefaultEntity = (
  companyId: string,
  countryId: string,
  name: string = 'Új entitás'
): Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'> => ({
  company_id: companyId,
  country_id: countryId,
  name,
  dispatch_name: null,
  is_active: true,
  org_id: null,
  contract_date: null,
  contract_end_date: null,
  contract_reminder_email: null,
  reporting_data: {},
  contract_holder_type: null,
  contract_price: null,
  price_type: null,
  contract_currency: null,
  pillars: null,
  occasions: null,
  industry: null,
  consultation_rows: [],
  price_history: [],
  workshop_data: {},
  crisis_data: {},
  headcount: null,
  inactive_headcount: null,
  client_dashboard_users: [],
});
