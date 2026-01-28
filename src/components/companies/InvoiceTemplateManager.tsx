import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BillingData,
  InvoicingData,
  InvoiceItem,
  InvoiceComment,
} from "@/types/company";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Számla sablon típus
export interface InvoiceTemplate {
  id: string;
  company_id: string;
  country_id: string | null;
  admin_identifier: string | null;
  name: string;
  is_name_shown: boolean;
  country: string | null;
  postal_code: string | null;
  city: string | null;
  street: string | null;
  house_number: string | null;
  is_address_shown: boolean;
  po_number: string | null;
  is_po_number_shown: boolean;
  is_po_number_changing: boolean;
  is_po_number_required: boolean;
  tax_number: string | null;
  community_tax_number: string | null;
  is_tax_number_shown: boolean;
  group_id: string | null;
  payment_deadline: number | null;
  is_payment_deadline_shown: boolean;
  invoicing_inactive: boolean;
  invoicing_inactive_from: string | null;
  invoicing_inactive_to: string | null;
  // Kapcsolódó tételek és megjegyzések
  items: InvoiceItem[];
  comments: InvoiceComment[];
}

interface InvoiceTemplateManagerProps {
  templates: InvoiceTemplate[];
  onTemplatesChange: (templates: InvoiceTemplate[]) => void;
  countryId: string | null;
  companyId: string;
  currency?: string | null;
  renderTemplateForm: (
    template: InvoiceTemplate,
    onUpdate: (updates: Partial<InvoiceTemplate>) => void,
    onUpdateItems: (items: InvoiceItem[]) => void,
    onUpdateComments: (comments: InvoiceComment[]) => void
  ) => React.ReactNode;
}

