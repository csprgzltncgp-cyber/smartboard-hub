import { useState } from "react";
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
import { DifferentPerCountryToggle } from "../DifferentPerCountryToggle";
import {
  BillingData,
  InvoicingData,
  BILLING_FREQUENCIES,
  CURRENCIES,
  VAT_RATES,
  INVOICE_LANGUAGES,
} from "@/types/company";
import { ContractedEntity } from "@/types/contracted-entity";
import { cn } from "@/lib/utils";

interface EntityBillingPanelProps {
  entity: ContractedEntity;
  billingData: BillingData;
  setBillingData: (data: BillingData) => void;
  invoicingData: InvoicingData;
  setInvoicingData: (data: InvoicingData) => void;
}

// Alapértelmezett BillingData
const getDefaultBillingData = (entityId?: string): BillingData => ({
  id: `new-entity-billing-${entityId || Date.now()}`,
  company_id: "",
  country_id: null,
  contracted_entity_id: entityId || null,
  admin_identifier: null,
  name: null,
  is_name_shown: true,
  country: null,
  postal_code: null,
  city: null,
  street: null,
  house_number: null,
  is_address_shown: true,
  po_number: null,
  is_po_number_shown: true,
  is_po_number_changing: false,
  is_po_number_required: true,
  tax_number: null,
  community_tax_number: null,
  is_tax_number_shown: true,
  group_id: null,
  payment_deadline: 30,
  is_payment_deadline_shown: true,
  invoicing_inactive: false,
  invoicing_inactive_from: null,
  invoicing_inactive_to: null,
});

// Alapértelmezett InvoicingData
const getDefaultInvoicingData = (entityId?: string): InvoicingData => ({
  id: `new-entity-invoicing-${entityId || Date.now()}`,
  company_id: "",
  country_id: null,
  contracted_entity_id: entityId || null,
  billing_frequency: null,
  billing_in_advance: false,
  invoice_language: null,
  currency: null,
  vat_rate: null,
  inside_eu: false,
  outside_eu: false,
  send_invoice_by_post: false,
  send_completion_certificate_by_post: false,
  post_code: null,
  city: null,
  street: null,
  house_number: null,
  send_invoice_by_email: false,
  send_completion_certificate_by_email: false,
  custom_email_subject: null,
  invoice_emails: [],
  upload_invoice_online: false,
  invoice_online_url: null,
  upload_completion_certificate_online: false,
  completion_certificate_online_url: null,
  contact_holder_name: null,
  show_contact_holder_name_on_post: false,
});

