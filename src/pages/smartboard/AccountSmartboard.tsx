import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserClientAssignments, useActivityPlans, useAllUserClientAssignments } from "@/hooks/useActivityPlan";
import { useCrmLeads } from "@/hooks/useCrmLeads";
import { startOfWeek, endOfWeek, parseISO, isWithinInterval, addDays } from "date-fns";

// Components
import TodayTasksPanel from "@/components/smartboard/TodayTasksPanel";
import AccountSummaryStrip from "@/components/smartboard/AccountSummaryStrip";
import IncomingClientsPanel, { IncomingClient } from "@/components/smartboard/IncomingClientsPanel";
import UsageAlertPanel, { UsageAlertClient } from "@/components/smartboard/UsageAlertPanel";
import LossClientsPanel, { LossClient } from "@/components/smartboard/LossClientsPanel";
import WeekEventsPanel, { WeekEvent } from "@/components/smartboard/WeekEventsPanel";
import UpcomingActivityPanel, { UpcomingActivity } from "@/components/smartboard/UpcomingActivityPanel";

// Get first name or nickname from full name
const getGreetingName = (fullName: string): string => {
  const firstName = fullName.split(" ").pop() || fullName;
  const nicknames: Record<string, string> = {
    "Barbara": "Barbi",
    "Katalin": "Kati",
    "Erzsébet": "Erzsi",
    "Zsuzsanna": "Zsuzsi",
    "Margit": "Manci",
    "János": "Jani",
    "István": "Pisti",
    "Ferenc": "Feri",
    "József": "Józsi",
    "László": "Laci",
    "Péter": "Peti",
  };
  return nicknames[firstName] || firstName;
};

// Mock today's tasks - in production this would come from the TODO system
const mockTodayTasks = [
  { id: 4001, date: "2026-01-26", author: "Rendszer", title: "Tesco ügyfél bevezetés lezárása", isNew: true },
  { id: 4002, date: "2026-01-26", author: "Kiss Barbara", title: "Samsung workshop előkészítés", isLastDay: true },
  { id: 4003, date: "2026-01-26", author: "Nagy Péter", title: "Audi éves riport összeállítása" },
];

// Mock usage alert data
const mockHighUsageClients: UsageAlertClient[] = [
  { id: "1", companyName: "Tech Solutions Kft.", country: "Magyarország", usagePercent: 145, contractLimit: 100, currentUsage: 145 },
  { id: "2", companyName: "Global Industries", country: "Ausztria", usagePercent: 128, contractLimit: 200, currentUsage: 256 },
];

const mockLowUsageClients: UsageAlertClient[] = [
  { id: "3", companyName: "Small Corp Zrt.", country: "Magyarország", usagePercent: 12, contractLimit: 100, currentUsage: 12 },
  { id: "4", companyName: "Micro Ltd.", country: "Szlovákia", usagePercent: 8, contractLimit: 50, currentUsage: 4 },
];

// Mock loss clients data (AI analyzed)
const mockLossClients: LossClient[] = [
  { 
    id: "1", 
    companyName: "Problem Corp Kft.", 
    country: "Magyarország",
    totalLoss: 15420,
    reasons: [
      { reason: "Túlórák", amount: 8500 },
      { reason: "Külső szakértők", amount: 4200 },
      { reason: "Adminisztráció", amount: 2720 },
    ],
    aiAnalysis: "A veszteség fő oka a magas túlóraköltség. Javasolt az erőforrás-tervezés felülvizsgálata és esetleg egy dedikált account manager kijelölése."
  },
];

// Mock psycho risk assessments
const mockPsychoRisk: UpcomingActivity[] = [
  { id: "1", title: "Éves kockázatfelmérés 2026", companyName: "Tesco Magyarország", companyId: "c1", scheduledDate: "2026-02-15" },
];

// Mock prize games
const mockPrizeGames: UpcomingActivity[] = [
  { id: "1", title: "Wellness nyereményjáték", companyName: "Samsung Electronics", companyId: "c2", scheduledDate: "2026-02-01" },
];

// Mock business breakfast
const mockBreakfast: UpcomingActivity[] = [
  { id: "1", title: "Q1 Business Breakfast", companyName: "CGP Europe", scheduledDate: "2026-02-10", participantsCount: 24 },
];