export const InvoiceTemplateManager = ({
  templates,
  onTemplatesChange,
  countryId,
  companyId,
  currency,
  renderTemplateForm,
}: InvoiceTemplateManagerProps) => {
  const [openTemplateIds, setOpenTemplateIds] = useState<string[]>([]);
  const [editingIdentifier, setEditingIdentifier] = useState<string | null>(null);
  const [newIdentifier, setNewIdentifier] = useState("");

  // Szűrjük az aktuális országhoz tartozó sablonokat
  const countryTemplates = templates.filter(
    (t) => t.country_id === countryId || (t.country_id === null && countryId === null)
  );

  // Új sablon hozzáadása - automatikusan 3 alaptétellel
  const addNewTemplate = () => {
    const newTemplate: InvoiceTemplate = {
      id: `new-template-${Date.now()}`,
      company_id: companyId,
      country_id: countryId,
      admin_identifier: `Sablon #${countryTemplates.length + 1}`,
      name: "",
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
      // Automatikusan 3 alap tétel a Laravel-hez hasonlóan
      items: [
        {
          id: `new-item-ws-${Date.now()}`,
          invoicing_data_id: `new-template-${Date.now()}`,
          item_name: "Workshop",
          item_type: "workshop",
          amount_name: null,
          amount_value: null,
          volume_name: null,
          volume_value: null,
          is_amount_changing: false,
          is_volume_changing: false,
          show_by_item: false,
          show_activity_id: true,
          with_timestamp: false,
          comment: null,
          data_request_email: null,
          data_request_salutation: null,
        },
        {
          id: `new-item-crisis-${Date.now() + 1}`,
          invoicing_data_id: `new-template-${Date.now()}`,
          item_name: "Krízisintervenció",
          item_type: "crisis",
          amount_name: null,
          amount_value: null,
          volume_name: null,
          volume_value: null,
          is_amount_changing: false,
          is_volume_changing: false,
          show_by_item: false,
          show_activity_id: true,
          with_timestamp: false,
          comment: null,
          data_request_email: null,
          data_request_salutation: null,
        },
        {
          id: `new-item-other-${Date.now() + 2}`,
          invoicing_data_id: `new-template-${Date.now()}`,
          item_name: "Egyéb tevékenység",
          item_type: "other-activity",
          amount_name: null,
          amount_value: null,
          volume_name: null,
          volume_value: null,
          is_amount_changing: false,
          is_volume_changing: false,
          show_by_item: false,
          show_activity_id: true,
          with_timestamp: false,
          comment: null,
          data_request_email: null,
          data_request_salutation: null,
        },
      ],
      comments: [],
    };

    onTemplatesChange([...templates, newTemplate]);
    // Azonnal megnyitjuk az új sablont
    setOpenTemplateIds([...openTemplateIds, newTemplate.id]);
  };

  // Sablon törlése
  const deleteTemplate = (templateId: string) => {
    onTemplatesChange(templates.filter((t) => t.id !== templateId));
    setOpenTemplateIds(openTemplateIds.filter((id) => id !== templateId));
  };

  // Sablon kinyitása/becsukása
  const toggleTemplate = (templateId: string) => {
    if (openTemplateIds.includes(templateId)) {
      setOpenTemplateIds(openTemplateIds.filter((id) => id !== templateId));
    } else {
      setOpenTemplateIds([...openTemplateIds, templateId]);
    }
  };

  // Sablon frissítése
  const updateTemplate = (templateId: string, updates: Partial<InvoiceTemplate>) => {
    onTemplatesChange(
      templates.map((t) => (t.id === templateId ? { ...t, ...updates } : t))
    );
  };

  // Sablon tételeinek frissítése
  const updateTemplateItems = (templateId: string, items: InvoiceItem[]) => {
    updateTemplate(templateId, { items });
  };

  // Sablon megjegyzéseinek frissítése
  const updateTemplateComments = (templateId: string, comments: InvoiceComment[]) => {
    updateTemplate(templateId, { comments });
  };

  // Admin azonosító szerkesztése
  const startEditIdentifier = (template: InvoiceTemplate) => {
    setEditingIdentifier(template.id);
    setNewIdentifier(template.admin_identifier || "");
  };

  const saveIdentifier = (templateId: string) => {
    updateTemplate(templateId, { admin_identifier: newIdentifier });
    setEditingIdentifier(null);
    setNewIdentifier("");
  };

  // Ha csak 1 sablon van, közvetlenül megjelenítjük a formot
  if (countryTemplates.length === 0) {
    // Még nincs sablon - üres állapot
    return (
      <div className="space-y-4">
        <div className="text-muted-foreground text-sm p-4 border rounded-lg bg-muted/30 text-center">
          Nincs még számlázási sablon. Hozz létre egy újat az alábbi gombbal.
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewTemplate}
          className="text-primary w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Új számla hozzáadása
        </Button>
      </div>
    );
  }

  if (countryTemplates.length === 1) {
    // Pontosan 1 sablon - közvetlenül jelenik meg
    const template = countryTemplates[0];
    return (
      <div className="space-y-4">
        {renderTemplateForm(
          template,
          (updates) => updateTemplate(template.id, updates),
          (items) => updateTemplateItems(template.id, items),
          (comments) => updateTemplateComments(template.id, comments)
        )}
        {/* Új sablon hozzáadása gomb */}
        <div className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewTemplate}
            className="text-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Új számla hozzáadása
          </Button>
        </div>
      </div>
    );
  }

  // Több sablon - lista nézet (mint a Laravel-ben)
  return (
    <div className="space-y-4">
      {/* Sablonok listája */}
      {countryTemplates.map((template) => {
        const isOpen = openTemplateIds.includes(template.id);
        const hasWorkshop = template.items.some((i) => i.item_type === "workshop");
        const hasCrisis = template.items.some((i) => i.item_type === "crisis");
        const hasOther = template.items.some((i) => i.item_type === "other-activity");

        // Címkék a Laravel-hez hasonlóan
        const labels: string[] = [];
        if (hasWorkshop) labels.push("WS");
        if (hasCrisis) labels.push("CI");
        if (hasOther) labels.push("O");

        return (
          <div key={template.id} className="border rounded-lg overflow-hidden">
            {/* Fejléc sor */}
            <div
              className={cn(
                "flex items-center justify-between p-3 cursor-pointer transition-colors",
                isOpen ? "bg-primary/10" : "bg-muted/30 hover:bg-muted/50"
              )}
              onClick={() => toggleTemplate(template.id)}
            >
              <div className="flex items-center gap-3">
                {/* Azonosító - szerkeszthető */}
                {editingIdentifier === template.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={newIdentifier}
                      onChange={(e) => setNewIdentifier(e.target.value)}
                      className="h-8 w-40"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveIdentifier(template.id);
                        if (e.key === "Escape") setEditingIdentifier(null);
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => saveIdentifier(template.id)}
                    >
                      OK
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {template.admin_identifier || "Nincs azonosító"}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditIdentifier(template);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Típus címkék */}
                {labels.length > 0 && (
                  <span className="text-primary text-sm font-medium">
                    {labels.join("/")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Szerkesztés/Törlés gombok */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTemplate(template.id);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Szerkesztés
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Törlés
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Biztosan törölni szeretnéd?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ez a művelet nem vonható vissza. A sablon és az összes hozzá tartozó tétel és megjegyzés törlődik.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Mégse</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteTemplate(template.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Törlés
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Nyitás/Zárás ikon */}
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Tartalom - ha nyitva van */}
            {isOpen && (
              <div className="p-4 border-t">
                {renderTemplateForm(
                  template,
                  (updates) => updateTemplate(template.id, updates),
                  (items) => updateTemplateItems(template.id, items),
                  (comments) => updateTemplateComments(template.id, comments)
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Új sablon hozzáadása gomb */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addNewTemplate}
        className="text-primary w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Új számla hozzáadása
      </Button>
    </div>
  );
};
