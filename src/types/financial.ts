// Financial Dashboard Types

export type ContractHolderType = 'cgp_europe' | 'telus' | 'telus_wpo' | 'compsych';

export type ExpenseCategory = 
  | 'gross_salary'
  | 'corporate_tax'
  | 'innovation_fee'
  | 'vat'
  | 'car_tax'
  | 'local_business_tax'
  | 'other_costs'
  | 'supplier_invoices'
  | 'custom';

export type EntryType = 'income' | 'expense';

export interface MonthlyExpense {
  id: string;
  year: number;
  month: number;
  category: ExpenseCategory;
  custom_category_name?: string;
  amount: number;
  currency: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ManualEntry {
  id: string;
  year: number;
  month: number;
  entry_type: EntryType;
  description: string;
  amount: number;
  currency: string;
  contract_holder?: ContractHolderType;
  country_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractHolderRevenue {
  id: string;
  year: number;
  month: number;
  contract_holder: ContractHolderType;
  country_id?: string;
  revenue: number;
  consultation_count: number;
  consultation_cost: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

// Display labels
export const CONTRACT_HOLDER_LABELS: Record<ContractHolderType, string> = {
  cgp_europe: 'CGP Europe',
  telus: 'Telus',
  telus_wpo: 'Telus/WPO',
  compsych: 'ComPsych',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  gross_salary: 'Bruttó bér költség',
  corporate_tax: 'Társasági adó',
  innovation_fee: 'Innovációs járulék',
  vat: 'ÁFA',
  car_tax: 'Cégautó adó',
  local_business_tax: 'Helyi iparűzési adó',
  other_costs: 'Egyéb költségek',
  supplier_invoices: 'Beszállítói számlák',
  custom: 'Egyéb tétel',
};

// Color mappings for charts
export const CONTRACT_HOLDER_COLORS: Record<ContractHolderType, string> = {
  cgp_europe: 'hsl(185, 100%, 19%)', // CGP Teal
  telus: 'hsl(262, 52%, 47%)', // Purple
  telus_wpo: 'hsl(21, 82%, 55%)', // Orange
  compsych: 'hsl(211, 100%, 50%)', // Blue
};

export interface MonthlyFinancialSummary {
  year: number;
  month: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  isProfitable: boolean;
  revenueByContractHolder: Record<ContractHolderType, number>;
  consultationsByContractHolder: Record<ContractHolderType, number>;
  consultationCostsByContractHolder: Record<ContractHolderType, number>;
}

export interface FinancialFilters {
  year: number;
  month?: number;
  country?: string;
}
