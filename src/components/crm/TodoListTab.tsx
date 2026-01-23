import { CrmLead, CrmMeeting } from "@/types/crm";
import { Mail, Video, Phone, Users, MessageSquare, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCrmLeads } from "@/hooks/useCrmLeads";

// Extract scheduled meetings from all leads
interface TodoItem {
  id: string;
  leadId: string;
  meeting: CrmMeeting;
  lead: CrmLead;
}

const getContactTypeIcon = (type: string) => {
  switch (type) {
    case 'email': return Mail;
    case 'video': return Video;
    case 'phone': return Phone;
    case 'personal':
    case 'in_person': return Users;
    default: return MessageSquare;
  }
};

const TodoListTab = () => {
  const { leads } = useCrmLeads();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Build todo items from all leads' scheduled meetings
  const todoItems: TodoItem[] = leads.flatMap(lead => 
    lead.meetings
      .filter(m => m.status === 'scheduled' || !m.status)
      .map(meeting => ({
        id: `${lead.id}-${meeting.id}`,
        leadId: lead.id,
        meeting,
        lead,
      }))
  ).sort((a, b) => {
    // Sort by date (closest first)
    const dateA = a.meeting.date.replace(/\./g, '-');
    const dateB = b.meeting.date.replace(/\./g, '-');
    return dateA.localeCompare(dateB);
  });

  if (todoItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Nincsenek ütemezett találkozók</p>
        <p className="text-sm mt-2">A lead kártyákon a "Találkozó" gombbal vehetsz fel új találkozókat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todoItems.map((item, index) => {
        const ContactIcon = getContactTypeIcon(item.meeting.contactType);
        const isExpanded = expandedId === item.id;
        const primaryContact = item.lead.contacts?.find(c => c.isPrimary) || item.lead.contacts?.[0];

        return (
          <div 
            key={item.id} 
            className={cn(
              "border border-border rounded-lg overflow-hidden transition-all",
              isExpanded && "ring-2 ring-primary/30"
            )}
          >
            {/* Summary Row - Table-like layout */}
            <div 
              className={cn(
                "flex items-center cursor-pointer transition-colors",
                isExpanded ? "bg-primary/10" : "bg-card hover:bg-muted/30"
              )}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
            >
              {/* Icon - dark green box only, no faded background */}
              <div className="w-12 flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <ContactIcon className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              {/* Content Grid */}
              <div className="flex-1 grid grid-cols-5 gap-2 px-4 py-3 text-sm">
                {/* Next contact */}
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">Következő kapcsolat</span>
                  <span className="font-medium text-foreground">
                    {item.meeting.date} - {item.meeting.time}
                  </span>
                </div>
                
                {/* Contact name */}
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">Kapcsolattartó</span>
                  <span className="font-medium text-foreground">{item.meeting.contactName}</span>
                </div>
                
                {/* Title */}
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">Pozíció</span>
                  <span className="text-foreground">{item.meeting.contactTitle}</span>
                </div>
                
                {/* Company */}
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">Cég</span>
                  <span className="font-medium text-foreground">{item.lead.companyName}</span>
                </div>
                
                {/* Expand arrow */}
                <div className="flex items-center justify-end">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details - 2 rows, 4 columns each */}
            {isExpanded && (
              <div className="bg-muted/20 border-t border-border">
                {/* Details Grid Row 1 */}
                <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
                  <div className="px-4 py-3">
                    <span className="text-xs text-muted-foreground uppercase block">Ország</span>
                    <span className="text-sm font-medium">{item.lead.details?.country || 'Hungary'}</span>
                  </div>
                  <div className="px-4 py-3">
                    <span className="text-xs text-muted-foreground uppercase block">Város</span>
                    <span className="text-sm font-medium">{item.lead.details?.city || '-'}</span>
                  </div>
                  <div className="px-4 py-3">
                    <span className="text-xs text-muted-foreground uppercase block">Telefon</span>
                    <span className="text-sm font-medium">{primaryContact?.phone || '-'}</span>
                  </div>
                  <div className="px-4 py-3">
                    <span className="text-xs text-muted-foreground uppercase block">Email</span>
                    <span className="text-sm font-medium truncate block">{primaryContact?.email || '-'}</span>
                  </div>
                </div>

                {/* Details Grid Row 2 */}
                <div className="grid grid-cols-4 divide-x divide-border">
                  <div className="px-4 py-3">
                    <span className="text-xs text-muted-foreground uppercase block">CGP felelős</span>
                    <span className="text-sm font-medium">{item.lead.assignedTo}</span>
                  </div>
                  <div className="px-4 py-3">
                    <span className="text-xs text-muted-foreground uppercase block">Szolgáltatás</span>
                    <span className="text-sm font-medium">
                      {item.meeting.pillars} PILL / {item.meeting.sessions} SESS
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <span className="text-xs text-muted-foreground uppercase block">Iparág</span>
                    <span className="text-sm font-medium">{item.lead.details?.industry || '-'}</span>
                  </div>
                  <div className="px-4 py-3">
                    <span className="text-xs text-muted-foreground uppercase block">Létszám</span>
                    <span className="text-sm font-medium">
                      {item.lead.details?.headcount?.toLocaleString() || '-'} fő
                    </span>
                  </div>
                </div>

                {/* Note if exists */}
                {item.meeting.note && (
                  <div className="px-4 py-3 border-t border-border bg-muted/10">
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Megjegyzés</span>
                    <p className="text-sm">{item.meeting.note}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TodoListTab;
