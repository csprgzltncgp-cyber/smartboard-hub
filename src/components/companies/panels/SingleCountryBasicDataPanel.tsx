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
import { Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import { ContractHolder, Workshop, CrisisIntervention, CountryDifferentiate, ConsultationRow, PriceHistoryEntry } from "@/types/company";
import { ContractDataPanel } from "./ContractDataPanel";

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
}

export const SingleCountryBasicDataPanel = ({
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
}: SingleCountryBasicDataPanelProps) => {
  const isCGP = contractHolderId === "2";
  const isLifeworks = contractHolderId === "1";
  const countryId = countryIds[0];

  const [isWorkshopsOpen, setIsWorkshopsOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(true);

  // Dummy countryDifferentiates for single country (no different per country needed)
  const countryDifferentiates: CountryDifferentiate = {
    contract_holder: false,
    org_id: false,
    contract_date: false,
    reporting: false,
    invoicing: false,
    contract_date_reminder_email: false,
  };

  const countryOptions = countries.map((c) => ({ id: c.id, label: c.name }));

  const countryWorkshops = workshops.filter((w) => w.country_id === countryId);
  const countryCrisis = crisisInterventions.filter((c) => c.country_id === countryId);

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
        onUpdateDifferentiate={() => {}}
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
        showDifferentPerCountry={false}
      />

      {/* ORG ID (csak Lifeworks esetén) */}
      {(isLifeworks || !contractHolderId) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label>ORG ID</Label>
            <Input
              value={orgId || ""}
              onChange={(e) => setOrgId(e.target.value || null)}
              placeholder="ORG ID"
            />
          </div>
        </div>
      )}

      {/* Szerződés dátumok (csak CGP esetén) */}
      {(isCGP || !contractHolderId) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Szerződés kezdete</Label>
            <Input
              type="date"
              value={contractStart || ""}
              onChange={(e) => setContractStart(e.target.value || null)}
            />
          </div>
          <div className="space-y-2">
            <Label>Szerződés lejárta</Label>
            <Input
              type="date"
              value={contractEnd || ""}
              onChange={(e) => setContractEnd(e.target.value || null)}
            />
          </div>
        </div>
      )}

      {/* Emlékeztető email (csak CGP esetén) */}
      {(isCGP || !contractHolderId) && (
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
            value={headCount || ""}
            onChange={(e) => setHeadCount(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="0"
          />
        </div>
      </div>

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

      {/* ============================================== */}
      {/* BELSŐ PANEL: Workshop és Krízisintervenció */}
      {/* ============================================== */}
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

      {/* ============================================== */}
      {/* BELSŐ PANEL: Client Dashboard beállítások */}
      {/* ============================================== */}
      {(isCGP || !contractHolderId) && (
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
    </div>
  );
};
