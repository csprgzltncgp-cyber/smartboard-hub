import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Trash2, 
  Power, 
  Lock, 
  Unlock, 
  Pencil, 
  LogIn, 
  Mail, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useExperts } from "@/hooks/useExperts";
import { Expert, Country } from "@/types/expert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ExpertList = () => {
  const navigate = useNavigate();
  const { 
    experts, 
    countries, 
    loading, 
    getExpertsByCountry, 
    toggleExpertActive, 
    toggleExpertLocked,
    cancelExpertContract,
    deleteExpert 
  } = useExperts();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelContractDialogOpen, setCancelContractDialogOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  // Filter experts by search term
  const filteredExperts = experts.filter(expert => 
    expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get filtered experts grouped by country
  const getFilteredExpertsByCountry = () => {
    const grouped: { country: Country; experts: Expert[] }[] = [];
    
    countries.forEach((country) => {
      const countryExperts = filteredExperts.filter((e) => e.country_id === country.id);
      if (countryExperts.length > 0) {
        grouped.push({
          country,
          experts: countryExperts,
        });
      }
    });

    // Add experts without country
    const noCountryExperts = filteredExperts.filter((e) => !e.country_id);
    if (noCountryExperts.length > 0) {
      grouped.push({
        country: { id: "no-country", name: "Nincs ország", code: "N/A", created_at: "", updated_at: "" },
        experts: noCountryExperts,
      });
    }

    return grouped;
  };

  const toggleCountry = (countryId: string) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryId)) {
      newExpanded.delete(countryId);
    } else {
      newExpanded.add(countryId);
    }
    setExpandedCountries(newExpanded);
  };

  const handleDeleteClick = (expert: Expert) => {
    setSelectedExpert(expert);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedExpert) {
      await deleteExpert(selectedExpert.id);
    }
    setDeleteDialogOpen(false);
    setSelectedExpert(null);
  };

  const handleCancelContractClick = (expert: Expert) => {
    setSelectedExpert(expert);
    setCancelContractDialogOpen(true);
  };

  const handleCancelContractConfirm = async () => {
    if (selectedExpert) {
      await cancelExpertContract(selectedExpert.id);
    }
    setCancelContractDialogOpen(false);
    setSelectedExpert(null);
  };

  const handleResendEmail = (expert: Expert) => {
    // TODO: Implement email resend functionality
    toast.success("Regisztrációs email újraküldve: " + expert.email);
  };

  const handleLoginAs = (expert: Expert) => {
    // TODO: Implement login as functionality
    toast.info("Bejelentkezés mint: " + expert.name);
  };

  const getCountryEmails = (countryExperts: Expert[]) => {
    return countryExperts
      .filter(e => e.last_login_at) // Only active experts
      .map(e => e.email)
      .join(",");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  const expertsByCountry = getFilteredExpertsByCountry();

  return (
    <TooltipProvider>
      <div>
        {/* Page Title */}
        <h1 className="text-3xl font-calibri-bold mb-2">Szakértők listája</h1>
        
        {/* Create New Link */}
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

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Keresés név vagy email alapján..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Country-grouped Expert List */}
        <div className="space-y-2">
          {expertsByCountry.map(({ country, experts: countryExperts }) => (
            <Collapsible 
              key={country.id}
              open={expandedCountries.has(country.id)}
              onOpenChange={() => toggleCountry(country.id)}
            >
              {/* Country Header */}
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 bg-cgp-teal text-white rounded-lg cursor-pointer hover:bg-cgp-teal/90 transition-colors">
                  <div className="flex items-center gap-3">
                    {expandedCountries.has(country.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <span className="font-calibri-bold text-lg">{country.code}</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {countryExperts.length}
                    </Badge>
                  </div>
                  <a
                    href={`mailto:${getCountryEmails(countryExperts)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Email küldése
                  </a>
                </div>
              </CollapsibleTrigger>

              {/* Expert List */}
              <CollapsibleContent>
                <div className="mt-1 space-y-1">
                  {countryExperts.map((expert) => (
                    <div 
                      key={expert.id}
                      className={cn(
                        "flex items-center justify-between p-4 bg-white border rounded-lg",
                        !expert.is_active && "opacity-60",
                        expert.contract_canceled && "bg-red-50"
                      )}
                    >
                      {/* Expert Name */}
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{expert.name}</span>
                        {/* Data Status indicator */}
                        {/* TODO: Check if expert data is complete */}
                        <Tooltip>
                          <TooltipTrigger>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </TooltipTrigger>
                          <TooltipContent>Adatok rendben</TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {/* Edit */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/dashboard/settings/experts/${expert.id}/edit`)}
                            >
                              <Pencil className="w-4 h-4 text-cgp-teal" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Szerkesztés</TooltipContent>
                        </Tooltip>

                        {/* Login As */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleLoginAs(expert)}
                            >
                              <LogIn className="w-4 h-4 text-cgp-teal" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bejelentkezés</TooltipContent>
                        </Tooltip>

                        {/* Pending / Active / Inactive Status */}
                        {!expert.last_login_at ? (
                          // Pending - hasn't logged in yet
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Függőben
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>Még nem jelentkezett be</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleResendEmail(expert)}
                                >
                                  <Mail className="w-4 h-4 text-yellow-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Email újraküldése</TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <>
                            {/* Lock/Unlock */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleExpertLocked(expert.id)}
                                  disabled={expert.contract_canceled}
                                >
                                  {expert.is_locked ? (
                                    <Lock className="w-4 h-4 text-red-500" />
                                  ) : (
                                    <Unlock className="w-4 h-4 text-green-500" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {expert.is_locked ? "Zárolva" : "Feloldva"}
                              </TooltipContent>
                            </Tooltip>

                            {/* Active/Inactive */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleExpertActive(expert.id)}
                                  disabled={expert.contract_canceled}
                                >
                                  {expert.is_active ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-gray-400" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {expert.is_active ? "Aktív" : "Inaktív"}
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}

                        {/* Cancel Contract */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelContractClick(expert)}
                              disabled={expert.contract_canceled}
                              className={expert.contract_canceled ? "text-gray-400" : "text-orange-500 hover:text-orange-600"}
                            >
                              <FileX className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {expert.contract_canceled ? "Szerződés felmondva" : "Szerződés felmondása"}
                          </TooltipContent>
                        </Tooltip>

                        {/* Delete */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(expert)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Törlés</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {expertsByCountry.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nincs találat
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Szakértő törlése</AlertDialogTitle>
              <AlertDialogDescription>
                Biztosan törölni szeretnéd <strong>{selectedExpert?.name}</strong> szakértőt?
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

        {/* Cancel Contract Confirmation Dialog */}
        <AlertDialog open={cancelContractDialogOpen} onOpenChange={setCancelContractDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Szerződés felmondása</AlertDialogTitle>
              <AlertDialogDescription>
                Biztosan fel szeretnéd mondani <strong>{selectedExpert?.name}</strong> szerződését?
                A szakértő zárolásra kerül és nem fog tudni bejelentkezni.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mégse</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelContractConfirm}
                className="bg-warning text-warning-foreground hover:bg-warning/90"
              >
                Felmondás
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default ExpertList;
