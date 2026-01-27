import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

interface CustomInvoiceItem {
  id?: string;
  name: string;
  country_id: string;
  amount: string;
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
  customInvoiceItems: CustomInvoiceItem[];
  setCustomInvoiceItems: (items: CustomInvoiceItem[]) => void;
  newItemName: string;
  setNewItemName: (value: string) => void;
  newItemCountryId: string;
  setNewItemCountryId: (value: string) => void;
  newItemAmount: string;
  setNewItemAmount: (value: string) => void;
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
  customInvoiceItems,
  setCustomInvoiceItems,
  newItemName,
  setNewItemName,
  newItemCountryId,
  setNewItemCountryId,
  newItemAmount,
  setNewItemAmount,
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

        {/* Extra díjazások */}
        <div className="space-y-4 pt-4 border-t mt-4">
          <h3 className="text-md font-medium">Extra díjazások</h3>
          
          {customInvoiceItems.map((item, index) => (
            <div key={item.id || index} className="flex items-center gap-2">
              <Input value={item.name} disabled className="flex-1" />
              <Input value={countries.find((c) => c.id === item.country_id)?.name || ""} disabled className="w-32" />
              <Input value={item.amount} disabled className="w-24" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCustomInvoiceItems(customInvoiceItems.filter((_, i) => i !== index))}
                className="text-destructive hover:text-destructive/80"
              >
                ×
              </Button>
            </div>
          ))}

          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Megnevezés</Label>
              <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Tétel megnevezése" />
            </div>
            <div className="w-36 space-y-1">
              <Label className="text-xs">Ország</Label>
              <Select value={newItemCountryId} onValueChange={setNewItemCountryId}>
                <SelectTrigger><SelectValue placeholder="Ország" /></SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24 space-y-1">
              <Label className="text-xs">Összeg</Label>
              <Input type="number" value={newItemAmount} onChange={(e) => setNewItemAmount(e.target.value)} placeholder="0" />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (newItemName && newItemCountryId && newItemAmount) {
                  setCustomInvoiceItems([...customInvoiceItems, { name: newItemName, country_id: newItemCountryId, amount: newItemAmount }]);
                  setNewItemName("");
                  setNewItemCountryId("");
                  setNewItemAmount("");
                }
              }}
              className="text-primary border-primary hover:bg-primary/10"
            >
              + Extra díjazás hozzáadása
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
