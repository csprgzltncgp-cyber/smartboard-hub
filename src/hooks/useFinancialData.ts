import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  MonthlyExpense, 
  ManualEntry, 
  ContractHolderRevenue,
  MonthlyFinancialSummary,
  FinancialFilters,
  ContractHolderType,
  ExpenseCategory,
  EntryType,
} from "@/types/financial";
import { toast } from "sonner";

// ============ MONTHLY EXPENSES ============

export const useMonthlyExpenses = (filters: FinancialFilters) => {
  return useQuery({
    queryKey: ['monthly-expenses', filters],
    queryFn: async () => {
      let query = supabase
        .from('monthly_expenses')
        .select('*')
        .eq('year', filters.year)
        .order('month', { ascending: true });

      if (filters.month) {
        query = query.eq('month', filters.month);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MonthlyExpense[];
    },
  });
};

export const useUpsertMonthlyExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: Omit<MonthlyExpense, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('monthly_expenses')
        .upsert(expense, { onConflict: 'year,month,category,custom_category_name' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Költség mentve');
    },
    onError: (error) => {
      toast.error('Hiba történt a mentéskor');
      console.error(error);
    },
  });
};

export const useDeleteMonthlyExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('monthly_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Költség törölve');
    },
    onError: (error) => {
      toast.error('Hiba történt a törléskor');
      console.error(error);
    },
  });
};

// ============ MANUAL ENTRIES ============

export const useManualEntries = (filters: FinancialFilters) => {
  return useQuery({
    queryKey: ['manual-entries', filters],
    queryFn: async () => {
      let query = supabase
        .from('manual_entries')
        .select('*')
        .eq('year', filters.year)
        .order('month', { ascending: true });

      if (filters.month) {
        query = query.eq('month', filters.month);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ManualEntry[];
    },
  });
};

export const useCreateManualEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<ManualEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('manual_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-entries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Tétel hozzáadva');
    },
    onError: (error) => {
      toast.error('Hiba történt');
      console.error(error);
    },
  });
};

export const useUpdateManualEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ManualEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('manual_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-entries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Tétel frissítve');
    },
    onError: (error) => {
      toast.error('Hiba történt');
      console.error(error);
    },
  });
};

export const useDeleteManualEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('manual_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-entries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Tétel törölve');
    },
    onError: (error) => {
      toast.error('Hiba történt');
      console.error(error);
    },
  });
};

// ============ CONTRACT HOLDER REVENUE ============

export const useContractHolderRevenue = (filters: FinancialFilters) => {
  return useQuery({
    queryKey: ['contract-holder-revenue', filters],
    queryFn: async () => {
      let query = supabase
        .from('contract_holder_revenue')
        .select('*, countries(name, code)')
        .eq('year', filters.year)
        .order('month', { ascending: true });

      if (filters.month) {
        query = query.eq('month', filters.month);
      }

      if (filters.country && filters.country !== 'all') {
        query = query.eq('country_id', filters.country);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (ContractHolderRevenue & { countries?: { name: string; code: string } })[];
    },
  });
};

export const useUpsertContractHolderRevenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (revenue: Omit<ContractHolderRevenue, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('contract_holder_revenue')
        .upsert(revenue, { onConflict: 'year,month,contract_holder,country_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-holder-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Bevétel mentve');
    },
    onError: (error) => {
      toast.error('Hiba történt');
      console.error(error);
    },
  });
};

// ============ FINANCIAL SUMMARY ============

export const useFinancialSummary = (filters: FinancialFilters) => {
  return useQuery({
    queryKey: ['financial-summary', filters],
    queryFn: async () => {
      // Build queries with country filter support
      let revenueQuery = supabase
        .from('contract_holder_revenue')
        .select('*')
        .eq('year', filters.year);
      
      let entriesQuery = supabase
        .from('manual_entries')
        .select('*')
        .eq('year', filters.year);

      // Apply country filter if specified
      if (filters.country && filters.country !== 'all') {
        revenueQuery = revenueQuery.eq('country_id', filters.country);
        entriesQuery = entriesQuery.eq('country_id', filters.country);
      }

      // Fetch all data in parallel
      const [expensesRes, entriesRes, revenueRes] = await Promise.all([
        supabase
          .from('monthly_expenses')
          .select('*')
          .eq('year', filters.year),
        entriesQuery,
        revenueQuery,
      ]);

      if (expensesRes.error) throw expensesRes.error;
      if (entriesRes.error) throw entriesRes.error;
      if (revenueRes.error) throw revenueRes.error;

      const expenses = expensesRes.data as MonthlyExpense[];
      const entries = entriesRes.data as ManualEntry[];
      const revenues = revenueRes.data as ContractHolderRevenue[];

      // Group by month
      const summaries: MonthlyFinancialSummary[] = [];
      
      for (let month = 1; month <= 12; month++) {
        const monthExpenses = expenses.filter(e => e.month === month);
        const monthEntries = entries.filter(e => e.month === month);
        const monthRevenues = revenues.filter(r => r.month === month);

        // Calculate totals
        const totalExpenses = 
          monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0) +
          monthEntries.filter(e => e.entry_type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);

        const revenueFromContractHolders = monthRevenues.reduce((sum, r) => sum + Number(r.revenue), 0);
        const manualIncome = monthEntries.filter(e => e.entry_type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
        const consultationCosts = monthRevenues.reduce((sum, r) => sum + Number(r.consultation_cost), 0);
        
        const totalRevenue = revenueFromContractHolders + manualIncome;
        const totalCosts = totalExpenses + consultationCosts;
        const profit = totalRevenue - totalCosts;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        // Revenue by contract holder
        const revenueByContractHolder: Record<ContractHolderType, number> = {
          cgp_europe: 0,
          telus: 0,
          telus_wpo: 0,
          compsych: 0,
        };

        const consultationsByContractHolder: Record<ContractHolderType, number> = {
          cgp_europe: 0,
          telus: 0,
          telus_wpo: 0,
          compsych: 0,
        };

        const consultationCostsByContractHolder: Record<ContractHolderType, number> = {
          cgp_europe: 0,
          telus: 0,
          telus_wpo: 0,
          compsych: 0,
        };

        monthRevenues.forEach(r => {
          revenueByContractHolder[r.contract_holder] += Number(r.revenue);
          consultationsByContractHolder[r.contract_holder] += r.consultation_count;
          consultationCostsByContractHolder[r.contract_holder] += Number(r.consultation_cost);
        });

        summaries.push({
          year: filters.year,
          month,
          totalRevenue,
          totalExpenses, // Fixed + manual expenses only
          consultationCosts, // Expert costs separately
          totalCosts, // For profit calculation
          profit,
          profitMargin,
          isProfitable: profit > 0,
          revenueByContractHolder,
          consultationsByContractHolder,
          consultationCostsByContractHolder,
        });
      }

      return summaries;
    },
  });
};
