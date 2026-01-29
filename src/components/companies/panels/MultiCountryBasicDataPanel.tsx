import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import { DifferentPerCountryToggle } from "../DifferentPerCountryToggle";
import { Checkbox } from "@/components/ui/checkbox";
import { CountryDifferentiate, ContractHolder, ConsultationRow, PriceHistoryEntry, CompanyCountrySettings, InvoiceTemplate } from "@/types/company";
import { ContractDataPanel } from "./ContractDataPanel";
import { MigrateBasicDataDialog } from "../dialogs/MigrateBasicDataDialog";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface MultiCountryBasicDataPanelProps {
  name: string;
  setName: (name: string) => void;
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
  countryDifferentiates: CountryDifferentiate;
  setCountryDifferentiates: (diff: CountryDifferentiate) => void;
  countries: Country[];
  contractHolders: ContractHolder[];
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
  // For migration dialog
  countrySettings: CompanyCountrySettings[];
  setCountrySettings: (settings: CompanyCountrySettings[]) => void;
  invoiceTemplates: InvoiceTemplate[];
  setInvoiceTemplates: (templates: InvoiceTemplate[]) => void;
}

export const MultiCountryBasicDataPanel = ({
  name,
  setName,
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
  countryDifferentiates,
  setCountryDifferentiates,
  countries,
  contractHolders,
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
  // For migration
  countrySettings,
  setCountrySettings,
  invoiceTemplates,
  setInvoiceTemplates,
}: MultiCountryBasicDataPanelProps) => {
  const [showMigrateDialog, setShowMigrateDialog] = useState(false);
  
  const isCGP = contractHolderId === "2";
  const isLifeworks = contractHolderId === "1";

  const updateDifferentiate = (key: keyof CountryDifferentiate, value: boolean) => {
    setCountryDifferentiates({ ...countryDifferentiates, [key]: value });
  };

  const countryOptions = countries.map((c) => ({ id: c.id, label: c.name }));
  const selectedCountries = countries.filter((c) => countryIds.includes(c.id));

  // Check if there's existing basic data to migrate
  const hasBasicData = Boolean(
    contractHolderId || 
    contractPrice || 
    contractFileUrl || 
    consultationRows.length > 0 ||
    industry ||
    pillarCount ||
    sessionCount
  );

  // Check if there's existing invoicing data to migrate
  const hasInvoicingData = invoiceTemplates.length > 0;

  // Handle basic_data toggle change
  const handleBasicDataToggleChange = (checked: boolean) => {
    if (checked && (hasBasicData || hasInvoicingData) && countryIds.length > 1) {
      // Show migration dialog to ask which country the data should go to
      setShowMigrateDialog(true);
    } else {
      // No data to migrate, just toggle
      setCountryDifferentiates({ ...countryDifferentiates, basic_data: checked });
    }
  };

  // Handle migration confirmation
  const handleMigrationConfirm = (basicDataCountryId: string | null, invoicingCountryId: string | null) => {
    // Migrate basic data to the selected country
    if (basicDataCountryId && hasBasicData) {
      const existingSettings = countrySettings.find((cs) => cs.country_id === basicDataCountryId);
      const updatedSettings: CompanyCountrySettings = {
        ...(existingSettings || {
          id: `new-${basicDataCountryId}`,
          company_id: "",
          country_id: basicDataCountryId,
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
        }),
        // Migrate basic data fields
        contract_holder_id: contractHolderId,
        contract_file_url: contractFileUrl,
        contract_price: contractPrice,
        contract_price_type: contractPriceType,
        contract_currency: contractCurrency,
        pillar_count: pillarCount,
        session_count: sessionCount,
        consultation_rows: consultationRows,
        industry: industry,
        price_history: priceHistory,
        contract_start: contractStart,
        contract_end: contractEnd,
        org_id: orgId,
      };

      const newCountrySettings = countrySettings.filter(
        (cs) => cs.country_id !== basicDataCountryId
      );
      setCountrySettings([...newCountrySettings, updatedSettings]);
    }

    // Migrate invoicing data to the selected country
    if (invoicingCountryId && hasInvoicingData) {
      const updatedTemplates = invoiceTemplates.map((template) => ({
        ...template,
        country_id: invoicingCountryId,
      }));
      setInvoiceTemplates(updatedTemplates);
      
      // Also enable invoicing differentiate
      setCountryDifferentiates({
        ...countryDifferentiates,
        basic_data: true,
        invoicing: true,
      });
    } else {
      setCountryDifferentiates({ ...countryDifferentiates, basic_data: true });
    }

    setShowMigrateDialog(false);
  };

  // Handle migration cancel
  const handleMigrationCancel = () => {
    // Don't toggle the switch if cancelled
    setShowMigrateDialog(false);
  };

  return (
    <>
      <MigrateBasicDataDialog
        open={showMigrateDialog}
        onOpenChange={setShowMigrateDialog}
        countries={selectedCountries}
        hasBasicData={hasBasicData}
        hasInvoicingData={hasInvoicingData}
        onConfirm={handleMigrationConfirm}
        onCancel={handleMigrationCancel}
      />
    <div className="space-y-6">
      {/* Cégnév */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label>Cégnév</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cégnév"
            required
          />
        </div>
      </div>

      {/* Országok - ez a második mező, korán kell megadni */}
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

      {/* "Alapadatok országonként különbözőek" checkbox - csak ha több ország van */}
      {countryIds.length > 1 && (
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
          <Checkbox
            id="basic-data-per-country"
            checked={countryDifferentiates.basic_data}
            onCheckedChange={(checked) => handleBasicDataToggleChange(checked === true)}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label htmlFor="basic-data-per-country" className="font-medium cursor-pointer">
              Alapadatok országonként különbözőek
            </Label>
            <p className="text-sm text-muted-foreground">
              Ha bekapcsolod, minden országhoz egyedi szerződési adatokat (szerződő fél, ár, dokumentum stb.) adhatsz meg.
            </p>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* BELSŐ PANEL: Szerződés adatai - csak ha NEM országonként különböző */}
      {/* ============================================== */}
      {!countryDifferentiates.basic_data && (
        <>
          <ContractDataPanel
            contractHolderId={contractHolderId}
            setContractHolderId={setContractHolderId}
            contractHolders={contractHolders}
            countryDifferentiates={countryDifferentiates}
            onUpdateDifferentiate={(key, value) => updateDifferentiate(key, value)}
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
            showDifferentPerCountry={countryIds.length > 1}
          />

          {/* ORG ID (csak Lifeworks esetén) */}
          {(isLifeworks || !contractHolderId) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>ORG ID</Label>
                <Input
                  value={orgId || ""}
                  onChange={(e) => setOrgId(e.target.value || null)}
                  placeholder="ORG ID"
                  disabled={countryDifferentiates.org_id}
                />
              </div>
              <DifferentPerCountryToggle
                checked={countryDifferentiates.org_id}
                onChange={(checked) => updateDifferentiate("org_id", checked)}
              />
            </div>
          )}

          {/* Szerződés dátumok (csak CGP esetén) */}
          {(isCGP || !contractHolderId) && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>Szerződés kezdete</Label>
                <Input
                  type="date"
                  value={contractStart || ""}
                  onChange={(e) => setContractStart(e.target.value || null)}
                  disabled={countryDifferentiates.contract_date}
                />
              </div>
              <div className="space-y-2">
                <Label>Szerződés lejárta</Label>
                <Input
                  type="date"
                  value={contractEnd || ""}
                  onChange={(e) => setContractEnd(e.target.value || null)}
                  disabled={countryDifferentiates.contract_date}
                />
              </div>
              <DifferentPerCountryToggle
                checked={countryDifferentiates.contract_date}
                onChange={(checked) => updateDifferentiate("contract_date", checked)}
              />
            </div>
          )}

          {/* Emlékeztető email (csak CGP esetén) */}
          {(isCGP || !contractHolderId) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Emlékeztető e-mail</Label>
                <Input
                  type="email"
                  value={contractReminderEmail || ""}
                  onChange={(e) => setContractReminderEmail(e.target.value || null)}
                  placeholder="email@ceg.hu"
                  disabled={countryDifferentiates.contract_date_reminder_email}
                />
              </div>
              <DifferentPerCountryToggle
                checked={countryDifferentiates.contract_date_reminder_email}
                onChange={(checked) => updateDifferentiate("contract_date_reminder_email", checked)}
              />
            </div>
          )}
        </>
      )}

      {/* Ha basic_data aktív, megjelenítjük az üzenetet */}
      {countryDifferentiates.basic_data && (
        <div className="p-4 bg-muted border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Az Alapadatok országonként különbözőek opció aktív. A szerződési adatokat az <strong>Országok</strong> fülön, az egyes országok alatt lehet megadni.
          </p>
        </div>
      )}

      {/* Aktív státusz */}
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
      </div>
    </>
  );
};