const AccountSmartboard = () => {
  const { currentUser } = useAuth();
  const { leads } = useCrmLeads();
  
  // Get user's assigned clients
  const { data: myAssignments } = useUserClientAssignments(currentUser?.id);
  const { data: allAssignments } = useAllUserClientAssignments();
  const { data: activityPlans } = useActivityPlans();
  
  // Check if user is admin or client director
  const isAdmin = currentUser?.smartboardPermissions?.some(p => p.smartboardId === "admin") ?? false;
  const hasFullAccess = isAdmin;
  
  // Get greeting name
  const greetingName = currentUser ? getGreetingName(currentUser.name) : "Kolléga";
  
  // Find incoming clients from CRM (leads with 'incoming_company' status)
  const incomingClients: IncomingClient[] = useMemo(() => {
    return leads
      .filter(lead => lead.status === 'incoming_company')
      .map(lead => ({
        id: lead.id,
        companyName: lead.companyName,
        country: lead.details?.country || "Ismeretlen",
        signedDate: lead.updatedAt,
        salesPerson: lead.contacts?.[0]?.name || "N/A",
      }));
  }, [leads]);
  
  // Get week events from activity plans
  const weekEvents: WeekEvent[] = useMemo(() => {
    if (!activityPlans) return [];
    
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    const events: WeekEvent[] = [];
    
    // Get all plans and their events
    activityPlans.forEach(plan => {
      // We need to get events from the plan - this would come from a separate query in production
      // For now, we'll create mock events based on the plan
    });
    
    // For demo, add some mock events
    const mockEvents: WeekEvent[] = [
      { 
        id: "e1", 
        title: "Vezetői workshop", 
        companyName: "Tesco Magyarország", 
        companyId: "c1",
        eventDate: addDays(now, 1).toISOString().split('T')[0],
        eventTime: "10:00",
        eventType: "workshop",
        location: "Budapest, Váci út 1-3."
      },
      { 
        id: "e2", 
        title: "Stresszkezelés webinárium", 
        companyName: "Samsung Electronics", 
        companyId: "c2",
        eventDate: addDays(now, 3).toISOString().split('T')[0],
        eventTime: "14:00",
        eventType: "webinar"
      },
    ];
    
    return mockEvents;
  }, [activityPlans]);
  
  // Calculate counts for summary
  const clientCount = hasFullAccess ? allAssignments?.length || 0 : myAssignments?.length || 0;

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-calibri-bold mb-2">Szia {greetingName}!</h1>
      <p className="text-muted-foreground mb-6">
        Account műszerfal - ügyfélkezelés és áttekintés
      </p>

      {/* Account Summary Strip */}
      <AccountSummaryStrip
        todayTasksCount={mockTodayTasks.length}
        incomingClientsCount={incomingClients.length}
        highUsageCount={mockHighUsageClients.length}
        lowUsageCount={mockLowUsageClients.length}
        lossClientsCount={mockLossClients.length}
        weekEventsCount={weekEvents.length}
        psychoRiskCount={mockPsychoRisk.length}
        prizeGameCount={mockPrizeGames.length}
        breakfastCount={mockBreakfast.length}
      />

      {/* Today's Tasks Panel */}
      <TodayTasksPanel tasks={mockTodayTasks} />

      {/* Incoming Clients Panel */}
      <IncomingClientsPanel clients={incomingClients} />

      {/* High Usage Alert Panel */}
      <UsageAlertPanel clients={mockHighUsageClients} type="high" />

      {/* Low Usage Alert Panel */}
      <UsageAlertPanel clients={mockLowUsageClients} type="low" />

      {/* Loss Clients Panel (AI) */}
      <LossClientsPanel clients={mockLossClients} />

      {/* Week Events Panel */}
      <WeekEventsPanel events={weekEvents} />

      {/* Psycho Risk Assessment Panel */}
      <UpcomingActivityPanel type="psycho-risk" items={mockPsychoRisk} />

      {/* Prize Game Panel */}
      <UpcomingActivityPanel type="prize-game" items={mockPrizeGames} />

      {/* Business Breakfast Panel */}
      <UpcomingActivityPanel type="breakfast" items={mockBreakfast} />
    </div>
  );
};

export default AccountSmartboard;
