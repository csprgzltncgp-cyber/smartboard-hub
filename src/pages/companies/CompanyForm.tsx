import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CompanyBasicDataPanel } from "@/components/companies/CompanyBasicDataPanel";
import { CompanyCountrySettingsPanel } from "@/components/companies/CompanyCountrySettingsPanel";
import { CompanyInvoicingPanel } from "@/components/companies/CompanyInvoicingPanel";
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
  const [connectedCompanyId, setConnectedCompanyId] = useState<string | null>(null);

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

  // Workshops és Krízisintervenciók
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [crisisInterventions, setCrisisInterventions] = useState<CrisisIntervention[]>([]);

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
        setConnectedCompanyId(company.connected_company_id);
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
          connectedCompanyId,
          leadAccountUserId: leadAccountId,
          countryDifferentiates,
          billingData: billingData || undefined,
          invoicingData: invoicingData || undefined,
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
          connectedCompanyId,
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
    toast.info("Új számlázási lista hozzáadása - fejlesztés alatt");
  };

  if (companiesLoading || formLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Betöltés...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/settings/companies")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? name || "Cég szerkesztése" : "Új cég hozzáadása"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Alapadatok panel */}
        <div className="bg-card border rounded-lg p-6">
          <CompanyBasicDataPanel
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
            leadAccountId={leadAccountId}
            setLeadAccountId={setLeadAccountId}
            connectedCompanyId={connectedCompanyId}
            setConnectedCompanyId={setConnectedCompanyId}
            countryDifferentiates={countryDifferentiates}
            setCountryDifferentiates={setCountryDifferentiates}
            countries={countries}
            contractHolders={mockContractHolders}
            accountAdmins={accountAdmins}
            connectedCompanies={connectedCompanies}
            clientUsername={clientUsername}
            setClientUsername={setClientUsername}
            clientLanguageId={clientLanguageId}
            setClientLanguageId={setClientLanguageId}
            hasClientPassword={hasClientPassword}
            onSetNewPassword={handleSetNewPassword}
          />
        </div>

        {/* Ország beállítások panel */}
        {countryIds.length > 0 && (
          <div className="bg-card border rounded-lg p-6">
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
          </div>
        )}

        {/* Számlázás panel (csak CGP esetén) */}
        {(contractHolderId === "2" || !contractHolderId) && (
          <div className="bg-card border rounded-lg p-6">
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
              billingDataPerCountry={billingDataPerCountry}
              setBillingDataPerCountry={setBillingDataPerCountry}
              invoicingDataPerCountry={invoicingDataPerCountry}
              setInvoicingDataPerCountry={setInvoicingDataPerCountry}
              invoiceItemsPerCountry={invoiceItemsPerCountry}
              setInvoiceItemsPerCountry={setInvoiceItemsPerCountry}
              invoiceCommentsPerCountry={invoiceCommentsPerCountry}
              setInvoiceCommentsPerCountry={setInvoiceCommentsPerCountry}
            />
          </div>
        )}

        {/* Műveletek */}
        <div className="flex items-center gap-4">
          <Button type="submit" className="rounded-xl">
            <Save className="h-4 w-4 mr-2" />
            Mentés
          </Button>

          {contractHolderId === "2" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddInvoiceList}
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Új számla hozzáadása
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
