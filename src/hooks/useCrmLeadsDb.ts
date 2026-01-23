import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CrmLead, LeadStatus, CrmContact, CrmMeeting, CrmCompanyDetails, CrmNote, CrmDetail } from '@/types/crm';
import { mockLeads, mockOffers, mockDeals } from '@/data/crmMockData';
import { Json } from '@/integrations/supabase/types';

// Map database row to CrmLead type
const mapDbRowToLead = (row: any): CrmLead => {
  const details = row.details as any;
  return {
    id: row.id,
    companyName: row.company_name,
    assignedTo: details?.assignedTo || '',
    assignedToId: details?.assignedToId || '',
    status: row.status as LeadStatus,
    progress: details?.progress || 0,
    contacts: (row.contacts || []) as CrmContact[],
    meetings: (row.meetings || []) as CrmMeeting[],
    details: (details?.companyDetails || {
      name: row.company_name,
      city: '',
      country: '',
      industry: '',
      headcount: 0,
      pillars: 0,
      sessions: 0,
    }) as CrmCompanyDetails,
    customDetails: (details?.customDetails || []) as CrmDetail[],
    notes: row.notes ? [{ id: '1', content: row.notes, createdAt: row.created_at, createdBy: 'System' }] : [],
    hasAlert: details?.hasAlert || false,
    isMuted: details?.isMuted || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Map CrmLead to database row format
const mapLeadToDbRow = (lead: CrmLead) => ({
  id: lead.id,
  company_name: lead.companyName,
  contact_name: lead.contacts?.[0]?.name || null,
  email: lead.contacts?.[0]?.email || null,
  phone: lead.contacts?.[0]?.phone || null,
  status: lead.status,
  notes: lead.notes?.[0]?.content || null,
  details: JSON.parse(JSON.stringify({
    assignedTo: lead.assignedTo,
    assignedToId: lead.assignedToId,
    progress: lead.progress,
    companyDetails: lead.details,
    customDetails: lead.customDetails,
    hasAlert: lead.hasAlert,
    isMuted: lead.isMuted,
  })) as Json,
  contacts: JSON.parse(JSON.stringify(lead.contacts)) as Json,
  meetings: JSON.parse(JSON.stringify(lead.meetings)) as Json,
});

// Migrate localStorage data to database
const migrateLocalStorageToDb = async () => {
  const STORAGE_KEY = 'crm-leads-v1';
  const migrationKey = 'crm-leads-migrated-to-db';
  
  // Check if already migrated
  if (localStorage.getItem(migrationKey)) {
    return;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const leads = parsed.state?.leads || [];
      
      if (leads.length > 0) {
        console.log('[CRM] Migrating', leads.length, 'leads from localStorage to database...');
        
        // Check if database is empty
        const { data: existing } = await supabase.from('crm_leads').select('id').limit(1);
        
        if (!existing || existing.length === 0) {
          // Insert leads one by one to handle any errors gracefully
          for (const lead of leads) {
            const dbRow = mapLeadToDbRow(lead);
            await supabase.from('crm_leads').upsert(dbRow);
          }
          console.log('[CRM] Migration complete!');
        }
      }
    }
    
    // Mark as migrated
    localStorage.setItem(migrationKey, 'true');
  } catch (e) {
    console.error('[CRM] Migration failed:', e);
  }
};

// Seed initial mock data if database is empty
const seedInitialData = async () => {
  const seedKey = 'crm-leads-seeded';
  
  if (localStorage.getItem(seedKey)) {
    return;
  }
  
  try {
    const { data: existing } = await supabase.from('crm_leads').select('id').limit(1);
    
    if (!existing || existing.length === 0) {
      console.log('[CRM] Seeding initial mock data...');
      
      const allMockLeads = [
        ...mockLeads.map(l => ({ ...l, status: 'lead' as LeadStatus })),
        ...mockOffers.map(l => ({ ...l, status: 'offer' as LeadStatus })),
        ...mockDeals.map(l => ({ ...l, status: 'deal' as LeadStatus })),
      ];
      
      for (const lead of allMockLeads) {
        const dbRow = mapLeadToDbRow(lead);
        await supabase.from('crm_leads').upsert(dbRow);
      }
      
      console.log('[CRM] Seeding complete!');
    }
    
    localStorage.setItem(seedKey, 'true');
  } catch (e) {
    console.error('[CRM] Seeding failed:', e);
  }
};

export const useCrmLeadsDb = () => {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all leads from database
  const fetchLeads = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('crm_leads')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      const mappedLeads = (data || []).map(mapDbRowToLead);
      setLeads(mappedLeads);
      setError(null);
    } catch (e: any) {
      console.error('[CRM] Failed to fetch leads:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize: migrate localStorage data and fetch leads
  useEffect(() => {
    const init = async () => {
      await migrateLocalStorageToDb();
      await seedInitialData();
      await fetchLeads();
    };
    init();
  }, [fetchLeads]);

  // Filter leads by status
  const leadsList = leads.filter(l => l.status === 'lead');
  const offersList = leads.filter(l => l.status === 'offer');
  const dealsList = leads.filter(l => l.status === 'deal');
  const signedList = leads.filter(l => l.status === 'signed');

  // Add new lead
  const addLead = useCallback(async (lead: CrmLead) => {
    try {
      const dbRow = mapLeadToDbRow(lead);
      const { error: insertError } = await supabase.from('crm_leads').insert(dbRow);
      
      if (insertError) throw insertError;
      
      setLeads(prev => [...prev, lead]);
    } catch (e: any) {
      console.error('[CRM] Failed to add lead:', e);
      setError(e.message);
    }
  }, []);

  // Update lead (preserves status)
  const updateLead = useCallback(async (updatedLead: CrmLead) => {
    try {
      // Get current status from state to preserve it
      const currentLead = leads.find(l => l.id === updatedLead.id);
      const leadToSave = {
        ...updatedLead,
        status: currentLead?.status || updatedLead.status,
      };
      
      const dbRow = mapLeadToDbRow(leadToSave);
      const { error: updateError } = await supabase
        .from('crm_leads')
        .update(dbRow)
        .eq('id', updatedLead.id);
      
      if (updateError) throw updateError;
      
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? leadToSave : l));
    } catch (e: any) {
      console.error('[CRM] Failed to update lead:', e);
      setError(e.message);
    }
  }, [leads]);

  // Change lead status (move between tabs)
  const changeLeadStatus = useCallback(async (leadId: string, newStatus: LeadStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('crm_leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);
      
      if (updateError) throw updateError;
      
      setLeads(prev => prev.map(l => 
        l.id === leadId 
          ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } 
          : l
      ));
    } catch (e: any) {
      console.error('[CRM] Failed to change lead status:', e);
      setError(e.message);
    }
  }, []);

  // Delete lead
  const deleteLead = useCallback(async (leadId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', leadId);
      
      if (deleteError) throw deleteError;
      
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (e: any) {
      console.error('[CRM] Failed to delete lead:', e);
      setError(e.message);
    }
  }, []);

  return {
    leads,
    leadsList,
    offersList,
    dealsList,
    signedList,
    loading,
    error,
    addLead,
    updateLead,
    changeLeadStatus,
    deleteLead,
    refetch: fetchLeads,
  };
};
