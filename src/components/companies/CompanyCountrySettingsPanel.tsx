import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp, Plus, Calendar, Building2, Upload, FileText, X, Trash2, History } from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyCountrySettings, CountryDifferentiate, ContractHolder, AccountAdmin, Workshop, CrisisIntervention, ConsultationRow, PriceHistoryEntry, INDUSTRIES, CURRENCIES } from "@/types/company";
import { DifferentPerCountryToggle } from "./DifferentPerCountryToggle";
import { ContractDataPanel } from "./panels/ContractDataPanel";
import { ContractedEntity, createDefaultEntity, EntityClientDashboardUser } from "@/types/contracted-entity";
import { cn } from "@/lib/utils";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import { toast } from "sonner";

// Consultation type options
const CONSULTATION_TYPES = [
  { id: "psychology", label: "Pszichológia" },
  { id: "legal", label: "Jog" },
  { id: "finance", label: "Pénzügy" },
  { id: "health_coaching", label: "Health Coaching" },
  { id: "other", label: "Egyéb" },
];

// Consultation duration options
const CONSULTATION_DURATIONS = [
  { id: "30", label: "30 perc" },
  { id: "50", label: "50 perc" },
];

// Consultation format options
const CONSULTATION_FORMATS = [
  { id: "personal", label: "Személyes" },
  { id: "video", label: "Videó" },
  { id: "phone", label: "Telefonos" },
  { id: "chat", label: "Szöveges üzenet (Chat)" },
];

// Price type options
const PRICE_TYPES = [
  { id: "pepm", name: "PEPM" },
  { id: "package", name: "Csomagár" },
];

interface Country {
  id: string;
  code: string;
  name: string;
}

