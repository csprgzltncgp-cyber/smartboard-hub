import { useState, useMemo, useCallback, useEffect } from "react";
import { CrmLead, LeadStatus } from "@/types/crm";
import { mockLeads, mockOffers, mockDeals } from "@/data/crmMockData";

// Create initial leads array ONCE outside the hook
const createInitialLeads = (): CrmLead[] => [
  ...mockLeads.map(l => ({ ...l, status: 'lead' as LeadStatus })),
  ...mockOffers.map(l => ({ ...l, status: 'offer' as LeadStatus })),
  ...mockDeals.map(l => ({ ...l, status: 'deal' as LeadStatus })),
];

// Global state to persist between renders - this simulates a proper state management solution
let globalLeads: CrmLead[] | null = null;
let globalSetLeads: ((leads: CrmLead[]) => void) | null = null;

export const useCrmLeads = () => {
  // Initialize from global state or create new
  const [leads, setLeads] = useState<CrmLead[]>(() => {
    if (globalLeads === null) {
      globalLeads = createInitialLeads();
    }
    return globalLeads;
  });

  // Keep global state in sync
  useEffect(() => {
    globalLeads = leads;
    globalSetLeads = setLeads;
  }, [leads]);

  // Sync with global state when it changes from another component
  useEffect(() => {
    if (globalLeads && globalLeads !== leads) {
      setLeads(globalLeads);
    }
  }, []);

  // Filter leads by status
  const getLeadsByStatus = useCallback((status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  }, [leads]);

  // Add a new lead
  const addLead = useCallback((lead: CrmLead) => {
    setLeads(prev => {
      const newLeads = [...prev, lead];
      globalLeads = newLeads;
      return newLeads;
    });
  }, []);

  // Update an existing lead
  const updateLead = useCallback((updatedLead: CrmLead) => {
    setLeads(prev => {
      const newLeads = prev.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      );
      globalLeads = newLeads;
      return newLeads;
    });
  }, []);

  // Change lead status (moves it to a different tab)
  const changeLeadStatus = useCallback((leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => {
      const newLeads = prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() } : lead
      );
      globalLeads = newLeads;
      return newLeads;
    });
  }, []);

  // Delete a lead
  const deleteLead = useCallback((leadId: string) => {
    setLeads(prev => {
      const newLeads = prev.filter(lead => lead.id !== leadId);
      globalLeads = newLeads;
      return newLeads;
    });
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
