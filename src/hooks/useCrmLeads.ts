import { useMemo } from "react";
import { useCrmLeadsDb } from "@/hooks/useCrmLeadsDb";

export const useCrmLeads = () => {
  const { 
    leads, 
    leadsList: dbLeadsList, 
    offersList: dbOffersList, 
    dealsList: dbDealsList, 
    signedList: dbSignedList, 
    loading,
    error,
    addLead, 
    updateLead, 
    changeLeadStatus, 
    deleteLead,
    refetch,
  } = useCrmLeadsDb();

  // Include incoming_company in signed list
  const signedList = useMemo(() => 
    leads.filter(lead => lead.status === 'signed' || lead.status === 'incoming_company'), 
    [leads]
  );

  const getLeadsByStatus = (status: string) => leads.filter(lead => lead.status === status);

  return {
    leads,
    leadsList: dbLeadsList,
    offersList: dbOffersList,
    dealsList: dbDealsList,
    signedList,
    loading,
    error,
    addLead,
    updateLead,
    changeLeadStatus,
    deleteLead,
    getLeadsByStatus,
    refetch,
  };
};
