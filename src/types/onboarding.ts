// Onboarding (Bevezetés) types

export type OnboardingStepStatus = 'pending' | 'in_progress' | 'completed';

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  status: OnboardingStepStatus;
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string;
  notes?: string;
  order: number;
}

export interface OnboardingContact {
  id: string;
  name: string;
  title: string;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  address?: string;
  isPrimary?: boolean;
}

export interface OnboardingNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface OnboardingDetail {
  id: string;
  label: string;
  value: string;
}

export interface OnboardingData {
  companyId: string;
  contacts: OnboardingContact[];
  details: OnboardingDetail[];
  notes: OnboardingNote[];
  steps: OnboardingStep[];
  isCompleted: boolean;
  completedAt?: string;
}

// Default onboarding steps
export const DEFAULT_ONBOARDING_STEPS: Omit<OnboardingStep, 'id'>[] = [
  { title: 'Kommunikációs anyagok jóváhagyása', status: 'pending', order: 1 },
  { title: 'Print kommunikációs anyagok gyártása', status: 'pending', order: 2 },
  { title: 'Print kommunikációs anyagok szállítása', status: 'pending', order: 3 },
  { title: 'Egyeztető meeting', status: 'pending', order: 4 },
  { title: 'Adatfeltöltés és véglegesítés Cégek profilban', status: 'pending', order: 5 },
  { title: 'Orientáció meeting', status: 'pending', order: 6 },
  { title: 'Orientáció onsite 1', status: 'pending', order: 7 },
  { title: 'Orientáció onsite 2', status: 'pending', order: 8 },
  { title: 'Orientáció onsite 3', status: 'pending', order: 9 },
  { title: 'Véglegesítés, befejezés', status: 'pending', order: 10 },
];

export const ONBOARDING_STEP_STATUS_LABELS: Record<OnboardingStepStatus, string> = {
  pending: 'Függőben',
  in_progress: 'Folyamatban',
  completed: 'Kész',
};

export const ONBOARDING_STEP_STATUS_COLORS: Record<OnboardingStepStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-cgp-badge-lastday/20 text-cgp-badge-lastday',
  completed: 'bg-cgp-badge-new/20 text-cgp-badge-new',
};
