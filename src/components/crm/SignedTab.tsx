import { CrmLead } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";

interface SignedTabProps {
  signedLeads: CrmLead[];
  onUpdateLead?: (lead: CrmLead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const SignedTab = ({ signedLeads, onUpdateLead, onDeleteLead }: SignedTabProps) => {
  return (
    <div>
      {/* Signed Leads List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {signedLeads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No signed leads yet.
          </div>
        ) : (
          signedLeads.map((lead) => (
            <CrmLeadCard key={lead.id} lead={lead} onUpdate={onUpdateLead} onDelete={onDeleteLead} />
          ))
        )}
      </div>
    </div>
  );
};

export default SignedTab;
