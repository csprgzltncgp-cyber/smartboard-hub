import { CrmLead } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignedTabProps {
  signedLeads: CrmLead[];
  onUpdateLead?: (lead: CrmLead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const SignedTab = ({ signedLeads, onUpdateLead, onDeleteLead }: SignedTabProps) => {
  const handleSendToCompanies = (lead: CrmLead, e: React.MouseEvent) => {
    e.stopPropagation();
    // Update lead status to incoming_company
    if (onUpdateLead) {
      onUpdateLead({
        ...lead,
        status: 'incoming_company'
      });
    }
  };

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
            <div key={lead.id} className="relative">
              <CrmLeadCard lead={lead} onUpdate={onUpdateLead} onDelete={onDeleteLead} />
              
              {/* Incoming Company Button - only show for signed status, not incoming_company */}
              {lead.status === 'signed' && (
                <div className="absolute right-16 top-1/2 -translate-y-1/2 z-10">
                  <Button
                    size="sm"
                    onClick={(e) => handleSendToCompanies(lead, e)}
                    className="bg-cgp-teal hover:bg-cgp-teal-hover text-white rounded-xl gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    Incoming company
                  </Button>
                </div>
              )}

              {/* Show Incoming Company badge if already sent */}
              {lead.status === 'incoming_company' && (
                <div className="absolute right-16 top-1/2 -translate-y-1/2 z-10">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-cgp-teal/20 text-cgp-teal rounded-xl text-sm font-medium">
                    <Building2 className="w-4 h-4" />
                    Incoming company
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SignedTab;
