import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { Country } from "@/types/expert";
import { toast } from "sonner";

const CURRENCIES = [
  { value: "czk", label: "CZK" },
  { value: "eur", label: "EUR" },
  { value: "huf", label: "HUF" },
  { value: "mdl", label: "MDL" },
  { value: "oal", label: "OAL" },
  { value: "pln", label: "PLN" },
  { value: "ron", label: "RON" },
  { value: "rsd", label: "RSD" },
  { value: "usd", label: "USD" },
  { value: "chf", label: "CHF" },
];

const INVOICING_TYPES = [
  { value: "normal", label: "Normál (óradíjas)" },
  { value: "fixed", label: "Fix bér" },
  { value: "custom", label: "Egyedi tételek" },
];

interface CustomInvoiceItem {
  id: string;
  name: string;
  countryId: string;
  amount: string;
}

interface ExpertInvoiceCardProps {
  invoiceData: {
    invoicing_type: "normal" | "fixed" | "custom";
    currency: string;
    hourly_rate_50: string;
    hourly_rate_30: string;
    hourly_rate_15: string;
    fixed_wage: string;
    ranking_hourly_rate: string;
    single_session_rate: string;
  };
  countries: Country[];
  singleSessionRateRequired: boolean;
  customInvoiceItems: CustomInvoiceItem[];
  onInvoiceChange: (data: Partial<ExpertInvoiceCardProps["invoiceData"]>) => void;
  onCustomItemsChange: (items: CustomInvoiceItem[]) => void;
}

