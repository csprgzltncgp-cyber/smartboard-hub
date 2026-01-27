import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCrmLeads } from "@/hooks/useCrmLeads";
import { useFinancialSummary } from "@/hooks/useFinancialData";
import { useActivityPlanEvents, useAllUserClientAssignments } from "@/hooks/useActivityPlan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Wallet, PieChart, ReceiptText } from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval, addDays } from "date-fns";
import { hu } from "date-fns/locale";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Reuse existing panels
import TodayTasksPanel from "@/components/smartboard/TodayTasksPanel";
import CrmSummaryPanel from "@/components/smartboard/CrmSummaryPanel";
import IncomingClientsPanel, { IncomingClient } from "@/components/smartboard/IncomingClientsPanel";
import LossClientsPanel, { LossClient } from "@/components/smartboard/LossClientsPanel";
import UsageAlertPanel, { UsageAlertClient } from "@/components/smartboard/UsageAlertPanel";
import OverBillingPanel from "@/components/smartboard/OverBillingPanel";
import LowPSIPanel from "@/components/smartboard/LowPSIPanel";
import AllEventsPanel from "@/components/smartboard/AllEventsPanel";

// Mock data from other SmartBoards
import {
  mockOverBillings,
  mockHighFees,
  mockLowPSI,
} from "@/data/operativeMockData";

// Contract holder config
const CONTRACT_HOLDER_LABELS: Record<string, string> = {
  cgp_europe: "CGP Europe",
  telus: "Telus",
  telus_wpo: "Telus/WPO",
  compsych: "CompSych",
};

const CONTRACT_HOLDER_COLORS: Record<string, string> = {
  cgp_europe: "#00575f",
  telus: "#59c6c6",
  telus_wpo: "#91b752",
  compsych: "#eb7e30",
};

