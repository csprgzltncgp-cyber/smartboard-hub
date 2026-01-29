import { useState } from "react";
import { ChevronDown, ChevronUp, Archive, User, Phone, Mail, MapPin, FileText, CheckCircle2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { OnboardingData, ONBOARDING_STEP_STATUS_LABELS, ONBOARDING_STEP_STATUS_COLORS } from "@/types/onboarding";

interface ArchivedOnboardingPanelProps {
  data: OnboardingData;
}

export const ArchivedOnboardingPanel = ({ data }: ArchivedOnboardingPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isStepsOpen, setIsStepsOpen] = useState(false);

  const completedDate = data.completedAt 
    ? new Date(data.completedAt).toLocaleDateString('hu-HU')
    : 'N/A';

  return (
    <div className="bg-muted/30 border rounded-lg overflow-hidden mt-6">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-cgp-task-completed-purple/10 hover:bg-cgp-task-completed-purple/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Archive className="w-5 h-5 text-cgp-task-completed-purple" />
          <span className="font-medium text-cgp-task-completed-purple">Archivált bevezetés</span>
          <Badge className="bg-cgp-task-completed-purple/20 text-cgp-task-completed-purple text-xs">
            Lezárva: {completedDate}
          </Badge>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t">
          {/* Kapcsolattartók */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setIsContactsOpen(!isContactsOpen)}
              className="w-full flex items-center justify-between px-4 py-2 bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Kapcsolattartók</span>
                <Badge variant="secondary" className="text-xs">{data.contacts.length}</Badge>
              </div>
              {isContactsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isContactsOpen && (
              <div className="p-3 space-y-2 border-t bg-background">
                {data.contacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-lg border text-sm",
                      contact.isPrimary && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      contact.gender === 'female' ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"
                    )}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{contact.name}</span>
                        {contact.isPrimary && (
                          <Badge className="bg-primary/10 text-primary text-xs">Elsődleges</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{contact.title}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {contact.phone}
                          </span>
                        )}
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {contact.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Részletek */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full flex items-center justify-between px-4 py-2 bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Részletek</span>
              </div>
              {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isDetailsOpen && (
              <div className="p-3 border-t bg-background">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.details.map((detail) => (
                    <div key={detail.id} className="space-y-0.5">
                      <Label className="text-xs text-muted-foreground">{detail.label}</Label>
                      <p className="text-sm font-medium">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feljegyzések */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className="w-full flex items-center justify-between px-4 py-2 bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Feljegyzések</span>
                <Badge variant="secondary" className="text-xs">{data.notes.length}</Badge>
              </div>
              {isNotesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isNotesOpen && (
              <div className="p-3 space-y-2 border-t bg-background">
                {data.notes.map((note) => (
                  <div key={note.id} className="p-2 rounded-lg bg-muted/30 border text-sm">
                    <p>{note.content}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{note.createdBy}</span>
                      <span>•</span>
                      <span>{note.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bevezetési lépések */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setIsStepsOpen(!isStepsOpen)}
              className="w-full flex items-center justify-between px-4 py-2 bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cgp-badge-new" />
                <span className="text-sm font-medium">Bevezetési lépések</span>
                <Badge className="bg-cgp-badge-new/20 text-cgp-badge-new text-xs">
                  {data.steps.filter(s => s.status === 'completed').length}/{data.steps.length} kész
                </Badge>
              </div>
              {isStepsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isStepsOpen && (
              <div className="p-3 space-y-1 border-t bg-background">
                {data.steps.map((step) => (
                  <div 
                    key={step.id} 
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg text-sm",
                      step.status === 'completed' && "bg-cgp-badge-new/5"
                    )}
                  >
                    <CheckCircle2 className={cn(
                      "w-4 h-4 flex-shrink-0",
                      step.status === 'completed' ? "text-cgp-badge-new" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "flex-1",
                      step.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                    <Badge className={cn("text-xs", ONBOARDING_STEP_STATUS_COLORS[step.status])}>
                      {ONBOARDING_STEP_STATUS_LABELS[step.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
