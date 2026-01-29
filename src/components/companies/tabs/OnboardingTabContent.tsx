import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  User, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  OnboardingStep, 
  OnboardingContact, 
  OnboardingNote, 
  OnboardingDetail,
  OnboardingData,
  DEFAULT_ONBOARDING_STEPS,
  OnboardingStepStatus,
  ONBOARDING_STEP_STATUS_LABELS,
  ONBOARDING_STEP_STATUS_COLORS,
} from "@/types/onboarding";
import { mockIncomingCompany } from "@/data/crmMockData";

interface OnboardingTabContentProps {
  companyId: string;
  onComplete?: (data: OnboardingData) => void;
  /** If true, use empty initial data instead of mock data (for new companies) */
  isEmpty?: boolean;
}

// Empty onboarding data for new companies
const getEmptyOnboardingData = (companyId: string): OnboardingData => {
  return {
    companyId,
    contacts: [],
    details: [],
    notes: [],
    steps: DEFAULT_ONBOARDING_STEPS.map((step, idx) => ({
      ...step,
      id: `step-${idx + 1}`,
      status: 'pending' as OnboardingStepStatus,
    })) as OnboardingStep[],
    isCompleted: false,
  };
};

// Mock data for existing MediaGroup Hungary (demo purposes)
const getMockOnboardingData = (companyId: string): OnboardingData => {
  const crmData = mockIncomingCompany;
  
  return {
    companyId,
    contacts: crmData.contacts.map(c => ({
      id: c.id,
      name: c.name,
      title: c.title,
      gender: c.gender,
      phone: c.phone,
      email: c.email,
      address: c.address,
      isPrimary: c.isPrimary,
    })),
    details: [
      { id: 'd1', label: 'Cégnév', value: crmData.details.name },
      { id: 'd2', label: 'Város', value: crmData.details.city },
      { id: 'd3', label: 'Ország', value: crmData.details.country },
      { id: 'd4', label: 'Iparág', value: crmData.details.industry },
      { id: 'd5', label: 'Létszám', value: String(crmData.details.headcount) },
      { id: 'd6', label: 'Pillérek', value: String(crmData.details.pillars) },
      { id: 'd7', label: 'Alkalmak', value: String(crmData.details.sessions) },
      ...crmData.customDetails.map(cd => ({
        id: cd.id,
        label: cd.label,
        value: cd.value,
      })),
    ],
    notes: crmData.notes.map(n => ({
      id: n.id,
      content: n.content,
      createdAt: n.createdAt,
      createdBy: n.createdBy,
    })),
    steps: DEFAULT_ONBOARDING_STEPS.map((step, idx) => ({
      ...step,
      id: `step-${idx + 1}`,
      // Mock: first 3 steps completed, 4th in progress
      status: idx < 3 ? 'completed' : idx === 3 ? 'in_progress' : 'pending',
      completedAt: idx < 3 ? '2024-12-15' : undefined,
    })) as OnboardingStep[],
    isCompleted: false,
  };
};