// Mock today's tasks for Admin
const mockTodayTasks = [
  { id: 5001, date: "2026-01-27", author: "Rendszer", title: "Havi pénzügyi riport jóváhagyása", isNew: true },
  { id: 5002, date: "2026-01-27", author: "Kiss Péter", title: "Új ügyfél onboarding ellenőrzése" },
  { id: 5003, date: "2026-01-27", author: "Nagy Anna", title: "Szakértői díjak felülvizsgálata", isLastDay: true },
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
    "Anna": "Ani",
  };
  return nicknames[firstName] || firstName;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('hu-HU', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const AdminSmartboard = () => {
  const { currentUser } = useAuth();
  const { leads } = useCrmLeads();
  const { data: allAssignments } = useAllUserClientAssignments();
  const { data: allEvents } = useActivityPlanEvents();
  
  // Get current month/year for financial data
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Fetch financial summary
  const { data: financialData } = useFinancialSummary({ 
    year: currentYear, 
    month: currentMonth 
  });
  
  const greetingName = currentUser ? getGreetingName(currentUser.name) : "Admin";
  
  // CRM data for Sales panel
  const leadsList = useMemo(() => leads.filter(l => l.status === 'lead'), [leads]);
  const offersList = useMemo(() => leads.filter(l => l.status === 'offer'), [leads]);
  const dealsList = useMemo(() => leads.filter(l => l.status === 'deal'), [leads]);
  const signedList = useMemo(() => leads.filter(l => l.status === 'signed'), [leads]);
  
  // Calculate upcoming meetings
  const upcomingMeetings = useMemo(() => {
    return leads.flatMap(lead => {
      const meetings = lead.meetings || [];
      return meetings.filter((m: { date: string }) => {
        const meetingDate = new Date(m.date);
        return meetingDate >= new Date();
      });
    });
  }, [leads]);
  
  // Incoming clients from CRM
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
  
  // Financial totals for current month
  const financialTotals = useMemo(() => {
    if (!financialData || financialData.length === 0) return null;
    
    const currentMonthData = financialData.find(s => s.month === currentMonth);
    if (!currentMonthData) return null;
    
    return {
      revenue: currentMonthData.totalRevenue,
      expenses: currentMonthData.totalExpenses + currentMonthData.consultationCosts,
      profit: currentMonthData.profit,
      isProfitable: currentMonthData.profit >= 0,
      revenueByContractHolder: currentMonthData.revenueByContractHolder,
      consultationCostsByContractHolder: currentMonthData.consultationCostsByContractHolder,
    };
  }, [financialData, currentMonth]);
  
  // Revenue pie chart data
  const revenuePieData = useMemo(() => {
    if (!financialTotals?.revenueByContractHolder) return [];
    
    return Object.entries(financialTotals.revenueByContractHolder)
      .filter(([_, value]) => (value as number) > 0)
      .map(([key, value]) => ({
        name: CONTRACT_HOLDER_LABELS[key] || key,
        value: value as number,
        color: CONTRACT_HOLDER_COLORS[key] || "#888",
      }));
  }, [financialTotals]);
  
  // Consultation costs pie chart data
  const consultationCostsPieData = useMemo(() => {
    if (!financialTotals?.consultationCostsByContractHolder) return [];
    
    return Object.entries(financialTotals.consultationCostsByContractHolder)
      .filter(([_, value]) => (value as number) > 0)
      .map(([key, value]) => ({
        name: CONTRACT_HOLDER_LABELS[key] || key,
        value: value as number,
        color: CONTRACT_HOLDER_COLORS[key] || "#888",
      }));
  }, [financialTotals]);
  
  // Planned events for this week - ALL events from ALL clients
  const weekEvents = useMemo(() => {
    if (!allEvents) return [];
    
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    return allEvents.filter(event => {
      const eventDate = parseISO(event.event_date);
      return isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
    });
  }, [allEvents]);

  // Calculate balance percentages
  const revenue = financialTotals?.revenue || 0;
  const expenses = financialTotals?.expenses || 0;
  const total = revenue + expenses;
  const revenuePercent = total > 0 ? (revenue / total) * 100 : 50;
  const expensePercent = total > 0 ? (expenses / total) * 100 : 50;

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-calibri-bold mb-2">Szia {greetingName}!</h1>
      <p className="text-muted-foreground mb-6">
        Admin műszerfal - teljes áttekintés
      </p>

      {/* Today's Tasks Panel */}
      <TodayTasksPanel tasks={mockTodayTasks} />

      {/* Financial Overview Section */}
      <div className="mb-8">
        <div className="flex items-end justify-between">
          <h2 className="bg-cgp-badge-new text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
            <Wallet className="w-6 h-6 md:w-8 md:h-8" />
            Pénzügyi áttekintés - {format(new Date(), "yyyy MMMM", { locale: hu })}
          </h2>
        </div>
        <div className="bg-cgp-badge-new/10 p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Financial Balance Panel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ReceiptText className="w-5 h-5" />
                  Pénzügyi mérleg
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Labels */}
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="w-4 h-4 text-cgp-badge-new" />
                      <span className="font-medium text-cgp-badge-new">Bevételek</span>
                      <span className="text-muted-foreground">({revenuePercent.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">({expensePercent.toFixed(1)}%)</span>
                      <span className="font-medium text-cgp-badge-lastday">Kiadások</span>
                      <ArrowUpRight className="w-4 h-4 text-cgp-badge-lastday" />
                    </div>
                  </div>

                  {/* Balance Bar */}
                  <div className="flex h-8 rounded-lg overflow-hidden bg-muted/30">
                    <div 
                      className="bg-cgp-badge-new flex items-center justify-start transition-all duration-500"
                      style={{ width: `${revenuePercent}%` }}
                    >
                      <span className="text-white font-semibold text-sm px-2 truncate">
                        {formatCurrency(revenue)}
                      </span>
                    </div>
                    <div 
                      className="bg-cgp-badge-lastday flex items-center justify-end transition-all duration-500"
                      style={{ width: `${expensePercent}%` }}
                    >
                      <span className="text-white font-semibold text-sm px-2 truncate">
                        {formatCurrency(expenses)}
                      </span>
                    </div>
                  </div>

                  {/* Profit indicator */}
                  <div className="flex justify-center">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${financialTotals?.isProfitable ? 'bg-primary/20 text-primary' : 'bg-cgp-badge-overdue/20 text-cgp-badge-overdue'}`}>
                      {financialTotals?.isProfitable ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-semibold">
                        {financialTotals?.isProfitable ? '+' : ''}{formatCurrency(financialTotals?.profit || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Contract Holder */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Bevétel megoszlás
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenuePieData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nincs adat</p>
                ) : (
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={revenuePieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {revenuePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-2 text-xs mt-2">
                  {revenuePieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consultation Costs by Contract Holder */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Tanácsadási költségek
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultationCostsPieData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nincs adat</p>
                ) : (
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={consultationCostsPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {consultationCostsPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-2 text-xs mt-2">
                  {consultationCostsPieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CRM Summary Panel from Sales */}
      <CrmSummaryPanel
        leads={leadsList}
        offers={offersList}
        deals={dealsList}
        signed={signedList}
        upcomingMeetings={upcomingMeetings.length}
      />

      {/* All Planned Events - from all clients */}
      <AllEventsPanel events={weekEvents} />

      {/* Incoming Clients Panel from Account */}
      <IncomingClientsPanel clients={incomingClients} />

      {/* Loss Clients Panel (AI) from Account */}
      <LossClientsPanel clients={mockLossClients} />

      {/* Operative AI Panels */}
      <OverBillingPanel items={mockOverBillings} type="billing" />
      <OverBillingPanel items={mockHighFees} type="fees" />
      <LowPSIPanel experts={mockLowPSI} />

      {/* Usage Alert Panels from Account */}
      <UsageAlertPanel clients={mockHighUsageClients} type="high" />
      <UsageAlertPanel clients={mockLowUsageClients} type="low" />
    </div>
  );
};

export default AdminSmartboard;
