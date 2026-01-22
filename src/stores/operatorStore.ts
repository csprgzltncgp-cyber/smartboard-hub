// Simple in-memory store for operators (mock data store)
// In production, this would be replaced with API calls to the Laravel backend

import { User, UserFormData, UserSmartboardPermission } from "@/types/user";

// Mock operators data - operators only have "operator" interface
let operators: User[] = [
  {
    id: "op1",
    name: "Kovács Anna",
    email: "kovacs.anna@cgp.hu",
    username: "kovacs.anna",
    phone: "+36 30 111 2222",
    countryId: "hu",
    languageId: "hu",
    active: true,
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2024-12-01"),
    smartboardPermissions: [
      {
        smartboardId: "operator",
        isDefault: true,
        enabledMenuItems: ["opr_dispatch", "opr_chat", "opr_eap_messages", "opr_qa"],
      },
    ],
  },
  {
    id: "op2",
    name: "Nagy Eszter",
    email: "nagy.eszter@cgp.hu",
    username: "nagy.eszter",
    phone: "+36 30 333 4444",
    countryId: "hu",
    languageId: "hu",
    active: true,
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2024-11-20"),
    smartboardPermissions: [
      {
        smartboardId: "operator",
        isDefault: true,
        enabledMenuItems: ["opr_dispatch", "opr_chat"],
      },
    ],
  },
  {
    id: "op3",
    name: "Tóth Bence",
    email: "toth.bence@cgp.hu",
    username: "toth.bence",
    countryId: "hu",
    languageId: "en",
    active: false,
    createdAt: new Date("2022-08-01"),
    updatedAt: new Date("2024-06-10"),
    smartboardPermissions: [
      {
        smartboardId: "operator",
        isDefault: true,
        enabledMenuItems: ["opr_dispatch"],
      },
    ],
  },
];

// Get all operators
export const getOperators = (): User[] => {
  return [...operators];
};

// Get operator by ID
export const getOperatorById = (id: string): User | undefined => {
  return operators.find(u => u.id === id);
};

// Create new operator - automatically adds operator smartboard
export const createOperator = (data: UserFormData): User => {
  const newOperator: User = {
    id: `op${Date.now()}`,
    ...data,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    smartboardPermissions: [
      {
        smartboardId: "operator",
        isDefault: true,
        enabledMenuItems: ["opr_dispatch", "opr_chat", "opr_eap_messages", "opr_qa"],
      },
    ],
  };
  operators.push(newOperator);
  return newOperator;
};

// Update operator basic info
export const updateOperator = (id: string, data: Partial<UserFormData>): User | undefined => {
  const index = operators.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  operators[index] = {
    ...operators[index],
    ...data,
    updatedAt: new Date(),
  };
  return operators[index];
};

// Toggle operator active status
export const toggleOperatorActive = (id: string): User | undefined => {
  const index = operators.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  operators[index] = {
    ...operators[index],
    active: !operators[index].active,
    updatedAt: new Date(),
  };
  return operators[index];
};

// Update operator smartboard permissions (only operator interface)
export const updateOperatorSmartboardPermissions = (
  id: string, 
  permissions: UserSmartboardPermission[]
): User | undefined => {
  const index = operators.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  // Filter to only allow operator smartboard
  const filteredPermissions = permissions.filter(p => p.smartboardId === "operator");
  
  operators[index] = {
    ...operators[index],
    smartboardPermissions: filteredPermissions,
    updatedAt: new Date(),
  };
  return operators[index];
};

// Delete operator
export const deleteOperator = (id: string): boolean => {
  const index = operators.findIndex(u => u.id === id);
  if (index === -1) return false;
  
  operators.splice(index, 1);
  return true;
};
