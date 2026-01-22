import { useMemo } from "react";
import { useCrmLeadsStore } from "@/stores/crmLeadsStore";

export const useCrmLeads = () => {
  const { leads, addLead, updateLead, changeLeadStatus, deleteLead } = useCrmLeadsStore();

  // Memoized filtered lists
  const leadsList = useMemo(() => leads.filter(lead => lead.status === 'lead'), [leads]);
  const offersList = useMemo(() => leads.filter(lead => lead.status === 'offer'), [leads]);
  const dealsList = useMemo(() => leads.filter(lead => lead.status === 'deal'), [leads]);
  const signedList = useMemo(() => leads.filter(lead => lead.status === 'signed' || lead.status === 'incoming_company'), [leads]);

  const getLeadsByStatus = (status: string) => leads.filter(lead => lead.status === status);

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
