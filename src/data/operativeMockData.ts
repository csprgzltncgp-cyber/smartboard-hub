// Mock data for Operative SmartBoard

export interface CaseWarning {
  id: string;
  caseNumber: string;
  clientName: string;
  expertName?: string;
  country: string;
  openedDate: string;
  warningType: 'not_dispatched' | '24h' | '5day' | 'rejected' | '2month' | '3month';
  daysOpen?: number;
}

export interface FraudSuspicion {
  id: string;
  caseNumber: string;
  clientName: string;
  matchType: 'phone' | 'email' | 'name';
  matchedCases: string[];
  riskLevel: 'high' | 'medium';
}

export interface OverBilling {
  id: string;
  expertName: string;
  caseNumber: string;
  billedAmount: number;
  expectedAmount: number;
  difference: number;
  currency: string;
}

export interface LowPSI {
  id: string;
  expertName: string;
  averageScore: number;
  feedbackCount: number;
  recentTrend: 'declining' | 'stable';
}

export interface WorkshopFeedback {
  id: string;
  workshopTitle: string;
  expertName: string;
  date: string;
  rating: number;
  companyName: string;
  isLowRating: boolean;
}

export interface ExpertNotification {
  id: string;
  expertName: string;
  totalSent: number;
  readCount: number;
  unreadCount: number;
  lastActivity: string;
}

export interface EapFeedback {
  id: string;
  userName: string;
  message: string;
  date: string;
  isAnswered: boolean;
}

export interface ExpertSearchDeadline {
  id: string;
  caseNumber: string;
  clientName: string;
  searchStarted: string;
  deadline: string;
  daysOverdue: number;
}

// Mock case warnings
export const mockCaseWarnings: CaseWarning[] = [
  // Not dispatched
  { id: '1', caseNumber: 'C-2026-0142', clientName: 'Kovács Anna', country: 'HU', openedDate: '2026-01-24', warningType: 'not_dispatched' },
  { id: '2', caseNumber: 'C-2026-0138', clientName: 'Szabó Péter', country: 'HU', openedDate: '2026-01-23', warningType: 'not_dispatched' },
  { id: '3', caseNumber: 'C-2026-0135', clientName: 'Novák Jana', country: 'CZ', openedDate: '2026-01-22', warningType: 'not_dispatched' },
  
  // 24h warning
  { id: '4', caseNumber: 'C-2026-0130', clientName: 'Tóth Gábor', expertName: 'Dr. Kiss Éva', country: 'HU', openedDate: '2026-01-25', warningType: '24h' },
  { id: '5', caseNumber: 'C-2026-0128', clientName: 'Horváth Mária', expertName: 'Dr. Nagy László', country: 'HU', openedDate: '2026-01-25', warningType: '24h' },
  
  // 5 day warning
  { id: '6', caseNumber: 'C-2026-0110', clientName: 'Varga István', expertName: 'Dr. Fekete Anna', country: 'HU', openedDate: '2026-01-21', warningType: '5day' },
  { id: '7', caseNumber: 'C-2026-0108', clientName: 'Molnár Zoltán', expertName: 'Dr. Balogh Péter', country: 'SK', openedDate: '2026-01-20', warningType: '5day' },
  
  // Rejected
  { id: '8', caseNumber: 'C-2026-0095', clientName: 'Kiss Katalin', expertName: 'Dr. Szabó Réka', country: 'HU', openedDate: '2026-01-18', warningType: 'rejected' },
  { id: '9', caseNumber: 'C-2026-0090', clientName: 'Nagy Béla', expertName: 'Dr. Kovács Tamás', country: 'RO', openedDate: '2026-01-17', warningType: 'rejected' },
  
  // 2 month+
  { id: '10', caseNumber: 'C-2025-1842', clientName: 'Fehér Judit', expertName: 'Dr. Tóth Csaba', country: 'HU', openedDate: '2025-11-20', warningType: '2month', daysOpen: 67 },
  { id: '11', caseNumber: 'C-2025-1810', clientName: 'Lakatos Róbert', expertName: 'Dr. Varga Klára', country: 'HU', openedDate: '2025-11-15', warningType: '2month', daysOpen: 72 },
  
  // 3 month+
  { id: '12', caseNumber: 'C-2025-1650', clientName: 'Bíró Eszter', expertName: 'Dr. Molnár Gábor', country: 'HU', openedDate: '2025-10-10', warningType: '3month', daysOpen: 108 },
  { id: '13', caseNumber: 'C-2025-1580', clientName: 'Papp András', expertName: 'Dr. Horváth Éva', country: 'SK', openedDate: '2025-09-25', warningType: '3month', daysOpen: 123 },
];

// Mock fraud suspicions (AI)
export const mockFraudSuspicions: FraudSuspicion[] = [
  { id: '1', caseNumber: 'C-2026-0142', clientName: 'Kovács Anna', matchType: 'phone', matchedCases: ['C-2025-1820', 'C-2025-0950'], riskLevel: 'high' },
  { id: '2', caseNumber: 'C-2026-0098', clientName: 'Nagy László', matchType: 'email', matchedCases: ['C-2026-0042'], riskLevel: 'medium' },
  { id: '3', caseNumber: 'C-2026-0085', clientName: 'Szabó Péter', matchType: 'name', matchedCases: ['C-2025-1650', 'C-2025-1200', 'C-2024-3500'], riskLevel: 'high' },
];

