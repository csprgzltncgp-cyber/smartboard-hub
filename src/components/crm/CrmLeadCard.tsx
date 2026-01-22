import { CrmLead, LeadStatus } from "@/types/crm";
import { ChevronDown, ChevronUp, Trash2, Hourglass, Calculator, Handshake, FileSignature } from "lucide-react";
import { useState } from "react";
import CrmLeadDetails from "./CrmLeadDetails";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Lead status icons matching NewLeadModal
const getLeadStatusIcon = (status: LeadStatus) => {
  switch (status) {
    case 'lead': return Hourglass;
    case 'offer': return Calculator;
    case 'deal': return Handshake;
    case 'signed': return FileSignature;
    default: return Hourglass;
  }
};

const getLeadStatusColor = (status: LeadStatus) => {
  switch (status) {
    case 'lead': return 'bg-blue-500 text-white';
    case 'offer': return 'bg-amber-500 text-white';
    case 'deal': return 'bg-green-500 text-white';
    case 'signed': return 'bg-primary text-primary-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

interface CrmLeadCardProps {
  lead: CrmLead;
  onUpdate?: (lead: CrmLead) => void;
  onDelete?: (leadId: string) => void;
}

const CrmLeadCard = ({ lead, onUpdate, onDelete }: CrmLeadCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = () => {
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
          {/* Lead Status Icon */}
          {(() => {
            const StatusIcon = getLeadStatusIcon(lead.status);
            return (
              <div className={cn("p-1.5 rounded", getLeadStatusColor(lead.status))}>
                <StatusIcon className="w-4 h-4" />
              </div>
            );
          })()}
          
          <span className="font-medium text-foreground">
            {lead.companyName || 'Unnamed Lead'}
          </span>
          <span className="text-muted-foreground">-</span>
          <span className="text-muted-foreground">{lead.assignedTo}</span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
              title="Delete lead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Lead törlése</AlertDialogTitle>
              <AlertDialogDescription>
                Biztosan törölni szeretnéd a "{lead.companyName || 'Unnamed Lead'}" leaded? Ez a művelet nem vonható vissza.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mégse</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Törlés
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
