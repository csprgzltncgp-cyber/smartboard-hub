import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CompanyCountrySettings, CountryDifferentiate, ContractHolder, AccountAdmin, Workshop, CrisisIntervention } from "@/types/company";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface CompanyCountrySettingsPanelProps {
  countryIds: string[];
  countries: Country[];
  countrySettings: CompanyCountrySettings[];
  setCountrySettings: (settings: CompanyCountrySettings[]) => void;
  countryDifferentiates: CountryDifferentiate;
  contractHolders: ContractHolder[];
  accountAdmins: AccountAdmin[];
  globalContractHolderId: string | null;
  // Workshops és Crisis interventions
  workshops: Workshop[];
  setWorkshops: (workshops: Workshop[]) => void;
  crisisInterventions: CrisisIntervention[];
  setCrisisInterventions: (interventions: CrisisIntervention[]) => void;
}

export const CompanyCountrySettingsPanel = ({
  countryIds,
  countries,
  countrySettings,
  setCountrySettings,
  countryDifferentiates,
  contractHolders,
  accountAdmins,
  globalContractHolderId,
  workshops,
  setWorkshops,
  crisisInterventions,
  setCrisisInterventions,
}: CompanyCountrySettingsPanelProps) => {
  const selectedCountries = countries.filter((c) => countryIds.includes(c.id));

  if (selectedCountries.length === 0) {
    return (
      <div className="py-4 text-muted-foreground">
        Válasszon országokat az alapadatoknál.
      </div>
    );
  }

  const getCountrySettings = (countryId: string): CompanyCountrySettings => {
    const existing = countrySettings.find((cs) => cs.country_id === countryId);
    if (existing) return existing;
    
    return {
      id: `new-${countryId}`,
      company_id: "",
      country_id: countryId,
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
    };
  };

  const updateCountrySettings = (countryId: string, updates: Partial<CompanyCountrySettings>) => {
    const existing = countrySettings.find((cs) => cs.country_id === countryId);
    if (existing) {
      setCountrySettings(
        countrySettings.map((cs) =>
          cs.country_id === countryId ? { ...cs, ...updates } : cs
        )
      );
    } else {
      const newSettings: CompanyCountrySettings = {
        ...getCountrySettings(countryId),
        ...updates,
      };
      setCountrySettings([...countrySettings, newSettings]);
    }
  };

  const getCountryWorkshops = (countryId: string) =>
    workshops.filter((w) => w.country_id === countryId);

  const getCountryCrisis = (countryId: string) =>
    crisisInterventions.filter((c) => c.country_id === countryId);

  const addWorkshop = (countryId: string) => {
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

  const addCrisis = (countryId: string) => {
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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ország beállítások</h2>

      {selectedCountries.map((country) => {
        const settings = getCountrySettings(country.id);
        const countryWorkshops = getCountryWorkshops(country.id);
        const countryCrisis = getCountryCrisis(country.id);
        const effectiveContractHolder = countryDifferentiates.contract_holder
          ? settings.contract_holder_id
          : globalContractHolderId;
        const isCGP = effectiveContractHolder === "2";
        const isLifeworks = effectiveContractHolder === "1";

        return (
          <CountrySettingsCard
            key={country.id}
            country={country}
            settings={settings}
            onUpdate={(updates) => updateCountrySettings(country.id, updates)}
            countryDifferentiates={countryDifferentiates}
            contractHolders={contractHolders}
            accountAdmins={accountAdmins}
            isCGP={isCGP}
            isLifeworks={isLifeworks}
            workshops={countryWorkshops}
            onAddWorkshop={() => addWorkshop(country.id)}
            crisisInterventions={countryCrisis}
            onAddCrisis={() => addCrisis(country.id)}
          />
        );
      })}
    </div>
  );
};

// Ország beállítások kártya
interface CountrySettingsCardProps {
  country: Country;
  settings: CompanyCountrySettings;
  onUpdate: (updates: Partial<CompanyCountrySettings>) => void;
  countryDifferentiates: CountryDifferentiate;
  contractHolders: ContractHolder[];
  accountAdmins: AccountAdmin[];
  isCGP: boolean;
  isLifeworks: boolean;
  workshops: Workshop[];
  onAddWorkshop: () => void;
  crisisInterventions: CrisisIntervention[];
  onAddCrisis: () => void;
}

const CountrySettingsCard = ({
  country,
  settings,
  onUpdate,
  countryDifferentiates,
  contractHolders,
  accountAdmins,
  isCGP,
  isLifeworks,
  workshops,
  onAddWorkshop,
  crisisInterventions,
  onAddCrisis,
}: CountrySettingsCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWorkshopsOpen, setIsWorkshopsOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            isOpen ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          <span className="font-medium">{country.code}</span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 p-4 border rounded-b-lg -mt-1">
        {/* Account (csak CGP esetén) */}
        {isCGP && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select
                value={settings.activity_plan_user_id || ""}
                onValueChange={(val) => onUpdate({ activity_plan_user_id: val || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon..." />
                </SelectTrigger>
                <SelectContent>
                  {accountAdmins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Szerződéshordozó - ha országonként különböző */}
        {countryDifferentiates.contract_holder && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Szerződéshordozó</Label>
              <Select
                value={settings.contract_holder_id || ""}
                onValueChange={(val) => onUpdate({ contract_holder_id: val || null })}
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
        )}

        {/* ORG ID - ha országonként különböző és Lifeworks */}
        {countryDifferentiates.org_id && isLifeworks && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ORG ID</Label>
              <Input
                value={settings.org_id || ""}
                onChange={(e) => onUpdate({ org_id: e.target.value || null })}
                placeholder="ORG ID"
              />
            </div>
          </div>
        )}

        {/* Szerződés dátumok - ha országonként különböző és CGP */}
        {countryDifferentiates.contract_date && isCGP && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Szerződés kezdete</Label>
              <Input
                type="date"
                value={settings.contract_start || ""}
                onChange={(e) => onUpdate({ contract_start: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label>Szerződés lejárta</Label>
              <Input
                type="date"
                value={settings.contract_end || ""}
                onChange={(e) => onUpdate({ contract_end: e.target.value || null })}
              />
            </div>
          </div>
        )}

        {/* Emlékeztető email - ha országonként különböző */}
        {countryDifferentiates.contract_date_reminder_email && isCGP && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emlékeztető e-mail</Label>
              <Input
                type="email"
                value={settings.contract_reminder_email || ""}
                onChange={(e) => onUpdate({ contract_reminder_email: e.target.value || null })}
                placeholder="email@ceg.hu"
              />
            </div>
          </div>
        )}

        {/* Létszám - mindig látható */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Létszám</Label>
            <Input
              type="number"
              value={settings.head_count || ""}
              onChange={(e) => onUpdate({ head_count: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="0"
            />
          </div>
        </div>

        {/* Client Dashboard beállítások - ha reporting országonként különböző */}
        {countryDifferentiates.reporting && isCGP && (
          <div className="space-y-4 border-l-2 border-primary/20 pl-4">
            <h4 className="text-sm font-medium text-primary">Client Dashboard beállítások</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Felhasználónév</Label>
                <Input
                  value={settings.client_username || ""}
                  onChange={(e) => onUpdate({ client_username: e.target.value || null })}
                  placeholder="Felhasználónév"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!settings.client_password_set ? (
                <div className="space-y-2">
                  <Label>Jelszó</Label>
                  <Input type="password" placeholder="Jelszó" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <button
                    type="button"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    + Új jelszó beállítása
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nyelv</Label>
                <Select
                  value={settings.client_language_id || ""}
                  onValueChange={(val) => onUpdate({ client_language_id: val || null })}
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

              <div className="space-y-2">
                <Label>Hozzáférés minden országhoz</Label>
                <Select
                  value={settings.all_country_access ? "1" : "0"}
                  onValueChange={(val) => onUpdate({ all_country_access: val === "1" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nem</SelectItem>
                    <SelectItem value="1">Igen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

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
                onClick={onAddWorkshop}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Hozzáadás
              </Button>
              {workshops.length > 0 && (
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
            {isWorkshopsOpen && workshops.length > 0 && (
              <div className="space-y-2 pl-4">
                {workshops.map((ws, idx) => (
                  <div key={ws.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{idx + 1}.</span>
                    <Input
                      value={ws.name}
                      onChange={() => {}}
                      placeholder="Workshop neve"
                      className="h-8 flex-1"
                    />
                    <Input
                      type="number"
                      value={ws.sessions_available}
                      onChange={() => {}}
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
                onClick={onAddCrisis}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Hozzáadás
              </Button>
              {crisisInterventions.length > 0 && (
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
            {isCrisisOpen && crisisInterventions.length > 0 && (
              <div className="space-y-2 pl-4">
                {crisisInterventions.map((ci, idx) => (
                  <div key={ci.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{idx + 1}.</span>
                    <Input
                      value={ci.name}
                      onChange={() => {}}
                      placeholder="Krízisintervenció neve"
                      className="h-8 flex-1"
                    />
                    <Input
                      type="number"
                      value={ci.sessions_available}
                      onChange={() => {}}
                      placeholder="Alkalmak"
                      className="h-8 w-24"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