// Mock overbilling (AI)
export const mockOverBillings: OverBilling[] = [
  { id: '1', expertName: 'Dr. Kiss Éva', caseNumber: 'C-2026-0088', billedAmount: 85000, expectedAmount: 50000, difference: 35000, currency: 'HUF' },
  { id: '2', expertName: 'Dr. Nagy László', caseNumber: 'C-2026-0072', billedAmount: 120000, expectedAmount: 75000, difference: 45000, currency: 'HUF' },
  { id: '3', expertName: 'Dr. Fekete Anna', caseNumber: 'C-2026-0065', billedAmount: 250, expectedAmount: 150, difference: 100, currency: 'EUR' },
];

// Mock high fees (AI)
export const mockHighFees: OverBilling[] = [
  { id: '1', expertName: 'Dr. Balogh Péter', caseNumber: 'N/A', billedAmount: 95000, expectedAmount: 65000, difference: 30000, currency: 'HUF' },
  { id: '2', expertName: 'Dr. Tóth Csaba', caseNumber: 'N/A', billedAmount: 180, expectedAmount: 120, difference: 60, currency: 'EUR' },
];

// Mock low PSI (AI)
export const mockLowPSI: LowPSI[] = [
  { id: '1', expertName: 'Dr. Szabó Réka', averageScore: 2.8, feedbackCount: 15, recentTrend: 'declining' },
  { id: '2', expertName: 'Dr. Kovács Tamás', averageScore: 3.1, feedbackCount: 22, recentTrend: 'stable' },
  { id: '3', expertName: 'Dr. Varga Klára', averageScore: 2.5, feedbackCount: 8, recentTrend: 'declining' },
];

// Mock workshop feedbacks
export const mockWorkshopFeedbacks: WorkshopFeedback[] = [
  { id: '1', workshopTitle: 'Stresszkezelés alapjai', expertName: 'Dr. Kiss Éva', date: '2026-01-20', rating: 2.1, companyName: 'Bosch Kft.', isLowRating: true },
  { id: '2', workshopTitle: 'Kiégés megelőzése', expertName: 'Dr. Szabó Réka', date: '2026-01-18', rating: 2.5, companyName: 'Audi Hungaria', isLowRating: true },
  { id: '3', workshopTitle: 'Csapatépítés', expertName: 'Dr. Nagy László', date: '2026-01-22', rating: 4.8, companyName: 'Samsung SDI', isLowRating: false },
  { id: '4', workshopTitle: 'Vezetői készségek', expertName: 'Dr. Fekete Anna', date: '2026-01-15', rating: 1.9, companyName: 'Tesco Global', isLowRating: true },
];

// Mock expert notifications
export const mockExpertNotifications: ExpertNotification[] = [
  { id: '1', expertName: 'Dr. Kiss Éva', totalSent: 25, readCount: 20, unreadCount: 5, lastActivity: '2026-01-25' },
  { id: '2', expertName: 'Dr. Nagy László', totalSent: 18, readCount: 10, unreadCount: 8, lastActivity: '2026-01-20' },
  { id: '3', expertName: 'Dr. Szabó Réka', totalSent: 30, readCount: 28, unreadCount: 2, lastActivity: '2026-01-26' },
  { id: '4', expertName: 'Dr. Fekete Anna', totalSent: 12, readCount: 5, unreadCount: 7, lastActivity: '2026-01-18' },
];

// Mock EAP feedbacks
export const mockEapFeedbacks: EapFeedback[] = [
  { id: '1', userName: 'anonymous_user_1', message: 'Nagyon hasznos volt a tanácsadás, köszönöm!', date: '2026-01-25', isAnswered: false },
  { id: '2', userName: 'anonymous_user_2', message: 'Kérném a visszahívást más időpontban.', date: '2026-01-24', isAnswered: false },
  { id: '3', userName: 'anonymous_user_3', message: 'A chat funkcióval kapcsolatban lenne kérdésem.', date: '2026-01-23', isAnswered: false },
];

// Mock expert search deadline
export const mockExpertSearchDeadlines: ExpertSearchDeadline[] = [
  { id: '1', caseNumber: 'C-2026-0095', clientName: 'Kiss Katalin', searchStarted: '2026-01-15', deadline: '2026-01-20', daysOverdue: 6 },
  { id: '2', caseNumber: 'C-2026-0090', clientName: 'Nagy Béla', searchStarted: '2026-01-10', deadline: '2026-01-15', daysOverdue: 11 },
];

// Helper to get counts
export const getOperativeCounts = () => {
  const notDispatched = mockCaseWarnings.filter(c => c.warningType === 'not_dispatched').length;
  const warning24h = mockCaseWarnings.filter(c => c.warningType === '24h').length;
  const warning5day = mockCaseWarnings.filter(c => c.warningType === '5day').length;
  const rejected = mockCaseWarnings.filter(c => c.warningType === 'rejected').length;
  const month2 = mockCaseWarnings.filter(c => c.warningType === '2month').length;
  const month3 = mockCaseWarnings.filter(c => c.warningType === '3month').length;
  
  return {
    notDispatched,
    warning24h,
    warning5day,
    rejected,
    month2,
    month3,
    totalCaseWarnings: notDispatched + warning24h + warning5day + rejected + month2 + month3,
    fraudSuspicions: mockFraudSuspicions.length,
    overBillings: mockOverBillings.length,
    highFees: mockHighFees.length,
    lowPSI: mockLowPSI.length,
    workshopLowRatings: mockWorkshopFeedbacks.filter(w => w.isLowRating).length,
    unreadNotifications: mockExpertNotifications.reduce((sum, n) => sum + n.unreadCount, 0),
    unansweredFeedbacks: mockEapFeedbacks.filter(f => !f.isAnswered).length,
    overdueSearches: mockExpertSearchDeadlines.length,
  };
};
