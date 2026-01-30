import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Calendar, Building2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyCountrySettings, CountryDifferentiate, ContractHolder, AccountAdmin, Workshop, CrisisIntervention, ConsultationRow, PriceHistoryEntry, INDUSTRIES, CURRENCIES } from "@/types/company";
import { DifferentPerCountryToggle } from "./DifferentPerCountryToggle";
import { ContractDataPanel } from "./panels/ContractDataPanel";
import { ContractedEntity, createDefaultEntity, EntityClientDashboardUser } from "@/types/contracted-entity";
import { cn } from "@/lib/utils";

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

  // Check if entity mode is enabled for a specific country
  const isEntityModeEnabled = (countryId: string) => {
    const entityCountryIds = countryDifferentiates.entity_country_ids || [];
    return entityCountryIds.includes(countryId);
  };

  // Toggle entity mode for a specific country
  const handleToggleEntityMode = (countryId: string, enabled: boolean) => {
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
              entities={countryEntities}
              companyId={companyId}
              onAddEntity={onAddEntity}
              onUpdateEntity={onUpdateEntity}
              onDeleteEntity={onDeleteEntity}
              isEntitiesLoading={isEntitiesLoading}
              onToggleEntityMode={handleToggleEntityMode}
            />
          );
        })}
      </div>
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
  entities: ContractedEntity[];
  companyId?: string;
  onAddEntity: (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEntity: (id: string, updates: Partial<ContractedEntity>) => Promise<void>;
  onDeleteEntity: (id: string) => Promise<void>;
  isEntitiesLoading?: boolean;
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
  entities,
  companyId,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity,
  isEntitiesLoading = false,
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
              <DifferentPerCountryToggle
                label="Több entitás"
                checked={hasMultipleEntities}
                onChange={(checked) => onToggleEntityMode(country.id, checked)}
              />
            </div>

            {/* Ha hasMultipleEntities aktív, entitás fülek megjelenítése */}
            {hasMultipleEntities && (
              <EntitySection
                country={country}
                entities={entities}
                activeEntityId={activeEntityId}
                setActiveEntityId={setActiveEntityId}
                companyId={companyId}
                contractHolders={contractHolders}
                isCGP={isCGP}
                isLifeworks={isLifeworks}
                onAddEntity={onAddEntity}
                onUpdateEntity={onUpdateEntity}
                onDeleteEntity={onDeleteEntity}
                isEntitiesLoading={isEntitiesLoading}
              />
            )}

            {/* Ha nincs entitás mód, az ország-szintű szerződési adatok */}
            {!hasMultipleEntities && (
              <>
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

            {/* Szerződés adatai */}
            <div className="space-y-4 border-l-2 border-primary/20 pl-4">
              <h4 className="text-sm font-medium text-primary">Szerződés adatai</h4>
              
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
                  <Label>Devizanem</Label>
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

              {/* Pillér és Alkalom */}
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

              {/* Szerződés dátumok */}
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
  contractHolders: ContractHolder[];
  isCGP: boolean;
  isLifeworks: boolean;
  onAddEntity: (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEntity: (id: string, updates: Partial<ContractedEntity>) => Promise<void>;
  onDeleteEntity: (id: string) => Promise<void>;
  isEntitiesLoading?: boolean;
}

const EntitySection = ({
  country,
  entities,
  activeEntityId,
  setActiveEntityId,
  companyId,
  contractHolders,
  isCGP,
  isLifeworks,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity,
  isEntitiesLoading = false,
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

  if (entities.length === 0) {
    return (
      <div className="text-center py-6 border rounded-lg bg-muted/30">
        <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Még nincs entitás ebben az országban
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddEntity}
          disabled={isEntitiesLoading || isCreating || !companyId}
        >
          <Plus className="h-4 w-4 mr-1" />
          Entitás létrehozása
        </Button>
      </div>
    );
  }

  const activeEntity = entities.find(e => e.id === activeEntityId);

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
              isCGP={isCGP}
              isLifeworks={isLifeworks}
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

// === EntityDataForm - Entitás űrlap ===
interface EntityDataFormProps {
  entity: ContractedEntity;
  contractHolders: ContractHolder[];
  isCGP: boolean;
  isLifeworks: boolean;
  onUpdate: (updates: Partial<ContractedEntity>) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const EntityDataForm = ({
  entity,
  contractHolders,
  isCGP,
  isLifeworks,
  onUpdate,
  onDelete,
  canDelete,
}: EntityDataFormProps) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
      {/* Entitás név */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Entitás neve (Cégnév)</Label>
          <Input
            value={entity.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Entitás neve"
          />
        </div>
        <div className="space-y-2">
          <Label>Cég elnevezése kiközvetítéshez</Label>
          <Input
            value={entity.dispatch_name || ""}
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

      {/* Szerződés adatok */}
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

      {/* Szerződés dátumok */}
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

      {/* ORG ID, Létszám */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>ORG ID</Label>
          <Input
            value={entity.org_id || ""}
            onChange={(e) => onUpdate({ org_id: e.target.value || null })}
            placeholder="ORG ID"
          />
        </div>
        <div className="space-y-2">
          <Label>Létszám</Label>
          <Input
            type="number"
            value={entity.headcount || ""}
            onChange={(e) => onUpdate({ headcount: e.target.value ? parseInt(e.target.value) : null })}
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

      {/* Entitás törlés */}
      {canDelete && (
        <div className="pt-4 border-t">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            Entitás törlése
          </Button>
        </div>
      )}
    </div>
  );
};
