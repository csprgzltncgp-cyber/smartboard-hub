import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Country } from "@/types/expert";

const STREET_SUFFIXES = [
  { value: "1", label: "Utca" },
  { value: "2", label: "Tér" },
  { value: "3", label: "Út" },
];

interface ExpertAddressCardProps {
  addressData: {
    post_code: string;
    country_id: string;
    city_id: string;
    street: string;
    street_suffix: string;
    house_number: string;
  };
  countries: Country[];
  onChange: (data: Partial<ExpertAddressCardProps["addressData"]>) => void;
}

export const ExpertAddressCard = ({ addressData, countries, onChange }: ExpertAddressCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-cgp-teal">Postázási cím:</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Irányítószám:</Label>
          <Input
            value={addressData.post_code}
            onChange={(e) => onChange({ post_code: e.target.value })}
            className="border-cgp-teal"
          />
        </div>

        <div className="space-y-2">
          <Label>Ország:</Label>
          <Select
            value={addressData.country_id}
            onValueChange={(value) => onChange({ country_id: value })}
          >
            <SelectTrigger className="border-cgp-teal">
              <SelectValue placeholder="Kérjük válasszon" />
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

        <div className="space-y-2">
          <Label>Város:</Label>
          <Input
            value={addressData.city_id}
            onChange={(e) => onChange({ city_id: e.target.value })}
            className="border-cgp-teal"
            placeholder="Város neve"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Utca:</Label>
            <Input
              value={addressData.street}
              onChange={(e) => onChange({ street: e.target.value })}
              className="border-cgp-teal"
            />
          </div>
          <div className="space-y-2">
            <Label>Közterület:</Label>
            <Select
              value={addressData.street_suffix}
              onValueChange={(value) => onChange({ street_suffix: value })}
            >
              <SelectTrigger className="border-cgp-teal">
                <SelectValue placeholder="Válassz" />
              </SelectTrigger>
              <SelectContent>
                {STREET_SUFFIXES.map((suffix) => (
                  <SelectItem key={suffix.value} value={suffix.value}>
                    {suffix.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Házszám:</Label>
          <Input
            value={addressData.house_number}
            onChange={(e) => onChange({ house_number: e.target.value })}
            className="border-cgp-teal"
          />
        </div>
      </CardContent>
    </Card>
  );
};
