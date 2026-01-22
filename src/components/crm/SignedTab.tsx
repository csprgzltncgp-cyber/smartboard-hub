import { CrmLead, LeadStatus } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";

interface SignedTabProps {
  signedLeads: CrmLead[];
  onUpdateLead?: (lead: CrmLead) => void;
  onChangeLeadStatus?: (leadId: string, newStatus: LeadStatus) => void;
  onDeleteLead?: (leadId: string) => void;
}

const SignedTab = ({ signedLeads, onUpdateLead, onChangeLeadStatus, onDeleteLead }: SignedTabProps) => {
  return (
    <div>
      {/* Signed Leads List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {signedLeads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Még nincsenek aláírt szerződések.
          </div>
        ) : (
          signedLeads.map((lead) => (
            <CrmLeadCard key={lead.id} lead={lead} onUpdate={onUpdateLead} onChangeStatus={onChangeLeadStatus} onDelete={onDeleteLead} />
          ))
        )}
      </div>
    </div>
  );
};

export default SignedTab;
