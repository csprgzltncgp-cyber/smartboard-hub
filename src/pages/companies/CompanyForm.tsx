import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CollapsiblePanel } from "@/components/companies/panels/CollapsiblePanel";
import { SingleCountryBasicDataPanel } from "@/components/companies/panels/SingleCountryBasicDataPanel";
import { MultiCountryBasicDataPanel } from "@/components/companies/panels/MultiCountryBasicDataPanel";
import { CompanyCountrySettingsPanel } from "@/components/companies/CompanyCountrySettingsPanel";
import { CompanyInvoicingPanel } from "@/components/companies/CompanyInvoicingPanel";
import { CompanyTabContainer, CompanyTab } from "@/components/companies/tabs/CompanyTabContainer";
import { OnboardingTabContent } from "@/components/companies/tabs/OnboardingTabContent";
import { ArchivedOnboardingPanel } from "@/components/companies/panels/ArchivedOnboardingPanel";
import { InputsTabContent } from "@/components/companies/tabs/InputsTabContent";
import { OnboardingData } from "@/types/onboarding";
import { NotesTabContent } from "@/components/companies/tabs/NotesTabContent";
import { StatisticsTabContent } from "@/components/companies/tabs/StatisticsTabContent";
import { ClientDashboardTabContent } from "@/components/companies/tabs/ClientDashboardTabContent";
import { InvoiceSlip } from "@/components/companies/InvoiceSlipCard";
import { NewCompanyOnboardingDialog } from "@/components/companies/NewCompanyOnboardingDialog";
import {
  CountryDifferentiate,
  CompanyCountrySettings,
  ContractHolder,
  AccountAdmin,
  Workshop,
  CrisisIntervention,
  BillingData,
  InvoicingData,
  InvoiceItem,
  InvoiceComment,
  InvoiceTemplate,
  PriceHistoryEntry,
} from "@/types/company";
import { useCompaniesDb } from "@/hooks/useCompaniesDb";
import { useAppUsersDb } from "@/hooks/useAppUsersDb";
import { useContractedEntities } from "@/hooks/useContractedEntities";
import { ContractedEntity } from "@/types/contracted-entity";
import { EntityInvoicingTabs, EntityBillingPanel, getDefaultEntityBillingData, getDefaultEntityInvoicingData } from "@/components/companies/entities";

// Mock contract holders (until we have a proper table)
const mockContractHolders: ContractHolder[] = [
  { id: "1", name: "Telus" },
  { id: "2", name: "CGP" },
];

const CompanyForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams<{ companyId: string }>();
  const isEditMode = Boolean(companyId);
  
  const { 
    countries, 
    companies, 
    getCompanyById, 
    createCompany, 
    updateCompany, 
    loading: companiesLoading 
  } = useCompaniesDb();
  
  const { users } = useAppUsersDb();
  
  // Contracted entities hook (csak edit módban használjuk a DB-t)
  const {
    entities: dbEntities,
    loading: entitiesLoading,
    createEntity,
    updateEntity,
    deleteEntity,
  } = useContractedEntities(companyId || undefined);

  // Helyi entitások új cég létrehozásánál (még nincs companyId)
  const [pendingEntities, setPendingEntities] = useState<ContractedEntity[]>([]);
  
  // Kombinált entitás lista: edit módban DB-ből, új módban pendingből
  const entities = isEditMode ? dbEntities : pendingEntities;

  const [formLoading, setFormLoading] = useState(isEditMode);

  // Alapadatok
  const [name, setName] = useState("");
  const [dispatchName, setDispatchName] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [countryIds, setCountryIds] = useState<string[]>([]);
  const [contractHolderId, setContractHolderId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [contractStart, setContractStart] = useState<string | null>(null);
  const [contractEnd, setContractEnd] = useState<string | null>(null);
  const [contractReminderEmail, setContractReminderEmail] = useState<string | null>(null);
  const [leadAccountId, setLeadAccountId] = useState<string | null>(null);
  // Client Dashboard felhasználók (több felhasználó támogatás)
  interface ClientDashboardUser {
    id: string;
    username: string;
    password?: string;
    languageId: string | null;
  }
  const [clientDashboardUsers, setClientDashboardUsers] = useState<ClientDashboardUser[]>([]);

  // Országonként különböző beállítások
  const [countryDifferentiates, setCountryDifferentiates] = useState<CountryDifferentiate>({
    contract_holder: false,
    org_id: false,
    contract_date: false,
    reporting: false,
    invoicing: false,
    contract_date_reminder_email: false,
    basic_data: false,
    has_multiple_entities: false,
    entity_country_ids: [],
  });

  // Ország-specifikus beállítások
  const [countrySettings, setCountrySettings] = useState<CompanyCountrySettings[]>([]);

  // Client Dashboard beállítások (globális)
  const [clientUsername, setClientUsername] = useState("");
  const [clientLanguageId, setClientLanguageId] = useState<string | null>(null);
  const [hasClientPassword, setHasClientPassword] = useState(false);

  // Létszám (csak 1 országnál globális)
  const [headCount, setHeadCount] = useState<number | null>(null);

  // Workshops és Krízisintervenciók
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [crisisInterventions, setCrisisInterventions] = useState<CrisisIntervention[]>([]);

  // Contract data fields (Szerződés adatai)
  const [contractFileUrl, setContractFileUrl] = useState<string | null>(null);
  const [contractPrice, setContractPrice] = useState<number | null>(null);
  const [contractPriceType, setContractPriceType] = useState<string | null>(null);
  const [contractCurrency, setContractCurrency] = useState<string | null>(null);
  const [pillarCount, setPillarCount] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [consultationRows, setConsultationRows] = useState<import("@/types/company").ConsultationRow[]>([]);
  const [industry, setIndustry] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);

  // Számlázási adatok
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [invoicingData, setInvoicingData] = useState<InvoicingData | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceComments, setInvoiceComments] = useState<InvoiceComment[]>([]);

  // Országonkénti számlázási adatok
  const [billingDataPerCountry, setBillingDataPerCountry] = useState<Record<string, BillingData>>({});
  const [invoicingDataPerCountry, setInvoicingDataPerCountry] = useState<Record<string, InvoicingData>>({});
  const [invoiceItemsPerCountry, setInvoiceItemsPerCountry] = useState<Record<string, InvoiceItem[]>>({});
  const [invoiceCommentsPerCountry, setInvoiceCommentsPerCountry] = useState<Record<string, InvoiceComment[]>>({});

  // Aktív ország fül a Számlázás panelen (ha országonként különböző)
  const [activeInvoicingCountryId, setActiveInvoicingCountryId] = useState<string>("");

  // Számla csíkok országonként (ha országonként különböző)
  const [invoiceSlipsPerCountry, setInvoiceSlipsPerCountry] = useState<Record<string, InvoiceSlip[]>>({});

  // Számla csíkok (egy cégnek több számlája lehet)
  const [invoiceSlips, setInvoiceSlips] = useState<InvoiceSlip[]>([]);
  
  // Számla sablonok (legacy - backward compatibility)
  const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>([]);

  // Aktív entitás a Számlázás panelen (ha több entitás van)
  const [activeInvoicingEntityId, setActiveInvoicingEntityId] = useState<string>("");
  
  // Entitásonkénti számlázási adatok
  const [billingDataPerEntity, setBillingDataPerEntity] = useState<Record<string, BillingData>>({});
  const [invoicingDataPerEntity, setInvoicingDataPerEntity] = useState<Record<string, InvoicingData>>({});
  const [invoiceSlipsPerEntity, setInvoiceSlipsPerEntity] = useState<Record<string, InvoiceSlip[]>>({});

  // Kontextusfüggő fülek állapota
  // CRM-ből érkező cégek mindig newcomer-ek (fromCrm state flag)
  const fromCrm = location.state?.fromCrm === true;
  
  // New company: show dialog to choose onboarding mode (unless from CRM)
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(!isEditMode && !fromCrm);
  const [isNewcomer, setIsNewcomer] = useState(fromCrm ? true : false);
  const [hasInputs, setHasInputs] = useState(false); // TODO: DB check
  const [hasNotes, setHasNotes] = useState(false); // TODO: DB check  
  const [hasStatistics, setHasStatistics] = useState(true); // TODO: DB check

  // Handle onboarding choice from dialog
  const handleOnboardingChoice = useCallback((withOnboarding: boolean) => {
    setIsNewcomer(withOnboarding);
    setShowOnboardingDialog(false);
  }, []);

  // Archived onboarding data
  const [archivedOnboarding, setArchivedOnboarding] = useState<OnboardingData | null>(null);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback((data: OnboardingData) => {
    setArchivedOnboarding(data);
    setIsNewcomer(false);
    toast.success("Bevezetés sikeresen lezárva és archiválva!");
  }, []);

  // Inputs tab callback ref
  const addInputFnRef = useRef<(() => void) | null>(null);
  const handleAddInputRef = useCallback((fn: () => void) => {
    addInputFnRef.current = fn;
  }, []);

  // Notes tab callback ref
  const addNoteFnRef = useRef<(() => void) | null>(null);
  const handleAddNoteRef = useCallback((fn: () => void) => {
    addNoteFnRef.current = fn;
  }, []);

  // Load company data in edit mode
  useEffect(() => {
    const loadCompany = async () => {
      if (!isEditMode || !companyId) return;
      
      setFormLoading(true);
      const company = await getCompanyById(companyId);
      
      if (company) {
        setName(company.name);
        setDispatchName(company.dispatch_name);
        setActive(company.active);
        setCountryIds(company.country_ids);
        setContractHolderId(company.contract_holder_id);
        setOrgId(company.org_id);
        setContractStart(company.contract_start);
        setContractEnd(company.contract_end);
        setContractReminderEmail(company.contract_reminder_email);
        setLeadAccountId(company.lead_account_id);
        // connectedCompanyId eltávolítva - már nincs használatban
        setCountryDifferentiates(company.countryDifferentiates);
        setCountrySettings(company.countrySettings);
        setBillingData(company.billingData);
        setInvoicingData(company.invoicingData);
        setInvoiceItems(company.invoiceItems);
        setInvoiceComments(company.invoiceComments);
        // Load newcomer status from company data (e.g. from CRM)
        if (company.isNewcomer) {
          setIsNewcomer(true);
        }
      }
      
      setFormLoading(false);
    };
    
    loadCompany();
  }, [isEditMode, companyId, getCompanyById]);

  // Új ország hozzáadásakor automatikusan beállítjuk az added_at dátumot
  const prevCountryIdsRef = useRef<string[]>([]);
  useEffect(() => {
    const prevIds = prevCountryIdsRef.current;
    const newCountryIds = countryIds.filter(id => !prevIds.includes(id));
    
    if (newCountryIds.length > 0) {
      const now = new Date().toISOString();
      const newSettings: CompanyCountrySettings[] = newCountryIds
        .filter(id => !countrySettings.find(cs => cs.country_id === id))
        .map(id => ({
          id: `new-${id}`,
          company_id: companyId || "",
          country_id: id,
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
          added_at: now,
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
        }));
      
      if (newSettings.length > 0) {
        setCountrySettings(prev => [...prev, ...newSettings]);
      }
    }
    
    prevCountryIdsRef.current = countryIds;
  }, [countryIds, countrySettings, companyId]);

  // Account admins from users
  const accountAdmins: AccountAdmin[] = users.map(u => ({
    id: u.id,
    name: u.name,
  }));

  // Connected companies (other companies)
  const connectedCompanies = companies
    .filter(c => c.id !== companyId)
    .map(c => ({ id: c.id, name: c.name }));

  // Dinamikus layout: 1 ország = panelek, több ország = fülek
  const isSingleCountry = countryIds.length <= 1;
  const isMultiCountry = countryIds.length > 1;
  const isCGP = contractHolderId === "2";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("A cégnév megadása kötelező");
      return;
    }

    if (countryIds.length === 0) {
      toast.error("Legalább egy országot ki kell választani");
      return;
    }

    try {
      if (isEditMode && companyId) {
        const success = await updateCompany(companyId, {
          name,
          dispatchName,
          countryIds,
          contractHolderType: contractHolderId === "2" ? "cgp" : contractHolderId === "1" ? "telus" : null,
          connectedCompanyId: null, // eltávolítva
          leadAccountUserId: leadAccountId,
          countryDifferentiates,
          billingData: billingData ?? {},
          invoicingData: invoicingData ?? {},
          invoiceItems: invoiceItems,
          invoiceComments: invoiceComments,
        });
        
        if (success) {
          toast.success("Cég frissítve");
          navigate("/dashboard/settings/companies");
        } else {
          toast.error("Hiba történt a mentés során");
        }
      } else {
        const newCompany = await createCompany({
          name,
          dispatchName,
          countryIds,
          contractHolderType: contractHolderId === "2" ? "cgp" : contractHolderId === "1" ? "telus" : null,
          connectedCompanyId: null, // eltávolítva
          leadAccountUserId: leadAccountId,
        });
        
        if (newCompany) {
          // Ha vannak pending entitások, létrehozzuk őket a frissen létrehozott céghez
          if (pendingEntities.length > 0 && countryDifferentiates.has_multiple_entities) {
            for (const pendingEntity of pendingEntities) {
              await createEntity({
                ...pendingEntity,
                company_id: newCompany.id,
              });
            }
          }
          
          toast.success("Cég létrehozva");
          navigate("/dashboard/settings/companies");
        } else {
          toast.error("Hiba történt a létrehozás során");
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Hiba történt a mentés során");
    }
  };

  const handleSetNewPassword = () => {
    toast.info("Jelszó beállítás dialógus - fejlesztés alatt");
  };

  // === Entity handlers (shared between single and multi country modes) ===
  const handleAddEntity = async (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => {
    if (isEditMode) {
      await createEntity(entity);
    } else {
      // Új cég: helyi state-be mentjük ideiglenes ID-val
      const tempEntity: ContractedEntity = {
        ...entity,
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPendingEntities(prev => [...prev, tempEntity]);
    }
  };

  const handleUpdateEntity = async (id: string, updates: Partial<ContractedEntity>) => {
    if (isEditMode) {
      await updateEntity(id, updates);
    } else {
      // Új cég: helyi state frissítése
      setPendingEntities(prev => prev.map(e => 
        e.id === id ? { ...e, ...updates } : e
      ));
    }
  };

  const handleDeleteEntity = async (id: string) => {
    if (isEditMode) {
      await deleteEntity(id);
    } else {
      // Új cég: helyi state-ből törlés
      setPendingEntities(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleAddInvoiceList = () => {
    const now = Date.now();

    const makeDefaultSlipItems = (slipId: string): InvoiceItem[] => [
      {
        id: `new-item-${now}-mult`,
        invoicing_data_id: slipId,
        item_name: "Szorzás tétel",
        item_type: "multiplication",
        amount_name: "Egységár (PEPM)",
        amount_value: null,
        volume_name: "Munkavállalói létszám",
        volume_value: null,
        is_amount_changing: false,
        is_volume_changing: false,
        show_by_item: false,
        show_activity_id: true,
        with_timestamp: false,
        comment: null,
        data_request_email: null,
        data_request_salutation: null,
      },
    ];

    if (countryDifferentiates.invoicing) {
      const countryId = activeInvoicingCountryId || countryIds[0];
      if (!countryId) {
        toast.error("Nincs kiválasztott ország");
        return;
      }

      const currentSlips = invoiceSlipsPerCountry[countryId] || [];
      const currentItems = invoiceItemsPerCountry[countryId] || [];
      const currentComments = invoiceCommentsPerCountry[countryId] || [];

      if (currentSlips.length === 0) {
        const firstSlip: InvoiceSlip = {
          id: `slip-1-${now}`,
          admin_identifier: "Számla #1",
          items: currentItems.length > 0 ? [...currentItems] : [],
          comments: currentComments.length > 0 ? [...currentComments] : [],
        };

        const secondSlipId = `slip-2-${now}`;
        const secondSlip: InvoiceSlip = {
          id: secondSlipId,
          admin_identifier: null,
          items: makeDefaultSlipItems(secondSlipId),
          comments: [],
        };

        setInvoiceSlipsPerCountry({
          ...invoiceSlipsPerCountry,
          [countryId]: [firstSlip, secondSlip],
        });

        setInvoiceItemsPerCountry({ ...invoiceItemsPerCountry, [countryId]: [] });
        setInvoiceCommentsPerCountry({ ...invoiceCommentsPerCountry, [countryId]: [] });
      } else {
        const newSlipId = `slip-${currentSlips.length + 1}-${now}`;
        const newSlip: InvoiceSlip = {
          id: newSlipId,
          admin_identifier: null,
          items: makeDefaultSlipItems(newSlipId),
          comments: [],
        };

        setInvoiceSlipsPerCountry({
          ...invoiceSlipsPerCountry,
          [countryId]: [...currentSlips, newSlip],
        });
      }

      toast.success("Új számla csík létrehozva");
      return;
    }

    if (invoiceSlips.length === 0) {
      const firstSlip: InvoiceSlip = {
        id: `slip-1-${now}`,
        admin_identifier: "Számla #1",
        items: invoiceItems.length > 0 ? [...invoiceItems] : [],
        comments: invoiceComments.length > 0 ? [...invoiceComments] : [],
      };

      const secondSlipId = `slip-2-${now}`;
      const secondSlip: InvoiceSlip = {
        id: secondSlipId,
        admin_identifier: null,
        items: makeDefaultSlipItems(secondSlipId),
        comments: [],
      };

      setInvoiceSlips([firstSlip, secondSlip]);
      setInvoiceItems([]);
      setInvoiceComments([]);
    } else {
      const newSlipId = `slip-${invoiceSlips.length + 1}-${now}`;
      const newSlip: InvoiceSlip = {
        id: newSlipId,
        admin_identifier: null,
        items: makeDefaultSlipItems(newSlipId),
        comments: [],
      };
      setInvoiceSlips([...invoiceSlips, newSlip]);
    }

    toast.success("Új számla csík létrehozva");
  };

  if (companiesLoading || formLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Betöltés...</span>
      </div>
    );
  }

  // === SINGLE COUNTRY LAYOUT (összecsukható panelek) ===
  const renderSingleCountryLayout = () => (
    <div className="space-y-4">
      {/* Bevezetés panel - ELSŐ, ha Új érkező */}
      {isNewcomer && (
        <CollapsiblePanel title="Bevezetés" variant="highlight" defaultOpen>
          <OnboardingTabContent companyId={companyId || "new"} onComplete={handleOnboardingComplete} isEmpty={!isEditMode} />
        </CollapsiblePanel>
      )}

      {/* Alapadatok panel */}
      <CollapsiblePanel title="Alapadatok">
        <SingleCountryBasicDataPanel
          companyId={companyId}
          name={name}
          setName={setName}
          dispatchName={dispatchName}
          setDispatchName={setDispatchName}
          active={active}
          setActive={setActive}
          countryIds={countryIds}
          setCountryIds={setCountryIds}
          contractHolderId={contractHolderId}
          setContractHolderId={setContractHolderId}
          orgId={orgId}
          setOrgId={setOrgId}
          contractStart={contractStart}
          setContractStart={setContractStart}
          contractEnd={contractEnd}
          setContractEnd={setContractEnd}
          contractReminderEmail={contractReminderEmail}
          setContractReminderEmail={setContractReminderEmail}
          countries={countries}
          contractHolders={mockContractHolders}
          headCount={headCount}
          setHeadCount={setHeadCount}
          workshops={workshops}
          setWorkshops={setWorkshops}
          crisisInterventions={crisisInterventions}
          setCrisisInterventions={setCrisisInterventions}
          clientDashboardUsers={clientDashboardUsers}
          setClientDashboardUsers={setClientDashboardUsers}
          onSetNewPassword={(userId: string) => toast.info(`Új jelszó beállítása: ${userId} - fejlesztés alatt`)}
          // Contract data fields
          contractFileUrl={contractFileUrl}
          setContractFileUrl={setContractFileUrl}
          contractPrice={contractPrice}
          setContractPrice={setContractPrice}
          contractPriceType={contractPriceType}
          setContractPriceType={setContractPriceType}
          contractCurrency={contractCurrency}
          setContractCurrency={setContractCurrency}
          pillarCount={pillarCount}
          setPillarCount={setPillarCount}
          sessionCount={sessionCount}
          setSessionCount={setSessionCount}
          consultationRows={consultationRows}
          setConsultationRows={setConsultationRows}
          industry={industry}
          setIndustry={setIndustry}
          priceHistory={priceHistory}
          setPriceHistory={setPriceHistory}
          // Contracted entities
          entities={entities.filter(e => e.country_id === countryIds[0])}
          hasMultipleEntities={countryDifferentiates.has_multiple_entities}
          onToggleMultipleEntities={(enabled) => setCountryDifferentiates(prev => ({ ...prev, has_multiple_entities: enabled }))}
          onAddEntity={handleAddEntity}
          onUpdateEntity={handleUpdateEntity}
          onDeleteEntity={handleDeleteEntity}
          isEntitiesLoading={isEditMode ? entitiesLoading : false}
        />
        
        {/* Archived onboarding panel - only shown after onboarding completion */}
        {archivedOnboarding && (
          <ArchivedOnboardingPanel data={archivedOnboarding} />
        )}
        
        {/* Mentés gomb az Alapadatok panelben */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t">
          <Button type="submit" className="rounded-xl">
            <Save className="h-4 w-4 mr-2" />
            Mentés
          </Button>
        </div>
      </CollapsiblePanel>

      {/* Számlázás panel (csak CGP) */}
      {(isCGP || !contractHolderId) && (
        <CollapsiblePanel title="Számlázás">
          {/* Entitás fülek ha több entitás van */}
          {countryDifferentiates.has_multiple_entities && entities.filter(e => e.country_id === countryIds[0]).length > 0 && (
            <EntityInvoicingTabs
              entities={entities.filter(e => e.country_id === countryIds[0])}
              hasMultipleEntities={countryDifferentiates.has_multiple_entities}
              activeEntityId={activeInvoicingEntityId || entities.filter(e => e.country_id === countryIds[0])[0]?.id || ""}
              onActiveEntityChange={setActiveInvoicingEntityId}
            >
              {(entityId, entity) => {
                // Get or create entity-specific billing data
                const entityBillingData = billingDataPerEntity[entityId] || getDefaultEntityBillingData(entityId);
                const entityInvoicingData = invoicingDataPerEntity[entityId] || getDefaultEntityInvoicingData(entityId);
                
                return (
                  <EntityBillingPanel
                    entity={entity}
                    billingData={entityBillingData}
                    setBillingData={(data) => {
                      setBillingDataPerEntity(prev => ({
                        ...prev,
                        [entityId]: data
                      }));
                    }}
                    invoicingData={entityInvoicingData}
                    setInvoicingData={(data) => {
                      setInvoicingDataPerEntity(prev => ({
                        ...prev,
                        [entityId]: data
                      }));
                    }}
                  />
                );
              }}
            </EntityInvoicingTabs>
          )}
          
          {/* Normál számlázás panel ha nincs több entitás */}
          {!countryDifferentiates.has_multiple_entities && (
            <CompanyInvoicingPanel
              countryDifferentiates={countryDifferentiates}
              setCountryDifferentiates={setCountryDifferentiates}
              billingData={billingData}
              setBillingData={setBillingData}
              invoicingData={invoicingData}
              setInvoicingData={setInvoicingData}
              invoiceItems={invoiceItems}
              setInvoiceItems={setInvoiceItems}
              invoiceComments={invoiceComments}
              setInvoiceComments={setInvoiceComments}
              countryIds={countryIds}
              countries={countries}
              companyId={companyId || "new"}
              billingDataPerCountry={billingDataPerCountry}
              setBillingDataPerCountry={setBillingDataPerCountry}
              invoicingDataPerCountry={invoicingDataPerCountry}
              setInvoicingDataPerCountry={setInvoicingDataPerCountry}
              invoiceItemsPerCountry={invoiceItemsPerCountry}
              setInvoiceItemsPerCountry={setInvoiceItemsPerCountry}
              invoiceCommentsPerCountry={invoiceCommentsPerCountry}
              setInvoiceCommentsPerCountry={setInvoiceCommentsPerCountry}
              invoiceSlips={invoiceSlips}
              setInvoiceSlips={setInvoiceSlips}
              activeInvoicingCountryId={activeInvoicingCountryId}
              setActiveInvoicingCountryId={setActiveInvoicingCountryId}
              invoiceSlipsPerCountry={invoiceSlipsPerCountry}
              setInvoiceSlipsPerCountry={setInvoiceSlipsPerCountry}
              invoiceTemplates={invoiceTemplates}
              setInvoiceTemplates={setInvoiceTemplates}
            />
          )}
          
          {/* Mentés és Új számla gombok a Számlázás panelben */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <Button type="submit" className="rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              Mentés
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddInvoiceList}
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Új számla hozzáadása
            </Button>
          </div>
        </CollapsiblePanel>
      )}

      {/* Inputok panel */}
      <CollapsiblePanel title="Inputok">
        <InputsTabContent companyId={companyId || "new"} onAddInputRef={handleAddInputRef} />
        <div className="flex items-center gap-4 mt-6 pt-4 border-t">
          <Button type="submit" className="rounded-xl">
            <Save className="h-4 w-4 mr-2" />
            Mentés
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => addInputFnRef.current?.()}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Új input hozzáadása
          </Button>
        </div>
      </CollapsiblePanel>

      {/* Feljegyzések panel */}
      <CollapsiblePanel title="Feljegyzések">
        <NotesTabContent companyId={companyId || "new"} onAddNoteRef={handleAddNoteRef} />
        <div className="flex items-center gap-4 mt-6 pt-4 border-t">
          <Button type="submit" className="rounded-xl">
            <Save className="h-4 w-4 mr-2" />
            Mentés
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => addNoteFnRef.current?.()}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Új feljegyzés hozzáadása
          </Button>
        </div>
      </CollapsiblePanel>

      {/* Statisztikák panel */}
      <CollapsiblePanel title="Statisztikák">
        <StatisticsTabContent companyId={companyId || "new"} />
        <div className="flex items-center gap-4 mt-6 pt-4 border-t">
          <Button type="submit" className="rounded-xl">
            <Save className="h-4 w-4 mr-2" />
            Mentés
          </Button>
        </div>
      </CollapsiblePanel>
    </div>
  );

  // === MULTI COUNTRY LAYOUT (fülek) ===
  const renderMultiCountryLayout = () => {
    // Alap fülek - Bevezetés ELSŐ helyen ha Új érkező
    const onboardingTab: CompanyTab = {
      id: "onboarding",
      label: "Bevezetés",
      visible: isNewcomer,
      variant: "highlight",
      content: (
        <div className="space-y-6">
          <OnboardingTabContent companyId={companyId || "new"} onComplete={handleOnboardingComplete} isEmpty={!isEditMode} />
        </div>
      ),
    };

    const baseTabs: CompanyTab[] = [
      {
        id: "basic",
        label: "Alapadatok",
        visible: true,
        content: (
          <div className="space-y-6">
            <MultiCountryBasicDataPanel
              name={name}
              setName={setName}
              dispatchName={dispatchName}
              setDispatchName={setDispatchName}
              active={active}
              setActive={setActive}
              countryIds={countryIds}
              setCountryIds={setCountryIds}
              contractHolderId={contractHolderId}
              setContractHolderId={setContractHolderId}
              orgId={orgId}
              setOrgId={setOrgId}
              contractStart={contractStart}
              setContractStart={setContractStart}
              contractEnd={contractEnd}
              setContractEnd={setContractEnd}
              contractReminderEmail={contractReminderEmail}
              setContractReminderEmail={setContractReminderEmail}
              countryDifferentiates={countryDifferentiates}
              setCountryDifferentiates={setCountryDifferentiates}
              countries={countries}
              contractHolders={mockContractHolders}
              // Contract data fields
              contractFileUrl={contractFileUrl}
              setContractFileUrl={setContractFileUrl}
              contractPrice={contractPrice}
              setContractPrice={setContractPrice}
              contractPriceType={contractPriceType}
              setContractPriceType={setContractPriceType}
              contractCurrency={contractCurrency}
              setContractCurrency={setContractCurrency}
              pillarCount={pillarCount}
              setPillarCount={setPillarCount}
              sessionCount={sessionCount}
              setSessionCount={setSessionCount}
              consultationRows={consultationRows}
              setConsultationRows={setConsultationRows}
              industry={industry}
              setIndustry={setIndustry}
              priceHistory={priceHistory}
              setPriceHistory={setPriceHistory}
              countrySettings={countrySettings}
              setCountrySettings={setCountrySettings}
              invoiceTemplates={invoiceTemplates}
              setInvoiceTemplates={setInvoiceTemplates}
            />
            
            {/* Archived onboarding panel - only shown after onboarding completion */}
            {archivedOnboarding && (
              <ArchivedOnboardingPanel data={archivedOnboarding} />
            )}
            
            {/* Mentés gomb - csak ha NEM országonként különböző, mert akkor nincs mit menteni itt */}
            {!countryDifferentiates.basic_data && (
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button type="submit" className="rounded-xl">
                  <Save className="h-4 w-4 mr-2" />
                  Mentés
                </Button>
              </div>
            )}
          </div>
        ),
      },
      {
        id: "countries",
        label: "Országok",
        visible: true,
        content: (
          <div className="space-y-6">
            <CompanyCountrySettingsPanel
              countryIds={countryIds}
              countries={countries}
              countrySettings={countrySettings}
              setCountrySettings={setCountrySettings}
              countryDifferentiates={countryDifferentiates}
              setCountryDifferentiates={setCountryDifferentiates}
              contractHolders={mockContractHolders}
              accountAdmins={accountAdmins}
              globalContractHolderId={contractHolderId}
              workshops={workshops}
              setWorkshops={setWorkshops}
              crisisInterventions={crisisInterventions}
              setCrisisInterventions={setCrisisInterventions}
              companyId={companyId}
              entities={entities}
              onAddEntity={handleAddEntity}
              onUpdateEntity={handleUpdateEntity}
              onDeleteEntity={handleDeleteEntity}
              isEntitiesLoading={entitiesLoading}
            />
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button type="submit" className="rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: "client-dashboard",
        label: "Client Dashboard",
        visible: isCGP || !contractHolderId,
        content: (
          <div className="space-y-6">
            <ClientDashboardTabContent companyId={companyId || "new"} countryIds={countryIds} />
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button type="submit" className="rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => toast.info("Új felhasználó hozzáadása - fejlesztés alatt")}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Új felhasználó hozzáadása
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: "invoicing",
        label: "Számlázás",
        visible: isCGP || !contractHolderId,
        content: (
          <div className="space-y-6">
            <CompanyInvoicingPanel
              countryDifferentiates={countryDifferentiates}
              setCountryDifferentiates={setCountryDifferentiates}
              billingData={billingData}
              setBillingData={setBillingData}
              invoicingData={invoicingData}
              setInvoicingData={setInvoicingData}
              invoiceItems={invoiceItems}
              setInvoiceItems={setInvoiceItems}
              invoiceComments={invoiceComments}
              setInvoiceComments={setInvoiceComments}
              countryIds={countryIds}
              countries={countries}
              companyId={companyId || "new"}
              billingDataPerCountry={billingDataPerCountry}
              setBillingDataPerCountry={setBillingDataPerCountry}
              invoicingDataPerCountry={invoicingDataPerCountry}
              setInvoicingDataPerCountry={setInvoicingDataPerCountry}
              invoiceItemsPerCountry={invoiceItemsPerCountry}
              setInvoiceItemsPerCountry={setInvoiceItemsPerCountry}
              invoiceCommentsPerCountry={invoiceCommentsPerCountry}
              setInvoiceCommentsPerCountry={setInvoiceCommentsPerCountry}
              invoiceSlips={invoiceSlips}
              setInvoiceSlips={setInvoiceSlips}
              activeInvoicingCountryId={activeInvoicingCountryId}
              setActiveInvoicingCountryId={setActiveInvoicingCountryId}
              invoiceSlipsPerCountry={invoiceSlipsPerCountry}
              setInvoiceSlipsPerCountry={setInvoiceSlipsPerCountry}
              invoiceTemplates={invoiceTemplates}
              setInvoiceTemplates={setInvoiceTemplates}
              entities={entities.map(e => ({ id: e.id, name: e.name, country_id: e.country_id }))}
              billingDataPerEntity={billingDataPerEntity}
              setBillingDataPerEntity={setBillingDataPerEntity}
              invoicingDataPerEntity={invoicingDataPerEntity}
              setInvoicingDataPerEntity={setInvoicingDataPerEntity}
            />
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button type="submit" className="rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddInvoiceList}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Új számla hozzáadása
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: "inputs",
        label: "Inputok",
        visible: true,
        content: (
          <div className="space-y-6">
            <InputsTabContent companyId={companyId || "new"} onAddInputRef={handleAddInputRef} />
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button type="submit" className="rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addInputFnRef.current?.()}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Új input hozzáadása
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: "notes",
        label: "Feljegyzések",
        visible: true,
        content: (
          <div className="space-y-6">
            <NotesTabContent companyId={companyId || "new"} onAddNoteRef={handleAddNoteRef} />
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button type="submit" className="rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addNoteFnRef.current?.()}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Új feljegyzés hozzáadása
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: "statistics",
        label: "Statisztikák",
        visible: true,
        content: (
          <div className="space-y-6">
            <StatisticsTabContent companyId={companyId || "new"} />
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button type="submit" className="rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </Button>
            </div>
          </div>
        ),
      },
    ];

    // Ha Új érkező, a Bevezetés fül ELSŐ helyen
    const tabs: CompanyTab[] = isNewcomer 
      ? [onboardingTab, ...baseTabs]
      : baseTabs;

    return <CompanyTabContainer tabs={tabs} defaultTab={isNewcomer ? "onboarding" : "basic"} />;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const state = location.state as
              | {
                  from?: string;
                  companiesListState?: { selectedCountryIds: string[]; openCountries: string[] };
                }
              | undefined;

            if (state?.from === "/dashboard/settings/companies") {
              navigate(state.from, { state: state.companiesListState });
              return;
            }

            navigate(-1);
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? name || "Cég szerkesztése" : "Új cég hozzáadása"}
        </h1>
      </div>

      {/* Onboarding choice dialog for new companies */}
      <NewCompanyOnboardingDialog
        open={showOnboardingDialog}
        onChoice={handleOnboardingChoice}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dinamikus layout az országok száma alapján */}
        {isSingleCountry ? renderSingleCountryLayout() : renderMultiCountryLayout()}
      </form>
    </div>
  );
};

export default CompanyForm;
