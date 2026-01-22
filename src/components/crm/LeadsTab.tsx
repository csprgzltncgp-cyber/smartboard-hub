import { useState } from "react";
import { CrmLead } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockColleagues } from "@/data/crmMockData";

interface LeadsTabProps {
  leads: CrmLead[];
  onAddLead?: (lead: CrmLead) => void;
  onUpdateLead?: (lead: CrmLead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const LeadsTab = ({ leads, onAddLead, onUpdateLead, onDeleteLead }: LeadsTabProps) => {
  const handleNewLead = () => {
    const newLead: CrmLead = {
      id: `lead-${Date.now()}`,
      companyName: '',
      assignedTo: mockColleagues[0]?.name || 'Unassigned',
      assignedToId: mockColleagues[0]?.id || '',
      status: 'lead',
      progress: 0,
      contacts: [],
      meetings: [],
      details: {
        name: '',
        city: '',
        country: '',
        industry: '',
        // Use NaN to represent “no value” for numeric fields so we don't show a default 0
        headcount: Number.NaN,
        pillars: 0,
        sessions: 0,
      },
      customDetails: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onAddLead?.(newLead);
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={handleNewLead}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          New lead
        </Button>
      </div>

      {/* Leads List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No leads yet. Click "New lead" to create one.
          </div>
        ) : (
          leads.map((lead) => (
            <CrmLeadCard key={lead.id} lead={lead} onUpdate={onUpdateLead} onDelete={onDeleteLead} />
          ))
        )}
      </div>
    </div>
  );
};

export default LeadsTab;
