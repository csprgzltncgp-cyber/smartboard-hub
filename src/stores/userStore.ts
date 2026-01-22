// Simple in-memory store for users (mock data store)
// In production, this would be replaced with API calls to the Laravel backend

import { User, UserFormData, UserSmartboardPermission } from "@/types/user";

// Mock users data
let users: User[] = [
  {
    id: "1",
    name: "Tompa Anita",
    email: "tompa.anita@cgp.hu",
    username: "tompa.anita",
    phone: "+36 30 123 4567",
    countryIds: ["hu"],
    languageId: "hu",
    active: true,
    createdAt: new Date("2022-01-15"),
    updatedAt: new Date("2024-12-01"),
    smartboardPermissions: [
      {
        smartboardId: "account",
        isDefault: true,
        enabledMenuItems: ["account_companies", "account_company_permissions", "account_inputs", "account_my_clients", "account_reports", "account_ws_ci_o"],
      },
      {
        smartboardId: "operative",
        isDefault: false,
        enabledMenuItems: ["op_experts_list", "op_expert_search", "op_notifications", "op_all_cases"],
      },
    ],
  },
  {
    id: "2",
    name: "Kiss Barbara",
    email: "kiss.barbara@cgp.hu",
    username: "kiss.barbara",
    countryIds: ["hu"],
    languageId: "hu",
    active: true,
    createdAt: new Date("2022-03-20"),
    updatedAt: new Date("2024-11-15"),
    smartboardPermissions: [
      {
        smartboardId: "sales",
        isDefault: true,
        enabledMenuItems: ["sales_smartboard", "sales_crm"],
      },
    ],
  },
  {
    id: "3",
    name: "Janky Péter",
    email: "janky.peter@cgp.hu",
    username: "janky.peter",
    countryIds: ["hu"],
    languageId: "hu",
    active: true,
    createdAt: new Date("2021-06-10"),
    updatedAt: new Date("2024-10-20"),
    smartboardPermissions: [
      {
        smartboardId: "financial",
        isDefault: true,
        enabledMenuItems: ["fin_invoices", "fin_inventory"],
      },
      {
        smartboardId: "account",
        isDefault: false,
        enabledMenuItems: ["account_companies"],
      },
    ],
  },
  {
    id: "4",
    name: "Szabó Mária",
    email: "szabo.maria@cgp.hu",
    username: "szabo.maria",
    countryIds: ["hu"],
    languageId: "hu",
    active: false,
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2024-08-10"),
    smartboardPermissions: [],
  },
  {
    id: "5",
    name: "Admin User",
    email: "admin@cgp.hu",
    username: "admin",
    countryIds: ["hu"],
    languageId: "hu",
    active: true,
    createdAt: new Date("2021-01-01"),
    updatedAt: new Date("2024-12-01"),
    smartboardPermissions: [
      {
        smartboardId: "admin",
        isDefault: true,
        enabledMenuItems: ["admin_all"],
      },
    ],
  },
];

// Get all users
export const getUsers = (): User[] => {
  return [...users];
};

// Get user by ID
export const getUserById = (id: string): User | undefined => {
  return users.find(u => u.id === id);
};

// Create new user
export const createUser = (data: UserFormData): User => {
  const newUser: User = {
    id: String(Date.now()),
    ...data,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    smartboardPermissions: [],
  };
  users.push(newUser);
  return newUser;
};

// Update user basic info
export const updateUser = (id: string, data: Partial<UserFormData>): User | undefined => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  users[index] = {
    ...users[index],
    ...data,
    updatedAt: new Date(),
  };
  return users[index];
};

// Toggle user active status
export const toggleUserActive = (id: string): User | undefined => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  users[index] = {
    ...users[index],
    active: !users[index].active,
    updatedAt: new Date(),
  };
  return users[index];
};

// Update user smartboard permissions
export const updateUserSmartboardPermissions = (
  id: string, 
  permissions: UserSmartboardPermission[]
): User | undefined => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  users[index] = {
    ...users[index],
    smartboardPermissions: permissions,
    updatedAt: new Date(),
  };
  return users[index];
};

// Delete user
export const deleteUser = (id: string): boolean => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  
  users.splice(index, 1);
  return true;
};
