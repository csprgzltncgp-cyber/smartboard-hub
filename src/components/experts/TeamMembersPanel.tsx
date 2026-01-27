import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { TeamMemberCard, TeamMember } from "./TeamMemberCard";

interface TeamMembersPanelProps {
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  countries: { id: string; name: string }[];
  cities: { id: string; name: string }[];
  permissions: { id: string; name: string }[];
  specializations: { id: string; name: string }[];
  languageSkills: { id: string; name: string }[];
}

const createEmptyTeamMember = (): TeamMember => ({
  name: "",
  email: "",
  phone_prefix: "",
  phone_number: "",
  is_team_leader: false,
  is_active: true,
  is_cgp_employee: false,
  is_eap_online_expert: false,
  language: "hu",
  selectedCountries: [],
  selectedCities: [],
  selectedPermissions: [],
  selectedSpecializations: [],
  selectedLanguageSkills: [],
  nativeLanguage: "",
  maxInprogressCases: "10",
  minInprogressCases: "0",
  username: "",
  dashboardLanguage: "hu",
  // Consultation type settings
  acceptsPersonalConsultation: false,
  acceptsVideoConsultation: false,
  acceptsPhoneConsultation: false,
  acceptsChatConsultation: false,
  videoConsultationType: "both",
  acceptsOnsiteConsultation: false,
});

export const TeamMembersPanel = ({
  teamMembers,
  setTeamMembers,
  countries,
  cities,
  permissions,
  specializations,
  languageSkills,
}: TeamMembersPanelProps) => {
  const handleAddMember = () => {
    setTeamMembers([...teamMembers, createEmptyTeamMember()]);
  };

  const handleUpdateMember = (index: number, member: TeamMember) => {
    const updated = [...teamMembers];
    updated[index] = member;
    setTeamMembers(updated);
  };

  const handleRemoveMember = (index: number) => {
    const updated = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(updated);
  };

  const handleSetLeader = (index: number) => {
    const updated = teamMembers.map((m, i) => ({
      ...m,
      is_team_leader: i === index,
    }));
    setTeamMembers(updated);
  };

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-cgp-teal" />
          Csapattagok
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddMember}
          className="text-primary border-primary hover:bg-primary/10"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Csapattag hozzáadása
        </Button>
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Még nincsenek csapattagok.</p>
          <p className="text-sm">Kattints a "Csapattag hozzáadása" gombra az első tag létrehozásához.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <TeamMemberCard
              key={member.id || index}
              member={member}
              index={index}
              onChange={handleUpdateMember}
              onRemove={handleRemoveMember}
              onSetLeader={handleSetLeader}
              countries={countries}
              cities={cities}
              permissions={permissions}
              specializations={specializations}
              languageSkills={languageSkills}
            />
          ))}
        </div>
      )}

      {teamMembers.length > 0 && !teamMembers.some((m) => m.is_team_leader) && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          ⚠️ Nincs kijelölt csapatvezető. Kérjük, jelölj ki egy csapatvezetőt!
        </div>
      )}
    </div>
  );
};

export { createEmptyTeamMember };
