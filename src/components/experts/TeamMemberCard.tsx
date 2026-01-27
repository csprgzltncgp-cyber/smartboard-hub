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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, ChevronRight, Trash2, Crown, Video, Phone, MessageSquare, User, MapPin, Globe, Power } from "lucide-react";
import { MultiSelectField } from "./MultiSelectField";
import { HierarchicalSpecializationSelect } from "./HierarchicalSpecializationSelect";
import { EapOnlineImageUpload } from "./EapOnlineImageUpload";
import { EapOnlineTextFields } from "./EapOnlineTextFields";
import { TeamMemberInactivityDialog } from "./TeamMemberInactivityDialog";

export interface TeamMemberInactivityPeriod {
  id: string;
  startDate: Date;
  endDate: Date | null;
  isIndefinite: boolean;
  reason: string;
}

export interface TeamMember {
  id?: string;
  name: string;
  email: string;
  phone_prefix: string;
  phone_number: string;
  is_team_leader: boolean;
  is_active: boolean;
  is_cgp_employee: boolean;
  is_eap_online_expert: boolean;
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
  // Consultation type settings
  acceptsPersonalConsultation: boolean;
  acceptsVideoConsultation: boolean;
  acceptsPhoneConsultation: boolean;
  acceptsChatConsultation: boolean;
  videoConsultationType: "eap_online_only" | "operator_only" | "both";
  acceptsOnsiteConsultation: boolean;
  // EAP Online extra fields
  eapOnlineImage?: string;
  eapOnlineShortDescription?: string;
  eapOnlineLongDescription?: string;
  // Inactivity periods
  inactivityPeriods?: TeamMemberInactivityPeriod[];
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
  languageSkills,
}: TeamMemberCardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [inactivityDialogOpen, setInactivityDialogOpen] = useState(false);

  const updateField = <K extends keyof TeamMember>(field: K, value: TeamMember[K]) => {
    onChange(index, { ...member, [field]: value });
  };

  // EAP Online expert option is visible when video consultation is enabled
  // AND video type is "eap_online_only" or "both"
  const showEapOnlineExpertOption = 
    member.acceptsVideoConsultation && 
    (member.videoConsultationType === "eap_online_only" || member.videoConsultationType === "both");

  const handleAddInactivityPeriod = (period: Omit<TeamMemberInactivityPeriod, "id">) => {
    const newPeriod: TeamMemberInactivityPeriod = {
      ...period,
      id: crypto.randomUUID(),
    };
    const currentPeriods = member.inactivityPeriods || [];
    updateField("inactivityPeriods", [...currentPeriods, newPeriod]);
    updateField("is_active", false);
  };

  const handleRemoveInactivityPeriod = (id: string) => {
    const currentPeriods = member.inactivityPeriods || [];
    updateField("inactivityPeriods", currentPeriods.filter(p => p.id !== id));
  };

  const handleActivate = () => {
    updateField("is_active", true);
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setInactivityDialogOpen(true)}
                title="Inaktivitási időszak kezelése"
              >
                <Power className={`w-4 h-4 ${member.is_active ? "text-primary" : "text-muted-foreground"}`} />
              </Button>
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


              <div className="flex items-center space-x-3 p-3 border-2 border-cgp-teal/50 rounded-lg">
                <Checkbox
                  checked={member.is_cgp_employee}
                  onCheckedChange={(checked) => updateField("is_cgp_employee", checked as boolean)}
                />
                <Label className="text-cgp-teal cursor-pointer">CGP munkatárs</Label>
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

              <HierarchicalSpecializationSelect
                selectedIds={member.selectedSpecializations}
                onChange={(v) => updateField("selectedSpecializations", v)}
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

            {/* Tanácsadási típusok */}
            <div className="space-y-4">
              <h3 className="text-md font-medium border-b pb-2">Tanácsadási típusok</h3>
              
              <p className="text-sm text-muted-foreground">
                Válaszd ki, milyen típusú tanácsadást vállal a csapattag.
              </p>

              {/* Személyes tanácsadás */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <Checkbox
                    checked={member.acceptsPersonalConsultation}
                    onCheckedChange={(checked) => updateField("acceptsPersonalConsultation", checked as boolean)}
                  />
                  <User className="w-5 h-5 text-cgp-teal" />
                  <Label className="cursor-pointer flex-1">Személyes tanácsadás</Label>
                </div>

                {member.acceptsPersonalConsultation && (
                  <div className="ml-8 p-3 border border-dashed rounded-lg bg-muted/20">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={member.acceptsOnsiteConsultation}
                        onCheckedChange={(checked) => updateField("acceptsOnsiteConsultation", checked as boolean)}
                      />
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <Label className="cursor-pointer text-sm">Vállal helyszíni (on-site) tanácsadást</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Videós tanácsadás */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <Checkbox
                    checked={member.acceptsVideoConsultation}
                    onCheckedChange={(checked) => updateField("acceptsVideoConsultation", checked as boolean)}
                  />
                  <Video className="w-5 h-5 text-cgp-teal" />
                  <Label className="cursor-pointer flex-1">Videós tanácsadás</Label>
                </div>

                {member.acceptsVideoConsultation && (
                  <div className="ml-8 space-y-4">
                    <div className="p-3 border border-dashed rounded-lg bg-muted/20">
                      <Label className="text-sm font-medium mb-3 block">Videós esetek típusa:</Label>
                      <RadioGroup
                        value={member.videoConsultationType}
                        onValueChange={(value) => updateField("videoConsultationType", value as "eap_online_only" | "operator_only" | "both")}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="eap_online_only" id={`video_eap_only_${index}`} />
                          <Label htmlFor={`video_eap_only_${index}`} className="cursor-pointer text-sm">
                            Csak EAP Online esetek
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="operator_only" id={`video_operator_only_${index}`} />
                          <Label htmlFor={`video_operator_only_${index}`} className="cursor-pointer text-sm">
                            Csak Operátor által kiközvetített esetek
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id={`video_both_${index}`} />
                          <Label htmlFor={`video_both_${index}`} className="cursor-pointer text-sm">
                            Mindkettő
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* EAP Online szakértő opció - csak ha EAP Online vagy Mindkettő van kiválasztva */}
                    {showEapOnlineExpertOption && (
                      <div className="p-4 border-2 border-cgp-teal/50 rounded-lg bg-cgp-teal/5 space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={member.is_eap_online_expert}
                            onCheckedChange={(checked) => updateField("is_eap_online_expert", checked as boolean)}
                          />
                          <Globe className="w-5 h-5 text-cgp-teal" />
                          <Label className="cursor-pointer text-cgp-teal font-medium">EAP Online Szakértő</Label>
                        </div>

                        {/* EAP Online extra mezők - csak ha be van jelölve */}
                        {member.is_eap_online_expert && (
                          <div className="space-y-6 pt-4 border-t border-cgp-teal/20">
                            <EapOnlineImageUpload
                              value={member.eapOnlineImage || ""}
                              onChange={(value) => updateField("eapOnlineImage", value)}
                              maxSizeKB={500}
                            />

                            <EapOnlineTextFields
                              shortDescription={member.eapOnlineShortDescription || ""}
                              longDescription={member.eapOnlineLongDescription || ""}
                              onShortDescriptionChange={(value) => updateField("eapOnlineShortDescription", value)}
                              onLongDescriptionChange={(value) => updateField("eapOnlineLongDescription", value)}
                              maxShortLength={150}
                              maxLongLength={1000}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Telefonos tanácsadás */}
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox
                  checked={member.acceptsPhoneConsultation}
                  onCheckedChange={(checked) => updateField("acceptsPhoneConsultation", checked as boolean)}
                />
                <Phone className="w-5 h-5 text-cgp-teal" />
                <Label className="cursor-pointer flex-1">Telefonos tanácsadás</Label>
              </div>

              {/* Chat alapú tanácsadás */}
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox
                  checked={member.acceptsChatConsultation}
                  onCheckedChange={(checked) => updateField("acceptsChatConsultation", checked as boolean)}
                />
                <MessageSquare className="w-5 h-5 text-cgp-teal" />
                <Label className="cursor-pointer flex-1">Szöveges üzenetváltás (Chat) alapú tanácsadás</Label>
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

      {/* Inactivity Dialog */}
      <TeamMemberInactivityDialog
        open={inactivityDialogOpen}
        onOpenChange={setInactivityDialogOpen}
        memberName={member.name || `Csapattag ${index + 1}`}
        inactivityPeriods={member.inactivityPeriods || []}
        onAddPeriod={handleAddInactivityPeriod}
        onRemovePeriod={handleRemoveInactivityPeriod}
        onActivate={handleActivate}
      />
    </div>
  );
};
