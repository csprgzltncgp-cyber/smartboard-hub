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
import { InputsTabContent } from "@/components/companies/tabs/InputsTabContent";
import { NotesTabContent } from "@/components/companies/tabs/NotesTabContent";
import { StatisticsTabContent } from "@/components/companies/tabs/StatisticsTabContent";
import { ClientDashboardTabContent } from "@/components/companies/tabs/ClientDashboardTabContent";
import { InvoiceSlip } from "@/components/companies/InvoiceSlipCard";
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

  const [formLoading, setFormLoading] = useState(isEditMode);

  // Alapadatok
  const [name, setName] = useState("");
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

  // Kontextusfüggő fülek állapota
  const [isNewcomer, setIsNewcomer] = useState(false); // CRM-ből érkezik
  const [hasInputs, setHasInputs] = useState(false); // TODO: DB check
  const [hasNotes, setHasNotes] = useState(false); // TODO: DB check  
  const [hasStatistics, setHasStatistics] = useState(true); // TODO: DB check

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
      }
      
      setFormLoading(false);
    };
    
    loadCompany();
  }, [isEditMode, companyId, getCompanyById]);

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
          countryIds,
          contractHolderType: contractHolderId === "2" ? "cgp" : contractHolderId === "1" ? "telus" : null,
          connectedCompanyId: null, // eltávolítva
          leadAccountUserId: leadAccountId,
        });
        
        if (newCompany) {
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
          <OnboardingTabContent companyId={companyId || "new"} />
          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <Button type="submit" className="rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              Mentés
            </Button>
          </div>
        </CollapsiblePanel>
      )}

      {/* Alapadatok panel */}
      <CollapsiblePanel title="Alapadatok">
        <SingleCountryBasicDataPanel
          name={name}
          setName={setName}
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
        />
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
          <OnboardingTabContent companyId={companyId || "new"} />
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit" className="rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              Mentés
            </Button>
          </div>
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
              contractHolders={mockContractHolders}
              accountAdmins={accountAdmins}
              globalContractHolderId={contractHolderId}
              workshops={workshops}
              setWorkshops={setWorkshops}
              crisisInterventions={crisisInterventions}
              setCrisisInterventions={setCrisisInterventions}
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dinamikus layout az országok száma alapján */}
        {isSingleCountry ? renderSingleCountryLayout() : renderMultiCountryLayout()}
      </form>
    </div>
  );
};

export default CompanyForm;
