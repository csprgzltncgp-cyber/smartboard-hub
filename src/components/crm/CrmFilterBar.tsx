import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCountries, mockColleagues } from "@/data/crmMockData";

interface CrmFilterBarProps {
  selectedCountry: string | null;
  selectedColleague: string | null;
  onCountryChange: (country: string | null) => void;
  onColleagueChange: (colleague: string | null) => void;
}

const CrmFilterBar = ({
  selectedCountry,
  selectedColleague,
  onCountryChange,
  onColleagueChange,
}: CrmFilterBarProps) => {
  return (
    <div className="flex gap-4 mb-6">
      <Select value={selectedCountry || "all"} onValueChange={(v) => onCountryChange(v === "all" ? null : v)}>
        <SelectTrigger className="w-[200px] bg-background border border-border rounded-xl hover:bg-muted">
          <SelectValue placeholder="Válassz országot" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Összes ország</SelectItem>
          {mockCountries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedColleague || "all"} onValueChange={(v) => onColleagueChange(v === "all" ? null : v)}>
        <SelectTrigger className="w-[200px] bg-background border border-border rounded-xl hover:bg-muted">
          <SelectValue placeholder="Válassz kollégát" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Összes kolléga</SelectItem>
          {mockColleagues.map((colleague) => (
            <SelectItem key={colleague.id} value={colleague.id}>
              {colleague.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CrmFilterBar;
