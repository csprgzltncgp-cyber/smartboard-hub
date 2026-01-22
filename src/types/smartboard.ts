// SmartBoard Panel Types

export interface ContractExpiringCompany {
  id: string;
  companyName: string;
  country: string;
  contractEndDate: string; // ISO date string
  daysUntilExpiry: number;
  assignedTo: string;
}

export interface SmartboardPanelProps {
  title: string;
  count?: number;
  variant?: 'warning' | 'info' | 'success' | 'neutral';
}
