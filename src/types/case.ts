// Case types based on Laravel Cases model

export type CaseStatus = 
  | 'pending'           // Függőben
  | 'opened'            // Új
  | 'assigned_to_expert' // Szakértőhöz kiközvetítve
  | 'employee_contacted' // Kapcsolatfelvétel megtörtént
  | 'client_unreachable' // A kliens elérhetetlen!
  | 'confirmed'          // Lezárt
  | 'client_unreachable_confirmed' // Kliens elérhetetlen lezárva
  | 'interrupted'        // A tanácsadás megszakadt
  | 'interrupted_confirmed'; // A tanácsadás megszakadt lezárva

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  pending: 'Függőben',
  opened: 'Új',
  assigned_to_expert: 'Szakértőhöz kiközvetítve',
  employee_contacted: 'Kapcsolatfelvétel megtörtént',
  client_unreachable: 'A kliens elérhetetlen!',
  confirmed: 'Lezárt',
  client_unreachable_confirmed: 'Kliens elérhetetlen lezárva',
  interrupted: 'A tanácsadás megszakadt',
  interrupted_confirmed: 'A tanácsadás megszakadt lezárva',
};

export type CaseExpertStatus = 
  | 'assigned'   // -1: Kiközvetítve, válaszra vár
  | 'accepted'   // 1: Elfogadva
  | 'rejected';  // 0: Elutasítva

export const CASE_EXPERT_STATUS_VALUES = {
  ASSIGNED_TO_EXPERT: -1,
  ACCEPTED: 1,
  REJECTED: 0,
} as const;

// Case type (Esettípus) - from Laravel case_input with default_type = 'case_type'
export type CaseType = 
  | 1   // Pszichológiai tanácsadás
  | 2   // Jogi tanácsadás  
  | 3   // Pénzügyi tanácsadás
  | 4   // Egyéb
  | 5   // Munkajogi
  | 6   // Életvezetési tanácsadás
  | 7   // Munkahelyi támogatás
  | 11; // Coaching

export interface CaseValue {
  id: string;
  caseId: string;
  caseInputId: number;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseExpert {
  id: string;
  name: string;
  email: string;
  accepted: number; // -1, 0, 1
  createdAt: string;
}

export interface CaseConsultation {
  id: string;
  caseId: string;
  permissionId: number;
  minuteLength: number;
  createdAt: string;
}

export interface Case {
  id: string;
  caseIdentifier: string;
  status: CaseStatus;
  companyId: string;
  companyName?: string;
  countryId: string;
  countryCode?: string;
  createdBy: string;
  operatorName?: string;
  employeeContactedAt?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  customerSatisfaction?: number;
  customerSatisfactionNotPossible?: boolean;
  closedByExpert?: boolean;
  activityCode?: string;
  eapConsultationDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Computed fields
  percentage: number; // 0, 33, 66, 100
  
  // Related data
  values: CaseValue[];
  experts: CaseExpert[];
  consultations: CaseConsultation[];
  
