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
import { DifferentPerCountryToggle } from "./DifferentPerCountryToggle";
import { CountryDifferentiate, AccountAdmin, ContractHolder } from "@/types/company";
import { ContractDataPanel } from "./panels/ContractDataPanel";

interface ConnectedCompany {
  id: string;
  name: string;
}

interface CompanyBasicDataPanelProps {
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
  leadAccountId: string | null;
  setLeadAccountId: (id: string | null) => void;
  connectedCompanyId: string | null;
  setConnectedCompanyId: (id: string | null) => void;
  countryDifferentiates: CountryDifferentiate;
  setCountryDifferentiates: (diff: CountryDifferentiate) => void;
  countries: Array<{ id: string; code: string; name: string }>;
  contractHolders: ContractHolder[];
  accountAdmins: AccountAdmin[];
  connectedCompanies: ConnectedCompany[];
  // Client Dashboard settings (csak ha CGP és reporting nincs country-nként)
  clientUsername: string;
  setClientUsername: (username: string) => void;
  clientLanguageId: string | null;
  setClientLanguageId: (id: string | null) => void;
  hasClientPassword: boolean;
  onSetNewPassword: () => void;
  // Contract data fields
  contractFileUrl: string | null;
  setContractFileUrl: (url: string | null) => void;
  contractCurrency: string | null;
  setContractCurrency: (currency: string | null) => void;
  pillarCount: number | null;
  setPillarCount: (count: number | null) => void;
  sessionCount: number | null;
  setSessionCount: (count: number | null) => void;
  industry: string | null;
  setIndustry: (industry: string | null) => void;
}

export const CompanyBasicDataPanel = ({
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
  leadAccountId,
  setLeadAccountId,
  connectedCompanyId,
  setConnectedCompanyId,
  countryDifferentiates,
  setCountryDifferentiates,
  countries,
  contractHolders,
  accountAdmins,
  connectedCompanies,
  clientUsername,
  setClientUsername,
  clientLanguageId,
  setClientLanguageId,
  hasClientPassword,
  onSetNewPassword,
  // Contract data fields
  contractFileUrl,
  setContractFileUrl,
  contractCurrency,
  setContractCurrency,
  pillarCount,
  setPillarCount,
  sessionCount,
  setSessionCount,
  industry,
  setIndustry,
}: CompanyBasicDataPanelProps) => {
  const isCGP = contractHolderId === "2";
  const isLifeworks = contractHolderId === "1";

  const updateDifferentiate = (key: keyof CountryDifferentiate, value: boolean) => {
    setCountryDifferentiates({ ...countryDifferentiates, [key]: value });
  };

  const countryOptions = countries.map((c) => ({ id: c.id, label: c.name }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Alapadatok</h2>


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

      {/* Kapcsolt cég */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label>Kapcsolt cég</Label>
          <Select
            value={connectedCompanyId || "none"}
            onValueChange={(val) => setConnectedCompanyId(val === "none" ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nincs</SelectItem>
              {connectedCompanies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Országok */}
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
        contractCurrency={contractCurrency}
        setContractCurrency={setContractCurrency}
        pillarCount={pillarCount}
        setPillarCount={setPillarCount}
        sessionCount={sessionCount}
        setSessionCount={setSessionCount}
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

      {/* Riportolás - csak ha CGP és nem országonkénti */}
      {(isCGP || !contractHolderId) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Riportolás</Label>
            <Input value="Riportolás" disabled className="bg-muted" />
          </div>
          <DifferentPerCountryToggle
            checked={countryDifferentiates.reporting}
            onChange={(checked) => updateDifferentiate("reporting", checked)}
          />
        </div>
      )}

      {/* Client Dashboard beállítások - csak ha CGP és reporting nem országonkénti */}
      {(isCGP || !contractHolderId) && !countryDifferentiates.reporting && (
        <div className="space-y-4 border-l-2 border-primary/20 pl-4 ml-2">
          <h3 className="text-sm font-medium text-primary">Client Dashboard beállítások</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Felhasználónév Client Dashboard-hoz</Label>
              <Input
                value={clientUsername}
                onChange={(e) => setClientUsername(e.target.value)}
                placeholder="Felhasználónév"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!hasClientPassword ? (
              <div className="space-y-2">
                <Label>Jelszó Client Dashboard-hoz</Label>
                <Input type="password" placeholder="Jelszó" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <button
                  type="button"
                  onClick={onSetNewPassword}
                  className="inline-flex items-center text-primary hover:underline"
                >
                  + Új jelszó beállítása
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client Dashboard nyelve</Label>
              <Select
                value={clientLanguageId || ""}
                onValueChange={(val) => setClientLanguageId(val || null)}
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
          </div>
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
