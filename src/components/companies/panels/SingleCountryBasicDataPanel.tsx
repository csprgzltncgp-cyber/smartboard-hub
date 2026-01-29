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
import { Plus, ChevronDown, ChevronUp, X, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import { ContractHolder, Workshop, CrisisIntervention, CountryDifferentiate, ConsultationRow, PriceHistoryEntry } from "@/types/company";
import { ContractDataPanel } from "./ContractDataPanel";
import { ContractedEntity, createDefaultEntity } from "@/types/contracted-entity";
import { DifferentPerCountryToggle } from "../DifferentPerCountryToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface ClientDashboardUser {
  id: string;
  username: string;
  password?: string;
  languageId: string | null;
}

interface SingleCountryBasicDataPanelProps {
  companyId?: string;
  name: string;
  setName: (name: string) => void;
  dispatchName: string | null;
  setDispatchName: (name: string | null) => void;
  active: boolean;
  setActive: (active: boolean) => void;
  countryIds: string[];
  setCountryIds: (ids: string[]) => void;
  contractHolderId: string | null;
  setContractHolderId: (id: string | null) => void;
  orgId: string | null;
  setOrgId: (id: string | null) => void;
  contractStart: string | null;
  setContractStart: (date: string | null) => void;
  contractEnd: string | null;
  setContractEnd: (date: string | null) => void;
  contractReminderEmail: string | null;
  setContractReminderEmail: (email: string | null) => void;
  countries: Country[];
  contractHolders: ContractHolder[];
  // Létszám (single country)
  headCount: number | null;
  setHeadCount: (count: number | null) => void;
  // Workshop & Crisis
  workshops: Workshop[];
  setWorkshops: (workshops: Workshop[]) => void;
  crisisInterventions: CrisisIntervention[];
  setCrisisInterventions: (interventions: CrisisIntervention[]) => void;
  // Client Dashboard users
  clientDashboardUsers: ClientDashboardUser[];
  setClientDashboardUsers: (users: ClientDashboardUser[]) => void;
  onSetNewPassword: (userId: string) => void;
  // Contract data fields
  contractFileUrl: string | null;
  setContractFileUrl: (url: string | null) => void;
  contractPrice: number | null;
  setContractPrice: (price: number | null) => void;
  contractPriceType: string | null;
  setContractPriceType: (type: string | null) => void;
  contractCurrency: string | null;
  setContractCurrency: (currency: string | null) => void;
  pillarCount: number | null;
  setPillarCount: (count: number | null) => void;
  sessionCount: number | null;
  setSessionCount: (count: number | null) => void;
  consultationRows: ConsultationRow[];
  setConsultationRows: (rows: ConsultationRow[]) => void;
  industry: string | null;
  setIndustry: (industry: string | null) => void;
  priceHistory: PriceHistoryEntry[];
  setPriceHistory: (history: PriceHistoryEntry[]) => void;
  // Contracted entities
  entities: ContractedEntity[];
  hasMultipleEntities: boolean;
  onToggleMultipleEntities: (enabled: boolean) => void;
  onAddEntity: (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEntity: (id: string, updates: Partial<ContractedEntity>) => Promise<void>;
  onDeleteEntity: (id: string) => Promise<void>;
  isEntitiesLoading?: boolean;
}

export const SingleCountryBasicDataPanel = ({
  companyId,
  name,
  setName,
  dispatchName,
  setDispatchName,
  active,
  setActive,
  countryIds,
  setCountryIds,
  contractHolderId,
  setContractHolderId,
  orgId,
  setOrgId,
  contractStart,
  setContractStart,
  contractEnd,
  setContractEnd,
  contractReminderEmail,
  setContractReminderEmail,
  countries,
  contractHolders,
  headCount,
  setHeadCount,
  workshops,
  setWorkshops,
  crisisInterventions,
  setCrisisInterventions,
  clientDashboardUsers,
  setClientDashboardUsers,
  onSetNewPassword,
  // Contract data fields
  contractFileUrl,
  setContractFileUrl,
  contractPrice,
  setContractPrice,
  contractPriceType,
  setContractPriceType,
  contractCurrency,
  setContractCurrency,
  pillarCount,
  setPillarCount,
  sessionCount,
  setSessionCount,
  consultationRows,
  setConsultationRows,
  industry,
  setIndustry,
  priceHistory,
  setPriceHistory,
  // Contracted entities
  entities,
  hasMultipleEntities,
  onToggleMultipleEntities,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity,
  isEntitiesLoading = false,
}: SingleCountryBasicDataPanelProps) => {
  const isCGP = contractHolderId === "2";
  const isLifeworks = contractHolderId === "1";
  const countryId = countryIds[0];

  const [isWorkshopsOpen, setIsWorkshopsOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(true);
  const [activeEntityId, setActiveEntityId] = useState<string>(entities[0]?.id || "");
  const [isCreatingInitialEntities, setIsCreatingInitialEntities] = useState(false);

  // Dummy countryDifferentiates for single country (no different per country needed)
  const countryDifferentiates: CountryDifferentiate = {
    contract_holder: false,
    org_id: false,
    contract_date: false,
    reporting: false,
    invoicing: false,
    contract_date_reminder_email: false,
    basic_data: false,
    has_multiple_entities: false,
  };

  const countryOptions = countries.map((c) => ({ id: c.id, label: c.name }));

  const countryWorkshops = workshops.filter((w) => w.country_id === countryId);
  const countryCrisis = crisisInterventions.filter((c) => c.country_id === countryId);

  // Update active tab when entities change
  useEffect(() => {
    if (entities.length > 0 && !entities.find(e => e.id === activeEntityId)) {
      setActiveEntityId(entities[0].id);
    }
  }, [entities, activeEntityId]);

  // Set first entity as active when entities are loaded
  useEffect(() => {
    if (entities.length > 0 && !activeEntityId) {
      setActiveEntityId(entities[0].id);
    }
  }, [entities, activeEntityId]);

  const handleToggleMultipleEntities = async (enabled: boolean) => {
    onToggleMultipleEntities(enabled);
    
    // Ha bekapcsoljuk és nincs még entitás, automatikusan létrehozunk 2-t
    if (enabled && entities.length === 0 && companyId && countryId && !isCreatingInitialEntities) {
      setIsCreatingInitialEntities(true);
      try {
        // Első entitás: a cégnév (vagy "Entitás 1" ha nincs)
        const entity1 = createDefaultEntity(companyId, countryId, name || "Entitás 1");
        await onAddEntity(entity1);
        
        // Második entitás
        const entity2 = createDefaultEntity(companyId, countryId, "Entitás 2");
        await onAddEntity(entity2);
      } finally {
        setIsCreatingInitialEntities(false);
      }
    }
  };

  const handleAddEntity = async () => {
    if (!companyId || !countryId) return;
    const newEntity = createDefaultEntity(companyId, countryId, `Entitás ${entities.length + 1}`);
    await onAddEntity(newEntity);
  };

  const getEntityTabLabel = (entity: ContractedEntity, index: number): string => {
    return entity.name || `Entitás ${index + 1}`;
  };

  const addWorkshop = () => {
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

  const addCrisis = () => {
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

  const updateWorkshop = (id: string, updates: Partial<Workshop>) => {
    setWorkshops(workshops.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const updateCrisis = (id: string, updates: Partial<CrisisIntervention>) => {
    setCrisisInterventions(crisisInterventions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addClientDashboardUser = () => {
    const newUser: ClientDashboardUser = {
      id: `new-user-${Date.now()}`,
      username: "",
      password: "",
      languageId: null,
    };
    setClientDashboardUsers([...clientDashboardUsers, newUser]);
  };

  const updateClientDashboardUser = (id: string, updates: Partial<ClientDashboardUser>) => {
    setClientDashboardUsers(
      clientDashboardUsers.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const removeClientDashboardUser = (id: string) => {
    setClientDashboardUsers(clientDashboardUsers.filter((u) => u.id !== id));
  };

  // ==== Render entity content (used for tabs or single view) ====
  const renderEntityContent = (entity?: ContractedEntity) => {
    // Ha van entity, akkor az entitás adatait jelenítjük meg
    // Ha nincs entity (single mode), akkor a component props-ból jönnek az adatok
    const isEntityMode = !!entity;
    
    const entityName = isEntityMode ? entity.name : name;
    const setEntityName = isEntityMode 
      ? (val: string) => onUpdateEntity(entity.id, { name: val })
      : setName;
    const entityOrgId = isEntityMode ? entity.org_id : orgId;
    const setEntityOrgId = isEntityMode 
      ? (val: string | null) => onUpdateEntity(entity.id, { org_id: val })
      : setOrgId;
    const entityContractStart = isEntityMode ? entity.contract_date : contractStart;
    const setEntityContractStart = isEntityMode 
      ? (val: string | null) => onUpdateEntity(entity.id, { contract_date: val })
      : setContractStart;
    const entityContractEnd = isEntityMode ? entity.contract_end_date : contractEnd;
    const setEntityContractEnd = isEntityMode 
      ? (val: string | null) => onUpdateEntity(entity.id, { contract_end_date: val })
      : setContractEnd;
    const entityContractHolderId = isEntityMode ? entity.contract_holder_type : contractHolderId;
    const setEntityContractHolderId = isEntityMode 
      ? (val: string | null) => onUpdateEntity(entity.id, { contract_holder_type: val })
      : setContractHolderId;
    const entityContractPrice = isEntityMode ? entity.contract_price : contractPrice;
    const setEntityContractPrice = isEntityMode 
      ? (val: number | null) => onUpdateEntity(entity.id, { contract_price: val })
      : setContractPrice;
    const entityContractPriceType = isEntityMode ? entity.price_type : contractPriceType;
    const setEntityContractPriceType = isEntityMode 
      ? (val: string | null) => onUpdateEntity(entity.id, { price_type: val })
      : setContractPriceType;
    const entityContractCurrency = isEntityMode ? entity.contract_currency : contractCurrency;
    const setEntityContractCurrency = isEntityMode 
      ? (val: string | null) => onUpdateEntity(entity.id, { contract_currency: val })
      : setContractCurrency;
    const entityPillarCount = isEntityMode ? entity.pillars : pillarCount;
    const setEntityPillarCount = isEntityMode 
      ? (val: number | null) => onUpdateEntity(entity.id, { pillars: val })
      : setPillarCount;
    const entitySessionCount = isEntityMode ? entity.occasions : sessionCount;
    const setEntitySessionCount = isEntityMode 
      ? (val: number | null) => onUpdateEntity(entity.id, { occasions: val })
      : setSessionCount;
    const entityConsultationRows = isEntityMode ? (entity.consultation_rows || []) : consultationRows;
    const setEntityConsultationRows = isEntityMode 
      ? (rows: ConsultationRow[]) => onUpdateEntity(entity.id, { consultation_rows: rows })
      : setConsultationRows;
    const entityIndustry = isEntityMode ? entity.industry : industry;
    const setEntityIndustry = isEntityMode 
      ? (val: string | null) => onUpdateEntity(entity.id, { industry: val })
      : setIndustry;
    const entityPriceHistory = isEntityMode ? (entity.price_history || []) : priceHistory;
    const setEntityPriceHistory = isEntityMode 
      ? (history: PriceHistoryEntry[]) => onUpdateEntity(entity.id, { price_history: history })
      : setPriceHistory;
    const entityHeadCount = isEntityMode ? entity.headcount : headCount;
    const setEntityHeadCount = isEntityMode 
      ? (val: number | null) => onUpdateEntity(entity.id, { headcount: val })
      : setHeadCount;
    
    const entityIsCGP = entityContractHolderId === "2";
    const entityIsLifeworks = entityContractHolderId === "1";

    return (
      <div className="space-y-6">
        {/* Cégnév / Entitás név */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label>{isEntityMode ? "Entitás neve *" : "Cégnév"}</Label>
            <Input
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder={isEntityMode ? "pl. Henkel Hungary Kft." : "Cégnév"}
              required
            />
            {isEntityMode && (
              <p className="text-xs text-muted-foreground">
                A jogi személy neve, akivel a szerződést kötötték
              </p>
            )}
          </div>
        </div>

        {/* Cég elnevezése kiközvetítéshez - csak nem entity módban */}
        {!isEntityMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Cég elnevezése kiközvetítéshez</Label>
              <Input
                value={dispatchName || ""}
                onChange={(e) => setDispatchName(e.target.value || null)}
                placeholder="Ahogy az operátorok listájában megjelenik"
              />
              <p className="text-xs text-muted-foreground">
                Ha üres, a cégnév jelenik meg az operátorok listájában.
              </p>
            </div>
          </div>
        )}

        {/* Országok - csak nem entity módban */}
        {!isEntityMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <MultiSelectField
                label="Országok"
                options={countryOptions}
                selectedIds={countryIds}
                onChange={setCountryIds}
                placeholder="Válasszon országokat..."
              />
            </div>
          </div>
        )}

        {/* Szerződés adatai */}
        <ContractDataPanel
          contractHolderId={entityContractHolderId}
          setContractHolderId={setEntityContractHolderId}
          contractHolders={contractHolders}
          countryDifferentiates={countryDifferentiates}
          onUpdateDifferentiate={() => {}}
          contractFileUrl={contractFileUrl}
          setContractFileUrl={setContractFileUrl}
          contractPrice={entityContractPrice}
          setContractPrice={setEntityContractPrice}
          contractPriceType={entityContractPriceType}
          setContractPriceType={setEntityContractPriceType}
          contractCurrency={entityContractCurrency}
          setContractCurrency={setEntityContractCurrency}
          pillarCount={entityPillarCount}
          setPillarCount={setEntityPillarCount}
          sessionCount={entitySessionCount}
          setSessionCount={setEntitySessionCount}
          consultationRows={entityConsultationRows}
          setConsultationRows={setEntityConsultationRows}
          industry={entityIndustry}
          setIndustry={setEntityIndustry}
          priceHistory={entityPriceHistory}
          setPriceHistory={setEntityPriceHistory}
          showDifferentPerCountry={false}
        />

        {/* ORG ID (csak Lifeworks esetén) */}
        {(entityIsLifeworks || !entityContractHolderId) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>ORG ID</Label>
              <Input
                value={entityOrgId || ""}
                onChange={(e) => setEntityOrgId(e.target.value || null)}
                placeholder="ORG ID"
              />
            </div>
          </div>
        )}

        {/* Szerződés dátumok (csak CGP esetén) */}
        {(entityIsCGP || !entityContractHolderId) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Szerződés kezdete</Label>
              <Input
                type="date"
                value={entityContractStart || ""}
                onChange={(e) => setEntityContractStart(e.target.value || null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Szerződés lejárta</Label>
              <Input
                type="date"
                value={entityContractEnd || ""}
                onChange={(e) => setEntityContractEnd(e.target.value || null)}
              />
            </div>
          </div>
        )}

        {/* Emlékeztető email (csak CGP esetén) - csak nem entity módban */}
        {!isEntityMode && (entityIsCGP || !entityContractHolderId) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Emlékeztető e-mail</Label>
              <Input
                type="email"
                value={contractReminderEmail || ""}
                onChange={(e) => setContractReminderEmail(e.target.value || null)}
                placeholder="email@ceg.hu"
              />
            </div>
          </div>
        )}

        {/* Létszám */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label>Létszám</Label>
            <Input
              type="number"
              value={entityHeadCount || ""}
              onChange={(e) => setEntityHeadCount(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Aktív státusz - csak nem entity módban */}
        {!isEntityMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Aktív</Label>
              <Select
                value={active ? "true" : "false"}
                onValueChange={(val) => setActive(val === "true")}
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
        )}

        {/* Workshop és Krízisintervenció */}
        <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-medium text-primary">Workshop és Krízisintervenció</h4>

          {/* Workshops */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Workshopok</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addWorkshop}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Hozzáadás
              </Button>
              {countryWorkshops.length > 0 && (
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
            {isWorkshopsOpen && countryWorkshops.length > 0 && (
              <div className="space-y-2 pl-4">
                {countryWorkshops.map((ws, idx) => (
                  <div key={ws.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{idx + 1}.</span>
                    <Input
                      value={ws.name}
                      onChange={(e) => updateWorkshop(ws.id, { name: e.target.value })}
                      placeholder="Workshop neve"
                      className="h-8 flex-1"
                    />
                    <Input
                      type="number"
                      value={ws.sessions_available}
                      onChange={(e) => updateWorkshop(ws.id, { sessions_available: parseInt(e.target.value) || 0 })}
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
              <span className="text-sm text-muted-foreground">Krízisintervenciók</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCrisis}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Hozzáadás
              </Button>
              {countryCrisis.length > 0 && (
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
            {isCrisisOpen && countryCrisis.length > 0 && (
              <div className="space-y-2 pl-4">
                {countryCrisis.map((ci, idx) => (
                  <div key={ci.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{idx + 1}.</span>
                    <Input
                      value={ci.name}
                      onChange={(e) => updateCrisis(ci.id, { name: e.target.value })}
                      placeholder="Krízisintervenció neve"
                      className="h-8 flex-1"
                    />
                    <Input
                      type="number"
                      value={ci.sessions_available}
                      onChange={(e) => updateCrisis(ci.id, { sessions_available: parseInt(e.target.value) || 0 })}
                      placeholder="Alkalmak"
                      className="h-8 w-24"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Client Dashboard felhasználók - csak nem entity módban */}
        {!isEntityMode && (entityIsCGP || !entityContractHolderId) && (
          <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-primary">Client Dashboard felhasználók</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addClientDashboardUser}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Új felhasználó
              </Button>
            </div>

            {clientDashboardUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nincs még felhasználó hozzáadva a Client Dashboard-hoz.
              </p>
            )}

            {clientDashboardUsers.map((user, idx) => (
              <div key={user.id} className="border rounded-lg p-3 space-y-3 bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Felhasználó #{idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeClientDashboardUser(user.id)}
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
                      onChange={(e) => updateClientDashboardUser(user.id, { username: e.target.value })}
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
                        onChange={(e) => updateClientDashboardUser(user.id, { password: e.target.value })}
                        placeholder="Jelszó"
                        className="h-9"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => onSetNewPassword(user.id)}
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
                      onValueChange={(val) => updateClientDashboardUser(user.id, { languageId: val || null })}
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

        {/* Entitás törlés gomb - csak entity módban és ha több van */}
        {isEntityMode && entities.length > 1 && (
          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDeleteEntity(entity.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Entitás törlése
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Több entitás toggle - A PANEL TETEJÉN */}
      {countryId && companyId && (
        <div className="flex items-center justify-between bg-muted/30 border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <h4 className="text-sm font-medium text-primary">Szerződött entitások</h4>
              <p className="text-xs text-muted-foreground">
                Ha egy országban több jogi személlyel is szerződést kötnek
              </p>
            </div>
          </div>
          <DifferentPerCountryToggle
            label="Több entitás"
            checked={hasMultipleEntities}
            onChange={handleToggleMultipleEntities}
            disabled={isEntitiesLoading || isCreatingInitialEntities}
          />
        </div>
      )}

      {/* Ha nincs több entitás, egyszerű panel */}
      {!hasMultipleEntities && renderEntityContent()}

      {/* Ha több entitás van, füles megjelenítés */}
      {hasMultipleEntities && (
        <>
          {(entities.length === 0 || isCreatingInitialEntities) ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Entitások létrehozása...
              </p>
            </div>
          ) : (
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
                  disabled={isEntitiesLoading}
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
                  {renderEntityContent(entity)}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </>
      )}
    </div>
  );
};
