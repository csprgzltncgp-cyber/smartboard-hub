import { useState, useEffect } from "react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
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
import { InactivityDialog } from "@/components/experts/InactivityDialog";

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

type ActiveInactivity = {
  until: string | null;
  is_indefinite: boolean;
};

const ExpertList = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState<Expert | null>(null);
  const [openCountries, setOpenCountries] = useState<string[]>([]);
  const [countryTabs, setCountryTabs] = useState<Record<string, "all" | "individual" | "company">>({});
  const [inactivityDialogOpen, setInactivityDialogOpen] = useState(false);
  const [selectedExpertForInactivity, setSelectedExpertForInactivity] = useState<Expert | null>(null);
  const [activeInactivityByExpertId, setActiveInactivityByExpertId] = useState<Record<string, ActiveInactivity>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const nowIso = new Date().toISOString();
      const [expertsRes, countriesRes, teamMembersRes] = await Promise.all([
        supabase.from("experts").select("*").order("name"),
        supabase.from("countries").select("*").order("code"),
        supabase.from("expert_team_members").select("*").order("name"),
      ]);

      if (expertsRes.data) setExperts(expertsRes.data as Expert[]);
      if (countriesRes.data) setCountries(countriesRes.data);
      if (teamMembersRes.data) setTeamMembers(teamMembersRes.data as TeamMember[]);

      // Fetch currently active inactivity periods to show "eddig" date next to the icon
      const { data: inactivityRows, error: inactivityError } = await supabase
        .from("expert_inactivity")
        .select("expert_id, until, is_indefinite, start_date")
        .lte("start_date", nowIso)
        .or(`until.is.null,until.gte.${nowIso}`);

      if (inactivityError) {
        console.error("Error fetching active inactivity:", inactivityError);
        setActiveInactivityByExpertId({});
      } else {
        const map: Record<string, ActiveInactivity> = {};
        (inactivityRows ?? []).forEach((row: any) => {
          const current = map[row.expert_id] as ActiveInactivity | undefined;
          // Prefer indefinite, otherwise prefer the farthest "until"
          if (row.is_indefinite) {
            map[row.expert_id] = { until: null, is_indefinite: true };
            return;
          }
          if (!row.until) return;
          if (!current) {
            map[row.expert_id] = { until: row.until, is_indefinite: false };
            return;
          }
          if (current.is_indefinite) return;
          if (!current.until || new Date(row.until) > new Date(current.until)) {
            map[row.expert_id] = { until: row.until, is_indefinite: false };
          }
        });
        setActiveInactivityByExpertId(map);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Hiba az adatok betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const formatInactivityUntil = (inactivity: ActiveInactivity | undefined) => {
    if (!inactivity) return null;
    if (inactivity.is_indefinite || !inactivity.until) return "Határozatlan";
    try {
      return format(new Date(inactivity.until), "yyyy.MM.dd", { locale: hu });
    } catch {
      return null;
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
      return <Badge className="bg-muted-foreground text-white">Szerződés felmondva</Badge>;
    }
    if (!expert.last_login_at) {
      return <Badge className="bg-cgp-badge-new text-white">Függőben</Badge>;
    }
    if (expert.is_locked) {
      return <Badge className="bg-destructive text-white">Zárolt</Badge>;
    }
    return (
      <Badge className={expert.is_active ? "bg-primary text-white" : "bg-muted-foreground text-white"}>
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

  const handleOpenInactivityDialog = (expert: Expert) => {
    setSelectedExpertForInactivity(expert);
    setInactivityDialogOpen(true);
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
            onClick={() => handleOpenInactivityDialog(expert)}
            title="Inaktivitási időszak kezelése"
          >
            <Power className={`w-4 h-4 ${expert.is_active ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
          {formatInactivityUntil(activeInactivityByExpertId[expert.id]) && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatInactivityUntil(activeInactivityByExpertId[expert.id])}
            </span>
          )}
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

      {/* Üres állapot üzenet */}
      {selectedCountryIds.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Válassz legalább egy országot a szakértők megtekintéséhez</p>
        </div>
      )}

      {/* Országonkénti szakértők */}
      {selectedCountryIds.length > 0 && (
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

          {displayedCountries.filter(c => getExpertsByCountryAndType(c.id).length > 0).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nincs szakértő a kiválasztott országokban.
            </div>
          )}
        </div>
      )}

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

      {/* Inactivity Dialog */}
      {selectedExpertForInactivity && (
        <InactivityDialog
          open={inactivityDialogOpen}
          onOpenChange={setInactivityDialogOpen}
          expertId={selectedExpertForInactivity.id}
          expertName={selectedExpertForInactivity.expert_type === "company" 
            ? selectedExpertForInactivity.company_name || selectedExpertForInactivity.name 
            : selectedExpertForInactivity.name}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default ExpertList;
