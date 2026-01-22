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
  countryIds?: string[]; // Multiple countries support
  languageId?: string;
  avatarUrl?: string; // Avatar image URL
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
  countryIds?: string[]; // Multiple countries support
  languageId?: string;
  avatarUrl?: string; // Avatar image URL
}

// Mock countries for the form (based on Laravel database)
export const COUNTRIES = [
  { id: "hu", name: "Magyarország" },
  { id: "cz", name: "Csehország" },
  { id: "sk", name: "Szlovákia" },
  { id: "ro", name: "Románia" },
  { id: "rs", name: "Szerbia" },
  { id: "md", name: "Moldova" },
  { id: "al", name: "Albánia" },
  { id: "xk", name: "Koszovó" },
  { id: "mk", name: "Észak-Macedónia" },
  { id: "ua", name: "Ukrajna" },
];

// Mock languages for the form
export const LANGUAGES = [
  { id: "hu", name: "Magyar" },
  { id: "en", name: "English" },
  { id: "de", name: "Deutsch" },
];
