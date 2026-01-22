import { CrmLead } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

interface LeadsTabProps {
  leads: CrmLead[];
}

const LeadsTab = ({ leads }: LeadsTabProps) => {
  return (
    <div>
      {/* Action Bar */}
      <div className="flex gap-2 mb-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
          <Plus className="w-4 h-4 mr-2" />
          New lead
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none p-2">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Leads List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {leads.map((lead) => (
          <CrmLeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
};

export default LeadsTab;
