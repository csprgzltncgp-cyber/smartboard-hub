import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { DifferentPerCountryToggle } from "./DifferentPerCountryToggle";
import {
  CountryDifferentiate,
  InvoicingData,
  BILLING_FREQUENCIES,
  CURRENCIES,
  VAT_RATES,
  INVOICE_LANGUAGES,
} from "@/types/company";
import { useState } from "react";

interface CompanyInvoicingPanelProps {
  countryDifferentiates: CountryDifferentiate;
  setCountryDifferentiates: (diff: CountryDifferentiate) => void;
  invoicingData: InvoicingData | null;
  setInvoicingData: (data: InvoicingData | null) => void;
}

export const CompanyInvoicingPanel = ({
  countryDifferentiates,
  setCountryDifferentiates,
  invoicingData,
  setInvoicingData,
}: CompanyInvoicingPanelProps) => {
  const [emails, setEmails] = useState<string[]>(invoicingData?.invoice_emails || [""]);

  const updateDifferentiate = (key: keyof CountryDifferentiate, value: boolean) => {
    setCountryDifferentiates({ ...countryDifferentiates, [key]: value });
  };

  const updateInvoicingData = (updates: Partial<InvoicingData>) => {
    if (invoicingData) {
      setInvoicingData({ ...invoicingData, ...updates });
    } else {
      setInvoicingData({
        id: "new",
        company_id: "",
        country_id: null,
        billing_name: null,
        billing_address: null,
        postal_code: null,
        tax_number: null,
        po_number: null,
        billing_frequency: null,
        invoice_language: null,
        currency: null,
        vat_rate: null,
        payment_deadline_days: null,
        send_invoice_by_post: false,
        send_invoice_by_email: false,
        invoice_emails: [],
        upload_invoice_online: false,
        upload_url: null,
        ...updates,
      });
    }
  };

  const addEmail = () => {
    setEmails([...emails, ""]);
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
    updateInvoicingData({ invoice_emails: newEmails.filter((e) => e.trim()) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Számlázás</h2>
      </div>

      {/* Országonként különböző számlázás */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Számlázás</Label>
          <Input value="Számlázás" disabled className="bg-muted" />
        </div>
        <DifferentPerCountryToggle
          checked={countryDifferentiates.invoicing}
          onChange={(checked) => updateDifferentiate("invoicing", checked)}
        />
      </div>

      {/* Ha nem országonként különböző, itt jelennek meg a számlázási beállítások */}
      {!countryDifferentiates.invoicing && (
        <div className="space-y-6 border-l-2 border-primary/20 pl-4 ml-2">
          <h3 className="text-sm font-medium text-primary">Számlázási adatok</h3>

          {/* Számlázási név és cím */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Számlázási név</Label>
              <Input
                value={invoicingData?.billing_name || ""}
                onChange={(e) => updateInvoicingData({ billing_name: e.target.value || null })}
                placeholder="Számlázási név"
              />
            </div>
            <div className="space-y-2">
              <Label>Adószám</Label>
              <Input
                value={invoicingData?.tax_number || ""}
                onChange={(e) => updateInvoicingData({ tax_number: e.target.value || null })}
                placeholder="Adószám"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Számlázási cím</Label>
              <Input
                value={invoicingData?.billing_address || ""}
                onChange={(e) => updateInvoicingData({ billing_address: e.target.value || null })}
                placeholder="Cím"
              />
            </div>
            <div className="space-y-2">
              <Label>Irányítószám</Label>
              <Input
                value={invoicingData?.postal_code || ""}
                onChange={(e) => updateInvoicingData({ postal_code: e.target.value || null })}
                placeholder="Irányítószám"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>PO szám</Label>
              <Input
                value={invoicingData?.po_number || ""}
                onChange={(e) => updateInvoicingData({ po_number: e.target.value || null })}
                placeholder="PO szám"
              />
            </div>
            <div className="space-y-2">
              <Label>Fizetési határidő (nap)</Label>
              <Input
                type="number"
                value={invoicingData?.payment_deadline_days || ""}
                onChange={(e) =>
                  updateInvoicingData({
                    payment_deadline_days: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="30"
              />
            </div>
          </div>

          {/* Számlázási gyakoriság, nyelv, pénznem, ÁFA */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Számlázási gyakoriság</Label>
              <Select
                value={invoicingData?.billing_frequency || ""}
                onValueChange={(val) =>
                  updateInvoicingData({ billing_frequency: val as any || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon..." />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.id} value={freq.id}>
                      {freq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Számla nyelve</Label>
              <Select
                value={invoicingData?.invoice_language || ""}
                onValueChange={(val) => updateInvoicingData({ invoice_language: val || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon..." />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Devizanem</Label>
              <Select
                value={invoicingData?.currency || ""}
                onValueChange={(val) => updateInvoicingData({ currency: val || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon..." />
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
            <div className="space-y-2">
              <Label>ÁFA kulcs</Label>
              <Select
                value={invoicingData?.vat_rate?.toString() || ""}
                onValueChange={(val) =>
                  updateInvoicingData({ vat_rate: val ? parseFloat(val) : null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon..." />
                </SelectTrigger>
                <SelectContent>
                  {VAT_RATES.map((vat) => (
                    <SelectItem key={vat.id} value={vat.id}>
                      {vat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Küldési beállítások */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Küldési beállítások</h4>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-by-post"
                  checked={invoicingData?.send_invoice_by_post || false}
                  onCheckedChange={(checked) =>
                    updateInvoicingData({ send_invoice_by_post: checked as boolean })
                  }
                />
                <Label htmlFor="send-by-post">Számla küldése postán</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-by-email"
                  checked={invoicingData?.send_invoice_by_email || false}
                  onCheckedChange={(checked) =>
                    updateInvoicingData({ send_invoice_by_email: checked as boolean })
                  }
                />
                <Label htmlFor="send-by-email">Számla küldése e-mailben</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="upload-online"
                  checked={invoicingData?.upload_invoice_online || false}
                  onCheckedChange={(checked) =>
                    updateInvoicingData({ upload_invoice_online: checked as boolean })
                  }
                />
                <Label htmlFor="upload-online">Számla feltöltése online</Label>
              </div>
            </div>

            {/* Email címek */}
            {invoicingData?.send_invoice_by_email && (
              <div className="space-y-2">
                <Label>E-mail címek a számlához</Label>
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder="email@ceg.hu"
                      className="flex-1"
                    />
                    {emails.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmail(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmail}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  E-mail cím hozzáadása
                </Button>
              </div>
            )}

            {/* Feltöltés URL */}
            {invoicingData?.upload_invoice_online && (
              <div className="space-y-2">
                <Label>Feltöltési URL</Label>
                <Input
                  value={invoicingData?.upload_url || ""}
                  onChange={(e) => updateInvoicingData({ upload_url: e.target.value || null })}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
