/* @refresh reset */

import { useState, useMemo, useCallback } from "react";
import { CrmLead, LeadStatus } from "@/types/crm";
import { mockLeads, mockOffers, mockDeals } from "@/data/crmMockData";

// Create initial leads array ONCE - stored in module scope to persist across renders
const initialLeads: CrmLead[] = [
  ...mockLeads.map(l => ({ ...l, status: 'lead' as LeadStatus })),
  ...mockOffers.map(l => ({ ...l, status: 'offer' as LeadStatus })),
  ...mockDeals.map(l => ({ ...l, status: 'deal' as LeadStatus })),
];

// Module-level state to persist between component unmounts
let persistedLeads: CrmLead[] = [...initialLeads];

export const useCrmLeads = () => {
  const [leads, setLeads] = useState<CrmLead[]>(persistedLeads);

  // Wrapper to update both local state and persisted state
  const updateLeadsState = useCallback((updater: (prev: CrmLead[]) => CrmLead[]) => {
    setLeads(prev => {
      const newLeads = updater(prev);
      persistedLeads = newLeads;
      return newLeads;
    });
  }, []);

  // Filter leads by status
  const getLeadsByStatus = useCallback((status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  }, [leads]);

  // Add a new lead
  const addLead = useCallback((lead: CrmLead) => {
    updateLeadsState(prev => [...prev, lead]);
  }, [updateLeadsState]);

  // Update an existing lead
  const updateLead = useCallback((updatedLead: CrmLead) => {
    updateLeadsState(prev => prev.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    ));
  }, [updateLeadsState]);

  // Change lead status (moves it to a different tab)
  const changeLeadStatus = useCallback((leadId: string, newStatus: LeadStatus) => {
    updateLeadsState(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() } : lead
    ));
  }, [updateLeadsState]);

  // Delete a lead
  const deleteLead = useCallback((leadId: string) => {
    updateLeadsState(prev => prev.filter(lead => lead.id !== leadId));
  }, [updateLeadsState]);

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
