import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface CompanyDataPanelProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  taxNumber: string;
  setTaxNumber: (value: string) => void;
  companyRegistrationNumber: string;
  setCompanyRegistrationNumber: (value: string) => void;
  companyAddress: string;
  setCompanyAddress: (value: string) => void;
  companyCity: string;
  setCompanyCity: (value: string) => void;
  companyPostalCode: string;
  setCompanyPostalCode: (value: string) => void;
  companyCountryId: string;
  setCompanyCountryId: (value: string) => void;
  countries: Country[];
}

export const CompanyDataPanel = ({
  companyName,
  setCompanyName,
  taxNumber,
  setTaxNumber,
  companyRegistrationNumber,
  setCompanyRegistrationNumber,
  companyAddress,
  setCompanyAddress,
  companyCity,
  setCompanyCity,
  companyPostalCode,
  setCompanyPostalCode,
  companyCountryId,
  setCompanyCountryId,
  countries,
}: CompanyDataPanelProps) => {
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Cégadatok</h2>

      <div className="space-y-2">
        <Label htmlFor="companyName">Cégnév *</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Cég hivatalos neve"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taxNumber">Adószám</Label>
          <Input
            id="taxNumber"
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value)}
            placeholder="12345678-1-23"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyRegistrationNumber">Cégjegyzékszám</Label>
          <Input
            id="companyRegistrationNumber"
            value={companyRegistrationNumber}
            onChange={(e) => setCompanyRegistrationNumber(e.target.value)}
            placeholder="01-09-123456"
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-md font-medium mb-4">Cég postai cím</h3>

        <div className="space-y-2">
          <Label>Ország</Label>
          <Select value={companyCountryId} onValueChange={setCompanyCountryId}>
            <SelectTrigger>
              <SelectValue placeholder="Válassz országot..." />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="companyPostalCode">Irányítószám</Label>
            <Input
              id="companyPostalCode"
              value={companyPostalCode}
              onChange={(e) => setCompanyPostalCode(e.target.value)}
              placeholder="1234"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="companyCity">Város</Label>
            <Input
              id="companyCity"
              value={companyCity}
              onChange={(e) => setCompanyCity(e.target.value)}
              placeholder="Budapest"
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="companyAddress">Cím (utca, házszám)</Label>
          <Input
            id="companyAddress"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="Példa utca 123."
          />
        </div>
      </div>
    </div>
  );
};
