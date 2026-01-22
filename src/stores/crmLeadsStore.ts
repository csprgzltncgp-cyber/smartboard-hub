import { create } from 'zustand';
import { CrmLead, LeadStatus } from "@/types/crm";
import { mockLeads, mockOffers, mockDeals } from "@/data/crmMockData";

// Create initial leads array
const createInitialLeads = (): CrmLead[] => [
  ...mockLeads.map(l => ({ ...l, status: 'lead' as LeadStatus })),
  ...mockOffers.map(l => ({ ...l, status: 'offer' as LeadStatus })),
  ...mockDeals.map(l => ({ ...l, status: 'deal' as LeadStatus })),
];

interface CrmLeadsState {
  leads: CrmLead[];
  addLead: (lead: CrmLead) => void;
  updateLead: (updatedLead: CrmLead) => void;
  changeLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  deleteLead: (leadId: string) => void;
}

export const useCrmLeadsStore = create<CrmLeadsState>((set) => ({
  leads: createInitialLeads(),
  
  addLead: (lead) => set((state) => ({ 
    leads: [...state.leads, lead] 
  })),
  
  updateLead: (updatedLead) => set((state) => ({ 
    leads: state.leads.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    )
  })),
  
  changeLeadStatus: (leadId, newStatus) => set((state) => ({ 
    leads: state.leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() } 
        : lead
    )
  })),
  
  deleteLead: (leadId) => set((state) => ({ 
    leads: state.leads.filter(lead => lead.id !== leadId) 
  })),
}));
