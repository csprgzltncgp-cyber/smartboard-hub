import { CrmLead } from "@/types/crm";
import CrmProgressBar from "./CrmProgressBar";
import { ChevronDown, ChevronUp, Bell, VolumeX } from "lucide-react";
import { useState } from "react";
import CrmLeadDetails from "./CrmLeadDetails";

interface CrmLeadCardProps {
  lead: CrmLead;
  onUpdate?: (lead: CrmLead) => void;
}

const CrmLeadCard = ({ lead, onUpdate }: CrmLeadCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-border">
      {/* Header Row */}
      <div 
        className="flex items-center gap-4 py-3 px-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 flex items-center gap-3">
          <span className="font-medium text-foreground">
            {lead.companyName}
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

        <CrmProgressBar progress={lead.progress} className="w-[300px]" />

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
