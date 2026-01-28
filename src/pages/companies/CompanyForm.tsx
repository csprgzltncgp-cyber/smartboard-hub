import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus } from "lucide-react";
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

// Mock adatok
const mockCountries = [
  { id: "hu", code: "HU", name: "Magyarország" },
  { id: "cz", code: "CZ", name: "Csehország" },
  { id: "sk", code: "SK", name: "Szlovákia" },
  { id: "pl", code: "PL", name: "Lengyelország" },
  { id: "ro", code: "RO", name: "Románia" },
  { id: "rs", code: "RS", name: "Szerbia" },
];

const mockContractHolders: ContractHolder[] = [
  { id: "1", name: "Lifeworks" },
  { id: "2", name: "CGP" },
  { id: "3", name: "Compsych" },
  { id: "4", name: "Optum" },
  { id: "5", name: "Pulso" },
  { id: "6", name: "VPO Telus" },
];

const mockAccountAdmins: AccountAdmin[] = [
  { id: "1", name: "Kiss Anna" },
  { id: "2", name: "Nagy Péter" },
  { id: "3", name: "Szabó Mária" },
];

// Mock kapcsolt cégek
const mockConnectedCompanies = [
  { id: "c1", name: "Anyacég Kft." },
  { id: "c2", name: "Partner Zrt." },
  { id: "c3", name: "Leányvállalat Bt." },
];

const CompanyForm = () => {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  const isEditMode = Boolean(companyId);

  // Alapadatok
  const [name, setName] = useState(isEditMode ? "Magyar Telekom Nyrt." : "");
  const [active, setActive] = useState(true);
  const [countryIds, setCountryIds] = useState<string[]>(isEditMode ? ["hu"] : []);
  const [contractHolderId, setContractHolderId] = useState<string | null>(isEditMode ? "2" : null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [contractStart, setContractStart] = useState<string | null>(isEditMode ? "2023-01-01" : null);
  const [contractEnd, setContractEnd] = useState<string | null>(isEditMode ? "2025-12-31" : null);
  const [contractReminderEmail, setContractReminderEmail] = useState<string | null>(null);
  const [leadAccountId, setLeadAccountId] = useState<string | null>(isEditMode ? "1" : null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("A cégnév megadása kötelező");
      return;
    }

    if (countryIds.length === 0) {
      toast.error("Legalább egy országot ki kell választani");
      return;
    }

    // Mock save
    toast.success(isEditMode ? "Cég frissítve" : "Cég létrehozva");
    navigate("/dashboard/settings/companies");
  };

  const handleSetNewPassword = () => {
    toast.info("Jelszó beállítás dialógus - fejlesztés alatt");
  };

  const handleAddInvoiceList = () => {
    toast.info("Új számlázási lista hozzáadása - fejlesztés alatt");
  };

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
          {isEditMode ? name : "Új cég hozzáadása"}
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
            countries={mockCountries}
            contractHolders={mockContractHolders}
            accountAdmins={mockAccountAdmins}
            connectedCompanies={mockConnectedCompanies}
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
              countries={mockCountries}
              countrySettings={countrySettings}
              setCountrySettings={setCountrySettings}
              countryDifferentiates={countryDifferentiates}
              contractHolders={mockContractHolders}
              accountAdmins={mockAccountAdmins}
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
