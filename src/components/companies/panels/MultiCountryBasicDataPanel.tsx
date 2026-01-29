import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import { DifferentPerCountryToggle } from "../DifferentPerCountryToggle";
import { CountryDifferentiate, ContractHolder } from "@/types/company";
import { ContractDataPanel } from "./ContractDataPanel";

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
  consultationTypes: string[];
  setConsultationTypes: (types: string[]) => void;
  consultationDurations: string[];
  setConsultationDurations: (durations: string[]) => void;
  consultationFormats: string[];
  setConsultationFormats: (formats: string[]) => void;
  industry: string | null;
  setIndustry: (industry: string | null) => void;
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
  consultationTypes,
  setConsultationTypes,
  consultationDurations,
  setConsultationDurations,
  consultationFormats,
  setConsultationFormats,
  industry,
  setIndustry,
}: MultiCountryBasicDataPanelProps) => {
  const isCGP = contractHolderId === "2";
  const isLifeworks = contractHolderId === "1";

  const updateDifferentiate = (key: keyof CountryDifferentiate, value: boolean) => {
    setCountryDifferentiates({ ...countryDifferentiates, [key]: value });
  };

  const countryOptions = countries.map((c) => ({ id: c.id, label: c.name }));

  return (
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

      {/* ============================================== */}
      {/* BELSŐ PANEL: Szerződés adatai */}
      {/* ============================================== */}
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
        consultationTypes={consultationTypes}
        setConsultationTypes={setConsultationTypes}
        consultationDurations={consultationDurations}
        setConsultationDurations={setConsultationDurations}
        consultationFormats={consultationFormats}
        setConsultationFormats={setConsultationFormats}
        industry={industry}
        setIndustry={setIndustry}
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
  );
};
