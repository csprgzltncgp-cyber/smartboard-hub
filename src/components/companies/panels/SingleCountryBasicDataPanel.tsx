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
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import { DifferentPerCountryToggle } from "../DifferentPerCountryToggle";
import { CountryDifferentiate, ContractHolder, Workshop, CrisisIntervention, CompanyCountrySettings } from "@/types/company";

interface ConnectedCompany {
  id: string;
  name: string;
}

interface Country {
  id: string;
  code: string;
  name: string;
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
  connectedCompanyId: string | null;
  setConnectedCompanyId: (id: string | null) => void;
  countries: Country[];
  contractHolders: ContractHolder[];
  connectedCompanies: ConnectedCompany[];
  // Létszám (single country)
  headCount: number | null;
  setHeadCount: (count: number | null) => void;
  // Workshop & Crisis
  workshops: Workshop[];
  setWorkshops: (workshops: Workshop[]) => void;
  crisisInterventions: CrisisIntervention[];
  setCrisisInterventions: (interventions: CrisisIntervention[]) => void;
  // Client Dashboard (single country, CGP only)
  clientUsername: string;
  setClientUsername: (username: string) => void;
  clientLanguageId: string | null;
  setClientLanguageId: (id: string | null) => void;
  hasClientPassword: boolean;
  onSetNewPassword: () => void;
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
  connectedCompanyId,
  setConnectedCompanyId,
  countries,
  contractHolders,
  connectedCompanies,
  headCount,
  setHeadCount,
  workshops,
  setWorkshops,
  crisisInterventions,
  setCrisisInterventions,
  clientUsername,
  setClientUsername,
  clientLanguageId,
  setClientLanguageId,
  hasClientPassword,
  onSetNewPassword,
}: SingleCountryBasicDataPanelProps) => {
  const isCGP = contractHolderId === "2";
  const isLifeworks = contractHolderId === "1";
  const countryId = countryIds[0];

  const [isWorkshopsOpen, setIsWorkshopsOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);

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

      {/* Contract Holder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label>Szerződéshordozó</Label>
          <Select
            value={contractHolderId || ""}
            onValueChange={(val) => setContractHolderId(val || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              {contractHolders.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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

      {/* Workshop és Krízisintervenció beállítások */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="text-sm font-medium text-primary">Workshop és Krízisintervenció beállítások</h4>

        {/* Workshops */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary">Workshopok</span>
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
            <span className="text-sm text-primary">Krízisintervenciók</span>
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

      {/* Client Dashboard beállítások - csak CGP esetén */}
      {(isCGP || !contractHolderId) && (
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
