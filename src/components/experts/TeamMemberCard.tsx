import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Trash2, Crown } from "lucide-react";
import { MultiSelectField } from "./MultiSelectField";

export interface TeamMember {
  id?: string;
  name: string;
  email: string;
  phone_prefix: string;
  phone_number: string;
  is_team_leader: boolean;
  is_active: boolean;
  language: string;
  // Professional data
  selectedCountries: string[];
  selectedCities: string[];
  selectedPermissions: string[];
  selectedSpecializations: string[];
  selectedLanguageSkills: string[];
  nativeLanguage: string;
  maxInprogressCases: string;
  minInprogressCases: string;
  // Dashboard data
  username: string;
  dashboardLanguage: string;
}

// Telefon előhívók
const PHONE_PREFIXES = [
  { code: "HU", dial_code: "+36" },
  { code: "CZ", dial_code: "+420" },
  { code: "SK", dial_code: "+421" },
  { code: "RO", dial_code: "+40" },
  { code: "RS", dial_code: "+381" },
  { code: "PL", dial_code: "+48" },
  { code: "MD", dial_code: "+373" },
  { code: "AL", dial_code: "+355" },
  { code: "XK", dial_code: "+383" },
  { code: "MK", dial_code: "+389" },
  { code: "UA", dial_code: "+380" },
];

const DASHBOARD_LANGUAGES = [
  { id: "hu", name: "Magyar" },
  { id: "en", name: "English" },
  { id: "de", name: "Deutsch" },
];

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
  onChange: (index: number, member: TeamMember) => void;
  onRemove: (index: number) => void;
  onSetLeader: (index: number) => void;
  countries: { id: string; name: string }[];
  cities: { id: string; name: string }[];
  permissions: { id: string; name: string }[];
  specializations: { id: string; name: string }[];
  languageSkills: { id: string; name: string }[];
}

export const TeamMemberCard = ({
  member,
  index,
  onChange,
  onRemove,
  onSetLeader,
  countries,
  cities,
  permissions,
  specializations,
  languageSkills,
}: TeamMemberCardProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const updateField = <K extends keyof TeamMember>(field: K, value: TeamMember[K]) => {
    onChange(index, { ...member, [field]: value });
  };

  return (
    <div className={`border rounded-xl ${member.is_team_leader ? "border-cgp-teal border-2" : "border-muted"}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-medium">{member.name || `Csapattag ${index + 1}`}</span>
              {member.is_team_leader && (
                <Badge className="bg-cgp-teal">
                  <Crown className="w-3 h-3 mr-1" />
                  Csapatvezető
                </Badge>
              )}
              {!member.is_active && (
                <Badge variant="secondary">Inaktív</Badge>
              )}
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {!member.is_team_leader && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onSetLeader(index)}
                  title="Csapatvezetővé tétel"
                >
                  <Crown className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-destructive hover:text-destructive"
                title="Csapattag törlése"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-6">
            {/* Kapcsolattartási adatok */}
            <div className="space-y-4">
              <h3 className="text-md font-medium border-b pb-2">Kapcsolattartási adatok</h3>
              
              <div className="space-y-2">
                <Label>Név *</Label>
                <Input
                  value={member.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Teljes név"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={member.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Telefon előhívó</Label>
                  <Select value={member.phone_prefix} onValueChange={(v) => updateField("phone_prefix", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PHONE_PREFIXES.map((prefix) => (
                        <SelectItem key={prefix.code} value={prefix.code}>
                          {prefix.code} {prefix.dial_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Telefonszám</Label>
                  <Input
                    type="tel"
                    value={member.phone_number}
                    onChange={(e) => updateField("phone_number", e.target.value)}
                    placeholder="XX XXX XXXX"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={member.is_active}
                  onCheckedChange={(checked) => updateField("is_active", checked as boolean)}
                />
                <Label className="cursor-pointer">Aktív</Label>
              </div>
            </div>

            {/* Szakmai adatok */}
            <div className="space-y-4">
              <h3 className="text-md font-medium border-b pb-2">Szakmai adatok</h3>

              <MultiSelectField
                label="Ország"
                options={countries.map((c) => ({ id: c.id, label: c.name }))}
                selectedIds={member.selectedCountries}
                onChange={(v) => updateField("selectedCountries", v)}
                placeholder="Válassz országot..."
                badgeColor="teal"
              />

              <MultiSelectField
                label="Város"
                options={cities.map((c) => ({ id: c.id, label: c.name }))}
                selectedIds={member.selectedCities}
                onChange={(v) => updateField("selectedCities", v)}
                placeholder="Válassz várost..."
                badgeColor="teal"
              />

              <MultiSelectField
                label="Szakterületek"
                options={permissions.map((p) => ({ id: p.id, label: p.name }))}
                selectedIds={member.selectedPermissions}
                onChange={(v) => updateField("selectedPermissions", v)}
                placeholder="Válassz szakterületet..."
                badgeColor="teal"
              />

              <MultiSelectField
                label="Specializáció"
                options={specializations.map((s) => ({ id: s.id, label: s.name }))}
                selectedIds={member.selectedSpecializations}
                onChange={(v) => updateField("selectedSpecializations", v)}
                placeholder="Válassz specializációt..."
                badgeColor="teal"
              />

              <div className="space-y-2">
                <Label>Anyanyelv</Label>
                <Select value={member.nativeLanguage} onValueChange={(v) => updateField("nativeLanguage", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz nyelvet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {languageSkills.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <MultiSelectField
                label="Nyelvtudás"
                options={languageSkills.map((l) => ({ id: l.id, label: l.name }))}
                selectedIds={member.selectedLanguageSkills}
                onChange={(v) => updateField("selectedLanguageSkills", v)}
                placeholder="Válassz nyelveket..."
                badgeColor="teal"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max. folyamatban lévő esetek</Label>
                  <Input
                    type="number"
                    value={member.maxInprogressCases}
                    onChange={(e) => updateField("maxInprogressCases", e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min. folyamatban lévő esetek</Label>
                  <Input
                    type="number"
                    value={member.minInprogressCases}
                    onChange={(e) => updateField("minInprogressCases", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Dashboard adatok */}
            <div className="space-y-4">
              <h3 className="text-md font-medium border-b pb-2">Expert Dashboard adatok</h3>

              <div className="space-y-2">
                <Label>Felhasználónév</Label>
                <Input
                  value={member.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="felhasznalonev"
                />
              </div>

              <div className="space-y-2">
                <Label>Dashboard nyelv</Label>
                <Select value={member.dashboardLanguage} onValueChange={(v) => updateField("dashboardLanguage", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz nyelvet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DASHBOARD_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
