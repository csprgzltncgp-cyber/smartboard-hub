import { CrmLead, LeadStatus } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";
import { mockColleagues } from "@/data/crmMockData";

interface LeadsTabProps {
  leads: CrmLead[];
  onAddLead?: (lead: CrmLead) => void;
  onUpdateLead?: (lead: CrmLead) => void;
  onChangeLeadStatus?: (leadId: string, newStatus: LeadStatus) => void;
  onDeleteLead?: (leadId: string) => void;
}

const LeadsTab = ({ leads, onAddLead, onUpdateLead, onChangeLeadStatus, onDeleteLead }: LeadsTabProps) => {
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
        headcount: Number.NaN,
        pillars: Number.NaN,
        sessions: Number.NaN,
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
      {/* Action Link */}
      <div className="mb-4">
        <button 
          onClick={handleNewLead}
          className="text-[#007bff] hover:text-[#0056b3] underline font-medium"
        >
          + Új lead
        </button>
      </div>

      {/* Leads List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Még nincsenek leadek. Kattints a "+ Új lead" gombra egy új létrehozásához.
          </div>
        ) : (
          leads.map((lead) => (
            <CrmLeadCard key={lead.id} lead={lead} onUpdate={onUpdateLead} onChangeStatus={onChangeLeadStatus} onDelete={onDeleteLead} />
          ))
        )}
      </div>
    </div>
  );
};

export default LeadsTab;
