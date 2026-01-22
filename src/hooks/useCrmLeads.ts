import { useState, useMemo, useCallback } from "react";
import { CrmLead, LeadStatus } from "@/types/crm";
import { mockLeads, mockOffers, mockDeals } from "@/data/crmMockData";

// Combine all leads into one array for state management
const initialLeads: CrmLead[] = [
  ...mockLeads.map(l => ({ ...l, status: 'lead' as LeadStatus })),
  ...mockOffers.map(l => ({ ...l, status: 'offer' as LeadStatus })),
  ...mockDeals.map(l => ({ ...l, status: 'deal' as LeadStatus })),
];

export const useCrmLeads = () => {
  const [leads, setLeads] = useState<CrmLead[]>(initialLeads);

  // Filter leads by status
  const getLeadsByStatus = useCallback((status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  }, [leads]);

  // Add a new lead
  const addLead = useCallback((lead: CrmLead) => {
    setLeads(prev => [...prev, lead]);
  }, []);

  // Update an existing lead
  const updateLead = useCallback((updatedLead: CrmLead) => {
    setLeads(prev => prev.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    ));
  }, []);

  // Change lead status (moves it to a different tab)
  const changeLeadStatus = useCallback((leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() } : lead
    ));
  }, []);

  // Delete a lead
  const deleteLead = useCallback((leadId: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId));
  }, []);

  // Memoized filtered lists
  const leadsList = useMemo(() => getLeadsByStatus('lead'), [getLeadsByStatus]);
  const offersList = useMemo(() => getLeadsByStatus('offer'), [getLeadsByStatus]);
  const dealsList = useMemo(() => getLeadsByStatus('deal'), [getLeadsByStatus]);
  const signedList = useMemo(() => leads.filter(lead => lead.status === 'signed' || lead.status === 'incoming_company'), [leads]);

  return {
    leads,
    leadsList,
    offersList,
    dealsList,
    signedList,
    addLead,
    updateLead,
    changeLeadStatus,
    deleteLead,
    getLeadsByStatus,
  };
};