  // Derived from values
  caseType?: number;
  clientName?: string;
  date?: string;
  location?: string;
  isCrisis?: boolean;
}

// Warning types for case cards
export interface CaseWarning {
  type: 'rejected' | '24h' | '5day' | '2month' | '3month' | 'interrupted' | 'unreachable' | 'no_expert' | 'eap_deleted' | 'closeable';
  label: string;
  severity: 'warning' | 'error' | 'info';
}

// Country grouping for in-progress cases
export interface CountryGroup {
  countryId: string;
  countryCode: string;
  countryName: string;
  caseCount: number;
  isExpanded: boolean;
  isLoading: boolean;
  cases: Case[];
}

// Calculate case progress percentage based on Laravel logic
export function calculateCasePercentage(caseData: Case): number {
  const status = caseData.status;
  const hasConsultations = caseData.consultations.length > 0;
  const caseType = caseData.caseType;
  
  // Opened or just assigned
  if (status === 'opened' || status === 'assigned_to_expert') {
    return 0;
  }
  
  // Check if case is complete (100%)
  const isComplete = 
    caseData.closedByExpert ||
    // Munkajogi esetek
    (caseType === 5 && (status === 'employee_contacted' || caseData.customerSatisfactionNotPossible || caseData.customerSatisfaction)) ||
    // Egyéb esetek
    (caseType === 4 && (status === 'employee_contacted' || caseData.customerSatisfactionNotPossible)) ||
    // Coaching esetek
    (caseType === 11 && caseData.customerSatisfactionNotPossible) ||
    // General cases with satisfaction
    (
      (([1, 2, 3].includes(caseType || 0) && caseData.customerSatisfaction != null) ||
       (![1, 2, 3].includes(caseType || 0) && caseData.customerSatisfactionNotPossible)) &&
      hasConsultations &&
      ![1, 6, 7].includes(caseType || 0)
    );
    
  if (isComplete) {
    return 100;
  }
  
  // Has consultations and contacted
  if (hasConsultations && status === 'employee_contacted') {
    return 66;
  }
  
  // Just contacted, no consultations
  if (status === 'employee_contacted') {
    return 33;
  }
  
  return 0;
}

// Get warnings for a case based on Laravel logic
export function getCaseWarnings(caseData: Case, userType: 'operator' | 'expert' | 'admin' = 'operator'): CaseWarning[] {
  const warnings: CaseWarning[] = [];
  const now = new Date();
  
  // Check if case was rejected
  const acceptedExpert = caseData.experts.find(e => e.accepted === CASE_EXPERT_STATUS_VALUES.ACCEPTED);
  const rejectedExpert = caseData.experts.find(e => e.accepted === CASE_EXPERT_STATUS_VALUES.REJECTED);
  
  if (!acceptedExpert && rejectedExpert) {
    warnings.push({
      type: 'rejected',
      label: 'Eset visszautasítva!',
      severity: 'error'
    });
  }
  
  // Check 24 hour warning for unaccepted assignments
  if (caseData.experts.length > 0) {
    const latestExpert = caseData.experts[0];
    if (latestExpert.accepted === CASE_EXPERT_STATUS_VALUES.ASSIGNED_TO_EXPERT) {
      const assignedDate = new Date(latestExpert.createdAt);
      const hoursDiff = (now.getTime() - assignedDate.getTime()) / (1000 * 60 * 60);
      if (hoursDiff >= 24) {
        warnings.push({
          type: '24h',
          label: '24 óra eltelt!',
          severity: 'error'
        });
      }
    }
  }
  
  // Check 5 day warning (contacted but no consultations)
  if (caseData.employeeContactedAt && caseData.consultations.length === 0) {
    const contactedDate = new Date(caseData.employeeContactedAt);
    const daysDiff = Math.floor((now.getTime() - contactedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= 4) {
      warnings.push({
        type: '5day',
        label: '5 nap eltelt!',
        severity: 'warning'
      });
    }
  }
  
  // Check consultation age (2nd or 3rd month)
  if (caseData.consultations.length > 0) {
    const firstConsultation = caseData.consultations[caseData.consultations.length - 1]; // oldest first
    const consultDate = new Date(firstConsultation.createdAt);
    const daysDiff = Math.floor((now.getTime() - consultDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 60) {
      warnings.push({
        type: '3month',
        label: '3. hónap',
        severity: 'error'
      });
    } else if (daysDiff >= 30) {
      warnings.push({
        type: '2month',
        label: '2. hónap',
        severity: 'warning'
      });
    }
  }
  
  // Interrupted status
  if (caseData.status === 'interrupted' && (userType === 'expert' || userType === 'admin')) {
    warnings.push({
      type: 'interrupted',
      label: 'Megszakadt',
      severity: 'warning'
    });
  }
  
  // Client unreachable
  if (caseData.status === 'client_unreachable') {
    warnings.push({
      type: 'unreachable',
      label: 'A kliens elérhetetlen!',
      severity: 'error'
    });
  }
  
  // No expert assigned
  if (caseData.experts.length === 0) {
    warnings.push({
      type: 'no_expert',
      label: 'Nincs szakértő kiválasztva!',
      severity: 'error'
    });
  }
  
  // EAP consultation deleted
  if (caseData.eapConsultationDeleted) {
    warnings.push({
      type: 'eap_deleted',
      label: 'EAP konzultáció törölve!',
      severity: 'warning'
    });
  }
  
  return warnings;
}
