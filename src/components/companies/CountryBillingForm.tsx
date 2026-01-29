import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MessageSquare, Calendar } from "lucide-react";
import { DifferentPerCountryToggle } from "./DifferentPerCountryToggle";
import {
  BillingData,
  InvoicingData,
  InvoiceItem,
  InvoiceComment,
  BILLING_FREQUENCIES,
  CURRENCIES,
  VAT_RATES,
  INVOICE_LANGUAGES,
  INVOICE_ITEM_TYPES,
  InvoiceItemType,
} from "@/types/company";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CountryBillingFormProps {
  countryName?: string;
  billingData: BillingData;
  setBillingData: (data: BillingData) => void;
  invoicingData: InvoicingData;
  setInvoicingData: (data: InvoicingData) => void;
  invoiceItems: InvoiceItem[];
  setInvoiceItems: (items: InvoiceItem[]) => void;
  invoiceComments: InvoiceComment[];
  setInvoiceComments: (comments: InvoiceComment[]) => void;
}

// Alapértelmezett BillingData
const getDefaultBillingData = (): BillingData => ({
  id: "new",
  company_id: "",
  country_id: null,
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
const getDefaultInvoicingData = (): InvoicingData => ({
  id: "new",
  company_id: "",
  country_id: null,
  billing_frequency: null,
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

export const CountryBillingForm = ({
  countryName,
  billingData,
  setBillingData,
  invoicingData,
  setInvoicingData,
  invoiceItems,
  setInvoiceItems,
  invoiceComments,
  setInvoiceComments,
}: CountryBillingFormProps) => {
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

  // Invoice item kezelés
  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: `new-item-${Date.now()}`,
      invoicing_data_id: invoicingData?.id || "new",
      item_name: "",
      item_type: "multiplication",
      amount_name: null,
      amount_value: null,
      volume_name: null,
      volume_value: null,
      is_amount_changing: false,
      is_volume_changing: false,
      show_by_item: false,
      show_activity_id: false,
      with_timestamp: false,
      comment: null,
      data_request_email: null,
      data_request_salutation: null,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const updateInvoiceItem = (id: string, updates: Partial<InvoiceItem>) => {
    setInvoiceItems(
      invoiceItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
  };

  // Comment kezelés
  const addInvoiceComment = () => {
    const newComment: InvoiceComment = {
      id: `new-comment-${Date.now()}`,
      invoicing_data_id: invoicingData?.id || "new",
      comment: "",
    };
    setInvoiceComments([...invoiceComments, newComment]);
  };

  const updateInvoiceComment = (id: string, comment: string) => {
    setInvoiceComments(
      invoiceComments.map((c) => (c.id === id ? { ...c, comment } : c))
    );
  };

  const removeInvoiceComment = (id: string) => {
    setInvoiceComments(invoiceComments.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 border-l-2 border-primary/20 pl-4 ml-2">
      {countryName && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{countryName}</span> számlázási beállításai
        </div>
      )}

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

        {/* PO szám - Változó toggle (mint az Országonként különböző) */}
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
              id={`inside-eu-${billingData.id}`}
              checked={invoicingData.inside_eu}
              onCheckedChange={(checked) =>
                updateInvoicingData({ inside_eu: !!checked, outside_eu: false })
              }
            />
            <Label htmlFor={`inside-eu-${billingData.id}`} className="cursor-pointer">EU-n belül</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`outside-eu-${billingData.id}`}
              checked={invoicingData.outside_eu}
              onCheckedChange={(checked) =>
                updateInvoicingData({ outside_eu: !!checked, inside_eu: false })
              }
            />
            <Label htmlFor={`outside-eu-${billingData.id}`} className="cursor-pointer">EU-n kívül</Label>
          </div>
        </div>
      </div>

      {/* === KÉZBESÍTÉSI BEÁLLÍTÁSOK === */}
      <div className={cn(
        "border-t pt-6",
        billingData.invoicing_inactive && "opacity-50 pointer-events-none"
      )}>
        <h3 className="text-sm font-medium text-primary mb-4">Kézbesítési beállítások</h3>

        {/* Postai kézbesítés */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`post-invoice-${billingData.id}`}
              checked={invoicingData.send_invoice_by_post}
              onCheckedChange={(checked) =>
                updateInvoicingData({ send_invoice_by_post: !!checked })
              }
            />
            <Label htmlFor={`post-invoice-${billingData.id}`} className="cursor-pointer">
              Számla küldése postán
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`post-cert-${billingData.id}`}
              checked={invoicingData.send_completion_certificate_by_post}
              onCheckedChange={(checked) =>
                updateInvoicingData({ send_completion_certificate_by_post: !!checked })
              }
            />
            <Label htmlFor={`post-cert-${billingData.id}`} className="cursor-pointer">
              Teljesítési igazolás küldése postán
            </Label>
          </div>

          {/* Postai cím ha szükséges */}
          {(invoicingData.send_invoice_by_post ||
            invoicingData.send_completion_certificate_by_post) && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <div className="space-y-2">
                <Label>Postai cím</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Input
                    value={invoicingData.post_code || ""}
                    onChange={(e) =>
                      updateInvoicingData({ post_code: e.target.value || null })
                    }
                    placeholder="Irányítószám"
                  />
                  <Input
                    value={invoicingData.city || ""}
                    onChange={(e) =>
                      updateInvoicingData({ city: e.target.value || null })
                    }
                    placeholder="Város"
                  />
                  <Input
                    value={invoicingData.street || ""}
                    onChange={(e) =>
                      updateInvoicingData({ street: e.target.value || null })
                    }
                    placeholder="Utca"
                  />
                  <Input
                    value={invoicingData.house_number || ""}
                    onChange={(e) =>
                      updateInvoicingData({ house_number: e.target.value || null })
                    }
                    placeholder="Házszám"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Kapcsolattartó neve (postai címhez)</Label>
                <Input
                  value={invoicingData.contact_holder_name || ""}
                  onChange={(e) =>
                    updateInvoicingData({ contact_holder_name: e.target.value || null })
                  }
                  placeholder="Kapcsolattartó neve"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`show-contact-${billingData.id}`}
                  checked={invoicingData.show_contact_holder_name_on_post}
                  onCheckedChange={(checked) =>
                    updateInvoicingData({ show_contact_holder_name_on_post: !!checked })
                  }
                />
                <Label htmlFor={`show-contact-${billingData.id}`} className="cursor-pointer">
                  Kapcsolattartó neve megjelenik a borítékon
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Email küldés */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`email-invoice-${billingData.id}`}
              checked={invoicingData.send_invoice_by_email}
              onCheckedChange={(checked) =>
                updateInvoicingData({ send_invoice_by_email: !!checked })
              }
            />
            <Label htmlFor={`email-invoice-${billingData.id}`} className="cursor-pointer">
              Számla küldése e-mailben
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`email-cert-${billingData.id}`}
              checked={invoicingData.send_completion_certificate_by_email}
              onCheckedChange={(checked) =>
                updateInvoicingData({ send_completion_certificate_by_email: !!checked })
              }
            />
            <Label htmlFor={`email-cert-${billingData.id}`} className="cursor-pointer">
              Teljesítési igazolás küldése e-mailben
            </Label>
          </div>

          {/* Email címek ha szükséges */}
          {(invoicingData.send_invoice_by_email ||
            invoicingData.send_completion_certificate_by_email) && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <div className="space-y-2">
                <Label>Email tárgy (egyéni)</Label>
                <Input
                  value={invoicingData.custom_email_subject || ""}
                  onChange={(e) =>
                    updateInvoicingData({ custom_email_subject: e.target.value || null })
                  }
                  placeholder="Egyéni email tárgy"
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
                  Email cím hozzáadása
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Online feltöltés */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`online-invoice-${billingData.id}`}
              checked={invoicingData.upload_invoice_online}
              onCheckedChange={(checked) =>
                updateInvoicingData({ upload_invoice_online: !!checked })
              }
            />
            <Label htmlFor={`online-invoice-${billingData.id}`} className="cursor-pointer">
              Számla feltöltése online
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`online-cert-${billingData.id}`}
              checked={invoicingData.upload_completion_certificate_online}
              onCheckedChange={(checked) =>
                updateInvoicingData({ upload_completion_certificate_online: !!checked })
              }
            />
            <Label htmlFor={`online-cert-${billingData.id}`} className="cursor-pointer">
              Teljesítési igazolás feltöltése online
            </Label>
          </div>

          {/* URL mezők ha szükséges */}
          {(invoicingData.upload_invoice_online ||
            invoicingData.upload_completion_certificate_online) && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              {invoicingData.upload_invoice_online && (
                <div className="space-y-2">
                  <Label>Számla feltöltési URL</Label>
                  <Input
                    value={invoicingData.invoice_online_url || ""}
                    onChange={(e) =>
                      updateInvoicingData({ invoice_online_url: e.target.value || null })
                    }
                    placeholder="https://..."
                  />
                </div>
              )}
              {invoicingData.upload_completion_certificate_online && (
                <div className="space-y-2">
                  <Label>Teljesítési igazolás feltöltési URL</Label>
                  <Input
                    value={invoicingData.completion_certificate_online_url || ""}
                    onChange={(e) =>
                      updateInvoicingData({
                        completion_certificate_online_url: e.target.value || null,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* === SZÁMLÁRA KERÜLŐ TÉTELEK, MEGJEGYZÉSEK === */}
      <div className={cn(
        "border-t pt-6 space-y-4",
        billingData.invoicing_inactive && "opacity-50 pointer-events-none"
      )}>
        <h3 className="text-sm font-medium text-primary">
          Számlára kerülő tételek, megjegyzések
        </h3>

        {/* Meglévő tételek */}
        {invoiceItems.length > 0 && (
          <div className="space-y-3">
            {invoiceItems.map((item, index) => (
              <InvoiceItemRow
                key={item.id}
                item={item}
                index={index}
                currency={invoicingData.currency}
                onUpdate={(updates) => updateInvoiceItem(item.id, updates)}
                onRemove={() => removeInvoiceItem(item.id)}
              />
            ))}
          </div>
        )}

        {/* Meglévő megjegyzések */}
        {invoiceComments.length > 0 && (
          <div className="space-y-3">
            <Label>Megjegyzések (Nem jelenik meg a számlán)</Label>
            {invoiceComments.map((comment) => (
              <div key={comment.id} className="flex items-center gap-2">
                <Input
                  value={comment.comment}
                  onChange={(e) => updateInvoiceComment(comment.id, e.target.value)}
                  placeholder="Megjegyzés"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInvoiceComment(comment.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Gombok egymás mellett */}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addInvoiceItem}
            className="text-primary"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tétel hozzáadása
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addInvoiceComment}
            className="text-primary"
          >
            <Plus className="h-4 w-4 mr-1" />
            Megjegyzés hozzáadása
          </Button>
        </div>
      </div>
    </div>
  );
};

// Invoice Item Row komponens
interface InvoiceItemRowProps {
  item: InvoiceItem;
  index: number;
  currency?: string | null;
  onUpdate: (updates: Partial<InvoiceItem>) => void;
  onRemove: () => void;
}

const InvoiceItemRow = ({ item, index, currency, onUpdate, onRemove }: InvoiceItemRowProps) => {
  const [showComment, setShowComment] = useState(!!item.comment);
  
  const isMultiplication = item.item_type === "multiplication";
  const isAmount = item.item_type === "amount";
  const isWorkshopOrCrisis = ["workshop", "crisis", "other-activity"].includes(item.item_type);
  const isContractHolder = item.item_type.startsWith("optum-") || item.item_type.startsWith("compsych-");
  const needsVolumeAndAmount = isMultiplication || isContractHolder;
  const needsAmountOnly = isAmount;

  const bgColor = !item.item_type ? "bg-purple-100/50" : "bg-primary/10";

  return (
    <div className="flex gap-3 items-stretch">
      <div className={cn("flex-1 rounded-lg p-4 space-y-4", bgColor)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Tétel megnevezése</Label>
            <Input
              value={item.item_name}
              onChange={(e) => onUpdate({ item_name: e.target.value })}
              placeholder="Tétel megnevezése"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Típus</Label>
            <Select
              value={item.item_type || "none"}
              onValueChange={(val) =>
                onUpdate({ item_type: val === "none" ? "multiplication" : (val as InvoiceItemType) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kérjük, válasszon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kérjük, válasszon</SelectItem>
                {INVOICE_ITEM_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          {isWorkshopOrCrisis && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`activity-id-${item.id}`}
                checked={item.show_activity_id}
                onCheckedChange={(checked) => onUpdate({ show_activity_id: !!checked })}
              />
              <Label htmlFor={`activity-id-${item.id}`} className="text-sm font-normal text-muted-foreground cursor-pointer">
                Activity ID megjelenik
              </Label>
            </div>
          )}
          {(isMultiplication || isContractHolder) && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`by-item-${item.id}`}
                checked={item.show_by_item}
                onCheckedChange={(checked) => onUpdate({ show_by_item: !!checked })}
              />
              <Label htmlFor={`by-item-${item.id}`} className="text-sm font-normal text-muted-foreground cursor-pointer">
                Tételesen
              </Label>
            </div>
          )}
        </div>

        {needsVolumeAndAmount && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Létszám mező neve</Label>
                <Input
                  value={item.volume_name || "Munkavállalói létszám"}
                  onChange={(e) => onUpdate({ volume_name: e.target.value || null })}
                  placeholder="Munkavállalói létszám"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Létszám érték</Label>
                {item.is_volume_changing ? (
                  <div className="bg-amber-500 text-amber-50 h-10 flex items-center justify-center rounded-lg text-sm">
                    Létszám a 'Számlázás' fül alatt!
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={item.volume_value || ""}
                    onChange={(e) => onUpdate({ volume_value: e.target.value || null })}
                    placeholder={isContractHolder ? "Automatikus" : "Érték"}
                    disabled={isContractHolder}
                    className={cn(isContractHolder && "opacity-50")}
                  />
                )}
              </div>
              {isMultiplication && (
                <DifferentPerCountryToggle
                  label="Változó"
                  checked={item.is_volume_changing}
                  onChange={(checked) => onUpdate({ is_volume_changing: checked })}
                />
              )}
            </div>

            {item.is_volume_changing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email cím adatbekéréshez</Label>
                  <Input
                    type="email"
                    value={item.data_request_email || ""}
                    onChange={(e) => onUpdate({ data_request_email: e.target.value || null })}
                    placeholder="email@ceg.hu"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Megszólítás</Label>
                  <Input
                    value={item.data_request_salutation || ""}
                    onChange={(e) => onUpdate({ data_request_salutation: e.target.value || null })}
                    placeholder="Tisztelt..."
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">PEPM mező neve</Label>
                <Input
                  value={item.amount_name || "PEPM"}
                  onChange={(e) => onUpdate({ amount_name: e.target.value || null })}
                  placeholder="PEPM"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">PEPM érték</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={item.amount_value || ""}
                    onChange={(e) => onUpdate({ amount_value: e.target.value || null })}
                    placeholder="Érték"
                    className="flex-1"
                  />
                  {currency && (
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {currency}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {needsAmountOnly && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Összeg mező neve</Label>
                <Input
                  value={item.amount_name || "Összeg"}
                  onChange={(e) => onUpdate({ amount_name: e.target.value || null })}
                  placeholder="Összeg"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Összeg érték</Label>
                {item.is_amount_changing ? (
                  <div className="bg-amber-500 text-amber-50 h-10 flex items-center justify-center rounded-lg text-sm">
                    Összeg a 'Számlázás' fül alatt!
                  </div>
                ) : (
                  <Input
                    type="number"
                    step="0.01"
                    value={item.amount_value || ""}
                    onChange={(e) => onUpdate({ amount_value: e.target.value || null })}
                    placeholder="Összeg érték"
                  />
                )}
              </div>
              <DifferentPerCountryToggle
                label="Változó"
                checked={item.is_amount_changing}
                onChange={(checked) => onUpdate({ is_amount_changing: checked })}
              />
            </div>
          </div>
        )}

        {showComment && (
          <div className="space-y-1 pt-2 border-t">
            <Label className="text-xs text-muted-foreground">Megjegyzés</Label>
            <Textarea
              value={item.comment || ""}
              onChange={(e) => onUpdate({ comment: e.target.value || null })}
              placeholder="Megjegyzés a tételhez... (Megjelenik a számlán)"
              rows={2}
            />
          </div>
        )}
      </div>

      <div className="shrink-0 flex flex-col gap-1 rounded-lg border bg-muted/30 p-1.5">
        {(isMultiplication || isAmount) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onUpdate({ with_timestamp: !item.with_timestamp })}
            className={cn("h-9 w-9 text-cgp-teal/40 hover:text-cgp-teal hover:bg-cgp-teal/10", item.with_timestamp && "text-cgp-teal bg-cgp-teal/10")}
            title="Időbélyeg"
          >
            <Calendar className="h-5 w-5" fill={item.with_timestamp ? "currentColor" : "none"} />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowComment(!showComment)}
          className={cn("h-9 w-9 text-cgp-teal/40 hover:text-cgp-teal hover:bg-cgp-teal/10", showComment && "text-cgp-teal bg-cgp-teal/10")}
          title="Megjegyzés"
        >
          <MessageSquare className="h-5 w-5" fill={showComment ? "currentColor" : "none"} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-9 w-9 text-destructive hover:bg-destructive/10"
          title="Törlés"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
