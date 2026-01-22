import { CrmLead } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";

interface OffersTabProps {
  offers: CrmLead[];
  onUpdateLead?: (lead: CrmLead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const OffersTab = ({ offers, onUpdateLead, onDeleteLead }: OffersTabProps) => {
  return (
    <div>
      {/* Offers List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {offers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No offers yet.
          </div>
        ) : (
          offers.map((offer) => (
            <CrmLeadCard key={offer.id} lead={offer} onUpdate={onUpdateLead} onDelete={onDeleteLead} />
          ))
        )}
      </div>
    </div>
  );
};

export default OffersTab;