export const EntityBillingPanel = ({
  entity,
  billingData,
  setBillingData,
  invoicingData,
  setInvoicingData,
}: EntityBillingPanelProps) => {
  const [emails, setEmails] = useState<string[]>(invoicingData?.invoice_emails || [""]);

  const updateBillingData = (updates: Partial<BillingData>) => {
    setBillingData({ ...billingData, ...updates });
  };

  const updateInvoicingData = (updates: Partial<InvoicingData>) => {
    setInvoicingData({ ...invoicingData, ...updates });
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
    <div className="space-y-6 border-l-2 border-primary/20 pl-4 ml-2">
      {/* === INAKTÍV MEZŐ - LEGFELÜL === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <DifferentPerCountryToggle
          label="Inaktív"
          checked={billingData.invoicing_inactive}
          onChange={(checked) => {
            updateBillingData({ 
              invoicing_inactive: checked,
              invoicing_inactive_from: checked ? new Date().toISOString().split('T')[0] : null,
              invoicing_inactive_to: checked ? billingData.invoicing_inactive_to : null
            });
          }}
        />
        {billingData.invoicing_inactive && (
          <>
            <div className="space-y-2">
              <Label>Eddig a dátumig</Label>
              <Input
                type="date"
                value={billingData.invoicing_inactive_to || ""}
                onChange={(e) =>
                  updateBillingData({ invoicing_inactive_to: e.target.value || null })
                }
                className={cn(
                  !billingData.invoicing_inactive_to && "border-red-500"
                )}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10"
            >
              Mentés
            </Button>
          </>
        )}
      </div>

      {/* === SZÁMLÁZÁSI ADATOK === */}
      <div className={cn(billingData.invoicing_inactive && "opacity-50 pointer-events-none")}>
        <h3 className="text-sm font-medium text-primary">Számlázási adatok</h3>

        {/* Számlázási név */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Számlázási név</Label>
            <Input
              value={billingData.name || ""}
              onChange={(e) => updateBillingData({ name: e.target.value || null })}
              placeholder="Számlázási név"
            />
          </div>
        </div>

        {/* Számlázási cím - Célország */}
        <div className="space-y-2 mt-4">
          <Label>Számlázási cím</Label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                value={billingData.country || ""}
                onChange={(e) => updateBillingData({ country: e.target.value || null })}
                placeholder="Célország"
              />
            </div>
            <div>
              <Input
                value={billingData.postal_code || ""}
                onChange={(e) => updateBillingData({ postal_code: e.target.value || null })}
                placeholder="Irányítószám"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                value={billingData.city || ""}
                onChange={(e) => updateBillingData({ city: e.target.value || null })}
                placeholder="Város"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={billingData.street || ""}
              onChange={(e) => updateBillingData({ street: e.target.value || null })}
              placeholder="Utca"
            />
            <Input
              value={billingData.house_number || ""}
              onChange={(e) => updateBillingData({ house_number: e.target.value || null })}
              placeholder="Házszám"
            />
          </div>
        </div>

        {/* PO szám */}
        <div className="space-y-2 mt-4">
          <Label>PO szám</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {billingData.is_po_number_changing ? (
              <div className="md:col-span-2 bg-amber-500 text-amber-50 h-12 flex items-center justify-center rounded-lg">
                PO szám a 'Számlázás' fül alatt!
              </div>
            ) : (
              <Input
                value={billingData.po_number || ""}
                onChange={(e) => updateBillingData({ po_number: e.target.value || null })}
                placeholder="PO szám"
                className="md:col-span-2"
              />
            )}
            <DifferentPerCountryToggle
              label="Változó"
              checked={billingData.is_po_number_changing}
              onChange={(checked) =>
                updateBillingData({ is_po_number_changing: checked })
              }
            />
          </div>
        </div>

        {/* Adószám */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Adószám</Label>
            <Input
              value={billingData.tax_number || ""}
              onChange={(e) => updateBillingData({ tax_number: e.target.value || null })}
              placeholder="Adószám"
            />
          </div>
        </div>

        {/* Közösségi adószám */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Közösségi adószám</Label>
            <Input
              value={billingData.community_tax_number || ""}
              onChange={(e) =>
                updateBillingData({ community_tax_number: e.target.value || null })
              }
              placeholder="Közösségi adószám"
            />
          </div>
        </div>

        {/* Csoport azonosító */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Csoport azonosító</Label>
            <Input
              value={billingData.group_id || ""}
              onChange={(e) => updateBillingData({ group_id: e.target.value || null })}
              placeholder="Csoport azonosító"
            />
          </div>
        </div>

        {/* Fizetési határidő */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Fizetési határidő</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={billingData.payment_deadline?.toString() || ""}
                onChange={(e) =>
                  updateBillingData({
                    payment_deadline: e.target.value ? parseInt(e.target.value) : 30,
                  })
                }
                placeholder="30"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">nap</span>
            </div>
          </div>
        </div>
      </div>

      {/* === SZÁMLÁZÁSI BEÁLLÍTÁSOK === */}
      <div className={cn(
        "border-t pt-6",
        billingData.invoicing_inactive && "opacity-50 pointer-events-none"
      )}>
        <h3 className="text-sm font-medium text-primary mb-4">Számlázási beállítások</h3>

        {/* Számlázási gyakoriság, nyelv, pénznem, ÁFA */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Számlázási gyakoriság</Label>
            <Select
              value={invoicingData.billing_frequency || "none"}
              onValueChange={(val) =>
                updateInvoicingData({ billing_frequency: val === "none" ? null : (val as any) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Válasszon..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Válasszon...</SelectItem>
                {BILLING_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.id} value={freq.id}>
                    {freq.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Előre számlázás checkbox - csak nem havi gyakoriságnál */}
            {invoicingData.billing_frequency && invoicingData.billing_frequency !== "monthly" && (
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id={`billing_in_advance_${entity.id}`}
                  checked={invoicingData.billing_in_advance}
                  onCheckedChange={(checked) =>
                    updateInvoicingData({ billing_in_advance: checked === true })
                  }
                />
                <label
                  htmlFor={`billing_in_advance_${entity.id}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Előre számlázás
                </label>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Számla nyelve</Label>
            <Select
              value={invoicingData.invoice_language || "none"}
              onValueChange={(val) => updateInvoicingData({ invoice_language: val === "none" ? null : val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Válasszon..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Válasszon...</SelectItem>
                {INVOICE_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Számlázási devizanem</Label>
            <Select
              value={invoicingData.currency || "none"}
              onValueChange={(val) => updateInvoicingData({ currency: val === "none" ? null : val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Válasszon..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Válasszon...</SelectItem>
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
              value={invoicingData.vat_rate?.toString() || "none"}
              onValueChange={(val) => updateInvoicingData({ vat_rate: val === "none" ? null : parseInt(val) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Válasszon..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Válasszon...</SelectItem>
                {VAT_RATES.map((rate) => (
                  <SelectItem key={rate.id} value={rate.id}>
                    {rate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* EU státusz */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`inside-eu-${entity.id}`}
              checked={invoicingData.inside_eu}
              onCheckedChange={(checked) =>
                updateInvoicingData({ inside_eu: !!checked, outside_eu: false })
              }
            />
            <Label htmlFor={`inside-eu-${entity.id}`} className="cursor-pointer">EU-n belül</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`outside-eu-${entity.id}`}
              checked={invoicingData.outside_eu}
              onCheckedChange={(checked) =>
                updateInvoicingData({ outside_eu: !!checked, inside_eu: false })
              }
            />
            <Label htmlFor={`outside-eu-${entity.id}`} className="cursor-pointer">EU-n kívül</Label>
          </div>
        </div>
      </div>

      {/* === SZÁMLAKÜLDÉS === */}
      <div className={cn(
        "border-t pt-6",
        billingData.invoicing_inactive && "opacity-50 pointer-events-none"
      )}>
        <h3 className="text-sm font-medium text-primary mb-4">Számlaküldés</h3>

        {/* Postai küldés */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`send-by-post-${entity.id}`}
              checked={invoicingData.send_invoice_by_post}
              onCheckedChange={(checked) =>
                updateInvoicingData({ send_invoice_by_post: !!checked })
              }
            />
            <Label htmlFor={`send-by-post-${entity.id}`} className="cursor-pointer">
              Postai küldés
            </Label>
          </div>

          {invoicingData.send_invoice_by_post && (
            <div className="ml-6 space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`send-cert-by-post-${entity.id}`}
                  checked={invoicingData.send_completion_certificate_by_post}
                  onCheckedChange={(checked) =>
                    updateInvoicingData({ send_completion_certificate_by_post: !!checked })
                  }
                />
                <Label htmlFor={`send-cert-by-post-${entity.id}`} className="cursor-pointer text-sm">
                  Teljesítésigazolás küldése
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Postai cím</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    value={invoicingData.post_code || ""}
                    onChange={(e) => updateInvoicingData({ post_code: e.target.value || null })}
                    placeholder="Irányítószám"
                  />
                  <Input
                    value={invoicingData.city || ""}
                    onChange={(e) => updateInvoicingData({ city: e.target.value || null })}
                    placeholder="Város"
                    className="md:col-span-2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={invoicingData.street || ""}
                    onChange={(e) => updateInvoicingData({ street: e.target.value || null })}
                    placeholder="Utca"
                  />
                  <Input
                    value={invoicingData.house_number || ""}
                    onChange={(e) => updateInvoicingData({ house_number: e.target.value || null })}
                    placeholder="Házszám"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`show-contact-holder-${entity.id}`}
                  checked={invoicingData.show_contact_holder_name_on_post}
                  onCheckedChange={(checked) =>
                    updateInvoicingData({ show_contact_holder_name_on_post: !!checked })
                  }
                />
                <Label htmlFor={`show-contact-holder-${entity.id}`} className="cursor-pointer text-sm">
                  Kapcsolattartó neve a borítékon
                </Label>
              </div>

              {invoicingData.show_contact_holder_name_on_post && (
                <div className="space-y-2">
                  <Label>Kapcsolattartó neve</Label>
                  <Input
                    value={invoicingData.contact_holder_name || ""}
                    onChange={(e) => updateInvoicingData({ contact_holder_name: e.target.value || null })}
                    placeholder="Kapcsolattartó neve"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Email küldés */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`send-by-email-${entity.id}`}
              checked={invoicingData.send_invoice_by_email}
              onCheckedChange={(checked) =>
                updateInvoicingData({ send_invoice_by_email: !!checked })
              }
            />
            <Label htmlFor={`send-by-email-${entity.id}`} className="cursor-pointer">
              Email küldés
            </Label>
          </div>

          {invoicingData.send_invoice_by_email && (
            <div className="ml-6 space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`send-cert-by-email-${entity.id}`}
                  checked={invoicingData.send_completion_certificate_by_email}
                  onCheckedChange={(checked) =>
                    updateInvoicingData({ send_completion_certificate_by_email: !!checked })
                  }
                />
                <Label htmlFor={`send-cert-by-email-${entity.id}`} className="cursor-pointer text-sm">
                  Teljesítésigazolás küldése
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Egyedi email tárgy</Label>
                <Input
                  value={invoicingData.custom_email_subject || ""}
                  onChange={(e) => updateInvoicingData({ custom_email_subject: e.target.value || null })}
                  placeholder="Egyedi email tárgy"
                />
              </div>

              <div className="space-y-2">
                <Label>Email címek</Label>
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder="email@ceg.hu"
                    />
                    {emails.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmail(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmail}
                >
                  + Email cím hozzáadása
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Online feltöltés */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`upload-online-${entity.id}`}
              checked={invoicingData.upload_invoice_online}
              onCheckedChange={(checked) =>
                updateInvoicingData({ upload_invoice_online: !!checked })
              }
            />
            <Label htmlFor={`upload-online-${entity.id}`} className="cursor-pointer">
              Online feltöltés
            </Label>
          </div>

          {invoicingData.upload_invoice_online && (
            <div className="ml-6 space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`upload-cert-online-${entity.id}`}
                  checked={invoicingData.upload_completion_certificate_online}
                  onCheckedChange={(checked) =>
                    updateInvoicingData({ upload_completion_certificate_online: !!checked })
                  }
                />
                <Label htmlFor={`upload-cert-online-${entity.id}`} className="cursor-pointer text-sm">
                  Teljesítésigazolás feltöltése
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Számla URL</Label>
                <Input
                  value={invoicingData.invoice_online_url || ""}
                  onChange={(e) => updateInvoicingData({ invoice_online_url: e.target.value || null })}
                  placeholder="https://..."
                />
              </div>

              {invoicingData.upload_completion_certificate_online && (
                <div className="space-y-2">
                  <Label>Teljesítésigazolás URL</Label>
                  <Input
                    value={invoicingData.completion_certificate_online_url || ""}
                    onChange={(e) => updateInvoicingData({ completion_certificate_online_url: e.target.value || null })}
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { getDefaultBillingData as getDefaultEntityBillingData, getDefaultInvoicingData as getDefaultEntityInvoicingData };
