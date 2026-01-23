import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserFormData, UserSmartboardPermission } from '@/types/user';
import { Json } from '@/integrations/supabase/types';

// Import avatar images for defaults
import avatarBarbara from "@/assets/avatars/avatar-barbara.jpg";
import avatarAnita from "@/assets/avatars/avatar-anita.jpg";
import avatarPeter from "@/assets/avatars/avatar-peter.jpg";
import avatarMaria from "@/assets/avatars/avatar-maria.jpg";
import avatarAdmin from "@/assets/avatars/avatar-admin.jpg";

// Default mock users for seeding
const defaultUsers: User[] = [
  {
    id: "1",
    name: "Tompa Anita",
    email: "tompa.anita@cgp.hu",
    username: "tompa.anita",
    phone: "+36 30 123 4567",
    countryIds: ["hu"],
    languageId: "hu",
    avatarUrl: avatarAnita,
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
    avatarUrl: avatarBarbara,
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
    avatarUrl: avatarPeter,
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
    avatarUrl: avatarMaria,
    active: false,
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2024-08-10"),
    smartboardPermissions: [
      {
        smartboardId: "operative",
        isDefault: true,
        enabledMenuItems: ["op_experts_list", "op_expert_search", "op_all_cases"],
      },
    ],
  },
  {
    id: "5",
    name: "Admin User",
    email: "admin@cgp.hu",
    username: "admin",
    countryIds: ["hu"],
    languageId: "hu",
    avatarUrl: avatarAdmin,
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

// Map database row to User type
const mapDbRowToUser = (row: any): User => {
  const perms = row.smartboard_permissions as any;
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    username: row.username,
    phone: row.phone || '',
    countryIds: perms?.countryIds || ['hu'],
    languageId: row.language || 'hu',
    avatarUrl: row.avatar_url || '',
    active: perms?.active !== false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    smartboardPermissions: perms?.permissions || [],
  };
};

// Map User to database row format
const mapUserToDbRow = (user: User) => ({
  id: user.id,
  username: user.username,
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  language: user.languageId || 'hu',
  avatar_url: user.avatarUrl || null,
  smartboard_permissions: JSON.parse(JSON.stringify({
    permissions: user.smartboardPermissions,
    countryIds: user.countryIds,
    active: user.active,
  })) as Json,
});

// Migrate localStorage users to database
const migrateLocalStorageUsers = async () => {
  const STORAGE_KEY = 'users-store-v1';
  const migrationKey = 'users-migrated-to-db';
  
  if (localStorage.getItem(migrationKey)) {
    return;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const users = JSON.parse(stored);
      
      if (users.length > 0) {
        console.log('[Users] Migrating', users.length, 'users from localStorage to database...');
        
        const { data: existing } = await supabase.from('app_users').select('id').limit(1);
        
        if (!existing || existing.length === 0) {
          for (const user of users) {
            const mappedUser: User = {
              ...user,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
            };
            const dbRow = mapUserToDbRow(mappedUser);
            await supabase.from('app_users').upsert(dbRow);
          }
          console.log('[Users] Migration complete!');
        }
      }
    }
    
    localStorage.setItem(migrationKey, 'true');
  } catch (e) {
    console.error('[Users] Migration failed:', e);
  }
};

// Seed initial users if database is empty
const seedInitialUsers = async () => {
  const seedKey = 'users-seeded';
  
  if (localStorage.getItem(seedKey)) {
    return;
  }
  
  try {
    const { data: existing } = await supabase.from('app_users').select('id').limit(1);
    
    if (!existing || existing.length === 0) {
      console.log('[Users] Seeding initial users...');
      
      for (const user of defaultUsers) {
        const dbRow = mapUserToDbRow(user);
        await supabase.from('app_users').upsert(dbRow);
      }
      
      console.log('[Users] Seeding complete!');
    }
    
    localStorage.setItem(seedKey, 'true');
  } catch (e) {
    console.error('[Users] Seeding failed:', e);
  }
};

export const useAppUsersDb = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('app_users')
        .select('*')
        .order('name');
      
      if (fetchError) throw fetchError;
      
      const mappedUsers = (data || []).map(mapDbRowToUser);
      setUsers(mappedUsers);
      setError(null);
    } catch (e: any) {
      console.error('[Users] Failed to fetch users:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await migrateLocalStorageUsers();
      await seedInitialUsers();
      await fetchUsers();
    };
    init();
  }, [fetchUsers]);

  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(u => u.id === id);
  }, [users]);

  const getUserByUsername = useCallback((username: string): User | undefined => {
    return users.find(u => u.username === username);
  }, [users]);

  const createUser = useCallback(async (data: UserFormData): Promise<User> => {
    const newUser: User = {
      id: crypto.randomUUID(),
      ...data,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      smartboardPermissions: [],
    };
    
    try {
      const dbRow = mapUserToDbRow(newUser);
      const { error: insertError } = await supabase.from('app_users').insert(dbRow);
      
      if (insertError) throw insertError;
      
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (e: any) {
      console.error('[Users] Failed to create user:', e);
      throw e;
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: Partial<UserFormData>): Promise<User | undefined> => {
    const existing = users.find(u => u.id === id);
    if (!existing) return undefined;
    
    const updatedUser: User = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    
    try {
      const dbRow = mapUserToDbRow(updatedUser);
      const { error: updateError } = await supabase
        .from('app_users')
        .update(dbRow)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (e: any) {
      console.error('[Users] Failed to update user:', e);
      throw e;
    }
  }, [users]);

  const updateUserSmartboardPermissions = useCallback(async (
    id: string, 
    permissions: UserSmartboardPermission[]
  ): Promise<User | undefined> => {
    const existing = users.find(u => u.id === id);
    if (!existing) return undefined;
    
    const updatedUser: User = {
      ...existing,
      smartboardPermissions: permissions,
      updatedAt: new Date(),
    };
    
    try {
      const dbRow = mapUserToDbRow(updatedUser);
      const { error: updateError } = await supabase
        .from('app_users')
        .update(dbRow)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (e: any) {
      console.error('[Users] Failed to update permissions:', e);
      throw e;
    }
  }, [users]);

  const toggleUserActive = useCallback(async (id: string): Promise<User | undefined> => {
    const existing = users.find(u => u.id === id);
    if (!existing) return undefined;
    
    const updatedUser: User = {
      ...existing,
      active: !existing.active,
      updatedAt: new Date(),
    };
    
    try {
      const dbRow = mapUserToDbRow(updatedUser);
      const { error: updateError } = await supabase
        .from('app_users')
        .update(dbRow)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (e: any) {
      console.error('[Users] Failed to toggle active:', e);
      throw e;
    }
  }, [users]);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('app_users')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (e: any) {
      console.error('[Users] Failed to delete user:', e);
      return false;
    }
  }, []);

  return {
    users,
    loading,
    error,
    getUserById,
    getUserByUsername,
    createUser,
    updateUser,
    updateUserSmartboardPermissions,
    toggleUserActive,
    deleteUser,
    refetch: fetchUsers,
  };
};

// Sync functions for backward compatibility with existing stores
// These will be used during the transition period
export const getUsers = (): User[] => {
  // Fallback to localStorage during initial load
  const STORAGE_KEY = 'users-store-v1';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const users = JSON.parse(stored);
      return users.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      }));
    }
  } catch (e) {
    console.error('[Users] Failed to load from localStorage:', e);
  }
  return defaultUsers;
};
