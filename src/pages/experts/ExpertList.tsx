import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Power, Pencil, Lock, Unlock, FileX, Building2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Expert {
  id: string;
  name: string;
  email: string;
  username: string | null;
  is_active: boolean | null;
  is_locked: boolean | null;
  contract_canceled: boolean | null;
  last_login_at: string | null;
  country_id: string | null;
  expert_type: "individual" | "company";
  company_name: string | null;
}

interface Country {
  id: string;
  code: string;
  name: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  is_team_leader: boolean;
  is_active: boolean;
  expert_id: string;
}

const ExpertList = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>(["all"]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState<Expert | null>(null);
  const [openCountries, setOpenCountries] = useState<string[]>([]);
  const [countryTabs, setCountryTabs] = useState<Record<string, "all" | "individual" | "company">>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expertsRes, countriesRes, teamMembersRes] = await Promise.all([
        supabase.from("experts").select("*").order("name"),
        supabase.from("countries").select("*").order("code"),
        supabase.from("expert_team_members").select("*").order("name"),
      ]);

      if (expertsRes.data) setExperts(expertsRes.data as Expert[]);
      if (countriesRes.data) setCountries(countriesRes.data);
      if (teamMembersRes.data) setTeamMembers(teamMembersRes.data as TeamMember[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Hiba az adatok betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const toggleCountry = (countryId: string) => {
    setOpenCountries((prev) =>
      prev.includes(countryId)
        ? prev.filter((id) => id !== countryId)
        : [...prev, countryId]
    );
  };

  const getCountryTab = (countryId: string) => countryTabs[countryId] || "all";
  
  const setCountryTab = (countryId: string, tab: "all" | "individual" | "company") => {
    setCountryTabs((prev) => ({ ...prev, [countryId]: tab }));
  };

  const getExpertsByCountryAndType = (countryId: string, type?: "individual" | "company") => {
    return experts.filter((expert) => {
      if (expert.country_id !== countryId) return false;
      if (type) return expert.expert_type === type;
      return true;
    });
  };

  const getCompanyExperts = () => {
    return experts.filter((expert) => expert.expert_type === "company");
  };

  const getTeamMembersByExpert = (expertId: string) => {
    return teamMembers.filter((m) => m.expert_id === expertId);
  };

  // Check if "all" is selected
  const isAllSelected = selectedCountryIds.includes("all");
  
  // Get countries to display
  const displayedCountries = isAllSelected 
    ? countries 
    : countries.filter((c) => selectedCountryIds.includes(c.id));

  const countryOptions = [
    { id: "all", label: "Összes ország" },
    ...countries.map((c) => ({ id: c.id, label: c.name })),
  ];

  const handleCountryFilterChange = (ids: string[]) => {
    // If "all" was just selected, clear other selections
    if (ids.includes("all") && !selectedCountryIds.includes("all")) {
      setSelectedCountryIds(["all"]);
    } else if (ids.includes("all") && ids.length > 1) {
      // If other items selected while "all" is there, remove "all"
      setSelectedCountryIds(ids.filter((id) => id !== "all"));
    } else if (ids.length === 0) {
      // If nothing selected, default to "all"
      setSelectedCountryIds(["all"]);
    } else {
      setSelectedCountryIds(ids);
    }
  };

  const handleToggleActive = async (expert: Expert) => {
    try {
      const { error } = await supabase
        .from("experts")
        .update({ is_active: !expert.is_active })
        .eq("id", expert.id);

      if (error) throw error;
      
      setExperts((prev) =>
        prev.map((e) =>
          e.id === expert.id ? { ...e, is_active: !e.is_active } : e
        )
      );
      toast.success(expert.is_active ? "Szakértő deaktiválva" : "Szakértő aktiválva");
    } catch (error) {
      toast.error("Hiba történt");
    }
  };

  const handleToggleLocked = async (expert: Expert) => {
    try {
      const { error } = await supabase
        .from("experts")
        .update({ is_locked: !expert.is_locked })
        .eq("id", expert.id);

      if (error) throw error;
      
      setExperts((prev) =>
        prev.map((e) =>
          e.id === expert.id ? { ...e, is_locked: !e.is_locked } : e
        )
      );
      toast.success(expert.is_locked ? "Szakértő feloldva" : "Szakértő zárolva");
    } catch (error) {
      toast.error("Hiba történt");
    }
  };

  const handleCancelContract = async (expert: Expert) => {
    try {
      const { error } = await supabase
        .from("experts")
        .update({ contract_canceled: true, is_active: false, is_locked: true })
        .eq("id", expert.id);

      if (error) throw error;
      
      setExperts((prev) =>
        prev.map((e) =>
          e.id === expert.id
            ? { ...e, contract_canceled: true, is_active: false, is_locked: true }
            : e
        )
      );
      toast.success("Szerződés felmondva");
    } catch (error) {
      toast.error("Hiba történt");
    }
  };

  const handleDeleteClick = (expert: Expert) => {
    setExpertToDelete(expert);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (expertToDelete) {
      try {
        const { error } = await supabase
          .from("experts")
          .delete()
          .eq("id", expertToDelete.id);

        if (error) throw error;
        
        setExperts((prev) => prev.filter((e) => e.id !== expertToDelete.id));
        toast.success("Szakértő törölve");
      } catch (error) {
        toast.error("Hiba a törlés során");
      }
    }
    setDeleteDialogOpen(false);
    setExpertToDelete(null);
  };

  const getStatusBadge = (expert: Expert) => {
    if (expert.contract_canceled) {
      return <Badge className="bg-muted-foreground">Szerződés felmondva</Badge>;
    }
    if (!expert.last_login_at) {
      return <Badge className="bg-warning">Függőben</Badge>;
    }
    if (expert.is_locked) {
      return <Badge className="bg-destructive">Zárolt</Badge>;
    }
    return (
      <Badge className={expert.is_active ? "bg-primary" : "bg-muted-foreground"}>
        {expert.is_active ? "Aktív" : "Inaktív"}
      </Badge>
    );
  };

  const getTypeBadge = (expert: Expert) => {
    if (expert.expert_type === "company") {
      return (
        <Badge variant="outline" className="text-primary border-primary">
          <Building2 className="w-3 h-3 mr-1" />
          Cég
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <User className="w-3 h-3 mr-1" />
        Egyéni
      </Badge>
    );
  };

  const ExpertActions = ({ expert }: { expert: Expert }) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/dashboard/settings/experts/${expert.id}/edit`)}
        title="Szerkesztés"
      >
        <Pencil className="w-4 h-4" />
      </Button>
      {expert.last_login_at && !expert.contract_canceled && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleActive(expert)}
            title={expert.is_active ? "Deaktiválás" : "Aktiválás"}
          >
            <Power className={`w-4 h-4 ${expert.is_active ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleLocked(expert)}
            title={expert.is_locked ? "Feloldás" : "Zárolás"}
          >
            {expert.is_locked ? (
              <Lock className="w-4 h-4 text-destructive" />
            ) : (
              <Unlock className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </>
      )}
      {!expert.contract_canceled && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleCancelContract(expert)}
          title="Szerződés felmondása"
        >
          <FileX className="w-4 h-4 text-warning" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDeleteClick(expert)}
        title="Törlés"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-calibri-bold mb-2">Szakértők</h1>
      
      <a
        href="#"
        className="text-cgp-link hover:text-cgp-link-hover hover:underline mb-6 block"
        onClick={(e) => {
          e.preventDefault();
          navigate("/dashboard/settings/experts/new");
        }}
      >
        + Új szakértő hozzáadása
      </a>

      <div className="max-w-md mb-6">
        <MultiSelectField
          label="Ország szűrő"
          options={countryOptions}
          selectedIds={selectedCountryIds}
          onChange={handleCountryFilterChange}
          placeholder="Válassz országot..."
        />
      </div>

      {/* Cégek szekció - mindig megjelenik ha vannak cégek */}
      {getCompanyExperts().length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Cégek
            <Badge variant="secondary">{getCompanyExperts().length}</Badge>
          </h2>
          <div className="space-y-2">
            {getCompanyExperts().map((company) => {
              const members = getTeamMembersByExpert(company.id);
              const isOpen = openCountries.includes(`company-${company.id}`);

              return (
                <Collapsible 
                  key={company.id} 
                  open={isOpen} 
                  onOpenChange={() => toggleCountry(`company-${company.id}`)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{company.company_name || company.name}</span>
                        <Badge variant="outline" className="text-primary border-primary">
                          <Users className="w-3 h-3 mr-1" />
                          {members.length} csapattag
                        </Badge>
                        {getStatusBadge(company)}
                      </div>
                      <div className="flex items-center gap-2">
                        <ExpertActions expert={company} />
                        {isOpen ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-l-2 border-primary ml-4 pl-4 py-2 space-y-2">
                      {members.length === 0 ? (
                        <div className="p-3 text-muted-foreground text-sm">
                          Nincsenek csapattagok
                        </div>
                      ) : (
                        members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-white border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{member.name}</span>
                              {member.is_team_leader && (
                                <Badge className="bg-primary">Csapatvezető</Badge>
                              )}
                              {!member.is_active && (
                                <Badge variant="secondary">Inaktív</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{member.email}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}

      {/* Országonkénti szakértők */}
      <div className="space-y-4">
        {displayedCountries.map((country) => {
          const allCountryExperts = getExpertsByCountryAndType(country.id);
          const individualExperts = getExpertsByCountryAndType(country.id, "individual");
          const companyExperts = getExpertsByCountryAndType(country.id, "company");
          
          if (allCountryExperts.length === 0) return null;

          const currentTab = getCountryTab(country.id);
          const isOpen = openCountries.includes(country.id);

          return (
            <Collapsible key={country.id} open={isOpen} onOpenChange={() => toggleCountry(country.id)}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary text-lg">{country.name}</span>
                    <Badge variant="outline">{allCountryExperts.length} szakértő</Badge>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-l-2 border-primary ml-4 pl-4 py-3">
                  {/* Országon belüli fülek */}
                  <Tabs 
                    value={currentTab} 
                    onValueChange={(v) => setCountryTab(country.id, v as "all" | "individual" | "company")} 
                    className="mb-3"
                  >
                    <TabsList className="h-8">
                      <TabsTrigger value="all" className="text-xs px-3 h-7">
                        Összes
                        <Badge variant="secondary" className="ml-1 text-xs">{allCountryExperts.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="individual" className="text-xs px-3 h-7">
                        <User className="w-3 h-3 mr-1" />
                        Egyéni
                        <Badge variant="secondary" className="ml-1 text-xs">{individualExperts.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="company" className="text-xs px-3 h-7">
                        <Building2 className="w-3 h-3 mr-1" />
                        Cégek
                        <Badge variant="secondary" className="ml-1 text-xs">{companyExperts.length}</Badge>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Szakértők listája a kiválasztott fül alapján */}
                  <div className="space-y-2">
                    {(currentTab === "all" || currentTab === "individual") && individualExperts.map((expert) => (
                      <div
                        key={expert.id}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{expert.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(expert)}
                          <ExpertActions expert={expert} />
                        </div>
                      </div>
                    ))}
                    {(currentTab === "all" || currentTab === "company") && companyExperts.map((expert) => (
                      <div
                        key={expert.id}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-medium">{expert.company_name || expert.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(expert)}
                          <ExpertActions expert={expert} />
                        </div>
                      </div>
                    ))}
                    {allCountryExperts.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Nincs szakértő ebben az országban.
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {displayedCountries.length === 0 && getCompanyExperts().length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nincs megjeleníthető szakértő.
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {expertToDelete?.expert_type === "company" ? "Cég törlése" : "Szakértő törlése"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd <strong>
                {expertToDelete?.expert_type === "company" 
                  ? expertToDelete?.company_name || expertToDelete?.name 
                  : expertToDelete?.name}
              </strong>?
              {expertToDelete?.expert_type === "company" && (
                <span className="block mt-2 text-destructive">
                  A céghez tartozó összes csapattag is törlésre kerül!
                </span>
              )}
              <span className="block mt-2">Ez a művelet nem vonható vissza.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpertList;
