import { useCrmLeads } from "@/hooks/useCrmLeads";
import { getExpiringContracts } from "@/data/contractExpiringMockData";
import ContractExpiringPanel from "@/components/smartboard/ContractExpiringPanel";
import CrmSummaryPanel from "@/components/smartboard/CrmSummaryPanel";
import UpcomingMeetingsPanel from "@/components/smartboard/UpcomingMeetingsPanel";
import TodayTasksPanel from "@/components/smartboard/TodayTasksPanel";
import { useMemo } from "react";

// Mock today's tasks - in production this would come from the TODO system
const mockTodayTasks = [
  { id: 3188, date: "2026-01-22", author: "Kiss Barbara", title: "Tesconak értesítések küldése", isNew: true, isLastDay: true },
  { id: 3190, date: "2026-01-22", author: "Kiss Barbara", title: "Samsung szerződés megújítás előkészítése" },
  { id: 3191, date: "2026-01-22", author: "Kiss Barbara", title: "Audi meeting összefoglaló" },
];

const SalesSmartboard = () => {
  const { leadsList, offersList, dealsList, signedList, leads } = useCrmLeads();
  
  // Get expiring contracts (within 30 days)
  const expiringContracts = getExpiringContracts(30);

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
      <h1 className="text-3xl font-calibri-bold mb-2">Sales SmartBoard</h1>
      <p className="text-muted-foreground mb-6">
        Értékesítési műszerfal - áttekintés és gyors műveletek
      </p>

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
