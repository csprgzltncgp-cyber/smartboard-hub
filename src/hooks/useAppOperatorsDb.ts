import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserFormData, UserSmartboardPermission } from '@/types/user';
import { getSmartboardById } from '@/config/smartboards';
import { Json } from '@/integrations/supabase/types';

// Get default search smartboard permissions
const getSearchPermissions = (): UserSmartboardPermission => {
  const searchSmartboard = getSmartboardById("search");
  return {
    smartboardId: "search",
    isDefault: false,
    enabledMenuItems: searchSmartboard?.menuItems.map(m => m.id) || [],
  };
};

// Default operators for seeding
const defaultOperators: User[] = [
  {
    id: "op1",
    name: "Kovács Anna",
    email: "kovacs.anna@cgp.hu",
    username: "kovacs.anna",
    phone: "+36 30 111 2222",
    countryIds: ["hu"],
    languageId: "hu",
    active: true,
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2024-12-01"),
    smartboardPermissions: [
      {
        smartboardId: "operator",
        isDefault: true,
        enabledMenuItems: ["opr_cases_in_progress", "opr_experts", "opr_chat", "opr_dispatch", "opr_eap_messages", "opr_qa"],
      },
      getSearchPermissions(),
    ],
  },
  {
    id: "op2",
    name: "Nagy Eszter",
    email: "nagy.eszter@cgp.hu",
    username: "nagy.eszter",
    phone: "+36 30 333 4444",
    countryIds: ["hu"],
    languageId: "hu",
    active: true,
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2024-11-20"),
    smartboardPermissions: [
      {
        smartboardId: "operator",
        isDefault: true,
        enabledMenuItems: ["opr_cases_in_progress", "opr_experts", "opr_chat"],
      },
      getSearchPermissions(),
    ],
  },
  {
    id: "op3",
    name: "Tóth Bence",
    email: "toth.bence@cgp.hu",
    username: "toth.bence",
    countryIds: ["hu"],
    languageId: "en",
    active: false,
    createdAt: new Date("2022-08-01"),
    updatedAt: new Date("2024-06-10"),
    smartboardPermissions: [
      {
        smartboardId: "operator",
        isDefault: true,
        enabledMenuItems: ["opr_cases_in_progress"],
      },
      getSearchPermissions(),
    ],
  },
];

