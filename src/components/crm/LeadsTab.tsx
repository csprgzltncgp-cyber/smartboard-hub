import { useState } from "react";
import { CrmLead } from "@/types/crm";
import CrmLeadCard from "./CrmLeadCard";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import NewLeadModal from "./NewLeadModal";

interface LeadsTabProps {
  leads: CrmLead[];
  onAddLead?: (lead: CrmLead) => void;
  onUpdateLead?: (lead: CrmLead) => void;
}

const LeadsTab = ({ leads, onAddLead, onUpdateLead }: LeadsTabProps) => {
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  const handleAddLead = (lead: CrmLead) => {
    onAddLead?.(lead);
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={() => setShowNewLeadModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          New lead
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none p-2">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Leads List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No leads yet. Click "New lead" to create one.
          </div>
        ) : (
          leads.map((lead) => (
            <CrmLeadCard key={lead.id} lead={lead} onUpdate={onUpdateLead} />
          ))
        )}
      </div>

      {/* New Lead Modal */}
      <NewLeadModal
        open={showNewLeadModal}
        onOpenChange={setShowNewLeadModal}
        onSubmit={handleAddLead}
        mode="create"
      />
    </div>
  );
};

export default LeadsTab;
