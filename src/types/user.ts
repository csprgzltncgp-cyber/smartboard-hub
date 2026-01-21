// User types for the SmartBoard permission system

export interface UserSmartboardPermission {
  smartboardId: string;
  isDefault: boolean; // Which smartboard opens on login
  enabledMenuItems: string[]; // List of enabled menu item IDs
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phone?: string;
  countryId?: string;
  languageId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  smartboardPermissions: UserSmartboardPermission[];
}

// Form data for creating/editing users
export interface UserFormData {
  name: string;
  email: string;
  username: string;
  phone?: string;
  countryId?: string;
  languageId?: string;
}

// Mock countries for the form
export const COUNTRIES = [
  { id: "hu", name: "Magyarország" },
  { id: "us", name: "USA" },
  { id: "uk", name: "United Kingdom" },
  { id: "de", name: "Németország" },
  { id: "at", name: "Ausztria" },
  { id: "ro", name: "Románia" },
  { id: "sk", name: "Szlovákia" },
  { id: "cz", name: "Csehország" },
  { id: "pl", name: "Lengyelország" },
];

// Mock languages for the form
export const LANGUAGES = [
  { id: "hu", name: "Magyar" },
  { id: "en", name: "English" },
  { id: "de", name: "Deutsch" },
];