export const OnboardingTabContent = ({ companyId, onComplete, isEmpty = false }: OnboardingTabContentProps) => {
  const [data, setData] = useState<OnboardingData>(() => 
    isEmpty ? getEmptyOnboardingData(companyId) : getMockOnboardingData(companyId)
  );
  const [isContactsOpen, setIsContactsOpen] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isStepsOpen, setIsStepsOpen] = useState(true);
  
  // Dialog states
  const [addStepDialogOpen, setAddStepDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");
  const [newStepDueDate, setNewStepDueDate] = useState("");
  
  const completedStepsCount = data.steps.filter(s => s.status === 'completed').length;
  const totalStepsCount = data.steps.length;
  const progressPercent = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

  const toggleStepStatus = (stepId: string) => {
    setData(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.id !== stepId) return step;
        
        const nextStatus: OnboardingStepStatus = 
          step.status === 'pending' ? 'in_progress' :
          step.status === 'in_progress' ? 'completed' : 'pending';
        
        return {
          ...step,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
        };
      }),
    }));
  };

  const addStep = () => {
    if (!newStepTitle.trim()) return;
    
    const newStep: OnboardingStep = {
      id: `step-${Date.now()}`,
      title: newStepTitle.trim(),
      description: newStepDescription.trim() || undefined,
      status: 'pending',
      dueDate: newStepDueDate || undefined,
      order: data.steps.length + 1,
    };
    
    setData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    
    setNewStepTitle("");
    setNewStepDescription("");
    setNewStepDueDate("");
    setAddStepDialogOpen(false);
  };

  const removeStep = (stepId: string) => {
    setData(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId),
    }));
  };

  const handleOnboardingButtonClick = () => {
    if (progressPercent < 100) {
      setConfirmDialogOpen(true);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handleCompleteOnboarding = () => {
    const completedData: OnboardingData = {
      ...data,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    onComplete?.(completedData);
    setConfirmDialogOpen(false);
  };

  const getStatusIcon = (status: OnboardingStepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-cgp-badge-new" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-cgp-badge-lastday" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between bg-[#91b752]/10 rounded-lg p-4">
        <div>
          <h3 className="font-semibold text-lg">Bevezetési folyamat</h3>
          <p className="text-sm text-muted-foreground">
            {completedStepsCount} / {totalStepsCount} lépés kész ({progressPercent}%)
          </p>
        </div>
        <Button 
          type="button"
          onClick={handleOnboardingButtonClick}
          className="bg-[hsl(21,82%,55%)] text-white px-5 py-2 rounded-xl font-medium hover:bg-[hsl(21,82%,48%)] hover:shadow-md active:translate-y-px transition-all"
        >
          <CheckCheck className="w-4 h-4 mr-2" />
          Bevezetés kész
        </Button>
      </div>

      {/* =========== CRM DATA SECTION =========== */}
      <div className="bg-muted/30 border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b">
          <h4 className="font-medium text-primary">CRM-ből átvett adatok</h4>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Kapcsolattartók */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setIsContactsOpen(!isContactsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">Kapcsolattartók</span>
                <Badge variant="secondary" className="text-xs">{data.contacts.length}</Badge>
              </div>
              {isContactsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isContactsOpen && (
              <div className="p-4 space-y-3 border-t bg-background">
                {data.contacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className={cn(
                      "flex items-start gap-4 p-3 rounded-lg border",
                      contact.isPrimary && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      contact.gender === 'female' ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"
                    )}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{contact.name}</span>
                        {contact.isPrimary && (
                          <Badge className="bg-primary/10 text-primary text-xs">Elsődleges</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.title}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                        {contact.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {contact.address}
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
              className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">Részletek</span>
              </div>
              {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isDetailsOpen && (
              <div className="p-4 border-t bg-background">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {data.details.map((detail) => (
                    <div key={detail.id} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{detail.label}</Label>
                      <p className="font-medium">{detail.value}</p>
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
              className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">Feljegyzések</span>
                <Badge variant="secondary" className="text-xs">{data.notes.length}</Badge>
              </div>
              {isNotesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isNotesOpen && (
              <div className="p-4 space-y-3 border-t bg-background">
                {data.notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg bg-muted/30 border">
                    <p className="text-sm">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{note.createdBy}</span>
                      <span>•</span>
                      <span>{note.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========== ONBOARDING STEPS SECTION =========== */}
      <div className="bg-muted/30 border rounded-lg overflow-hidden">
        <div className="bg-[#91b752]/20 px-4 py-3 border-b flex items-center justify-between">
          <h4 className="font-medium text-[#5d7a2a]">Bevezetési lépések</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddStepDialogOpen(true)}
            className="h-8 border-[#91b752] text-[#5d7a2a] hover:bg-[#91b752]/10"
          >
            <Plus className="w-4 h-4 mr-1" />
            Új lépés
          </Button>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            {data.steps.map((step, idx) => (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                  step.status === 'completed' && "bg-cgp-badge-new/5 border-cgp-badge-new/30",
                  step.status === 'in_progress' && "bg-cgp-badge-lastday/5 border-cgp-badge-lastday/30",
                  step.status === 'pending' && "bg-background hover:bg-muted/30"
                )}
              >
                {/* Status indicator / checkbox */}
                <button
                  type="button"
                  onClick={() => toggleStepStatus(step.id)}
                  className="flex-shrink-0 hover:scale-110 transition-transform"
                >
                  {getStatusIcon(step.status)}
                </button>
                
                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium",
                      step.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                    <Badge className={cn("text-xs", ONBOARDING_STEP_STATUS_COLORS[step.status])}>
                      {ONBOARDING_STEP_STATUS_LABELS[step.status]}
                    </Badge>
                  </div>
                  {step.description && (
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  )}
                  {step.completedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Kész: {step.completedAt}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive/70 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Step Dialog */}
      <Dialog open={addStepDialogOpen} onOpenChange={setAddStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Új bevezetési lépés
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="step-title">Lépés neve *</Label>
              <Input
                id="step-title"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                placeholder="pl. Orientáció onsite 4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-desc">Leírás</Label>
              <Textarea
                id="step-desc"
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
                placeholder="Opcionális leírás..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-due">Határidő</Label>
              <Input
                id="step-due"
                type="date"
                value={newStepDueDate}
                onChange={(e) => setNewStepDueDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddStepDialogOpen(false)}>
                Mégse
              </Button>
              <Button type="button" onClick={addStep} disabled={!newStepTitle.trim()}>
                Hozzáadás
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm incomplete onboarding dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bevezetés lezárása</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Még nem fejeztél be minden lépést ({completedStepsCount} / {totalStepsCount}). 
              Biztosan le akarod zárni a bevezetést?
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Mégse
              </Button>
              <Button 
                type="button" 
                onClick={handleCompleteOnboarding}
                className="bg-[hsl(21,82%,55%)] text-white hover:bg-[hsl(21,82%,48%)]"
              >
                Igen, lezárom
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
