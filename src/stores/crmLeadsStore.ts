import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useCrmLeadsStore = create<CrmLeadsState>()(
  persist(
    (set) => ({
      leads: createInitialLeads(),

      addLead: (lead) =>
        set((state) => ({
          leads: [...state.leads, lead],
        })),

      // NOTE: status changes must go through changeLeadStatus (ID-based) to avoid
      // stale objects accidentally overwriting the current status when saving
      // meetings/contacts/details/notes.
      updateLead: (updatedLead) =>
        set((state) => ({
          leads: state.leads.map((lead) => {
            if (lead.id !== updatedLead.id) return lead;
            return {
              ...lead,
              ...updatedLead,
              status: lead.status,
            };
          }),
        })),

      changeLeadStatus: (leadId, newStatus) =>
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId
              ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
              : lead
          ),
        })),

      deleteLead: (leadId) =>
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== leadId),
        })),
    }),
    {
      name: 'crm-leads-v1',
      version: 1,
      partialize: (state) => ({ leads: state.leads }),
    }
  )
);
