import { ContractHolderType } from "@/types/financial";

// Mock data generator for initial seeding
export const generateMockContractHolderRevenue = (year: number) => {
  const mockData: Array<{
    year: number;
    month: number;
    contract_holder: ContractHolderType;
    revenue: number;
    consultation_count: number;
    consultation_cost: number;
    currency: string;
  }> = [];

  const contractHolders: ContractHolderType[] = ['cgp_europe', 'telus', 'telus_wpo', 'compsych'];

  for (let month = 1; month <= 12; month++) {
    contractHolders.forEach(holder => {
      // Generate semi-random but realistic data
      const baseRevenue: Record<ContractHolderType, number> = {
        cgp_europe: 45000,
        telus: 28000,
        telus_wpo: 18000,
        compsych: 12000,
      };

      const baseConsultations: Record<ContractHolderType, number> = {
        cgp_europe: 120,
        telus: 85,
        telus_wpo: 45,
        compsych: 35,
      };

      // Add some monthly variance (±20%)
      const variance = 0.8 + Math.random() * 0.4;
      const seasonality = 1 + Math.sin((month - 3) * Math.PI / 6) * 0.1; // Peak in Q2

      mockData.push({
        year,
        month,
        contract_holder: holder,
        revenue: Math.round(baseRevenue[holder] * variance * seasonality),
        consultation_count: Math.round(baseConsultations[holder] * variance * seasonality),
        consultation_cost: Math.round(baseConsultations[holder] * variance * seasonality * 55), // ~55 EUR/consultation avg
        currency: 'EUR',
      });
    });
  }

  return mockData;
};

import { ExpenseCategory } from "@/types/financial";

export const generateMockMonthlyExpenses = (year: number) => {
  const categories: Array<{ category: ExpenseCategory; baseAmount: number }> = [
    { category: 'gross_salary', baseAmount: 32000 },
    { category: 'corporate_tax', baseAmount: 4500 },
    { category: 'innovation_fee', baseAmount: 800 },
    { category: 'vat', baseAmount: 6500 },
    { category: 'car_tax', baseAmount: 450 },
    { category: 'local_business_tax', baseAmount: 1200 },
    { category: 'other_costs', baseAmount: 3500 },
    { category: 'supplier_invoices', baseAmount: 2800 },
  ];

  const mockData: Array<{
    year: number;
    month: number;
    category: ExpenseCategory;
    amount: number;
    currency: string;
  }> = [];

  for (let month = 1; month <= 12; month++) {
    categories.forEach(({ category, baseAmount }) => {
      // Small monthly variance
      const variance = 0.95 + Math.random() * 0.1;
      mockData.push({
        year,
        month,
        category,
        amount: Math.round(baseAmount * variance),
        currency: 'EUR',
      });
    });
  }

  return mockData;
};

// Hungarian month names
export const MONTH_NAMES = [
  'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
  'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
];

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('hu-HU').format(value);
};