// Map database row to User type
const mapDbRowToOperator = (row: any): User => {
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
const mapOperatorToDbRow = (user: User) => ({
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

// Migrate localStorage operators to database
const migrateLocalStorageOperators = async () => {
  const STORAGE_KEY = 'operators-store-v1';
  const migrationKey = 'operators-migrated-to-db';
  
  if (localStorage.getItem(migrationKey)) {
    return;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const operators = JSON.parse(stored);
      
      if (operators.length > 0) {
        console.log('[Operators] Migrating', operators.length, 'operators from localStorage to database...');
        
        const { data: existing } = await supabase.from('app_operators').select('id').limit(1);
        
        if (!existing || existing.length === 0) {
          for (const op of operators) {
            const mappedOp: User = {
              ...op,
              createdAt: new Date(op.createdAt),
              updatedAt: new Date(op.updatedAt),
            };
            const dbRow = mapOperatorToDbRow(mappedOp);
            await supabase.from('app_operators').upsert(dbRow);
          }
          console.log('[Operators] Migration complete!');
        }
      }
    }
    
    localStorage.setItem(migrationKey, 'true');
  } catch (e) {
    console.error('[Operators] Migration failed:', e);
  }
};

// Seed initial operators if database is empty
const seedInitialOperators = async () => {
  const seedKey = 'operators-seeded';
  
  if (localStorage.getItem(seedKey)) {
    return;
  }
  
  try {
    const { data: existing } = await supabase.from('app_operators').select('id').limit(1);
    
    if (!existing || existing.length === 0) {
      console.log('[Operators] Seeding initial operators...');
      
      for (const op of defaultOperators) {
        const dbRow = mapOperatorToDbRow(op);
        await supabase.from('app_operators').upsert(dbRow);
      }
      
      console.log('[Operators] Seeding complete!');
    }
    
    localStorage.setItem(seedKey, 'true');
  } catch (e) {
    console.error('[Operators] Seeding failed:', e);
  }
};

export const useAppOperatorsDb = () => {
  const [operators, setOperators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOperators = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('app_operators')
        .select('*')
        .order('name');
      
      if (fetchError) throw fetchError;
      
      const mappedOperators = (data || []).map(mapDbRowToOperator);
      setOperators(mappedOperators);
      setError(null);
    } catch (e: any) {
      console.error('[Operators] Failed to fetch operators:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await migrateLocalStorageOperators();
      await seedInitialOperators();
      await fetchOperators();
    };
    init();
  }, [fetchOperators]);

  const getOperatorById = useCallback((id: string): User | undefined => {
    return operators.find(u => u.id === id);
  }, [operators]);

  const getOperatorByUsername = useCallback((username: string): User | undefined => {
    return operators.find(u => u.username === username);
  }, [operators]);

  const createOperator = useCallback(async (data: UserFormData): Promise<User> => {
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
          enabledMenuItems: ["opr_dispatch", "opr_chat", "opr_eap_messages", "opr_cases_in_progress", "opr_experts_list", "opr_qa"],
        },
        getSearchPermissions(),
      ],
    };
    
    try {
      const dbRow = mapOperatorToDbRow(newOperator);
      const { error: insertError } = await supabase.from('app_operators').insert(dbRow);
      
      if (insertError) throw insertError;
      
      setOperators(prev => [...prev, newOperator]);
      return newOperator;
    } catch (e: any) {
      console.error('[Operators] Failed to create operator:', e);
      throw e;
    }
  }, []);

  const updateOperator = useCallback(async (id: string, data: Partial<UserFormData>): Promise<User | undefined> => {
    const existing = operators.find(u => u.id === id);
    if (!existing) return undefined;
    
    const updatedOperator: User = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    
    try {
      const dbRow = mapOperatorToDbRow(updatedOperator);
      const { error: updateError } = await supabase
        .from('app_operators')
        .update(dbRow)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setOperators(prev => prev.map(u => u.id === id ? updatedOperator : u));
      return updatedOperator;
    } catch (e: any) {
      console.error('[Operators] Failed to update operator:', e);
      throw e;
    }
  }, [operators]);

  const updateOperatorSmartboardPermissions = useCallback(async (
    id: string, 
    permissions: UserSmartboardPermission[]
  ): Promise<User | undefined> => {
    const existing = operators.find(u => u.id === id);
    if (!existing) return undefined;
    
    // Filter to only allow operator and search smartboards
    const filteredPermissions = permissions.filter(
      p => p.smartboardId === "operator" || p.smartboardId === "search"
    );
    
    const updatedOperator: User = {
      ...existing,
      smartboardPermissions: filteredPermissions,
      updatedAt: new Date(),
    };
    
    try {
      const dbRow = mapOperatorToDbRow(updatedOperator);
      const { error: updateError } = await supabase
        .from('app_operators')
        .update(dbRow)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setOperators(prev => prev.map(u => u.id === id ? updatedOperator : u));
      return updatedOperator;
    } catch (e: any) {
      console.error('[Operators] Failed to update permissions:', e);
      throw e;
    }
  }, [operators]);

  const toggleOperatorActive = useCallback(async (id: string): Promise<User | undefined> => {
    const existing = operators.find(u => u.id === id);
    if (!existing) return undefined;
    
    const updatedOperator: User = {
      ...existing,
      active: !existing.active,
      updatedAt: new Date(),
    };
    
    try {
      const dbRow = mapOperatorToDbRow(updatedOperator);
      const { error: updateError } = await supabase
        .from('app_operators')
        .update(dbRow)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setOperators(prev => prev.map(u => u.id === id ? updatedOperator : u));
      return updatedOperator;
    } catch (e: any) {
      console.error('[Operators] Failed to toggle active:', e);
      throw e;
    }
  }, [operators]);

  const deleteOperator = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('app_operators')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      setOperators(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (e: any) {
      console.error('[Operators] Failed to delete operator:', e);
      return false;
    }
  }, []);

  return {
    operators,
    loading,
    error,
    getOperatorById,
    getOperatorByUsername,
    createOperator,
    updateOperator,
    updateOperatorSmartboardPermissions,
    toggleOperatorActive,
    deleteOperator,
    refetch: fetchOperators,
  };
};

// Sync functions for backward compatibility
export const getOperators = (): User[] => {
  const STORAGE_KEY = 'operators-store-v1';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const operators = JSON.parse(stored);
      return operators.map((o: any) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
      }));
    }
  } catch (e) {
    console.error('[Operators] Failed to load from localStorage:', e);
  }
  return defaultOperators;
};
