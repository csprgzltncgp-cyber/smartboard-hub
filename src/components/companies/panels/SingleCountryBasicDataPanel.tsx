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
import { Plus, ChevronDown, ChevronUp, X, Building2, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import { ContractHolder, Workshop, CrisisIntervention, CountryDifferentiate, ConsultationRow, PriceHistoryEntry } from "@/types/company";
import { ContractDataPanel } from "./ContractDataPanel";
import { ContractedEntity, EntityClientDashboardUser, createDefaultEntity } from "@/types/contracted-entity";
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

  // NOTE: A "Cégnév" (nem entitás mód) input aktuális értékének biztos olvasásához.
  // Így a toggle pillanatában akkor is át tudjuk migrálni az értéket, ha a state még nem frissült.
  const companyNameInputRef = useRef<HTMLInputElement | null>(null);

  // Dummy countryDifferentiates for single country (no different per country needed)
  const countryDifferentiates: CountryDifferentiate = {
    contract_holder: false,
    org_id: false,
    contract_date: false,
    reporting: false,
    invoicing: false,
    contract_date_reminder_email: false,
    basic_data: false,
    workshop_crisis: false,
    has_multiple_entities: false,
    entity_country_ids: [],
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

  // Collect current form values for migration - using a function to get latest values
  const getCurrentFormValues = () => ({
    name: companyNameInputRef.current?.value?.trim() || name?.trim() || "",
    dispatchName,
    active,
    orgId,
    contractStart,
    contractEnd,
    contractReminderEmail,
    contractHolderId,
    contractPrice,
    contractPriceType,
    contractCurrency,
    pillarCount,
    sessionCount,
    industry,
    consultationRows,
    priceHistory,
    headCount,
    clientDashboardUsers,
  });

  // Check if toggle can be disabled (only if 1 or fewer entities exist)
  const canDisableMultipleEntities = entities.length <= 1;
  const multipleEntitiesToggleDisabled = isEntitiesLoading || isCreatingInitialEntities || (hasMultipleEntities && !canDisableMultipleEntities);

  const handleToggleMultipleEntities = async (enabled: boolean) => {
    // Prevent disabling if there are more than 1 entity
    if (!enabled && entities.length > 1) {
      return; // Cannot disable - entities must be deleted first
    }

    // Capture current form values BEFORE toggle (important for migration)
    const currentValues = getCurrentFormValues();
    
    onToggleMultipleEntities(enabled);
    
    // Ha bekapcsoljuk és nincs még entitás, automatikusan létrehozunk 2-t
    // Működik companyId nélkül is (új cég esetén) - placeholder ID-t használunk
    if (enabled && entities.length === 0 && countryId && !isCreatingInitialEntities) {
      setIsCreatingInitialEntities(true);
      try {
        // Placeholder company_id új cég esetén - a tényleges ID mentéskor kerül be
        const entityCompanyId = companyId || "pending";
        
        // Első entitás: a meglévő cégadatokkal (minden adat a captured values-ból!)
        const entity1Name = currentValues.name || "Entitás 1";
        const entity1: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'> = {
          company_id: entityCompanyId,
          country_id: countryId,
          name: entity1Name,
          dispatch_name: currentValues.dispatchName,
          is_active: currentValues.active,
          org_id: currentValues.orgId,
          contract_date: currentValues.contractStart,
          contract_end_date: currentValues.contractEnd,
          contract_reminder_email: currentValues.contractReminderEmail,
          reporting_data: {},
          contract_holder_type: currentValues.contractHolderId,
          contract_price: currentValues.contractPrice,
          price_type: currentValues.contractPriceType,
          contract_currency: currentValues.contractCurrency,
          pillars: currentValues.pillarCount,
          occasions: currentValues.sessionCount,
          industry: currentValues.industry,
          consultation_rows: currentValues.consultationRows,
          price_history: currentValues.priceHistory,
          workshop_data: {},
          crisis_data: {},
          headcount: currentValues.headCount,
          inactive_headcount: null,
          client_dashboard_users: currentValues.clientDashboardUsers.map(u => ({
            id: u.id,
            username: u.username,
            password: u.password,
            language_id: u.languageId,
          })),
        };
        await onAddEntity(entity1);
        
        // Második entitás: üres, alapértelmezett értékekkel
        const entity2 = createDefaultEntity(entityCompanyId, countryId, "Új entitás");
        await onAddEntity(entity2);
      } finally {
        setIsCreatingInitialEntities(false);
      }
    }
  };

  const handleAddEntity = async () => {
    if (!companyId || !countryId) return;
    const newEntity = createDefaultEntity(companyId, countryId, "Új entitás");
    await onAddEntity(newEntity);
  };

  const getEntityTabLabel = (entity: ContractedEntity, index: number): string => {
    // Minden entitás a saját nevét (cégnév) mutatja, ha ki van töltve
    // Ha üres vagy alapértelmezett név ("Entitás X", "Új entitás"), akkor fallback
    const isDefaultName = !entity.name || 
      entity.name.startsWith("Entitás ") || 
      entity.name.startsWith("Új entitás");
    
    if (!isDefaultName) {
      return entity.name;
    }
    return `Entitás ${index + 1}`;
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

  // ==== Helper: convert entity CD users to component format ====
  const entityCDUsersToComponentFormat = (users: EntityClientDashboardUser[]): ClientDashboardUser[] => {
    return users.map(u => ({
      id: u.id,
      username: u.username,
      password: u.password,
      languageId: u.language_id,
    }));
  };

  // ==== Render entity content - MINDEN mező itt van! ====
  const renderEntityContent = (entity?: ContractedEntity) => {
    const isEntityMode = !!entity;
    
    // Entitás-specifikus adatok
    const entityName = isEntityMode ? entity.name : name;
    const setEntityName = isEntityMode 
      ? (val: string) => onUpdateEntity(entity.id, { name: val })
      : setName;
    const entityDispatchName = isEntityMode ? entity.dispatch_name : dispatchName;
    const setEntityDispatchName = isEntityMode 
      ? (val: string | null) => onUpdateEntity(entity.id, { dispatch_name: val })
      : setDispatchName;
    const entityActive = isEntityMode ? entity.is_active : active;
    const setEntityActive = isEntityMode 
      ? (val: boolean) => onUpdateEntity(entity.id, { is_active: val })
      : setActive;
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
    const entityContractReminderEmail = isEntityMode ? entity.contract_reminder_email : contractReminderEmail;
    const setEntityContractReminderEmail = isEntityMode 
      ? (val: string | null) => onUpdateEntity(entity.id, { contract_reminder_email: val })
      : setContractReminderEmail;
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
    
    // Client Dashboard users - entity módban az entitásból jön
    const entityCDUsers = isEntityMode 
      ? entityCDUsersToComponentFormat(entity.client_dashboard_users || [])
      : clientDashboardUsers;
    
    const addEntityCDUser = () => {
      const newUser: ClientDashboardUser = {
        id: `new-user-${Date.now()}`,
        username: "",
        password: "",
        languageId: null,
      };
      if (isEntityMode) {
        const newEntityUsers: EntityClientDashboardUser[] = [
          ...(entity.client_dashboard_users || []),
          { id: newUser.id, username: "", password: "", language_id: null },
        ];
        onUpdateEntity(entity.id, { client_dashboard_users: newEntityUsers });
      } else {
        setClientDashboardUsers([...clientDashboardUsers, newUser]);
      }
    };

    const updateEntityCDUser = (userId: string, updates: Partial<ClientDashboardUser>) => {
      if (isEntityMode) {
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
        onUpdateEntity(entity.id, { client_dashboard_users: newUsers });
      } else {
        setClientDashboardUsers(
          clientDashboardUsers.map((u) => (u.id === userId ? { ...u, ...updates } : u))
        );
      }
    };

    const removeEntityCDUser = (userId: string) => {
      if (isEntityMode) {
        const newUsers = (entity.client_dashboard_users || []).filter(u => u.id !== userId);
        onUpdateEntity(entity.id, { client_dashboard_users: newUsers });
      } else {
        setClientDashboardUsers(clientDashboardUsers.filter((u) => u.id !== userId));
      }
    };
    
    const entityIsCGP = entityContractHolderId === "2";
    const entityIsLifeworks = entityContractHolderId === "1";

    return (
      <div className="space-y-6">
        {/* Entitás/Cégnév */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label>{isEntityMode ? "Entitás neve *" : "Cégnév"}</Label>
            <Input
              ref={isEntityMode ? undefined : companyNameInputRef}
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

        {/* Cég elnevezése kiközvetítéshez */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label>{isEntityMode ? "Entitás elnevezése kiközvetítéshez" : "Cég elnevezése kiközvetítéshez"}</Label>
            <Input
              value={entityDispatchName || ""}
              onChange={(e) => setEntityDispatchName(e.target.value || null)}
              placeholder="Ahogy az operátorok listájában megjelenik"
            />
            <p className="text-xs text-muted-foreground">
              Ha üres, a {isEntityMode ? "entitás" : "cég"} neve jelenik meg az operátorok listájában.
            </p>
          </div>
        </div>

        {/* Aktív státusz */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label>Aktív</Label>
            <Select
              value={entityActive ? "true" : "false"}
              onValueChange={(val) => setEntityActive(val === "true")}
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

        {/* Emlékeztető email (csak CGP esetén) */}
        {(entityIsCGP || !entityContractHolderId) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Emlékeztető e-mail</Label>
              <Input
                type="email"
                value={entityContractReminderEmail || ""}
                onChange={(e) => setEntityContractReminderEmail(e.target.value || null)}
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

        {/* Client Dashboard felhasználók */}
        {(entityIsCGP || !entityContractHolderId) && (
          <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-primary">Client Dashboard felhasználók</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEntityCDUser}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Új felhasználó
              </Button>
            </div>

            {entityCDUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nincs még felhasználó hozzáadva a Client Dashboard-hoz.
              </p>
            )}

            {entityCDUsers.map((user, idx) => (
              <div key={user.id} className="border rounded-lg p-3 space-y-3 bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Felhasználó #{idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEntityCDUser(user.id)}
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
                      onChange={(e) => updateEntityCDUser(user.id, { username: e.target.value })}
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
                        onChange={(e) => updateEntityCDUser(user.id, { password: e.target.value })}
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
                      onValueChange={(val) => updateEntityCDUser(user.id, { languageId: val || null })}
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
                  <AlertDialogAction onClick={() => onDeleteEntity(entity.id)}>
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

  return (
    <div className="space-y-6">
      {/* ORSZÁG KIVÁLASZTÓ - KIEMELT PANEL (mindig látható, entity módban readonly) */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-medium text-primary">Ország</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelectField
            label=""
            options={countryOptions}
            selectedIds={countryIds}
            onChange={hasMultipleEntities ? () => {} : setCountryIds}
            placeholder="Válasszon országokat..."
            disabled={hasMultipleEntities}
          />
        </div>
        {hasMultipleEntities && (
          <p className="text-xs text-muted-foreground mt-2">
            Több entitás módban az ország nem módosítható. Először kapcsolja ki a több entitás opciót.
          </p>
        )}
      </div>

      {/* Több entitás toggle - látható új cégnél is (companyId nélkül) */}
      {countryId && (
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
          <div className="flex items-center gap-2">
            <DifferentPerCountryToggle
              label="Több entitás"
              checked={hasMultipleEntities}
              onChange={handleToggleMultipleEntities}
              disabled={multipleEntitiesToggleDisabled}
            />
            {hasMultipleEntities && !canDisableMultipleEntities && (
              <span className="text-xs text-muted-foreground">
                (Entitások törlése szükséges a kikapcsoláshoz)
              </span>
            )}
          </div>
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
