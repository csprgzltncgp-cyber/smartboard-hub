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

// Pénznemek
const CURRENCIES = [
  { id: "czk", name: "CZK" },
  { id: "eur", name: "EUR" },
  { id: "huf", name: "HUF" },
  { id: "mdl", name: "MDL" },
  { id: "pln", name: "PLN" },
  { id: "ron", name: "RON" },
  { id: "rsd", name: "RSD" },
  { id: "usd", name: "USD" },
  { id: "chf", name: "CHF" },
];

// Számlázási típusok
const INVOICING_TYPES = [
  { id: "normal", name: "Normál" },
  { id: "fixed", name: "Fix" },
  { id: "custom", name: "Egyedi" },
];

interface CompanyBillingPanelProps {
  billingName: string;
  setBillingName: (value: string) => void;
  billingAddress: string;
  setBillingAddress: (value: string) => void;
  billingCity: string;
  setBillingCity: (value: string) => void;
  billingPostalCode: string;
  setBillingPostalCode: (value: string) => void;
  billingCountryId: string;
  setBillingCountryId: (value: string) => void;
  billingEmail: string;
  setBillingEmail: (value: string) => void;
  billingTaxNumber: string;
  setBillingTaxNumber: (value: string) => void;
  invoicingType: string;
  setInvoicingType: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  hourlyRate50: string;
  setHourlyRate50: (value: string) => void;
  hourlyRate30: string;
  setHourlyRate30: (value: string) => void;
  hourlyRate15: string;
  setHourlyRate15: (value: string) => void;
  fixedWage: string;
  setFixedWage: (value: string) => void;
  rankingHourlyRate: string;
  setRankingHourlyRate: (value: string) => void;
  singleSessionRate: string;
  setSingleSessionRate: (value: string) => void;
  countries: Country[];
}

export const CompanyBillingPanel = ({
  billingName,
  setBillingName,
  billingAddress,
  setBillingAddress,
  billingCity,
  setBillingCity,
  billingPostalCode,
  setBillingPostalCode,
  billingCountryId,
  setBillingCountryId,
  billingEmail,
  setBillingEmail,
  billingTaxNumber,
  setBillingTaxNumber,
  invoicingType,
  setInvoicingType,
  currency,
  setCurrency,
  hourlyRate50,
  setHourlyRate50,
  hourlyRate30,
  setHourlyRate30,
  hourlyRate15,
  setHourlyRate15,
  fixedWage,
  setFixedWage,
  rankingHourlyRate,
  setRankingHourlyRate,
  singleSessionRate,
  setSingleSessionRate,
  countries,
}: CompanyBillingPanelProps) => {
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Számlázási adatok</h2>

      <div className="space-y-2">
        <Label htmlFor="billingName">Számlázási név</Label>
        <Input
          id="billingName"
          value={billingName}
          onChange={(e) => setBillingName(e.target.value)}
          placeholder="Cégnév a számlán"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="billingTaxNumber">Számlázási adószám</Label>
          <Input
            id="billingTaxNumber"
            value={billingTaxNumber}
            onChange={(e) => setBillingTaxNumber(e.target.value)}
            placeholder="12345678-1-23"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billingEmail">Számlázási email</Label>
          <Input
            id="billingEmail"
            type="email"
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
            placeholder="szamla@ceg.hu"
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-md font-medium mb-4">Számlázási cím</h3>

        <div className="space-y-2">
          <Label>Ország</Label>
          <Select value={billingCountryId} onValueChange={setBillingCountryId}>
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
            <Label htmlFor="billingPostalCode">Irányítószám</Label>
            <Input
              id="billingPostalCode"
              value={billingPostalCode}
              onChange={(e) => setBillingPostalCode(e.target.value)}
              placeholder="1234"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="billingCity">Város</Label>
            <Input
              id="billingCity"
              value={billingCity}
              onChange={(e) => setBillingCity(e.target.value)}
              placeholder="Budapest"
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="billingAddress">Cím (utca, házszám)</Label>
          <Input
            id="billingAddress"
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            placeholder="Példa utca 123."
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-md font-medium mb-4">Díjszabás</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Számlázás típusa</Label>
            <Select value={invoicingType} onValueChange={setInvoicingType}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz típust..." />
              </SelectTrigger>
              <SelectContent>
                {INVOICING_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Pénznem</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz pénznemet..." />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.id} value={curr.id}>
                    {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {invoicingType === "normal" && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate50">Óradíj (50 perc)</Label>
              <Input
                id="hourlyRate50"
                type="number"
                value={hourlyRate50}
                onChange={(e) => setHourlyRate50(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate30">Óradíj (30 perc)</Label>
              <Input
                id="hourlyRate30"
                type="number"
                value={hourlyRate30}
                onChange={(e) => setHourlyRate30(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate15">Óradíj (15 perc)</Label>
              <Input
                id="hourlyRate15"
                type="number"
                value={hourlyRate15}
                onChange={(e) => setHourlyRate15(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        )}

        {invoicingType === "fixed" && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fixedWage">Fix bér</Label>
              <Input
                id="fixedWage"
                type="number"
                value={fixedWage}
                onChange={(e) => setFixedWage(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rankingHourlyRate">Rangsorolási óradíj</Label>
              <Input
                id="rankingHourlyRate"
                type="number"
                value={rankingHourlyRate}
                onChange={(e) => setRankingHourlyRate(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        )}

        <div className="space-y-2 mt-4">
          <Label htmlFor="singleSessionRate">Egyszeri ülés díja</Label>
          <Input
            id="singleSessionRate"
            type="number"
            value={singleSessionRate}
            onChange={(e) => setSingleSessionRate(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};
