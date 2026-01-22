// Mock data for contracts expiring within 1 month
// In production, this will come from org_data.contract_date_end field

import { ContractExpiringCompany } from '@/types/smartboard';
import { differenceInDays, addDays, format } from 'date-fns';

// Helper to calculate days until expiry
const getDaysUntilExpiry = (endDate: Date): number => {
  return differenceInDays(endDate, new Date());
};

// Generate realistic mock data with dates relative to today
const today = new Date();

export const mockExpiringContracts: ContractExpiringCompany[] = [
  {
    id: 'exp1',
    companyName: 'Procter & Gamble Hungary',
    country: 'Hungary',
    contractEndDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    daysUntilExpiry: 5,
    assignedTo: 'Peter Janky',
  },
  {
    id: 'exp2',
    companyName: 'Samsung Electronics Slovakia',
    country: 'Slovakia',
    contractEndDate: format(addDays(today, 12), 'yyyy-MM-dd'),
    daysUntilExpiry: 12,
    assignedTo: 'Peter Janky',
  },
  {
    id: 'exp3',
    companyName: 'Audi Hungaria Zrt.',
    country: 'Hungary',
    contractEndDate: format(addDays(today, 18), 'yyyy-MM-dd'),
    daysUntilExpiry: 18,
    assignedTo: 'Peter Janky',
  },
  {
    id: 'exp4',
    companyName: 'Bosch Romania',
    country: 'Romania',
    contractEndDate: format(addDays(today, 25), 'yyyy-MM-dd'),
    daysUntilExpiry: 25,
    assignedTo: 'Peter Janky',
  },
  {
    id: 'exp5',
    companyName: 'Continental Automotive Czech',
    country: 'Czech Republic',
    contractEndDate: format(addDays(today, 28), 'yyyy-MM-dd'),
    daysUntilExpiry: 28,
    assignedTo: 'Peter Janky',
  },
];

// Filter only contracts expiring within 30 days
export const getExpiringContracts = (withinDays: number = 30): ContractExpiringCompany[] => {
  return mockExpiringContracts.filter(c => c.daysUntilExpiry <= withinDays && c.daysUntilExpiry >= 0);
};
