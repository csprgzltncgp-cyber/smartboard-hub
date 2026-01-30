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
import { SelectEntityCountriesDialog } from "../dialogs/SelectEntityCountriesDialog";
import { Globe, Building2 } from "lucide-react";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface MultiCountryBasicDataPanelProps {
  name: string;
  setName: (name: string) => void;
  dispatchName: string | null;
  setDispatchName: (name: string | null) => void;
  groupName: string | null;
  setGroupName: (name: string | null) => void;
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
  // Entity count check - to prevent disabling basic_data when entities exist
  hasMultipleEntitiesInAnyCountry?: boolean;
}

export const MultiCountryBasicDataPanel = ({
  name,
  setName,
  dispatchName,
  setDispatchName,
  groupName,
  setGroupName,
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
  // Entity check
  hasMultipleEntitiesInAnyCountry = false,
}: MultiCountryBasicDataPanelProps) => {
  const [showMigrateDialog, setShowMigrateDialog] = useState(false);
  const [showEntityCountriesDialog, setShowEntityCountriesDialog] = useState(false);
  
  const isCGP = contractHolderId === "2";
  const isLifeworks = contractHolderId === "1";

  const updateDifferentiate = (key: keyof CountryDifferentiate, value: boolean) => {
    setCountryDifferentiates({ ...countryDifferentiates, [key]: value });
  };

  const countryOptions = countries.map((c) => ({ id: c.id, label: c.name }));
  const selectedCountries = countries.filter((c) => countryIds.includes(c.id));

  // Check if there's existing basic data to migrate (including name and dispatchName)
  const hasBasicData = Boolean(
    name.trim() ||
    dispatchName?.trim() ||
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

  // Check if basic_data toggle can be disabled
  const canDisableBasicData = !hasMultipleEntitiesInAnyCountry;
  const basicDataToggleDisabled = countryDifferentiates.basic_data && !canDisableBasicData;

  // Handle basic_data toggle change
  const handleBasicDataToggleChange = (checked: boolean) => {
    // Prevent disabling if there are entities in any country
    if (!checked && hasMultipleEntitiesInAnyCountry) {
      return; // Cannot disable - entities must be deleted first
    }

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
          contract_file_url: null,
          contract_price: null,
          contract_price_type: null,
          contract_currency: null,
          pillar_count: null,
          session_count: null,
          consultation_rows: [],
          industry: null,
          price_history: [],
        }),
        // Migrate basic data fields - including name, dispatch_name, is_active
        name: name || null,
        dispatch_name: dispatchName,
        is_active: active,
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

    // Migrate invoicing data to the selected country (same country as basic data)
    if (invoicingCountryId && hasInvoicingData) {
      const updatedTemplates = invoiceTemplates.map((template) => ({
        ...template,
        country_id: invoicingCountryId,
      }));
      setInvoiceTemplates(updatedTemplates);
    }
    
    // Always enable both basic_data and invoicing differentiate together
    // If basic data is per-country, invoicing must be per-country too
    setCountryDifferentiates({
      ...countryDifferentiates,
      basic_data: true,
      invoicing: true,
    });

    setShowMigrateDialog(false);
  };

  // Handle migration cancel
  const handleMigrationCancel = () => {
    // Don't toggle the switch if cancelled
    setShowMigrateDialog(false);
  };

  // Handle entity toggle - open dialog
  const handleEntityToggleClick = () => {
    setShowEntityCountriesDialog(true);
  };

  // Handle entity countries selection
  const handleEntityCountriesConfirm = (selectedIds: string[]) => {
    setCountryDifferentiates({
      ...countryDifferentiates,
      has_multiple_entities: selectedIds.length > 0,
      entity_country_ids: selectedIds,
    });
  };

  // Get display text for entity countries
  const getEntityCountriesLabel = () => {
    const entityCountryIds = countryDifferentiates.entity_country_ids || [];
    if (entityCountryIds.length === 0) return "Több entitás";
    
    const names = entityCountryIds
      .map((id) => countries.find((c) => c.id === id)?.name)
      .filter(Boolean);
    
    if (names.length <= 2) {
      return names.join(", ");
    }
    return `${names.length} ország`;
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
      <SelectEntityCountriesDialog
        open={showEntityCountriesDialog}
        onOpenChange={setShowEntityCountriesDialog}
        countries={countries}
        selectedCountryIds={countryIds}
        entityCountryIds={countryDifferentiates.entity_country_ids || []}
        onConfirm={handleEntityCountriesConfirm}
      />
    <div className="space-y-6">
      {/* ORSZÁG KIVÁLASZTÓ - KIEMELT PANEL */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-medium text-primary">Országok</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelectField
            label=""
            options={countryOptions}
            selectedIds={countryIds}
            onChange={setCountryIds}
            placeholder="Válasszon országokat..."
          />
        </div>
      </div>

      {/* "Alapadatok országonként különbözőek" - csak ha több ország van */}
      {countryIds.length > 1 && (
        <div className="flex items-center justify-between bg-muted/30 border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <h4 className="text-sm font-medium text-primary">Országonkénti alapadatok</h4>
              <p className="text-xs text-muted-foreground">
                Ha bekapcsolod, minden országhoz egyedi szerződési adatokat adhatsz meg
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DifferentPerCountryToggle
              label="Országonként különböző"
              checked={countryDifferentiates.basic_data || false}
              onChange={(checked) => handleBasicDataToggleChange(checked)}
              disabled={basicDataToggleDisabled}
            />
            {countryDifferentiates.basic_data && !canDisableBasicData && (
              <span className="text-xs text-muted-foreground">
                (Entitások törlése szükséges a kikapcsoláshoz)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Cégcsoport mező - csak ha országonként különböző */}
      {countryDifferentiates.basic_data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label>Cégcsoport neve</Label>
            <Input
              value={groupName || ""}
              onChange={(e) => setGroupName(e.target.value || null)}
              placeholder="A cég ezzel a névvel jelenik meg a Cégek menüben"
            />
            <p className="text-xs text-muted-foreground">
              Ha az alapadatok országonként eltérőek, ez a név jelenik meg a céglistában.
            </p>
          </div>
        </div>
      )}

      {/* Cégnév - csak ha NEM országonként különböző */}
      {!countryDifferentiates.basic_data && (
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
      )}

      {/* Cég elnevezése kiközvetítéshez - csak ha NEM országonként különböző */}
      {!countryDifferentiates.basic_data && (
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
            Az Alapadatok országonként különbözőek opció aktív. A cégnevet és a szerződési adatokat az <strong>Országok</strong> fülön, az egyes országok alatt lehet megadni.
          </p>
        </div>
      )}

      {/* Ha has_multiple_entities aktív, megjelenítjük az üzenetet */}
      {countryDifferentiates.has_multiple_entities && !countryDifferentiates.basic_data && (
        <div className="p-4 bg-muted border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            A Több entitás opció aktív. Az entitásokat az <strong>Országok</strong> fülön, az egyes országok alatt lehet kezelni.
          </p>
        </div>
      )}

      {/* Aktív státusz - csak ha NEM országonként különböző */}
      {!countryDifferentiates.basic_data && (
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
      </div>
    </>
  );
};
