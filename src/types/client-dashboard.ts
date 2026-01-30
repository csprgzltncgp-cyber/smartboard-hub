// Client Dashboard típusok - CD hozzáférés kezelés

/**
 * Riport típus - meghatározza hogyan vannak strukturálva a riportok
 */
export type ReportType = 'single' | 'per_country' | 'per_entity' | 'custom';

/**
 * Hozzáférés típus - meghatározza a felhasználók hozzárendelését
 */
export type AccessType = 'single_user' | 'per_report' | 'with_superuser';

/**
 * CD menüpontok
 */
export const CD_MENU_ITEMS = [
  { id: 'riport', name: 'Riport', description: 'EAP riportok megtekintése' },
  { id: 'workshops', name: 'Workshopok', description: 'Workshop események' },
  { id: 'crisis', name: 'Krízis intervenciók', description: 'Krízis beavatkozások' },
  { id: 'health_map', name: 'Health Map', description: 'Egészségtérkép' },
  { id: 'program_usage', name: 'Programhasználat', description: 'Használati statisztikák' },
  { id: 'customer_satisfaction', name: 'Elégedettség', description: 'Elégedettségi index' },
  { id: 'volume_request', name: 'Adatbeküldés', description: 'Létszámadatok beküldése' },
] as const;

export type CDMenuItem = typeof CD_MENU_ITEMS[number]['id'];

/**
 * Riport konfiguráció - egy cég riport beállításai
 */
export interface ReportConfiguration {
  id: string;
  company_id: string;
  report_type: ReportType;
  configuration: ReportConfigurationDetails;
  access_type: AccessType;
  created_at: string;
  updated_at: string;
}

/**
 * Részletes konfiguráció JSON-ban tárolva
 */
export interface ReportConfigurationDetails {
  // Mely országoknak van külön riportja
  country_ids?: string[];
  // Mely entitásoknak van külön riportja
  entity_ids?: string[];
  // Aggregált nézet: mely riportok vannak összevonva
  aggregated_groups?: AggregatedGroup[];
}

/**
 * Aggregált csoport - több riport összevonva
 */
export interface AggregatedGroup {
  id: string;
  name: string;
  country_ids?: string[];
  entity_ids?: string[];
}

/**
 * CD felhasználó
 */
export interface ClientDashboardUser {
  id: string;
  company_id: string;
  username: string;
  password?: string;
  language_id: string | null;
  is_superuser: boolean;
  can_view_aggregated: boolean;
  created_at: string;
  updated_at: string;
  // Kapcsolódó adatok
  scopes?: ClientDashboardUserScope[];
  permissions?: ClientDashboardUserPermission[];
}

/**
 * CD felhasználó scope - mit láthat az adott user
 */
export interface ClientDashboardUserScope {
  id: string;
  user_id: string;
  country_id: string | null;
  contracted_entity_id: string | null;
  created_at: string;
}

/**
 * CD felhasználó jogosultság - menüpont szintű
 */
export interface ClientDashboardUserPermission {
  id: string;
  user_id: string;
  menu_item: CDMenuItem;
  is_enabled: boolean;
  created_at: string;
}

/**
 * Wizard lépések
 */
export type WizardStep = 'report_structure' | 'user_assignment' | 'permissions';

/**
 * Wizard állapot
 */
export interface CDWizardState {
  currentStep: WizardStep;
  reportType: ReportType;
  accessType: AccessType;
  // Kiválasztott országok/entitások a riportokhoz
  selectedCountryIds: string[];
  selectedEntityIds: string[];
  // Létrehozott felhasználók
  users: Partial<ClientDashboardUser>[];
  // Konfiguráció mentésre készen
  isComplete: boolean;
}

/**
 * Riport slot - egy "hely" amire user-t lehet rendelni
 */
export interface ReportSlot {
  id: string;
  type: 'country' | 'entity' | 'aggregated';
  name: string;
  countryId?: string;
  entityId?: string;
  aggregatedGroupId?: string;
}

/**
 * Alapértelmezett wizard állapot
 */
export const createDefaultWizardState = (): CDWizardState => ({
  currentStep: 'report_structure',
  reportType: 'single',
  accessType: 'single_user',
  selectedCountryIds: [],
  selectedEntityIds: [],
  users: [],
  isComplete: false,
});

/**
 * Alapértelmezett user jogosultságok létrehozása
 */
export const createDefaultPermissions = (userId: string): Omit<ClientDashboardUserPermission, 'id' | 'created_at'>[] => {
  return CD_MENU_ITEMS.map(item => ({
    user_id: userId,
    menu_item: item.id,
    is_enabled: true, // Alapból minden engedélyezve
  }));
};