export const ExpertInvoiceCard = ({
  invoiceData,
  countries,
  singleSessionRateRequired,
  customInvoiceItems,
  onInvoiceChange,
  onCustomItemsChange,
}: ExpertInvoiceCardProps) => {
  const [showCustomItemDialog, setShowCustomItemDialog] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState({ name: "", countryId: "", amount: "" });

  const handleAddCustomItem = () => {
    if (!newCustomItem.name || !newCustomItem.countryId || !newCustomItem.amount) {
      toast.error("Minden mező kitöltése kötelező");
      return;
    }
    onCustomItemsChange([
      ...customInvoiceItems,
      { ...newCustomItem, id: Date.now().toString() },
    ]);
    setNewCustomItem({ name: "", countryId: "", amount: "" });
    setShowCustomItemDialog(false);
  };

  const handleRemoveCustomItem = (id: string) => {
    onCustomItemsChange(customInvoiceItems.filter((item) => item.id !== id));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-cgp-teal">Számlázási információk:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Számlázás típusa:</Label>
            <Select
              value={invoiceData.invoicing_type}
              onValueChange={(value: "normal" | "fixed" | "custom") =>
                onInvoiceChange({ invoicing_type: value })
              }
            >
              <SelectTrigger className="border-cgp-teal">
                <SelectValue placeholder="Kérjük válasszon" />
              </SelectTrigger>
              <SelectContent>
                {INVOICING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <Label>Devizanem</Label>
              <Input disabled className="bg-muted" />
            </div>
            <Select
              value={invoiceData.currency}
              onValueChange={(value) => onInvoiceChange({ currency: value })}
            >
              <SelectTrigger className="border-cgp-teal w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Normal type - hourly rates */}
          {invoiceData.invoicing_type === "normal" && (
            <>
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label>Óradíj (nettó)</Label>
                  <Input disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Időtartam 50 perc</Label>
                  <Input disabled className="bg-muted w-32" />
                </div>
                <Input
                  type="number"
                  value={invoiceData.hourly_rate_50}
                  onChange={(e) => onInvoiceChange({ hourly_rate_50: e.target.value })}
                  className="border-cgp-teal w-24"
                  placeholder={invoiceData.currency.toUpperCase()}
                />
              </div>

              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label>Óradíj (nettó)</Label>
                  <Input disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Időtartam 30 perc</Label>
                  <Input disabled className="bg-muted w-32" />
                </div>
                <Input
                  type="number"
                  value={invoiceData.hourly_rate_30}
                  onChange={(e) => onInvoiceChange({ hourly_rate_30: e.target.value })}
                  className="border-cgp-teal w-24"
                  placeholder={invoiceData.currency.toUpperCase()}
                />
              </div>

              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label>Óradíj (nettó)</Label>
                  <Input disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Időtartam 15 perc</Label>
                  <Input disabled className="bg-muted w-32" />
                </div>
                <Input
                  type="number"
                  value={invoiceData.hourly_rate_15}
                  onChange={(e) => onInvoiceChange({ hourly_rate_15: e.target.value })}
                  className="border-cgp-teal w-24"
                  placeholder={invoiceData.currency.toUpperCase()}
                />
              </div>
            </>
          )}

          {/* Fixed type */}
          {invoiceData.invoicing_type === "fixed" && (
            <>
              <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label>Nettó fix díj</Label>
                  <Input disabled className="bg-muted" />
                </div>
                <Input
                  type="number"
                  value={invoiceData.fixed_wage}
                  onChange={(e) => onInvoiceChange({ fixed_wage: e.target.value })}
                  className="border-cgp-teal w-24"
                  placeholder={invoiceData.currency.toUpperCase()}
                />
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label>Rangsoroló óradíj</Label>
                  <Input disabled className="bg-muted" />
                </div>
                <Input
                  type="number"
                  value={invoiceData.ranking_hourly_rate}
                  onChange={(e) => onInvoiceChange({ ranking_hourly_rate: e.target.value })}
                  className="border-cgp-teal w-24"
                  placeholder={invoiceData.currency.toUpperCase()}
                />
              </div>
            </>
          )}

          {/* Single session rate */}
          {singleSessionRateRequired && (
            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <div className="space-y-2">
                <Label>Egyszeri konzultáció díja</Label>
                <Input disabled className="bg-muted" />
              </div>
              <Input
                type="number"
                value={invoiceData.single_session_rate}
                onChange={(e) => onInvoiceChange({ single_session_rate: e.target.value })}
                className="border-cgp-teal w-24"
                placeholder={invoiceData.currency.toUpperCase()}
              />
            </div>
          )}

          {/* Custom invoice items list */}
          {customInvoiceItems.length > 0 && (
            <div className="space-y-2">
              <Label className="text-lg">Egyedi tételek:</Label>
              {customInvoiceItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
                  <Input disabled value={item.name} className="bg-muted" />
                  <Input
                    disabled
                    value={countries.find((c) => c.id === item.countryId)?.name || ""}
                    className="bg-muted w-32"
                  />
                  <Input disabled value={item.amount} className="bg-muted w-24" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCustomItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-cgp-teal" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add custom item button */}
          {invoiceData.currency && (
            <Button
              type="button"
              variant="outline"
              className="border-cgp-teal text-cgp-teal hover:bg-cgp-teal hover:text-white"
              onClick={() => setShowCustomItemDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Extra díjazás hozzáadása
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Custom item dialog */}
      <Dialog open={showCustomItemDialog} onOpenChange={setShowCustomItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extra díjazás hozzáadása</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Megnevezés:</Label>
              <Input
                value={newCustomItem.name}
                onChange={(e) => setNewCustomItem((prev) => ({ ...prev, name: e.target.value }))}
                className="border-cgp-teal"
              />
            </div>
            <div className="space-y-2">
              <Label>Ország:</Label>
              <Select
                value={newCustomItem.countryId}
                onValueChange={(value) => setNewCustomItem((prev) => ({ ...prev, countryId: value }))}
              >
                <SelectTrigger className="border-cgp-teal">
                  <SelectValue placeholder="Válassz országot" />
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
              <Label>Összeg ({invoiceData.currency.toUpperCase()}):</Label>
              <Input
                type="number"
                value={newCustomItem.amount}
                onChange={(e) => setNewCustomItem((prev) => ({ ...prev, amount: e.target.value }))}
                className="border-cgp-teal"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomItemDialog(false)}>
              Mégse
            </Button>
            <Button onClick={handleAddCustomItem} className="bg-cgp-teal hover:bg-cgp-teal/90">
              Hozzáadás
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