interface CompanyCountrySettingsPanelProps {
  countryIds: string[];
  countries: Country[];
  countrySettings: CompanyCountrySettings[];
  setCountrySettings: (settings: CompanyCountrySettings[]) => void;
  countryDifferentiates: CountryDifferentiate;
  setCountryDifferentiates: (diff: CountryDifferentiate) => void;
  contractHolders: ContractHolder[];
  accountAdmins: AccountAdmin[];
  globalContractHolderId: string | null;
  // Workshops és Crisis interventions
  workshops: Workshop[];
  setWorkshops: (workshops: Workshop[]) => void;
  crisisInterventions: CrisisIntervention[];
  setCrisisInterventions: (interventions: CrisisIntervention[]) => void;
  // Contracted entities
  companyId?: string;
  entities: ContractedEntity[];
  onAddEntity: (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEntity: (id: string, updates: Partial<ContractedEntity>) => Promise<void>;
  onDeleteEntity: (id: string) => Promise<void>;
  isEntitiesLoading?: boolean;
}

export const CompanyCountrySettingsPanel = ({
  countryIds,
  countries,
  countrySettings,
  setCountrySettings,
  countryDifferentiates,
  setCountryDifferentiates,
  contractHolders,
  accountAdmins,
  globalContractHolderId,
  workshops,
  setWorkshops,
  crisisInterventions,
  setCrisisInterventions,
  companyId,
  entities,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity,
  isEntitiesLoading = false,
}: CompanyCountrySettingsPanelProps) => {
  const [isCreatingInitialEntities, setIsCreatingInitialEntities] = useState<Record<string, boolean>>({});
  
  const selectedCountries = countries.filter((c) => countryIds.includes(c.id));

  if (selectedCountries.length === 0) {
    return (
      <div className="py-4 text-muted-foreground">
        Válasszon országokat az alapadatoknál.
      </div>
    );
  }

  const getCountrySettings = (countryId: string): CompanyCountrySettings => {
    const existing = countrySettings.find((cs) => cs.country_id === countryId);
    if (existing) return existing;
    
    return {
      id: `new-${countryId}`,
      company_id: "",
      country_id: countryId,
      contract_holder_id: null,
      org_id: null,
      contract_start: null,
      contract_end: null,
      contract_reminder_email: null,
      head_count: null,
      activity_plan_user_id: null,
      client_username: null,
      client_password_set: false,
      client_language_id: null,
      all_country_access: false,
      added_at: null,
      name: null,
      dispatch_name: null,
      is_active: true,
      contract_file_url: null,
      contract_price: null,
      contract_price_type: null,
      contract_currency: null,
      pillar_count: null,
      session_count: null,
      consultation_rows: [],
      industry: null,
      price_history: [],
    };
  };

  const updateCountrySettings = (countryId: string, updates: Partial<CompanyCountrySettings>) => {
    const existing = countrySettings.find((cs) => cs.country_id === countryId);
    if (existing) {
      setCountrySettings(
        countrySettings.map((cs) =>
          cs.country_id === countryId ? { ...cs, ...updates } : cs
        )
      );
    } else {
      const newSettings: CompanyCountrySettings = {
        ...getCountrySettings(countryId),
        ...updates,
      };
      setCountrySettings([...countrySettings, newSettings]);
    }
  };

  const getCountryWorkshops = (countryId: string) =>
    workshops.filter((w) => w.country_id === countryId);

  const getCountryCrisis = (countryId: string) =>
    crisisInterventions.filter((c) => c.country_id === countryId);

  const addWorkshop = (countryId: string) => {
    const newWorkshop: Workshop = {
      id: `new-ws-${Date.now()}`,
      company_id: "",
      country_id: countryId,
      name: "",
      sessions_available: 0,
      price: null,
      currency: null,
    };
    setWorkshops([...workshops, newWorkshop]);
  };

  const addCrisis = (countryId: string) => {
    const newCrisis: CrisisIntervention = {
      id: `new-ci-${Date.now()}`,
      company_id: "",
      country_id: countryId,
      name: "",
      sessions_available: 0,
      price: null,
      currency: null,
    };
    setCrisisInterventions([...crisisInterventions, newCrisis]);
  };

  // Get entities for a specific country
  const getCountryEntities = (countryId: string) => 
    entities.filter(e => e.country_id === countryId);

  // Check if entity mode is enabled for a specific country (derived from actual entity count)
  const isEntityModeEnabled = (countryId: string) => {
    const countryEntities = entities.filter(e => e.country_id === countryId);
    return countryEntities.length > 1;
  };

  // Check if entity mode can be disabled for a specific country
  const canDisableEntityMode = (countryId: string) => {
    const countryEntities = entities.filter(e => e.country_id === countryId);
    return countryEntities.length <= 1;
  };

  // Toggle entity mode for a specific country
  const handleToggleEntityMode = async (countryId: string, enabled: boolean) => {
    // Prevent disabling if there are more than 1 entity in this country
    const countryEntities = entities.filter(e => e.country_id === countryId);
    if (!enabled && countryEntities.length > 1) {
      return; // Cannot disable - entities must be deleted first
    }

    const currentIds = countryDifferentiates.entity_country_ids || [];
    let newIds: string[];
    
    if (enabled) {
      newIds = [...currentIds, countryId];
    } else {
      newIds = currentIds.filter(id => id !== countryId);
    }
    
    setCountryDifferentiates({
      ...countryDifferentiates,
      has_multiple_entities: newIds.length > 0,
      entity_country_ids: newIds,
    });

    // Ha bekapcsoljuk és nincs még entitás az országban, létrehozzuk a 2 entitást
    if (enabled) {
      const countryEntities = entities.filter(e => e.country_id === countryId);
      if (countryEntities.length === 0 && !isCreatingInitialEntities[countryId]) {
        setIsCreatingInitialEntities(prev => ({ ...prev, [countryId]: true }));
        try {
          const settings = getCountrySettings(countryId);
          const entityCompanyId = companyId || "pending";
          
          // Első entitás: az ország beállításainak adatait kapja
          const entity1: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'> = {
            company_id: entityCompanyId,
            country_id: countryId,
            name: settings.name || "Entitás 1",
            dispatch_name: settings.dispatch_name,
            is_active: settings.is_active,
            org_id: settings.org_id,
            contract_date: settings.contract_start,
            contract_end_date: settings.contract_end,
            contract_reminder_email: settings.contract_reminder_email,
            reporting_data: {},
            contract_holder_type: settings.contract_holder_id,
            contract_price: settings.contract_price,
            price_type: settings.contract_price_type,
            contract_currency: settings.contract_currency,
            pillars: settings.pillar_count,
            occasions: settings.session_count,
            industry: settings.industry,
            consultation_rows: settings.consultation_rows || [],
            price_history: settings.price_history || [],
            workshop_data: {},
            crisis_data: {},
            headcount: settings.head_count,
            inactive_headcount: null,
            client_dashboard_users: [],
          };
          await onAddEntity(entity1);
          
          // Második entitás: üres
          const entity2 = createDefaultEntity(entityCompanyId, countryId, "Új entitás");
          await onAddEntity(entity2);
        } finally {
          setIsCreatingInitialEntities(prev => ({ ...prev, [countryId]: false }));
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Ország csíkok */}
      <div className="space-y-4">
        {selectedCountries.map((country) => {
          const settings = getCountrySettings(country.id);
          const countryWorkshops = getCountryWorkshops(country.id);
          const countryCrisis = getCountryCrisis(country.id);
          const countryEntities = getCountryEntities(country.id);
          const effectiveContractHolder = countryDifferentiates.basic_data
            ? settings.contract_holder_id
            : countryDifferentiates.contract_holder
              ? settings.contract_holder_id
              : globalContractHolderId;
          const isCGP = effectiveContractHolder === "2";
          const isLifeworks = effectiveContractHolder === "1";

          return (
            <CountrySettingsCard
              key={country.id}
              country={country}
              settings={settings}
              onUpdate={(updates) => updateCountrySettings(country.id, updates)}
              countryDifferentiates={countryDifferentiates}
              contractHolders={contractHolders}
              accountAdmins={accountAdmins}
              isCGP={isCGP}
              isLifeworks={isLifeworks}
              workshops={countryWorkshops}
              onAddWorkshop={() => addWorkshop(country.id)}
              crisisInterventions={countryCrisis}
              onAddCrisis={() => addCrisis(country.id)}
              hasMultipleEntities={isEntityModeEnabled(country.id)}
              canDisableEntityMode={canDisableEntityMode(country.id)}
              entities={countryEntities}
              companyId={companyId}
              onAddEntity={onAddEntity}
              onUpdateEntity={onUpdateEntity}
              onDeleteEntity={onDeleteEntity}
              isEntitiesLoading={isEntitiesLoading}
              isCreatingInitialEntities={isCreatingInitialEntities[country.id] || false}
              onToggleEntityMode={handleToggleEntityMode}
            />
          );
        })}
      </div>
    </div>
  );
};

// Country-specific contract data section - full form with all fields
interface CountryContractDataSectionProps {
  settings: CompanyCountrySettings;
  onUpdate: (updates: Partial<CompanyCountrySettings>) => void;
  isCGP: boolean;
  isLifeworks: boolean;
}

const CountryContractDataSection = ({
  settings,
  onUpdate,
  isCGP,
  isLifeworks,
}: CountryContractDataSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPriceHistoryForm, setShowPriceHistoryForm] = useState(false);
  const [newHistoryEntry, setNewHistoryEntry] = useState<Partial<PriceHistoryEntry>>({
    effective_date: new Date().toISOString().split('T')[0],
    price: settings.contract_price || undefined,
    price_type: settings.contract_price_type || undefined,
    currency: settings.contract_currency || undefined,
    notes: null,
  });

  const consultationRows = settings.consultation_rows || [];
  const priceHistory = settings.price_history || [];

  // File handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Csak PDF fájl tölthető fel!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("A fájl mérete maximum 10MB lehet!");
      return;
    }

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const fakeUrl = `contracts/${Date.now()}_${file.name}`;
      onUpdate({ contract_file_url: fakeUrl });
      toast.success("Szerződés sikeresen feltöltve!");
    } catch (error) {
      toast.error("Hiba a feltöltés során!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    onUpdate({ contract_file_url: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Consultation row handlers
  const addConsultationRow = () => {
    const newRow: ConsultationRow = {
      id: crypto.randomUUID(),
      type: null,
      durations: [],
      formats: [],
    };
    onUpdate({ consultation_rows: [...consultationRows, newRow] });
  };

  const removeConsultationRow = (rowId: string) => {
    onUpdate({ consultation_rows: consultationRows.filter((row) => row.id !== rowId) });
  };

  const updateConsultationRow = (rowId: string, field: keyof ConsultationRow, value: any) => {
    onUpdate({
      consultation_rows: consultationRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    });
  };

  const getAvailableTypes = (currentRowId: string) => {
    const usedTypes = consultationRows
      .filter((row) => row.id !== currentRowId && row.type)
      .map((row) => row.type);
    return CONSULTATION_TYPES.filter((t) => !usedTypes.includes(t.id));
  };

  // Price history handlers
  const addPriceHistoryEntry = () => {
    if (!newHistoryEntry.effective_date || !newHistoryEntry.price) {
      toast.error("Kérjük adja meg a dátumot és az árat!");
      return;
    }

    const entry: PriceHistoryEntry = {
      id: crypto.randomUUID(),
      effective_date: newHistoryEntry.effective_date,
      price: newHistoryEntry.price,
      price_type: newHistoryEntry.price_type || null,
      currency: newHistoryEntry.currency || null,
      notes: newHistoryEntry.notes || null,
    };

    const updatedHistory = [...priceHistory, entry].sort(
      (a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
    );

    onUpdate({ price_history: updatedHistory });
    setShowPriceHistoryForm(false);
    setNewHistoryEntry({
      effective_date: new Date().toISOString().split('T')[0],
      price: settings.contract_price || undefined,
      price_type: settings.contract_price_type || undefined,
      currency: settings.contract_currency || undefined,
      notes: null,
    });
    toast.success("Árváltozás sikeresen rögzítve!");
  };

  const removePriceHistoryEntry = (entryId: string) => {
    onUpdate({ price_history: priceHistory.filter((e) => e.id !== entryId) });
  };

  const getPriceTypeName = (type: string | null) => {
    return PRICE_TYPES.find((pt) => pt.id === type)?.name || type || "-";
  };

  const getCurrencyName = (currency: string | null) => {
    return CURRENCIES.find((c) => c.id === currency)?.name || currency?.toUpperCase() || "-";
  };

  return (
    <div className="space-y-4 border-l-2 border-primary/20 pl-4">
      <h4 className="text-sm font-medium text-primary">Szerződés adatai</h4>

      {/* Contract PDF Upload */}
      <div className="space-y-2">
        <Label>Szerződés (PDF)</Label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          {settings.contract_file_url ? (
            <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 flex-1">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm truncate flex-1">
                {settings.contract_file_url.split("/").pop()}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Feltöltés..." : "PDF feltöltése"}
            </Button>
          )}
        </div>
      </div>

      {/* Ár és típus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Szerződéses ár</Label>
          <Input
            type="number"
            value={settings.contract_price || ""}
            onChange={(e) => onUpdate({ contract_price: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Ár típusa</Label>
          <Select
            value={settings.contract_price_type || ""}
            onValueChange={(val) => onUpdate({ contract_price_type: val || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pepm">PEPM</SelectItem>
              <SelectItem value="package">Csomagár</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Szerződéses ár devizanem</Label>
          <Select
            value={settings.contract_currency || ""}
            onValueChange={(val) => onUpdate({ contract_currency: val || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <Label>Árváltozás előzmények</Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPriceHistoryForm(!showPriceHistoryForm)}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Árváltozás rögzítése
          </Button>
        </div>

        {showPriceHistoryForm && (
          <div className="bg-background border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Érvényesség kezdete</Label>
                <Input
                  type="date"
                  value={newHistoryEntry.effective_date || ""}
                  onChange={(e) =>
                    setNewHistoryEntry({ ...newHistoryEntry, effective_date: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ár</Label>
                <Input
                  type="number"
                  value={newHistoryEntry.price ?? ""}
                  onChange={(e) =>
                    setNewHistoryEntry({
                      ...newHistoryEntry,
                      price: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                  min={0}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ár típusa</Label>
                <Select
                  value={newHistoryEntry.price_type || "none"}
                  onValueChange={(val) =>
                    setNewHistoryEntry({
                      ...newHistoryEntry,
                      price_type: val === "none" ? undefined : val,
                    })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válasszon..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Válasszon...</SelectItem>
                    {PRICE_TYPES.map((pt) => (
                      <SelectItem key={pt.id} value={pt.id}>
                        {pt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Devizanem</Label>
                <Select
                  value={newHistoryEntry.currency || "none"}
                  onValueChange={(val) =>
                    setNewHistoryEntry({
                      ...newHistoryEntry,
                      currency: val === "none" ? undefined : val,
                    })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válasszon..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Válasszon...</SelectItem>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.id} value={curr.id}>
                        {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Megjegyzés (opcionális)</Label>
              <Input
                value={newHistoryEntry.notes || ""}
                onChange={(e) =>
                  setNewHistoryEntry({ ...newHistoryEntry, notes: e.target.value || null })
                }
                placeholder="Pl.: Éves ármódosítás, infláció követése..."
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={addPriceHistoryEntry}>
                Mentés
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPriceHistoryForm(false)}
              >
                Mégse
              </Button>
            </div>
          </div>
        )}

        {priceHistory.length === 0 ? (
          <div className="text-sm text-muted-foreground py-3 text-center border border-dashed rounded-lg">
            Nincs árváltozás előzmény rögzítve.
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Dátum</th>
                  <th className="text-left px-3 py-2 font-medium">Ár</th>
                  <th className="text-left px-3 py-2 font-medium">Típus</th>
                  <th className="text-left px-3 py-2 font-medium">Megjegyzés</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {priceHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(entry.effective_date), "yyyy. MMM d.", { locale: hu })}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {entry.price.toLocaleString("hu-HU")} {getCurrencyName(entry.currency)}
                    </td>
                    <td className="px-3 py-2">{getPriceTypeName(entry.price_type)}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {entry.notes || "-"}
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePriceHistoryEntry(entry.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pillér és Alkalom és Iparág */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Pillér</Label>
          <Input
            type="number"
            value={settings.pillar_count || ""}
            onChange={(e) => onUpdate({ pillar_count: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Alkalom</Label>
          <Input
            type="number"
            value={settings.session_count || ""}
            onChange={(e) => onUpdate({ session_count: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Iparág</Label>
          <Select
            value={settings.industry || ""}
            onValueChange={(val) => onUpdate({ industry: val || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.id} value={ind.id}>
                  {ind.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Consultation Rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Tanácsadás beállítások</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addConsultationRow}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Új sor
          </Button>
        </div>

        {consultationRows.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            Nincs tanácsadás beállítás. Kattints az "Új sor" gombra a hozzáadáshoz.
          </div>
        ) : (
          <div className="space-y-3">
            {consultationRows.map((row, index) => (
              <div
                key={row.id}
                className="bg-background border rounded-lg p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {index + 1}. tanácsadás típus
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConsultationRow(row.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Típus</Label>
                    <Select
                      value={row.type || "none"}
                      onValueChange={(val) =>
                        updateConsultationRow(row.id, "type", val === "none" ? null : val)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Válassz típust..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Válassz típust...</SelectItem>
                        {getAvailableTypes(row.id).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label}
                          </SelectItem>
                        ))}
                        {row.type && !getAvailableTypes(row.id).find((t) => t.id === row.type) && (
                          <SelectItem value={row.type}>
                            {CONSULTATION_TYPES.find((t) => t.id === row.type)?.label}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <MultiSelectField
                    label="Időtartam"
                    options={CONSULTATION_DURATIONS}
                    selectedIds={row.durations}
                    onChange={(durations) => updateConsultationRow(row.id, "durations", durations)}
                    placeholder="Válassz..."
                    badgeColor="teal"
                  />

                  <MultiSelectField
                    label="Forma"
                    options={CONSULTATION_FORMATS}
                    selectedIds={row.formats}
                    onChange={(formats) => updateConsultationRow(row.id, "formats", formats)}
                    placeholder="Válassz..."
                    badgeColor="teal"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Szerződés dátumok - CGP */}
      {isCGP && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Szerződés kezdete</Label>
            <Input
              type="date"
              value={settings.contract_start || ""}
              onChange={(e) => onUpdate({ contract_start: e.target.value || null })}
            />
          </div>
          <div className="space-y-2">
            <Label>Szerződés lejárta</Label>
            <Input
              type="date"
              value={settings.contract_end || ""}
              onChange={(e) => onUpdate({ contract_end: e.target.value || null })}
            />
          </div>
        </div>
      )}

      {/* Emlékeztető email - CGP */}
      {isCGP && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Emlékeztető e-mail</Label>
            <Input
              type="email"
              value={settings.contract_reminder_email || ""}
              onChange={(e) => onUpdate({ contract_reminder_email: e.target.value || null })}
              placeholder="email@ceg.hu"
            />
          </div>
        </div>
      )}

      {/* ORG ID - Lifeworks */}
      {isLifeworks && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>ORG ID</Label>
            <Input
              value={settings.org_id || ""}
              onChange={(e) => onUpdate({ org_id: e.target.value || null })}
              placeholder="ORG ID"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Ország beállítások kártya
interface CountrySettingsCardProps {
  country: Country;
  settings: CompanyCountrySettings;
  onUpdate: (updates: Partial<CompanyCountrySettings>) => void;
  countryDifferentiates: CountryDifferentiate;
  contractHolders: ContractHolder[];
  accountAdmins: AccountAdmin[];
  isCGP: boolean;
  isLifeworks: boolean;
  workshops: Workshop[];
  onAddWorkshop: () => void;
  crisisInterventions: CrisisIntervention[];
  onAddCrisis: () => void;
  // Entity support
  hasMultipleEntities: boolean;
  canDisableEntityMode: boolean;
  entities: ContractedEntity[];
  companyId?: string;
  onAddEntity: (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEntity: (id: string, updates: Partial<ContractedEntity>) => Promise<void>;
  onDeleteEntity: (id: string) => Promise<void>;
  isEntitiesLoading?: boolean;
  isCreatingInitialEntities?: boolean;
  // Callback to toggle entity mode for this country
  onToggleEntityMode: (countryId: string, enabled: boolean) => void;
}

const CountrySettingsCard = ({
  country,
  settings,
  onUpdate,
  countryDifferentiates,
  contractHolders,
  accountAdmins,
  isCGP,
  isLifeworks,
  workshops,
  onAddWorkshop,
  crisisInterventions,
  onAddCrisis,
  hasMultipleEntities,
  canDisableEntityMode,
  entities,
  companyId,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity,
  isEntitiesLoading = false,
  isCreatingInitialEntities = false,
  onToggleEntityMode,
}: CountrySettingsCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWorkshopsOpen, setIsWorkshopsOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [activeEntityId, setActiveEntityId] = useState<string>(entities[0]?.id || "");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div
          className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
            isOpen 
              ? "bg-primary text-primary-foreground rounded-t-lg" 
              : "bg-muted hover:bg-muted/80 rounded-lg"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">{country.code}</span>
            {settings.added_at && (
              <span className={`flex items-center gap-1 text-xs ${isOpen ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                <Calendar className="h-3 w-3" />
                Hozzáadva: {format(new Date(settings.added_at), "yyyy. MMM d.", { locale: hu })}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 p-4 border border-t-0 rounded-b-lg bg-background">

        {/* Ha basic_data aktív, megjelenítjük a Több entitás toggle-t és az összes szerződési adatot */}
        {countryDifferentiates.basic_data && (
          <div className="space-y-6">
            {/* Több entitás toggle - csak basic_data módban érhető el */}
            <div className="flex items-center justify-between bg-muted/30 border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="text-sm font-medium text-primary">Szerződött entitások</h4>
                  <p className="text-xs text-muted-foreground">
                    Ha ebben az országban több jogi személlyel is szerződést kötnek
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DifferentPerCountryToggle
                  label="Több entitás"
                  checked={hasMultipleEntities}
                  onChange={(checked) => onToggleEntityMode(country.id, checked)}
                  disabled={isEntitiesLoading || isCreatingInitialEntities || (hasMultipleEntities && !canDisableEntityMode)}
                />
                {hasMultipleEntities && !canDisableEntityMode && (
                  <span className="text-xs text-muted-foreground">
                    (Entitások törlése szükséges a kikapcsoláshoz)
                  </span>
                )}
              </div>
            </div>

            {/* Ha hasMultipleEntities aktív, entitás fülek megjelenítése */}
            {hasMultipleEntities && (
              <EntitySection
                country={country}
                entities={entities}
                activeEntityId={activeEntityId}
                setActiveEntityId={setActiveEntityId}
                companyId={companyId}
                countrySettings={settings}
                contractHolders={contractHolders}
                isCGP={isCGP}
                isLifeworks={isLifeworks}
                onAddEntity={onAddEntity}
                onUpdateEntity={onUpdateEntity}
                onDeleteEntity={onDeleteEntity}
                isEntitiesLoading={isEntitiesLoading}
                isCreatingInitialEntities={isCreatingInitialEntities}
              />
            )}

            {/* Ha nincs entitás mód, az ország-szintű szerződési adatok */}
            {!hasMultipleEntities && (
              <>
                {/* Cégnév és Dispatch name - országonként */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cégnév</Label>
                    <Input
                      value={settings.name || ""}
                      onChange={(e) => onUpdate({ name: e.target.value || null })}
                      placeholder="Cégnév ebben az országban"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cég elnevezése kiközvetítéshez</Label>
                    <Input
                      value={settings.dispatch_name || ""}
                      onChange={(e) => onUpdate({ dispatch_name: e.target.value || null })}
                      placeholder="Ahogy az operátorok listájában megjelenik"
                    />
                  </div>
                </div>

                {/* Aktív státusz */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Aktív</Label>
                    <Select
                      value={settings.is_active ? "true" : "false"}
                      onValueChange={(val) => onUpdate({ is_active: val === "true" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Igen</SelectItem>
                        <SelectItem value="false">Nem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Szerződéshordozó */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Szerződéshordozó</Label>
                    <Select
                      value={settings.contract_holder_id || ""}
                      onValueChange={(val) => onUpdate({ contract_holder_id: val || null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Válasszon..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contractHolders.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            {ch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

            {/* Szerződés adatai - Teljes form */}
            <CountryContractDataSection
              settings={settings}
              onUpdate={onUpdate}
              isCGP={isCGP}
              isLifeworks={isLifeworks}
            />
              </>
            )}
          </div>
        )}

        {/* Ha basic_data NINCS aktív, a korábbi logika: egyedi mezők külön-külön */}
        {!countryDifferentiates.basic_data && (
          <>
            {/* Szerződéshordozó - ha országonként különböző */}
            {countryDifferentiates.contract_holder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Szerződéshordozó</Label>
                  <Select
                    value={settings.contract_holder_id || ""}
                    onValueChange={(val) => onUpdate({ contract_holder_id: val || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Válasszon..." />
                    </SelectTrigger>
                    <SelectContent>
                      {contractHolders.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          {ch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* ORG ID - ha országonként különböző és Lifeworks */}
            {countryDifferentiates.org_id && isLifeworks && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ORG ID</Label>
                  <Input
                    value={settings.org_id || ""}
                    onChange={(e) => onUpdate({ org_id: e.target.value || null })}
                    placeholder="ORG ID"
                  />
                </div>
              </div>
            )}

            {/* Szerződés dátumok - ha országonként különböző és CGP */}
            {countryDifferentiates.contract_date && isCGP && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Szerződés kezdete</Label>
                  <Input
                    type="date"
                    value={settings.contract_start || ""}
                    onChange={(e) => onUpdate({ contract_start: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Szerződés lejárta</Label>
                  <Input
                    type="date"
                    value={settings.contract_end || ""}
                    onChange={(e) => onUpdate({ contract_end: e.target.value || null })}
                  />
                </div>
              </div>
            )}

            {/* Emlékeztető email - ha országonként különböző */}
            {countryDifferentiates.contract_date_reminder_email && isCGP && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emlékeztető e-mail</Label>
                  <Input
                    type="email"
                    value={settings.contract_reminder_email || ""}
                    onChange={(e) => onUpdate({ contract_reminder_email: e.target.value || null })}
                    placeholder="email@ceg.hu"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Létszám - mindig látható */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Létszám</Label>
            <Input
              type="number"
              value={settings.head_count || ""}
              onChange={(e) => onUpdate({ head_count: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="0"
            />
          </div>
        </div>

        {/* Client Dashboard beállítások - ha reporting országonként különböző */}
        {countryDifferentiates.reporting && isCGP && (
          <div className="space-y-4 border-l-2 border-primary/20 pl-4">
            <h4 className="text-sm font-medium text-primary">Client Dashboard beállítások</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Felhasználónév</Label>
                <Input
                  value={settings.client_username || ""}
                  onChange={(e) => onUpdate({ client_username: e.target.value || null })}
                  placeholder="Felhasználónév"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!settings.client_password_set ? (
                <div className="space-y-2">
                  <Label>Jelszó</Label>
                  <Input type="password" placeholder="Jelszó" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <button
                    type="button"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    + Új jelszó beállítása
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nyelv</Label>
                <Select
                  value={settings.client_language_id || ""}
                  onValueChange={(val) => onUpdate({ client_language_id: val || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">English</SelectItem>
                    <SelectItem value="1">Magyar</SelectItem>
                    <SelectItem value="2">Polska</SelectItem>
                    <SelectItem value="4">Slovenský</SelectItem>
                    <SelectItem value="5">Česky</SelectItem>
                    <SelectItem value="6">Українська</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hozzáférés minden országhoz</Label>
                <Select
                  value={settings.all_country_access ? "1" : "0"}
                  onValueChange={(val) => onUpdate({ all_country_access: val === "1" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nem</SelectItem>
                    <SelectItem value="1">Igen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Workshop és Krízisintervenció beállítások */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-primary">Workshop és Krízisintervenció beállítások</h4>

          {/* Workshops */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary">Workshopok</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddWorkshop}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Hozzáadás
              </Button>
              {workshops.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWorkshopsOpen(!isWorkshopsOpen)}
                  className="h-8"
                >
                  {isWorkshopsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {isWorkshopsOpen && workshops.length > 0 && (
              <div className="space-y-2 pl-4">
                {workshops.map((ws, idx) => (
                  <div key={ws.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{idx + 1}.</span>
                    <Input
                      value={ws.name}
                      onChange={() => {}}
                      placeholder="Workshop neve"
                      className="h-8 flex-1"
                    />
                    <Input
                      type="number"
                      value={ws.sessions_available}
                      onChange={() => {}}
                      placeholder="Alkalmak"
                      className="h-8 w-24"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Krízisintervenciók */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary">Krízisintervenciók</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddCrisis}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Hozzáadás
              </Button>
              {crisisInterventions.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCrisisOpen(!isCrisisOpen)}
                  className="h-8"
                >
                  {isCrisisOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {isCrisisOpen && crisisInterventions.length > 0 && (
              <div className="space-y-2 pl-4">
                {crisisInterventions.map((ci, idx) => (
                  <div key={ci.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{idx + 1}.</span>
                    <Input
                      value={ci.name}
                      onChange={() => {}}
                      placeholder="Krízisintervenció neve"
                      className="h-8 flex-1"
                    />
                    <Input
                      type="number"
                      value={ci.sessions_available}
                      onChange={() => {}}
                      placeholder="Alkalmak"
                      className="h-8 w-24"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// === EntitySection komponens - Entitás kezelés országon belül ===
interface EntitySectionProps {
  country: Country;
  entities: ContractedEntity[];
  activeEntityId: string;
  setActiveEntityId: (id: string) => void;
  companyId?: string;
  countrySettings: CompanyCountrySettings;
  contractHolders: ContractHolder[];
  isCGP: boolean;
  isLifeworks: boolean;
  onAddEntity: (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEntity: (id: string, updates: Partial<ContractedEntity>) => Promise<void>;
  onDeleteEntity: (id: string) => Promise<void>;
  isEntitiesLoading?: boolean;
  isCreatingInitialEntities?: boolean;
}

const EntitySection = ({
  country,
  entities,
  activeEntityId,
  setActiveEntityId,
  companyId,
  countrySettings,
  contractHolders,
  isCGP,
  isLifeworks,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity,
  isEntitiesLoading = false,
  isCreatingInitialEntities = false,
}: EntitySectionProps) => {
  const [isCreating, setIsCreating] = useState(false);

  // Update active tab when entities change
  React.useEffect(() => {
    if (entities.length > 0 && !entities.find(e => e.id === activeEntityId)) {
      setActiveEntityId(entities[0].id);
    }
  }, [entities, activeEntityId, setActiveEntityId]);

  const handleAddEntity = async () => {
    if (!companyId) return;
    setIsCreating(true);
    try {
      const newEntity = createDefaultEntity(companyId, country.id, "Új entitás");
      await onAddEntity(newEntity);
    } finally {
      setIsCreating(false);
    }
  };

  const getEntityTabLabel = (entity: ContractedEntity, index: number): string => {
    const isDefaultName = !entity.name || 
      entity.name.startsWith("Entitás ") || 
      entity.name.startsWith("Új entitás");
    
    if (!isDefaultName) {
      return entity.name;
    }
    return `Entitás ${index + 1}`;
  };

  if (entities.length === 0 || isCreatingInitialEntities) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/30">
        <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {isCreatingInitialEntities ? "Entitások létrehozása..." : "Még nincs entitás ebben az országban"}
        </p>
        {!isCreatingInitialEntities && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddEntity}
            disabled={isEntitiesLoading || isCreating || !companyId}
            className="mt-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            Entitás létrehozása
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs 
        value={activeEntityId} 
        onValueChange={setActiveEntityId}
        className="w-full"
      >
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <TabsList className="h-auto p-1 bg-muted/50 flex-wrap gap-1">
            {entities.map((entity, index) => (
              <TabsTrigger
                key={entity.id}
                value={entity.id}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                )}
              >
                {getEntityTabLabel(entity, index)}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddEntity}
            disabled={isEntitiesLoading || isCreating || !companyId}
            className="h-9"
          >
            <Plus className="h-4 w-4 mr-1" />
            Új entitás
          </Button>
        </div>

        {entities.map((entity) => (
          <TabsContent
            key={entity.id}
            value={entity.id}
            className="mt-0"
          >
            <EntityDataForm
              entity={entity}
              contractHolders={contractHolders}
              onUpdate={(updates) => onUpdateEntity(entity.id, updates)}
              onDelete={() => onDeleteEntity(entity.id)}
              canDelete={entities.length > 1}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// === EntityDataForm - Teljes entitás űrlap (ugyanaz mint SingleCountryBasicDataPanel) ===
interface EntityDataFormProps {
  entity: ContractedEntity;
  contractHolders: ContractHolder[];
  onUpdate: (updates: Partial<ContractedEntity>) => void;
  onDelete: () => void;
  canDelete: boolean;
}

// Helper: entity CD users to component format
interface ClientDashboardUser {
  id: string;
  username: string;
  password?: string;
  languageId: string | null;
}

const entityCDUsersToComponentFormat = (users: EntityClientDashboardUser[]): ClientDashboardUser[] => {
  return users.map(u => ({
    id: u.id,
    username: u.username,
    password: u.password,
    languageId: u.language_id,
  }));
};

const EntityDataForm = ({
  entity,
  contractHolders,
  onUpdate,
  onDelete,
  canDelete,
}: EntityDataFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPriceHistoryForm, setShowPriceHistoryForm] = useState(false);
  const [newHistoryEntry, setNewHistoryEntry] = useState<Partial<PriceHistoryEntry>>({
    effective_date: new Date().toISOString().split('T')[0],
    price: entity.contract_price || undefined,
    price_type: entity.price_type || undefined,
    currency: entity.contract_currency || undefined,
    notes: null,
  });

  // Local state for immediate input response
  const [localName, setLocalName] = useState(entity.name);
  const [localDispatchName, setLocalDispatchName] = useState(entity.dispatch_name || "");

  // Sync local state when entity changes (e.g., tab switch)
  React.useEffect(() => {
    setLocalName(entity.name);
    setLocalDispatchName(entity.dispatch_name || "");
  }, [entity.id, entity.name, entity.dispatch_name]);

  const consultationRows = entity.consultation_rows || [];
  const priceHistory = entity.price_history || [];
  const cdUsers = entityCDUsersToComponentFormat(entity.client_dashboard_users || []);

  const isCGP = entity.contract_holder_type === "2";
  const isLifeworks = entity.contract_holder_type === "1";

  // File handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Csak PDF fájl tölthető fel!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("A fájl mérete maximum 10MB lehet!");
      return;
    }

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const fakeUrl = `contracts/${Date.now()}_${file.name}`;
      // Note: contract_file_url is not in entity type yet, would need to add
      toast.success("Szerződés sikeresen feltöltve!");
    } catch (error) {
      toast.error("Hiba a feltöltés során!");
    } finally {
      setIsUploading(false);
    }
  };

  // Consultation row handlers
  const addConsultationRow = () => {
    const newRow: ConsultationRow = {
      id: crypto.randomUUID(),
      type: null,
      durations: [],
      formats: [],
    };
    onUpdate({ consultation_rows: [...consultationRows, newRow] });
  };

  const removeConsultationRow = (rowId: string) => {
    onUpdate({ consultation_rows: consultationRows.filter((row) => row.id !== rowId) });
  };

  const updateConsultationRow = (rowId: string, field: keyof ConsultationRow, value: any) => {
    onUpdate({
      consultation_rows: consultationRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    });
  };

  const getAvailableTypes = (currentRowId: string) => {
    const usedTypes = consultationRows
      .filter((row) => row.id !== currentRowId && row.type)
      .map((row) => row.type);
    return CONSULTATION_TYPES.filter((t) => !usedTypes.includes(t.id));
  };

  // Price history handlers
  const addPriceHistoryEntry = () => {
    if (!newHistoryEntry.effective_date || !newHistoryEntry.price) {
      toast.error("Kérjük adja meg a dátumot és az árat!");
      return;
    }

    const entry: PriceHistoryEntry = {
      id: crypto.randomUUID(),
      effective_date: newHistoryEntry.effective_date,
      price: newHistoryEntry.price,
      price_type: newHistoryEntry.price_type || null,
      currency: newHistoryEntry.currency || null,
      notes: newHistoryEntry.notes || null,
    };

    const updatedHistory = [...priceHistory, entry].sort(
      (a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
    );

    onUpdate({ price_history: updatedHistory });
    setShowPriceHistoryForm(false);
    setNewHistoryEntry({
      effective_date: new Date().toISOString().split('T')[0],
      price: entity.contract_price || undefined,
      price_type: entity.price_type || undefined,
      currency: entity.contract_currency || undefined,
      notes: null,
    });
    toast.success("Árváltozás sikeresen rögzítve!");
  };

  const removePriceHistoryEntry = (entryId: string) => {
    onUpdate({ price_history: priceHistory.filter((e) => e.id !== entryId) });
  };

  const getPriceTypeName = (type: string | null) => {
    return PRICE_TYPES.find((pt) => pt.id === type)?.name || type || "-";
  };

  const getCurrencyName = (currency: string | null) => {
    return CURRENCIES.find((c) => c.id === currency)?.name || currency?.toUpperCase() || "-";
  };

  // CD user handlers
  const addCDUser = () => {
    const newUser: EntityClientDashboardUser = {
      id: `new-user-${Date.now()}`,
      username: "",
      password: "",
      language_id: null,
    };
    onUpdate({ client_dashboard_users: [...(entity.client_dashboard_users || []), newUser] });
  };

  const updateCDUser = (userId: string, updates: Partial<ClientDashboardUser>) => {
    const newUsers = (entity.client_dashboard_users || []).map(u => 
      u.id === userId 
        ? { 
            ...u, 
            username: updates.username ?? u.username,
            password: updates.password ?? u.password,
            language_id: updates.languageId !== undefined ? updates.languageId : u.language_id,
          } 
        : u
    );
    onUpdate({ client_dashboard_users: newUsers });
  };

  const removeCDUser = (userId: string) => {
    const newUsers = (entity.client_dashboard_users || []).filter(u => u.id !== userId);
    onUpdate({ client_dashboard_users: newUsers });
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-muted/10">
      {/* Entitás név */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Entitás neve (Cégnév) *</Label>
          <Input
            value={localName}
            onChange={(e) => {
              setLocalName(e.target.value);
              onUpdate({ name: e.target.value });
            }}
            placeholder="pl. Henkel Hungary Kft."
          />
          <p className="text-xs text-muted-foreground">
            A jogi személy neve, akivel a szerződést kötötték
          </p>
        </div>
        <div className="space-y-2">
          <Label>Cég elnevezése kiközvetítéshez</Label>
          <Input
            value={localDispatchName}
            onChange={(e) => {
              setLocalDispatchName(e.target.value);
              onUpdate({ dispatch_name: e.target.value || null });
            }}
            placeholder="Ahogy az operátorok listájában megjelenik"
          />
        </div>
      </div>

      {/* Aktív és Szerződéshordozó */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Aktív</Label>
          <Select
            value={entity.is_active ? "true" : "false"}
            onValueChange={(val) => onUpdate({ is_active: val === "true" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Igen</SelectItem>
              <SelectItem value="false">Nem</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Szerződéshordozó</Label>
          <Select
            value={entity.contract_holder_type || ""}
            onValueChange={(val) => onUpdate({ contract_holder_type: val || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              {contractHolders.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Szerződéses ár, típus, deviza */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Szerződéses ár</Label>
          <Input
            type="number"
            value={entity.contract_price || ""}
            onChange={(e) => onUpdate({ contract_price: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Ár típusa</Label>
          <Select
            value={entity.price_type || ""}
            onValueChange={(val) => onUpdate({ price_type: val || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pepm">PEPM</SelectItem>
              <SelectItem value="package">Csomagár</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Devizanem</Label>
          <Select
            value={entity.contract_currency || ""}
            onValueChange={(val) => onUpdate({ contract_currency: val || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <Label>Árváltozás előzmények</Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPriceHistoryForm(!showPriceHistoryForm)}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Árváltozás rögzítése
          </Button>
        </div>

        {showPriceHistoryForm && (
          <div className="bg-background border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Érvényesség kezdete</Label>
                <Input
                  type="date"
                  value={newHistoryEntry.effective_date || ""}
                  onChange={(e) =>
                    setNewHistoryEntry({ ...newHistoryEntry, effective_date: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ár</Label>
                <Input
                  type="number"
                  value={newHistoryEntry.price ?? ""}
                  onChange={(e) =>
                    setNewHistoryEntry({
                      ...newHistoryEntry,
                      price: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                  min={0}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ár típusa</Label>
                <Select
                  value={newHistoryEntry.price_type || "none"}
                  onValueChange={(val) =>
                    setNewHistoryEntry({
                      ...newHistoryEntry,
                      price_type: val === "none" ? undefined : val,
                    })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válasszon..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Válasszon...</SelectItem>
                    {PRICE_TYPES.map((pt) => (
                      <SelectItem key={pt.id} value={pt.id}>
                        {pt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Devizanem</Label>
                <Select
                  value={newHistoryEntry.currency || "none"}
                  onValueChange={(val) =>
                    setNewHistoryEntry({
                      ...newHistoryEntry,
                      currency: val === "none" ? undefined : val,
                    })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válasszon..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Válasszon...</SelectItem>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.id} value={curr.id}>
                        {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Megjegyzés (opcionális)</Label>
              <Input
                value={newHistoryEntry.notes || ""}
                onChange={(e) =>
                  setNewHistoryEntry({ ...newHistoryEntry, notes: e.target.value || null })
                }
                placeholder="Pl.: Éves ármódosítás, infláció követése..."
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={addPriceHistoryEntry}>
                Mentés
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPriceHistoryForm(false)}
              >
                Mégse
              </Button>
            </div>
          </div>
        )}

        {priceHistory.length === 0 ? (
          <div className="text-sm text-muted-foreground py-3 text-center border border-dashed rounded-lg">
            Nincs árváltozás előzmény rögzítve.
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Dátum</th>
                  <th className="text-left px-3 py-2 font-medium">Ár</th>
                  <th className="text-left px-3 py-2 font-medium">Típus</th>
                  <th className="text-left px-3 py-2 font-medium">Megjegyzés</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {priceHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(entry.effective_date), "yyyy. MMM d.", { locale: hu })}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {entry.price.toLocaleString("hu-HU")} {getCurrencyName(entry.currency)}
                    </td>
                    <td className="px-3 py-2">{getPriceTypeName(entry.price_type)}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {entry.notes || "-"}
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePriceHistoryEntry(entry.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pillér, Alkalom, Iparág */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Pillér</Label>
          <Input
            type="number"
            value={entity.pillars || ""}
            onChange={(e) => onUpdate({ pillars: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Alkalom</Label>
          <Input
            type="number"
            value={entity.occasions || ""}
            onChange={(e) => onUpdate({ occasions: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Iparág</Label>
          <Select
            value={entity.industry || ""}
            onValueChange={(val) => onUpdate({ industry: val || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.id} value={ind.id}>
                  {ind.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Consultation Rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Tanácsadás beállítások</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addConsultationRow}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Új sor
          </Button>
        </div>

        {consultationRows.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            Nincs tanácsadás beállítás. Kattints az "Új sor" gombra a hozzáadáshoz.
          </div>
        ) : (
          <div className="space-y-3">
            {consultationRows.map((row, index) => (
              <div
                key={row.id}
                className="bg-background border rounded-lg p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {index + 1}. tanácsadás típus
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConsultationRow(row.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Típus</Label>
                    <Select
                      value={row.type || "none"}
                      onValueChange={(val) =>
                        updateConsultationRow(row.id, "type", val === "none" ? null : val)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Válassz típust..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Válassz típust...</SelectItem>
                        {getAvailableTypes(row.id).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label}
                          </SelectItem>
                        ))}
                        {row.type && !getAvailableTypes(row.id).find((t) => t.id === row.type) && (
                          <SelectItem value={row.type}>
                            {CONSULTATION_TYPES.find((t) => t.id === row.type)?.label}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <MultiSelectField
                    label="Időtartam"
                    options={CONSULTATION_DURATIONS}
                    selectedIds={row.durations}
                    onChange={(durations) => updateConsultationRow(row.id, "durations", durations)}
                    placeholder="Válassz..."
                    badgeColor="teal"
                  />

                  <MultiSelectField
                    label="Forma"
                    options={CONSULTATION_FORMATS}
                    selectedIds={row.formats}
                    onChange={(formats) => updateConsultationRow(row.id, "formats", formats)}
                    placeholder="Válassz..."
                    badgeColor="teal"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Szerződés dátumok - CGP */}
      {(isCGP || !entity.contract_holder_type) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Szerződés kezdete</Label>
            <Input
              type="date"
              value={entity.contract_date || ""}
              onChange={(e) => onUpdate({ contract_date: e.target.value || null })}
            />
          </div>
          <div className="space-y-2">
            <Label>Szerződés lejárta</Label>
            <Input
              type="date"
              value={entity.contract_end_date || ""}
              onChange={(e) => onUpdate({ contract_end_date: e.target.value || null })}
            />
          </div>
          <div className="space-y-2">
            <Label>Emlékeztető e-mail</Label>
            <Input
              type="email"
              value={entity.contract_reminder_email || ""}
              onChange={(e) => onUpdate({ contract_reminder_email: e.target.value || null })}
              placeholder="email@ceg.hu"
            />
          </div>
        </div>
      )}

      {/* ORG ID és Létszám */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(isLifeworks || !entity.contract_holder_type) && (
          <div className="space-y-2">
            <Label>ORG ID</Label>
            <Input
              value={entity.org_id || ""}
              onChange={(e) => onUpdate({ org_id: e.target.value || null })}
              placeholder="ORG ID"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Létszám</Label>
          <Input
            type="number"
            value={entity.headcount || ""}
            onChange={(e) => onUpdate({ headcount: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="0"
          />
        </div>
      </div>

      {/* Client Dashboard felhasználók - CGP */}
      {(isCGP || !entity.contract_holder_type) && (
        <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-primary">Client Dashboard felhasználók</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCDUser}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Új felhasználó
            </Button>
          </div>

          {cdUsers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nincs még felhasználó hozzáadva a Client Dashboard-hoz.
            </p>
          )}

          {cdUsers.map((user, idx) => (
            <div key={user.id} className="border rounded-lg p-3 space-y-3 bg-background">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Felhasználó #{idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCDUser(user.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Felhasználónév</Label>
                  <Input
                    value={user.username}
                    onChange={(e) => updateCDUser(user.id, { username: e.target.value })}
                    placeholder="Felhasználónév"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Jelszó</Label>
                  {user.id.startsWith("new-") ? (
                    <Input
                      type="password"
                      value={user.password || ""}
                      onChange={(e) => updateCDUser(user.id, { password: e.target.value })}
                      placeholder="Jelszó"
                      className="h-9"
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-9 p-0 text-primary"
                    >
                      + Új jelszó beállítása
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nyelv</Label>
                  <Select
                    value={user.languageId || ""}
                    onValueChange={(val) => updateCDUser(user.id, { languageId: val || null })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Válasszon..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">English</SelectItem>
                      <SelectItem value="1">Magyar</SelectItem>
                      <SelectItem value="2">Polska</SelectItem>
                      <SelectItem value="4">Slovenský</SelectItem>
                      <SelectItem value="5">Česky</SelectItem>
                      <SelectItem value="6">Українська</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entitás törlés */}
      {canDelete && (
        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Entitás törlése
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Entitás törlése</AlertDialogTitle>
                <AlertDialogDescription>
                  Biztosan törölni szeretné a(z) "{entity.name}" entitást? Ez a művelet nem vonható vissza.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Mégse</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>
                  Törlés
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};
