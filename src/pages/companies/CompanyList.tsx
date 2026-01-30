import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trash2, Pencil, Building2, ChevronDown, ChevronRight, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import { Company } from "@/types/company";
import { useCompaniesDb } from "@/hooks/useCompaniesDb";

const CompanyList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companies, countries, loading, deleteCompany, fetchCompanies } = useCompaniesDb();
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [openCountries, setOpenCountries] = useState<string[]>([]);

  // Restore list UI state when coming back from edit
  useEffect(() => {
    const state = location.state as
      | {
          selectedCountryIds?: string[];
          openCountries?: string[];
        }
      | undefined;

    if (!state) return;

    if (state.selectedCountryIds) setSelectedCountryIds(state.selectedCountryIds);
    if (state.openCountries) setOpenCountries(state.openCountries);
  }, [location.state]);

  // Ország választó opciók
  const countryOptions = [
    { id: "all", label: "Összes ország" },
    ...countries.map((c) => ({ id: c.id, label: c.name })),
  ];

  // "Összes" kiválasztva?
  const isAllSelected = selectedCountryIds.includes("all");

  // Megjelenítendő országok
  const displayedCountries = isAllSelected
    ? countries
    : countries.filter((c) => selectedCountryIds.includes(c.id));

  // Szűrt cégek az országok alapján
  const filteredCompanies = useMemo(() => {
    if (selectedCountryIds.length === 0) return [];
    if (isAllSelected) return companies;
    return companies.filter((company) =>
      company.country_ids.some((cid) => selectedCountryIds.includes(cid))
    );
  }, [companies, selectedCountryIds, isAllSelected]);

  // Cégek országonkénti csoportosítása
  const companiesByCountry = useMemo(() => {
    const grouped: Record<string, Company[]> = {};
    
    displayedCountries.forEach((country) => {
      grouped[country.id] = filteredCompanies.filter((company) =>
        company.country_ids.includes(country.id)
      );
    });
    
    return grouped;
  }, [filteredCompanies, displayedCountries]);

  const handleCountryFilterChange = (ids: string[]) => {
    // Ha "all" most lett kiválasztva, töröljük a többit
    if (ids.includes("all") && !selectedCountryIds.includes("all")) {
      setSelectedCountryIds(["all"]);
    } else if (ids.includes("all") && ids.length > 1) {
      // Ha más elem is kiválasztva, miközben "all" is ott van, távolítsuk el az "all"-t
      setSelectedCountryIds(ids.filter((id) => id !== "all"));
    } else {
      setSelectedCountryIds(ids);
    }
  };

  const toggleCountry = (countryId: string) => {
    setOpenCountries((prev) =>
      prev.includes(countryId)
        ? prev.filter((id) => id !== countryId)
        : [...prev, countryId]
    );
  };

  const handleDeleteClick = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (companyToDelete) {
      const success = await deleteCompany(companyToDelete.id);
      if (success) {
        toast.success(`${companyToDelete.name} törölve`);
      } else {
        toast.error("Hiba történt a törlés során");
      }
      setCompanyToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (companyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/settings/companies/${companyId}/edit`, {
      state: {
        from: "/dashboard/settings/companies",
        companiesListState: {
          selectedCountryIds,
          openCountries,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cégek betöltése...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-calibri-bold mb-2">Cégek</h1>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate("/dashboard/settings/companies/new");
        }}
        className="text-cgp-link hover:text-cgp-link-hover hover:underline mb-6 block"
      >
        + Új cég hozzáadása
      </a>

      {/* Ország szűrő - MultiSelect */}
      <div className="max-w-md mb-6">
        <MultiSelectField
          label="Ország szűrő"
          options={countryOptions}
          selectedIds={selectedCountryIds}
          onChange={handleCountryFilterChange}
          placeholder="Válassz országot..."
        />
      </div>

      {/* Üres állapot - ország nincs kiválasztva */}
      {selectedCountryIds.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Válassz legalább egy országot a cégek megtekintéséhez</p>
        </div>
      )}

      {/* Üres állapot - nincs cég */}
      {selectedCountryIds.length > 0 && companies.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Még nincs cég az adatbázisban</p>
          <Button
            variant="link"
            onClick={() => navigate("/dashboard/settings/companies/new")}
            className="mt-2"
          >
            Hozd létre az elsőt
          </Button>
        </div>
      )}

      {/* Tartalom betöltve - országonkénti csoportosítás */}
      {selectedCountryIds.length > 0 && companies.length > 0 && (
        <div className="space-y-2">
          {displayedCountries.map((country) => {
            const countryCompanies = companiesByCountry[country.id] || [];
            if (countryCompanies.length === 0) return null;

            const isOpen = openCountries.includes(country.id);

            return (
              <Collapsible
                key={country.id}
                open={isOpen}
                onOpenChange={() => toggleCountry(country.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary text-lg">{country.name}</span>
                      <Badge variant="outline">{countryCompanies.length} cég</Badge>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="border-l-2 border-primary ml-4 pl-4 py-3 space-y-2">
                  {countryCompanies.map((company) => (
                    <CompanyRow
                      key={`${country.id}-${company.id}`}
                      company={company}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Törlés megerősítő dialógus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törli?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet nem vonható vissza. A(z) "{companyToDelete?.name}" cég
              véglegesen törlésre kerül.
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

// Cég sor komponens
interface CompanyRowProps {
  company: Company;
  onEdit: (id: string, e: React.MouseEvent) => void;
  onDelete: (company: Company, e: React.MouseEvent) => void;
}

const CompanyRow = ({ company, onEdit, onDelete }: CompanyRowProps) => {
  // Ha a cégcsoport név ki van töltve (több országos / országonkénti alapadatok eset),
  // akkor a listában ezzel jelenjen meg.
  const displayName = company.group_name?.trim() ? company.group_name : company.name;

  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors ${
      company.isNewcomer 
        ? "bg-[#91b752]/10 border-[#91b752] border-2" 
        : "bg-white"
    }`}>
      <div className="flex items-center gap-3">
        {company.is_connected && (
          <div className="flex items-center text-primary">
            <Building2 className="h-4 w-4" />
            <Link2 className="h-3 w-3 -ml-1" />
          </div>
        )}
        <span className={company.active ? "" : "text-muted-foreground"}>
          {displayName}
        </span>
        {company.isNewcomer && (
          <Badge className="bg-[#91b752] text-white hover:bg-[#91b752]/90 text-xs font-semibold">
            Új érkező
          </Badge>
        )}
        {!company.active && (
          <Badge variant="secondary" className="text-xs">
            Inaktív
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => onEdit(company.id, e)}
          className="text-primary hover:text-primary"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Szerkesztés
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => onDelete(company, e)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Törlés
        </Button>
      </div>
    </div>
  );
};

export default CompanyList;
