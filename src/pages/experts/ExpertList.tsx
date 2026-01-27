import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  Trash2, 
  Lock, 
  Unlock, 
  Pencil, 
  LogIn, 
  Mail, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileCheck,
  FileX,
  Info
} from "lucide-react";
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
    toggleExpertActive, 
    toggleExpertLocked,
    cancelExpertContract,
    deleteExpert 
  } = useExperts();
  
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelContractDialogOpen, setCancelContractDialogOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  // Get experts grouped by country
  const getExpertsByCountry = () => {
    const grouped: { country: Country; experts: Expert[] }[] = [];
    
    countries.forEach((country) => {
      const countryExperts = experts.filter((e) => e.country_id === country.id);
      if (countryExperts.length > 0) {
        grouped.push({
          country,
          experts: countryExperts,
        });
      }
    });

    // Add experts without country
    const noCountryExperts = experts.filter((e) => !e.country_id);
    if (noCountryExperts.length > 0) {
      grouped.push({
        country: { id: "no-country", name: "Nincs ország", code: "N/A", created_at: "", updated_at: "" },
        experts: noCountryExperts,
      });
    }

    return grouped;
  };

  const toggleCountry = (countryId: string, event: React.MouseEvent) => {
    // Don't toggle if clicking on the mail link
    if ((event.target as HTMLElement).closest('a.mail-link')) {
      return;
    }
    
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

  const expertsByCountry = getExpertsByCountry();

  return (
    <TooltipProvider>
      <div className="m-0">
        {/* Breadcrumb placeholder */}
        <div className="text-sm text-muted-foreground mb-2">
          Beállítások / Szakértők
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-bold mb-2 pl-0">Szakértők listája</h1>
        
        {/* Create New Link - underlined link style like Laravel */}
        <a 
          href="#"
          className="text-cgp-link hover:text-cgp-link-hover underline mb-6 block pl-0"
          onClick={(e) => {
            e.preventDefault();
            navigate("/dashboard/settings/experts/new");
          }}
        >
          Új szakértő hozzáadása
        </a>

        {/* Country-grouped Expert List - Laravel style */}
        <div>
          {expertsByCountry.map(({ country, experts: countryExperts }) => (
            <div key={country.id}>
              {/* Country Header - Laravel list.css style: .list-element.case-list-in.active */}
              <div 
                className={cn(
                  "flex items-center justify-between py-2.5 px-2.5 cursor-pointer mb-0",
                  "font-bold mt-2.5",
                  expandedCountries.has(country.id) 
                    ? "bg-cgp-list-active text-white" 
                    : "bg-cgp-list-bg text-foreground"
                )}
                onClick={(e) => toggleCountry(country.id, e)}
              >
                <div className="flex items-center gap-2">
                  <span>{country.code}</span>
                  {/* Mail link */}
                  <a
                    href={`mailto:${getCountryEmails(countryExperts)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mail-link flex items-center gap-1 text-current ml-2.5"
                  >
                    <Mail className="w-5 h-5 mb-0.5" />
                    Email küldése
                  </a>
                </div>
                {/* Caret button */}
                <button className="bg-transparent border-0 outline-none float-right">
                  <ChevronDown 
                    className={cn(
                      "w-5 h-5 transition-transform",
                      expandedCountries.has(country.id) ? "rotate-180 text-white" : ""
                    )} 
                  />
                </button>
              </div>

              {/* Expert List - hidden by default, shown when expanded */}
              {expandedCountries.has(country.id) && countryExperts.map((expert) => (
                <div 
                  key={expert.id}
                  className={cn(
                    "py-2.5 px-2.5 bg-cgp-list-bg text-foreground font-bold mt-2.5",
                    "flex items-center justify-between"
                  )}
                  data-country={country.id}
                >
                  {/* Expert Name */}
                  <span>{expert.name}</span>

                  {/* Actions - float right, Laravel order: Delete, Contract, Active/Inactive, Locked, Edit, LoginAs, DataStatus */}
                  <div className="flex items-center float-right">
                    
                    {/* Delete Button - .delete-button style */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleDeleteClick(expert)}
                          className="bg-transparent border-0 outline-none ml-1.5 text-cgp-delete-purple"
                        >
                          <Trash2 className="w-5 h-5 mb-0.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Törlés</TooltipContent>
                    </Tooltip>

                    {/* Cancel Contract - .activate-button style */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => !expert.contract_canceled && handleCancelContractClick(expert)}
                          disabled={expert.contract_canceled}
                          className={cn(
                            "bg-transparent border-0 outline-none ml-1.5 flex items-center gap-1",
                            expert.contract_canceled 
                              ? "text-destructive" // .deactivated color
                              : "text-cgp-status-active" // .activate-button default color
                          )}
                        >
                          {expert.contract_canceled ? (
                            <>
                              <FileX className="w-5 h-5 mb-0.5" />
                              <span className="text-sm">Felmondva</span>
                            </>
                          ) : (
                            <>
                              <FileCheck className="w-5 h-5 mb-0.5" />
                              <span className="text-sm">Szerződés</span>
                            </>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {expert.contract_canceled ? "Szerződés felmondva" : "Szerződés felmondása"}
                      </TooltipContent>
                    </Tooltip>

                    {/* Status buttons - only shown if expert has logged in */}
                    {expert.last_login_at ? (
                      <>
                        {/* Active/Inactive - .activate-button with .deactivated for inactive */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => toggleExpertActive(expert.id)}
                              disabled={expert.contract_canceled}
                              className={cn(
                                "bg-transparent border-0 outline-none ml-1.5 flex items-center gap-1",
                                !expert.is_active 
                                  ? "text-destructive" // .deactivated
                                  : "text-cgp-status-active" // active green
                              )}
                            >
                              {expert.is_active ? (
                                <>
                                  <CheckCircle className="w-5 h-5 mb-0.5" />
                                  <span className="text-sm">Aktív</span>
                                </>
                              ) : (
                                <>
                                  {expert.inactivity ? (
                                    <Info className="w-5 h-5 mb-0.5" />
                                  ) : (
                                    <XCircle className="w-5 h-5 mb-0.5" />
                                  )}
                                  <span className="text-sm">Inaktív</span>
                                </>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {expert.is_active ? "Aktív - kattints az inaktiváláshoz" : "Inaktív - kattints az aktiváláshoz"}
                            {expert.inactivity && ` (Inaktív: ${expert.inactivity.until}-ig)`}
                          </TooltipContent>
                        </Tooltip>

                        {/* Locked/Unlocked */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => toggleExpertLocked(expert.id)}
                              disabled={expert.contract_canceled}
                              className={cn(
                                "bg-transparent border-0 outline-none ml-1.5 flex items-center gap-1",
                                expert.is_locked 
                                  ? "text-destructive" // .deactivated
                                  : "text-cgp-status-active" // unlocked green
                              )}
                            >
                              {expert.is_locked ? (
                                <>
                                  <Lock className="w-5 h-5 mb-0.5" />
                                  <span className="text-sm">Zárolt</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-5 h-5 mb-0.5" />
                                  <span className="text-sm">Nyitott</span>
                                </>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {expert.is_locked ? "Zárolt" : "Feloldva"}
                          </TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      /* Pending status - .pending color */
                      <span className="flex items-center gap-1 ml-1.5 text-cgp-status-pending">
                        <AlertCircle className="w-5 h-5 mb-0.5" />
                        <span className="text-sm">Függőben</span>
                        {/* Resend email button - .mail-resend-button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleResendEmail(expert)}
                              className="bg-transparent border-0 outline-none ml-1.5 text-cgp-status-pending"
                            >
                              <Mail className="w-5 h-5 mb-0.5" />
                              <span className="text-sm">Email küldése</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Regisztrációs email újraküldése</TooltipContent>
                        </Tooltip>
                      </span>
                    )}

                    {/* Edit link */}
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/dashboard/settings/experts/${expert.id}/edit`);
                      }}
                      className="flex items-center gap-1 ml-1.5 text-foreground no-underline"
                    >
                      <Pencil className="w-5 h-5 mb-0.5" />
                      <span className="text-sm">Szerkesztés</span>
                    </a>

                    {/* Login As button - .loginAs style */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleLoginAs(expert)}
                          className="bg-transparent border-0 outline-none ml-1.5 text-foreground flex items-center gap-1"
                        >
                          <LogIn className="w-5 h-5 mb-0.5" />
                          <span className="text-sm">Belépés</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Bejelentkezés mint szakértő</TooltipContent>
                    </Tooltip>

                    {/* Data status indicator - missing or ok */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/dashboard/settings/experts/${expert.id}/edit`);
                          }}
                          className={cn(
                            "flex items-center gap-1 ml-2",
                            // TODO: Check if expert data is complete
                            "text-cgp-status-active" // .activate-button green for OK
                            // Use "text-destructive" for missing data
                          )}
                        >
                          <CheckCircle className="w-5 h-5 mb-0.5" />
                          <span className="text-sm">Adatok rendben</span>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Szakértői adatok állapota</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}

              {/* Last element spacing */}
              {expandedCountries.has(country.id) && countryExperts.length > 0 && (
                <div className="mb-5" />
              )}
            </div>
          ))}

          {expertsByCountry.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nincs szakértő az adatbázisban
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Biztosan törölni szeretné?</AlertDialogTitle>
              <AlertDialogDescription>
                Ez a művelet nem vonható vissza.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mégse</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Igen, törlöm!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Contract Confirmation Dialog */}
        <AlertDialog open={cancelContractDialogOpen} onOpenChange={setCancelContractDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Biztosan fel szeretné mondani a szerződést?</AlertDialogTitle>
              <AlertDialogDescription>
                A szakértő zárolásra kerül és nem fog tudni bejelentkezni.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mégse</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelContractConfirm}
                className="bg-cgp-badge-lastday text-white hover:bg-cgp-badge-lastday/90"
              >
                Igen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default ExpertList;
