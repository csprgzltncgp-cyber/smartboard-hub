import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, ListChecks, Building2, ChevronDown, ChevronRight, Link2, Users } from "lucide-react";
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

// Mock adatok
const mockCountries = [
  { id: "hu", code: "HU", name: "Magyarország" },
  { id: "cz", code: "CZ", name: "Csehország" },
  { id: "sk", code: "SK", name: "Szlovákia" },
  { id: "pl", code: "PL", name: "Lengyelország" },
  { id: "ro", code: "RO", name: "Románia" },
  { id: "rs", code: "RS", name: "Szerbia" },
];

const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Magyar Telekom Nyrt.",
    active: true,
    country_ids: ["hu"],
    contract_holder_id: "2",
    org_id: null,
    contract_start: "2023-01-01",
    contract_end: "2025-12-31",
    contract_reminder_email: "hr@telekom.hu",
    lead_account_id: "1",
    is_connected: true,
    created_at: "2023-01-01",
    updated_at: "2024-01-15",
  },
  {
    id: "2",
    name: "OTP Bank Nyrt.",
    active: true,
    country_ids: ["hu", "ro", "rs"],
    contract_holder_id: "2",
    org_id: null,
    contract_start: "2022-06-01",
    contract_end: "2024-05-31",
    contract_reminder_email: null,
    lead_account_id: "2",
    is_connected: false,
    created_at: "2022-06-01",
    updated_at: "2024-02-20",
  },
  {
    id: "3",
    name: "Škoda Auto a.s.",
    active: true,
    country_ids: ["cz", "sk"],
    contract_holder_id: "1",
    org_id: "SKODA-001",
    contract_start: null,
    contract_end: null,
    contract_reminder_email: null,
    lead_account_id: null,
    is_connected: false,
    created_at: "2023-03-15",
    updated_at: "2024-01-10",
  },
  {
    id: "4",
    name: "PKO Bank Polski",
    active: true,
    country_ids: ["pl"],
    contract_holder_id: "1",
    org_id: "PKO-PL-002",
    contract_start: null,
    contract_end: null,
    contract_reminder_email: null,
    lead_account_id: null,
    is_connected: true,
    created_at: "2023-05-01",
    updated_at: "2024-03-01",
  },
  {
    id: "5",
    name: "Erste Bank Hungary Zrt.",
    active: false,
    country_ids: ["hu"],
    contract_holder_id: "2",
    org_id: null,
    contract_start: "2021-01-01",
    contract_end: "2023-12-31",
    contract_reminder_email: null,
    lead_account_id: "1",
    is_connected: false,
    created_at: "2021-01-01",
    updated_at: "2023-12-31",
  },
];

const CompanyList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [countries] = useState(mockCountries);
  const [loading, setLoading] = useState(false);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [openCountries, setOpenCountries] = useState<string[]>([]);

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

  const handleDeleteConfirm = () => {
    if (companyToDelete) {
      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));
      toast.success(`${companyToDelete.name} törölve`);
      setCompanyToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (companyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/settings/companies/${companyId}/edit`);
  };

  const handleInputsClick = (companyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/settings/companies/${companyId}/inputs`);
  };

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

      {/* Tartalom betöltve - országonkénti csoportosítás */}
      {selectedCountryIds.length > 0 && (
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
                      onInputs={handleInputsClick}
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
  onInputs: (id: string, e: React.MouseEvent) => void;
  onDelete: (company: Company, e: React.MouseEvent) => void;
}

const CompanyRow = ({ company, onEdit, onInputs, onDelete }: CompanyRowProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        {company.is_connected && (
          <div className="flex items-center text-primary">
            <Building2 className="h-4 w-4" />
            <Link2 className="h-3 w-3 -ml-1" />
          </div>
        )}
        <span className={company.active ? "" : "text-muted-foreground"}>
          {company.name}
        </span>
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
          onClick={(e) => onInputs(company.id, e)}
          className="text-primary hover:text-primary"
        >
          <ListChecks className="h-4 w-4 mr-1" />
          Inputok
        </Button>
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
