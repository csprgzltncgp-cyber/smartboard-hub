import { CrmLead, LeadStatus } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";

interface OffersTabProps {
  offers: CrmLead[];
  onUpdateLead?: (lead: CrmLead) => void;
  onChangeLeadStatus?: (leadId: string, newStatus: LeadStatus) => void;
  onDeleteLead?: (leadId: string) => void;
}

const OffersTab = ({ offers, onUpdateLead, onChangeLeadStatus, onDeleteLead }: OffersTabProps) => {
  return (
    <div>
      {/* Offers List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {offers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Még nincsenek ajánlatok.
          </div>
        ) : (
          offers.map((offer) => (
            <CrmLeadCard key={offer.id} lead={offer} onUpdate={onUpdateLead} onChangeStatus={onChangeLeadStatus} onDelete={onDeleteLead} />
          ))
        )}
      </div>
    </div>
  );
};

export default OffersTab;
