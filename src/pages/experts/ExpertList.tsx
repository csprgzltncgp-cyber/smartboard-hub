import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Power, Search, Pencil, Lock, Unlock, FileX, Building2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState<Expert | null>(null);
  const [openCountries, setOpenCountries] = useState<string[]>([]);
  const [openCompanies, setOpenCompanies] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "individual" | "company">("all");

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

  const toggleCompany = (expertId: string) => {
    setOpenCompanies((prev) =>
      prev.includes(expertId)
        ? prev.filter((id) => id !== expertId)
        : [...prev, expertId]
    );
  };

  const getExpertsByCountry = (countryId: string) => {
    return experts.filter((expert) => expert.country_id === countryId && expert.expert_type === "individual");
  };

  const getCompanyExperts = () => {
    return experts.filter((expert) => expert.expert_type === "company");
  };

  const getTeamMembersByExpert = (expertId: string) => {
    return teamMembers.filter((m) => m.expert_id === expertId);
  };

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expert.username?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (expert.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    if (activeTab === "individual") return matchesSearch && expert.expert_type === "individual";
    if (activeTab === "company") return matchesSearch && expert.expert_type === "company";
    return matchesSearch;
  });

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
      <h1 className="text-3xl font-calibri-bold mb-2">Szakértők listája</h1>
      
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

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Keresés név, email, felhasználónév vagy cégnév alapján..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "individual" | "company")} className="mb-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            Összes
            <Badge variant="secondary">{experts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Egyéni
            <Badge variant="secondary">{experts.filter((e) => e.expert_type === "individual").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Cégek
            <Badge variant="secondary">{experts.filter((e) => e.expert_type === "company").length}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Ha van keresés, táblázatos nézet */}
      {searchTerm ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Név / Cégnév</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Típus</TableHead>
                <TableHead className="text-center">Státusz</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperts.map((expert) => (
                <TableRow key={expert.id} className={!expert.is_active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">
                    {expert.expert_type === "company" ? expert.company_name || expert.name : expert.name}
                  </TableCell>
                  <TableCell>{expert.email}</TableCell>
                  <TableCell className="text-center">{getTypeBadge(expert)}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(expert)}</TableCell>
                  <TableCell className="text-right">
                    <ExpertActions expert={expert} />
                  </TableCell>
                </TableRow>
              ))}
              {filteredExperts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nincs találat
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cégek szekció */}
          {(activeTab === "all" || activeTab === "company") && getCompanyExperts().length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Cégek
              </h2>
              <div className="space-y-1">
                {getCompanyExperts().map((company) => {
                  const members = getTeamMembersByExpert(company.id);
                  const isOpen = openCompanies.includes(company.id);

                  return (
                    <Collapsible key={company.id} open={isOpen} onOpenChange={() => toggleCompany(company.id)}>
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

          {/* Egyéni szakértők országonkénti csoportosításban */}
          {(activeTab === "all" || activeTab === "individual") && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Egyéni szakértők
              </h2>
              <div className="space-y-1">
                {countries.map((country) => {
                  const countryExperts = getExpertsByCountry(country.id);
                  if (countryExperts.length === 0) return null;

                  const isOpen = openCountries.includes(country.id);

                  return (
                    <Collapsible key={country.id} open={isOpen} onOpenChange={() => toggleCountry(country.id)}>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-primary">{country.code}</span>
                            <Badge variant="outline">{countryExperts.length} szakértő</Badge>
                          </div>
                          {isOpen ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-l-2 border-primary ml-4 pl-4 py-2 space-y-2">
                          {countryExperts.map((expert) => (
                            <div
                              key={expert.id}
                              className="flex items-center justify-between p-3 bg-white border rounded-lg"
                            >
                              <span className="font-medium">{expert.name}</span>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(expert)}
                                <ExpertActions expert={expert} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
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
    </div>
  );
};

export default ExpertList;
