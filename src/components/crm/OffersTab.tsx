import { CrmLead } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface OffersTabProps {
  offers: CrmLead[];
  onUpdateLead?: (lead: CrmLead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const OffersTab = ({ offers, onUpdateLead, onDeleteLead }: OffersTabProps) => {
  return (
    <div>
      {/* Action Bar */}
      <div className="flex gap-2 mb-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

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
