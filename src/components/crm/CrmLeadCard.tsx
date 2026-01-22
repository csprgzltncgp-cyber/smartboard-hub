import { CrmLead } from "@/types/crm";
import { ChevronDown, ChevronUp, Bell, VolumeX, X } from "lucide-react";
import { useState } from "react";
import CrmLeadDetails from "./CrmLeadDetails";

interface CrmLeadCardProps {
  lead: CrmLead;
  onUpdate?: (lead: CrmLead) => void;
  onDelete?: (leadId: string) => void;
}

const CrmLeadCard = ({ lead, onUpdate, onDelete }: CrmLeadCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(lead.id);
  };

  return (
    <div className="border-b border-border">
      {/* Header Row */}
      <div 
        className="flex items-center gap-4 py-3 px-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 flex items-center gap-3">
          <span className="font-medium text-foreground">
            {lead.companyName || 'Unnamed Lead'}
          </span>
          <span className="text-muted-foreground">-</span>
          <span className="text-muted-foreground">{lead.assignedTo}</span>
          
          {/* Status Icons */}
          {lead.isMuted && (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          )}
          {lead.hasAlert && (
            <Bell className="w-4 h-4 text-destructive" />
          )}
        </div>

        <button 
          onClick={handleDelete}
          className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
          title="Delete lead"
        >
          <X className="w-4 h-4" />
        </button>

        <button className="p-1 hover:bg-muted rounded">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && <CrmLeadDetails lead={lead} onUpdate={onUpdate} />}
    </div>
  );
};

export default CrmLeadCard;
