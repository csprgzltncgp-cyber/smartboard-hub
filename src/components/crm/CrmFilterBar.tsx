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
      <Select value={selectedCountry || ""} onValueChange={(v) => onCountryChange(v || null)}>
        <SelectTrigger className="w-[200px] bg-primary text-primary-foreground border-0 rounded-none hover:bg-primary/90">
          <SelectValue placeholder="Choose country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All countries</SelectItem>
          {mockCountries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedColleague || ""} onValueChange={(v) => onColleagueChange(v || null)}>
        <SelectTrigger className="w-[200px] bg-primary text-primary-foreground border-0 rounded-none hover:bg-primary/90">
          <SelectValue placeholder="Choose a colleague" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All colleagues</SelectItem>
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
