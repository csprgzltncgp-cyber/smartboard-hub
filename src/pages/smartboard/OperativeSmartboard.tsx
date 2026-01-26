import { useAuth } from "@/contexts/AuthContext";
import TodayTasksPanel from "@/components/smartboard/TodayTasksPanel";
import OperativeSummaryStrip from "@/components/smartboard/OperativeSummaryStrip";
import CaseWarningsPanel from "@/components/smartboard/CaseWarningsPanel";
import FraudSuspicionPanel from "@/components/smartboard/FraudSuspicionPanel";
import OverBillingPanel from "@/components/smartboard/OverBillingPanel";
import LowPSIPanel from "@/components/smartboard/LowPSIPanel";
import WorkshopFeedbackPanel from "@/components/smartboard/WorkshopFeedbackPanel";
import ExpertNotificationsPanel from "@/components/smartboard/ExpertNotificationsPanel";
import EapFeedbackPanel from "@/components/smartboard/EapFeedbackPanel";
import SearchDeadlinePanel from "@/components/smartboard/SearchDeadlinePanel";
import {
  mockCaseWarnings,
  mockFraudSuspicions,
  mockOverBillings,
  mockHighFees,
  mockLowPSI,
  mockWorkshopFeedbacks,
  mockExpertNotifications,
  mockEapFeedbacks,
  mockExpertSearchDeadlines,
  getOperativeCounts,
} from "@/data/operativeMockData";

// Mock today's tasks - in production this would come from the TODO system
const mockTodayTasks = [
  { id: 3200, date: "2026-01-26", author: "Tompa Anita", title: "Szakértő elérhetőségek frissítése", isNew: true },
  { id: 3201, date: "2026-01-26", author: "Szabó Maria", title: "Eset statisztikák havi összesítése" },
  { id: 3202, date: "2026-01-26", author: "Deen Judit", title: "Visszaélés-gyanús esetek ellenőrzése", isLastDay: true },
];

// Get first name from full name
const getGreetingName = (fullName: string): string => {
  const firstName = fullName.split(" ").pop() || fullName;
  const nicknames: Record<string, string> = {
    "Anita": "Ani",
    "Maria": "Mari",
    "Judit": "Judi",
    "Katalin": "Kati",
    "Erzsébet": "Erzsi",
    "Zsuzsanna": "Zsuzsi",
    "János": "Jani",
    "István": "Pisti",
    "Ferenc": "Feri",
    "József": "Józsi",
    "László": "Laci",
    "Péter": "Peti",
  };
  return nicknames[firstName] || firstName;
};

const OperativeSmartboard = () => {
  const { currentUser } = useAuth();
  const greetingName = currentUser ? getGreetingName(currentUser.name) : "Kolléga";

  // Get counts for summary strip
  const counts = getOperativeCounts();

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-calibri-bold mb-2">Szia {greetingName}!</h1>
      <p className="text-muted-foreground mb-6">
        Operatív műszerfal - esetek, minőség és rendszerállapot
      </p>

      {/* Operative Summary Strip */}
      <OperativeSummaryStrip
        todayTasksCount={mockTodayTasks.length}
        notDispatchedCount={counts.notDispatched}
        warning24hCount={counts.warning24h}
        warning5dayCount={counts.warning5day}
        rejectedCount={counts.rejected}
        month2Count={counts.month2}
        month3Count={counts.month3}
        fraudSuspicionCount={counts.fraudSuspicions}
        overBillingCount={counts.overBillings}
        lowPSICount={counts.lowPSI}
        workshopLowRatingCount={counts.workshopLowRatings}
        unreadNotificationsCount={counts.unreadNotifications}
        unansweredFeedbackCount={counts.unansweredFeedbacks}
        overdueSearchCount={counts.overdueSearches}
      />

      {/* Today's Tasks - Universal panel */}
      <TodayTasksPanel tasks={mockTodayTasks} />

      {/* Case Warnings - Tab-based panel */}
      <CaseWarningsPanel warnings={mockCaseWarnings} />

      {/* AI Panels */}
      <FraudSuspicionPanel suspicions={mockFraudSuspicions} />
      <OverBillingPanel items={mockOverBillings} type="billing" />
      <OverBillingPanel items={mockHighFees} type="fees" />
      <LowPSIPanel experts={mockLowPSI} />

      {/* Feedback & Communication Panels */}
      <WorkshopFeedbackPanel feedbacks={mockWorkshopFeedbacks} />
      <ExpertNotificationsPanel notifications={mockExpertNotifications} />
      <EapFeedbackPanel feedbacks={mockEapFeedbacks} />
      <SearchDeadlinePanel items={mockExpertSearchDeadlines} />
    </div>
  );
};

export default OperativeSmartboard;
