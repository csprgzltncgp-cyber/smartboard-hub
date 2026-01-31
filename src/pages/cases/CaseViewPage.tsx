import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Mail, AlertTriangle, Plus, Trash2, Save, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Case, 
  CaseValue, 
  CaseConsultation, 
  CASE_STATUS_LABELS, 
  CASE_EXPERT_STATUS_VALUES,
  getCaseWarnings,
  calculateCasePercentage 
} from "@/types/case";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Input field types based on Laravel CaseInput model
interface CaseInputField {
  id: number;
  name: string;
  type: 'text' | 'select' | 'date' | 'integer' | 'textarea';
  defaultType: string;
  values?: { id: number; value: string; translation: string }[];
  isEditable: boolean;
}

// Mock input fields based on Laravel
const MOCK_INPUT_FIELDS: CaseInputField[] = [
  { id: 1, name: 'Eset létrehozásának ideje', type: 'date', defaultType: 'case_creation_time', isEditable: true },
  { id: 2, name: 'Kliens neve', type: 'text', defaultType: 'client_name', isEditable: true },
  { id: 3, name: 'Esettípus', type: 'select', defaultType: 'case_type', isEditable: false, values: [
    { id: 1, value: '1', translation: 'Pszichológiai tanácsadás' },
    { id: 2, value: '2', translation: 'Jogi tanácsadás' },
    { id: 3, value: '3', translation: 'Pénzügyi tanácsadás' },
    { id: 4, value: '4', translation: 'Egyéb' },
    { id: 5, value: '5', translation: 'Munkajogi' },
  ]},
  { id: 4, name: 'Specializáció', type: 'select', defaultType: 'case_specialization', isEditable: false, values: [
    { id: 1, value: '1', translation: 'Szorongás' },
    { id: 2, value: '2', translation: 'Depresszió' },
    { id: 3, value: '3', translation: 'Kapcsolati problémák' },
  ]},
  { id: 5, name: 'Helyszín', type: 'select', defaultType: 'location', isEditable: false, values: [
    { id: 1, value: '1', translation: 'Budapest' },
    { id: 2, value: '2', translation: 'Debrecen' },
    { id: 3, value: '3', translation: 'Szeged' },
  ]},
  { id: 6, name: 'Kért tanácsadás nyelve', type: 'select', defaultType: 'case_language_skill', isEditable: false, values: [
    { id: 1, value: '1', translation: 'Magyar' },
    { id: 2, value: '2', translation: 'Angol' },
    { id: 3, value: '3', translation: 'Német' },
  ]},
  { id: 7, name: 'Kliens nyelve', type: 'select', defaultType: 'clients_language', isEditable: true, values: [
    { id: 1, value: '1', translation: 'Magyar' },
    { id: 2, value: '2', translation: 'Angol' },
    { id: 3, value: '3', translation: 'Német' },
  ]},
  { id: 8, name: 'Telefon', type: 'text', defaultType: 'phone', isEditable: true },
  { id: 9, name: 'Email', type: 'text', defaultType: 'email', isEditable: true },
  { id: 10, name: 'Problémaleírás', type: 'textarea', defaultType: 'presenting_concern', isEditable: true },
  { id: 11, name: 'Krízishelyzet', type: 'select', defaultType: 'is_crisis', isEditable: true, values: [
    { id: 1, value: 'igen', translation: 'Igen' },
    { id: 2, value: 'nem', translation: 'Nem' },
  ]},
];

