import { useCrmLeads } from "@/hooks/useCrmLeads";
import { getExpiringContracts } from "@/data/contractExpiringMockData";
import ContractExpiringPanel from "@/components/smartboard/ContractExpiringPanel";
import CrmSummaryPanel from "@/components/smartboard/CrmSummaryPanel";
import UpcomingMeetingsPanel from "@/components/smartboard/UpcomingMeetingsPanel";
import TodayTasksPanel from "@/components/smartboard/TodayTasksPanel";
import SalesSummaryStrip from "@/components/smartboard/SalesSummaryStrip";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Mock today's tasks - in production this would come from the TODO system
const mockTodayTasks = [
  { id: 3188, date: "2026-01-22", author: "Kiss Barbara", title: "Tesconak értesítések küldése", isNew: true, isLastDay: true },
  { id: 3190, date: "2026-01-22", author: "Kiss Barbara", title: "Samsung szerződés megújítás előkészítése" },
  { id: 3191, date: "2026-01-22", author: "Kiss Barbara", title: "Audi meeting összefoglaló" },
];

// Get first name or nickname from full name
const getGreetingName = (fullName: string): string => {
  const firstName = fullName.split(" ").pop() || fullName; // Get last part (first name in Hungarian)
  // Common Hungarian nickname mappings
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

const SalesSmartboard = () => {
  const { currentUser } = useAuth();
  const { leadsList, offersList, dealsList, signedList, leads } = useCrmLeads();
  
  // Get expiring contracts (within 30 days)
  const expiringContracts = getExpiringContracts(30);

  // Get greeting name
  const greetingName = currentUser ? getGreetingName(currentUser.name) : "Kolléga";

  // Collect all upcoming meetings from all leads
  const upcomingMeetings = useMemo(() => {
    const allMeetings = leads.flatMap(lead => 
      lead.meetings
        .filter(m => m.status === 'scheduled' || !m.status)
        .map(m => ({
          ...m,
          companyName: lead.companyName,
        }))
    );
    // Sort by date (most recent first)
    return allMeetings.sort((a, b) => a.date.localeCompare(b.date));
  }, [leads]);

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-calibri-bold mb-2">Szia {greetingName}!</h1>
      <p className="text-muted-foreground mb-6">
        Értékesítési műszerfal - áttekintés és gyors műveletek
      </p>

      {/* Sales Summary Strip - Quick overview at the top */}
      <SalesSummaryStrip
        leadsCount={leadsList.length}
        offersCount={offersList.length}
        dealsCount={dealsList.length}
        signedCount={signedList.length}
        upcomingMeetingsCount={upcomingMeetings.length}
        expiringContractsCount={expiringContracts.length}
      />

      {/* Today's Tasks - Universal panel for all SmartBoards */}
      <TodayTasksPanel tasks={mockTodayTasks} />

      {/* Contract Expiring Warning Panel - Most Important! */}
      <ContractExpiringPanel contracts={expiringContracts} />

      {/* CRM Summary Panel */}
      <CrmSummaryPanel
        leads={leadsList}
        offers={offersList}
        deals={dealsList}
        signed={signedList}
        upcomingMeetings={upcomingMeetings.length}
      />

      {/* Upcoming Meetings Panel */}
      <UpcomingMeetingsPanel meetings={upcomingMeetings} />
    </div>
  );
};

export default SalesSmartboard;
