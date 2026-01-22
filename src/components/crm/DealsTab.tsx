import { CrmLead } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface DealsTabProps {
  deals: CrmLead[];
  onUpdateLead?: (lead: CrmLead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const DealsTab = ({ deals, onUpdateLead, onDeleteLead }: DealsTabProps) => {
  return (
    <div>
      {/* Action Bar */}
      <div className="flex gap-2 mb-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Deals List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {deals.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No deals yet.
          </div>
        ) : (
          deals.map((deal) => (
            <CrmLeadCard key={deal.id} lead={deal} onUpdate={onUpdateLead} onDelete={onDeleteLead} />
          ))
        )}
      </div>
    </div>
  );
};

export default DealsTab;