// Mock case data generator
function generateMockCaseData(caseId: string): Case {
  const statuses: Array<Case['status']> = ['opened', 'assigned_to_expert', 'employee_contacted'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const hasExpert = Math.random() > 0.2;
  
  const daysAgo = Math.floor(Math.random() * 30);
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  
  const caseData: Case = {
    id: caseId,
    caseIdentifier: `CGP-HU-2024-${caseId.split('-').pop()?.padStart(5, '0') || '00001'}`,
    status,
    companyId: 'company-1',
    companyName: 'ABC Kft.',
    countryId: 'hu',
    countryCode: 'HU',
    createdBy: 'operator-1',
    operatorName: 'Kiss Péter',
    employeeContactedAt: status === 'employee_contacted' ? new Date(Date.now() - (daysAgo - 2) * 24 * 60 * 60 * 1000).toISOString() : undefined,
    createdAt,
    updatedAt: createdAt,
    percentage: 0,
    values: [
      { id: 'v1', caseId, caseInputId: 1, value: createdAt.split('T')[0], createdAt, updatedAt: createdAt },
      { id: 'v2', caseId, caseInputId: 2, value: 'Minta Kliens', createdAt, updatedAt: createdAt },
      { id: 'v3', caseId, caseInputId: 3, value: '1', createdAt, updatedAt: createdAt },
      { id: 'v4', caseId, caseInputId: 4, value: '1', createdAt, updatedAt: createdAt },
      { id: 'v5', caseId, caseInputId: 5, value: '1', createdAt, updatedAt: createdAt },
      { id: 'v6', caseId, caseInputId: 6, value: '1', createdAt, updatedAt: createdAt },
      { id: 'v7', caseId, caseInputId: 7, value: '1', createdAt, updatedAt: createdAt },
      { id: 'v8', caseId, caseInputId: 8, value: '+36 30 123 4567', createdAt, updatedAt: createdAt },
      { id: 'v9', caseId, caseInputId: 9, value: 'kliens@example.com', createdAt, updatedAt: createdAt },
      { id: 'v10', caseId, caseInputId: 10, value: 'Szorongás a munkahelyen, koncentrációs problémák.', createdAt, updatedAt: createdAt },
      { id: 'v11', caseId, caseInputId: 11, value: 'nem', createdAt, updatedAt: createdAt },
    ],
    experts: hasExpert ? [
      { 
        id: '1', 
        name: 'Dr. Kovács Anna', 
        email: 'kovacs.anna@example.com',
        accepted: Math.random() > 0.3 ? 1 : -1,
        createdAt: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString()
      }
    ] : [],
    consultations: status === 'employee_contacted' ? [
      { 
        id: 'consult-1', 
        caseId, 
        permissionId: 1, 
        minuteLength: 50,
        createdAt: new Date(Date.now() - (daysAgo - 3) * 24 * 60 * 60 * 1000).toISOString()
      }
    ] : [],
    caseType: 1,
    clientName: 'Minta Kliens',
    date: createdAt.split('T')[0],
  };
  
  caseData.percentage = calculateCasePercentage(caseData);
  return caseData;
}

// Available experts for assignment
const MOCK_AVAILABLE_EXPERTS = [
  { id: '1', name: 'Dr. Kovács Anna', email: 'kovacs.anna@example.com' },
  { id: '2', name: 'Dr. Nagy Béla', email: 'nagy.bela@example.com' },
  { id: '3', name: 'Dr. Szabó Katalin', email: 'szabo.katalin@example.com' },
  { id: '4', name: 'Dr. Tóth Péter', email: 'toth.peter@example.com' },
];

export default function CaseViewPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingInputId, setEditingInputId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isExpertDialogOpen, setIsExpertDialogOpen] = useState(false);
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedExpert, setSelectedExpert] = useState<string>('');
  const [consultationDate, setConsultationDate] = useState<string>('');
  
  useEffect(() => {
    if (caseId) {
      // Simulate loading case data
      setIsLoading(true);
      setTimeout(() => {
        const data = generateMockCaseData(caseId);
        setCaseData(data);
        setSelectedStatus(data.status);
        setIsLoading(false);
      }, 300);
    }
  }, [caseId]);

  const getInputValue = (inputId: number): string => {
    const value = caseData?.values.find(v => v.caseInputId === inputId);
    return value?.value || '';
  };

  const getInputDisplayValue = (inputId: number): string => {
    const value = getInputValue(inputId);
    const field = MOCK_INPUT_FIELDS.find(f => f.id === inputId);
    
    if (field?.type === 'select' && field.values) {
      const option = field.values.find(v => v.value === value || v.id.toString() === value);
      return option?.translation || value;
    }
    
    return value;
  };

  const handleEditInput = (inputId: number) => {
    setEditingInputId(inputId);
    setEditValue(getInputValue(inputId));
  };

  const handleSaveInput = (inputId: number) => {
    if (!caseData) return;
    
    setCaseData(prev => {
      if (!prev) return prev;
      
      const newValues = prev.values.map(v => {
        if (v.caseInputId === inputId) {
          return { ...v, value: editValue, updatedAt: new Date().toISOString() };
        }
        return v;
      });
      
      return { ...prev, values: newValues };
    });
    
    setEditingInputId(null);
    toast.success('Mező sikeresen mentve!');
  };

  const handleStatusChange = () => {
    if (!caseData) return;
    
    setCaseData(prev => {
      if (!prev) return prev;
      return { ...prev, status: selectedStatus as Case['status'] };
    });
    
    setIsStatusDialogOpen(false);
    toast.success('Státusz sikeresen módosítva!');
  };

  const handleAssignExpert = () => {
    if (!caseData || !selectedExpert) return;
    
    const expert = MOCK_AVAILABLE_EXPERTS.find(e => e.id === selectedExpert);
    if (!expert) return;
    
    setCaseData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        experts: [
          ...prev.experts,
          {
            id: expert.id,
            name: expert.name,
            email: expert.email,
            accepted: -1, // Assigned, waiting for response
            createdAt: new Date().toISOString(),
          }
        ]
      };
    });
    
    setIsExpertDialogOpen(false);
    setSelectedExpert('');
    toast.success(`Szakértő (${expert.name}) sikeresen kiközvetítve!`);
  };

  const handleAddConsultation = () => {
    if (!caseData || !consultationDate) return;
    
    const newConsultation: CaseConsultation = {
      id: `consult-${Date.now()}`,
      caseId: caseData.id,
      permissionId: caseData.caseType || 1,
      minuteLength: 50,
      createdAt: new Date(consultationDate).toISOString(),
    };
    
    setCaseData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        consultations: [...prev.consultations, newConsultation],
      };
    });
    
    setIsConsultationDialogOpen(false);
    setConsultationDate('');
    toast.success('Konzultáció sikeresen hozzáadva!');
  };

  const handleDeleteConsultation = (consultationId: string) => {
    if (!caseData) return;
    
    setCaseData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        consultations: prev.consultations.filter(c => c.id !== consultationId),
      };
    });
    
    toast.success('Konzultáció sikeresen törölve!');
  };

  const acceptedExpert = caseData?.experts.find(e => e.accepted === CASE_EXPERT_STATUS_VALUES.ACCEPTED);
  const pendingExpert = caseData?.experts.find(e => e.accepted === CASE_EXPERT_STATUS_VALUES.ASSIGNED_TO_EXPERT);
  const rejectedExpert = caseData?.experts.find(e => e.accepted === CASE_EXPERT_STATUS_VALUES.REJECTED);
  const warnings = caseData ? getCaseWarnings(caseData, 'operator') : [];
  
  const caseTypeLabels: Record<number, string> = {
    1: 'Pszichológiai',
    2: 'Jogi',
    3: 'Pénzügyi',
    4: 'Egyéb',
    5: 'Munkajogi',
    6: 'Életvezetési',
    7: 'Munkahelyi',
    11: 'Coaching',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Az eset nem található.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Vissza</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Vissza a listához
          </Button>
          <h1 className="text-2xl font-bold">Eset megtekintése</h1>
        </div>
      </div>

      {/* Case Title Summary - Laravel style */}
      <div className="bg-muted/50 rounded-lg p-4 border">
        <p className="text-lg">
          <span className="font-mono font-semibold">{caseData.caseIdentifier}</span>
          <span className="text-muted-foreground mx-2">-</span>
          <span>{caseData.date}</span>
          {caseData.companyName && (
            <>
              <span className="text-muted-foreground mx-2">-</span>
              <span className="font-medium">{caseData.companyName}</span>
            </>
          )}
          {acceptedExpert && (
            <>
              <span className="text-muted-foreground mx-2">-</span>
              <span className="text-[hsl(var(--cgp-teal))]">{acceptedExpert.name}</span>
            </>
          )}
          {caseData.caseType && caseTypeLabels[caseData.caseType] && (
            <>
              <span className="text-muted-foreground mx-2">-</span>
              <span className="text-muted-foreground">{caseTypeLabels[caseData.caseType]}</span>
            </>
          )}
          {caseData.clientName && (
            <>
              <span className="text-muted-foreground mx-2">-</span>
              <span>{caseData.clientName}</span>
            </>
          )}
        </p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {warnings.map(warning => (
            <Badge 
              key={warning.type}
              variant={warning.severity === 'error' ? 'destructive' : 'secondary'}
              className="gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              {warning.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Case Details */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold text-lg border-b pb-2">Eset adatai</h2>
        
        <ul className="space-y-3">
          {/* Status */}
          <li className="flex items-center gap-2">
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Edit2 className="h-4 w-4" />
                  <span>Státusz:</span>
                  <span className="font-medium">{CASE_STATUS_LABELS[caseData.status]}</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Státusz módosítása</DialogTitle>
                </DialogHeader>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz státuszt" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button onClick={handleStatusChange}>Mentés</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </li>

          {/* Country */}
          <li className="flex items-center gap-2">
            <span className="text-muted-foreground">Ország:</span>
            <span className="font-medium">{caseData.countryCode}</span>
          </li>

          {/* Identifier */}
          <li className="flex items-center gap-2">
            <span className="text-muted-foreground">Azonosító:</span>
            <span className="font-mono font-medium">{caseData.caseIdentifier}</span>
          </li>

          {/* Dynamic Input Fields */}
          {MOCK_INPUT_FIELDS.map(field => {
            const value = getInputValue(field.id);
            if (!value && field.defaultType !== 'presenting_concern') return null;
            
            // Skip certain fields that are shown elsewhere
            if (['case_type', 'case_specialization', 'case_language_skill', 'location'].includes(field.defaultType) && !field.isEditable) {
              return (
                <li key={field.id} className="flex items-center gap-2">
                  <span className="text-muted-foreground">{field.name}:</span>
                  <span className="font-medium">{getInputDisplayValue(field.id)}</span>
                </li>
              );
            }
            
            // Editable fields
            if (field.isEditable) {
              return (
                <li key={field.id} className="flex items-start gap-2">
                  {editingInputId === field.id ? (
                    <div className="flex-1 flex items-start gap-2">
                      <span className="text-muted-foreground min-w-[120px]">{field.name}:</span>
                      {field.type === 'textarea' ? (
                        <Textarea 
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1"
                          rows={3}
                        />
                      ) : field.type === 'select' && field.values ? (
                        <Select value={editValue} onValueChange={setEditValue}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.values.map(v => (
                              <SelectItem key={v.id} value={v.value}>{v.translation}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          type={field.type === 'date' ? 'date' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1"
                        />
                      )}
                      <Button size="sm" onClick={() => handleSaveInput(field.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingInputId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <button 
                      className="flex items-start gap-2 hover:text-primary transition-colors text-left"
                      onClick={() => handleEditInput(field.id)}
                    >
                      <Edit2 className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{field.name}:</span>
                      <span className="font-medium">{getInputDisplayValue(field.id) || '-'}</span>
                    </button>
                  )}
                </li>
              );
            }
            
            return (
              <li key={field.id} className="flex items-center gap-2">
                <span className="text-muted-foreground">{field.name}:</span>
                <span className="font-medium">{getInputDisplayValue(field.id)}</span>
              </li>
            );
          })}

          {/* Expert Assignment */}
          <li className="flex items-center gap-2 pt-2 border-t">
            <Dialog open={isExpertDialogOpen} onOpenChange={setIsExpertDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Edit2 className="h-4 w-4" />
                  <span>Kiközvetített szakértő:</span>
                  {acceptedExpert ? (
                    <span className="font-medium text-[hsl(var(--cgp-teal))]">{acceptedExpert.name}</span>
                  ) : pendingExpert ? (
                    <span className="font-medium text-amber-600">{pendingExpert.name} (várakozik)</span>
                  ) : (
                    <span className="text-muted-foreground italic">Nincs kiválasztva</span>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Szakértő kiközvetítése</DialogTitle>
                  <DialogDescription>
                    Válassz ki egy szakértőt az esethez
                  </DialogDescription>
                </DialogHeader>
                <Select value={selectedExpert} onValueChange={setSelectedExpert}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz szakértőt" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_AVAILABLE_EXPERTS.map(expert => (
                      <SelectItem key={expert.id} value={expert.id}>{expert.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button onClick={handleAssignExpert} disabled={!selectedExpert}>
                    Kiközvetítés
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </li>

          {/* Rejected Expert Warning */}
          {rejectedExpert && (
            <li className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">A szakértő nem vállalta az esetet: {rejectedExpert.name}</span>
            </li>
          )}

          {/* Consultations Section */}
          <li className="flex flex-col gap-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ülések száma:</span>
              <span className="font-medium">{caseData.consultations.length}</span>
            </div>
            
            {caseData.consultations.map((consultation, index) => (
              <div key={consultation.id} className="flex items-center justify-between pl-4 py-1 bg-muted/30 rounded">
                <span className="text-sm">
                  Ülés {index + 1} időpontja: {new Date(consultation.createdAt).toLocaleString('hu-HU')}
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konzultáció törlése</AlertDialogTitle>
                      <AlertDialogDescription>
                        Biztosan törölni szeretnéd ezt a konzultációt? Ez a művelet nem vonható vissza.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Mégse</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteConsultation(consultation.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Törlés
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
            
            {/* Add Consultation Button */}
            <Dialog open={isConsultationDialogOpen} onOpenChange={setIsConsultationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-fit gap-2">
                  <Plus className="h-4 w-4" />
                  Új ülés hozzáadása
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Új konzultáció hozzáadása</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium">Időpont</label>
                  <Input 
                    type="datetime-local"
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleAddConsultation} disabled={!consultationDate}>
                    Hozzáadás
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </li>

          {/* Customer Satisfaction */}
          {caseData.customerSatisfaction && (
            <li className="flex items-center gap-2 pt-2 border-t">
              <span className="text-muted-foreground">Elégedettségi pontszám:</span>
              <span className="font-medium">{caseData.customerSatisfaction}</span>
            </li>
          )}

          {/* Confirmed At */}
          {caseData.confirmedAt && (
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">Lezárva:</span>
              <span className="font-medium">
                {new Date(caseData.confirmedAt).toLocaleDateString('hu-HU')}
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {acceptedExpert && (
          <Button variant="outline" className="gap-2" asChild>
            <a href={`mailto:${acceptedExpert.email}`}>
              <Mail className="h-4 w-4" />
              Email küldése
            </a>
          </Button>
        )}
      </div>

      {/* Back Link */}
      <div className="pt-4 border-t">
        <Button variant="link" onClick={() => navigate(-1)} className="px-0">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Vissza a listához
        </Button>
      </div>
    </div>
  );
}
