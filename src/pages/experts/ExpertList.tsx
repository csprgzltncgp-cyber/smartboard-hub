import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Power, Search, Pencil, Lock, Unlock, FileX } from "lucide-react";
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
}

interface Country {
  id: string;
  code: string;
  name: string;
}

const ExpertList = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState<Expert | null>(null);
  const [openCountries, setOpenCountries] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expertsRes, countriesRes] = await Promise.all([
        supabase.from("experts").select("*").order("name"),
        supabase.from("countries").select("*").order("code"),
      ]);

      if (expertsRes.data) setExperts(expertsRes.data);
      if (countriesRes.data) setCountries(countriesRes.data);
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

  const getExpertsByCountry = (countryId: string) => {
    return experts.filter((expert) => expert.country_id === countryId);
  };

  const filteredExperts = experts.filter(
    (expert) =>
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expert.username?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

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
      return <Badge className="bg-gray-500">Szerződés felmondva</Badge>;
    }
    if (!expert.last_login_at) {
      return <Badge className="bg-yellow-500">Függőben</Badge>;
    }
    if (expert.is_locked) {
      return <Badge className="bg-red-500">Zárolt</Badge>;
    }
    return (
      <Badge className={expert.is_active ? "bg-green-500" : "bg-gray-400"}>
        {expert.is_active ? "Aktív" : "Inaktív"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  // Ha van keresés, táblázatos nézet
  if (searchTerm) {
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

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Keresés név, email vagy felhasználónév alapján..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Név</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Felhasználónév</TableHead>
                <TableHead className="text-center">Státusz</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperts.map((expert) => (
                <TableRow key={expert.id} className={!expert.is_active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{expert.name}</TableCell>
                  <TableCell>{expert.email}</TableCell>
                  <TableCell>{expert.username || "-"}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(expert)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
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
                            <Power className={`w-4 h-4 ${expert.is_active ? "text-green-500" : "text-gray-400"}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleLocked(expert)}
                            title={expert.is_locked ? "Feloldás" : "Zárolás"}
                          >
                            {expert.is_locked ? (
                              <Lock className="w-4 h-4 text-red-500" />
                            ) : (
                              <Unlock className="w-4 h-4 text-gray-400" />
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
                          <FileX className="w-4 h-4 text-orange-500" />
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

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Szakértő törlése</AlertDialogTitle>
              <AlertDialogDescription>
                Biztosan törölni szeretnéd <strong>{expertToDelete?.name}</strong> szakértőt?
                Ez a művelet nem vonható vissza.
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
  }

  // Országonkénti csoportosított nézet (Laravel-hez hasonló)
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

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Keresés név, email vagy felhasználónév alapján..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

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
                    <span className="font-semibold text-cgp-teal">{country.code}</span>
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
                <div className="border-l-2 border-cgp-teal ml-4 pl-4 py-2 space-y-2">
                  {countryExperts.map((expert) => (
                    <div
                      key={expert.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg"
                    >
                      <span className="font-medium">{expert.name}</span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(expert)}
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
                              <Power className={`w-4 h-4 ${expert.is_active ? "text-green-500" : "text-gray-400"}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleLocked(expert)}
                              title={expert.is_locked ? "Feloldás" : "Zárolás"}
                            >
                              {expert.is_locked ? (
                                <Lock className="w-4 h-4 text-red-500" />
                              ) : (
                                <Unlock className="w-4 h-4 text-gray-400" />
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
                            <FileX className="w-4 h-4 text-orange-500" />
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
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Szakértő törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd <strong>{expertToDelete?.name}</strong> szakértőt?
              Ez a művelet nem vonható vissza.
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
