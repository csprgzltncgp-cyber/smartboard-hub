import { CrmLead, LeadStatus } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";

interface DealsTabProps {
  deals: CrmLead[];
  onUpdateLead?: (lead: CrmLead) => void;
  onChangeLeadStatus?: (leadId: string, newStatus: LeadStatus) => void;
  onDeleteLead?: (leadId: string) => void;
}

const DealsTab = ({ deals, onUpdateLead, onChangeLeadStatus, onDeleteLead }: DealsTabProps) => {
  return (
    <div>
      {/* Deals List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {deals.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Még nincsenek tárgyalások.
          </div>
        ) : (
          deals.map((deal) => (
            <CrmLeadCard key={deal.id} lead={deal} onUpdate={onUpdateLead} onChangeStatus={onChangeLeadStatus} onDelete={onDeleteLead} />
          ))
        )}
      </div>
    </div>
  );
};

export default DealsTab;
