// Számla csík (slip) komponens - egy számla tételeinek és megjegyzéseinek csoportja
// Ez NEM új számlázási adatokat jelent, hanem tételek csoportját egy adott számlához

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, MessageSquare, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InvoiceItem,
  InvoiceComment,
  INVOICE_ITEM_TYPES,
  InvoiceItemType,
} from "@/types/company";
import { DifferentPerCountryToggle } from "./DifferentPerCountryToggle";
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

// Számla csík típus - egyszerűsített, csak tételek és megjegyzések
export interface InvoiceSlip {
  id: string;
  admin_identifier: string | null;
  items: InvoiceItem[];
  comments: InvoiceComment[];
}

// Exkluzív típusok, amelyek csak egy csíkban lehetnek
export const EXCLUSIVE_ITEM_TYPES: InvoiceItemType[] = ["workshop", "crisis", "other-activity"];

interface InvoiceSlipCardProps {
  slip: InvoiceSlip;
  slipIndex: number;
  currency?: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<InvoiceSlip>) => void;
  onUpdateItems: (items: InvoiceItem[]) => void;
  onUpdateComments: (comments: InvoiceComment[]) => void;
  onDelete?: () => void;
  isFirst?: boolean; // Az első csík nem törölhető
  // Más csíkokban már használt exkluzív típusok (workshop, crisis, other-activity)
  usedExclusiveTypes?: InvoiceItemType[];
}

export const InvoiceSlipCard = ({
  slip,
  slipIndex,
  currency,
  isOpen,
  onToggle,
  onUpdate,
  onUpdateItems,
  onUpdateComments,
  onDelete,
  isFirst = false,
  usedExclusiveTypes = [],
}: InvoiceSlipCardProps) => {
  const [editingIdentifier, setEditingIdentifier] = useState(false);
  const [newIdentifier, setNewIdentifier] = useState(slip.admin_identifier || "");

  // Típus címkék a fejlécben
  const hasWorkshop = slip.items.some((i) => i.item_type === "workshop");
  const hasCrisis = slip.items.some((i) => i.item_type === "crisis");
  const hasOther = slip.items.some((i) => i.item_type === "other-activity");
  const labels: string[] = [];
  if (hasWorkshop) labels.push("WS");
  if (hasCrisis) labels.push("CI");
  if (hasOther) labels.push("O");

  // Új tétel hozzáadása
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `new-item-${Date.now()}`,
      invoicing_data_id: slip.id,
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
    onUpdateItems([...slip.items, newItem]);
  };

  // Új megjegyzés hozzáadása
  const addComment = () => {
    const newComment: InvoiceComment = {
      id: `new-comment-${Date.now()}`,
      invoicing_data_id: slip.id,
      comment: "",
    };
    onUpdateComments([...slip.comments, newComment]);
  };

  // Tétel frissítése
  const updateItem = (itemId: string, updates: Partial<InvoiceItem>) => {
    onUpdateItems(
      slip.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  // Tétel törlése
  const removeItem = (itemId: string) => {
    onUpdateItems(slip.items.filter((item) => item.id !== itemId));
  };

  // Megjegyzés frissítése
  const updateComment = (commentId: string, text: string) => {
    onUpdateComments(
      slip.comments.map((c) =>
        c.id === commentId ? { ...c, comment: text } : c
      )
    );
  };

  // Megjegyzés törlése
  const removeComment = (commentId: string) => {
    onUpdateComments(slip.comments.filter((c) => c.id !== commentId));
  };

  // Azonosító mentése
  const saveIdentifier = () => {
    onUpdate({ admin_identifier: newIdentifier || null });
    setEditingIdentifier(false);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Fejléc sor - kattintással nyit/zár */}
      <div
        className={cn(
          "flex items-center justify-between p-3 cursor-pointer transition-colors",
          isOpen ? "bg-primary/10" : "bg-muted/30 hover:bg-muted/50"
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {/* Azonosító - szerkeszthető */}
          {editingIdentifier ? (
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
                className="h-8 w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveIdentifier();
                  if (e.key === "Escape") setEditingIdentifier(false);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={saveIdentifier}
              >
                OK
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {slip.admin_identifier || `Számla #${slipIndex + 1}`}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewIdentifier(slip.admin_identifier || "");
                  setEditingIdentifier(true);
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

          {/* Tételek száma */}
          <span className="text-muted-foreground text-sm">
            ({slip.items.length} tétel)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Törlés gomb - csak ha van onDelete callback (a szülő dönti el, hogy törölhető-e) */}
          {onDelete && (
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
                    Ez a művelet nem vonható vissza. A számla és az összes hozzá
                    tartozó tétel és megjegyzés törlődik.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Mégse</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Törlés
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

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
        <div className="p-4 border-t space-y-4">
          {/* Tételek */}
          {slip.items.length > 0 && (
            <div className="space-y-3">
              {slip.items.map((item, index) => {
                // Az ebben a csíkban használt exkluzív típusok (a jelenlegi tétel kivételével)
                const usedInThisSlip = slip.items
                  .filter((i) => i.id !== item.id)
                  .map((i) => i.item_type)
                  .filter((t): t is InvoiceItemType =>
                    EXCLUSIVE_ITEM_TYPES.includes(t as InvoiceItemType)
                  );

                return (
                  <SlipInvoiceItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    currency={currency}
                    onUpdate={(updates) => updateItem(item.id, updates)}
                    onRemove={() => removeItem(item.id)}
                    usedExclusiveTypes={usedExclusiveTypes}
                    usedInThisSlip={usedInThisSlip}
                  />
                );
              })}
            </div>
          )}

          {/* Megjegyzések */}
          {slip.comments.length > 0 && (
            <div className="space-y-3">
              <Label>Megjegyzések (Nem jelenik meg a számlán)</Label>
              {slip.comments.map((comment) => (
                <div key={comment.id} className="flex items-center gap-2">
                  <Input
                    value={comment.comment}
                    onChange={(e) => updateComment(comment.id, e.target.value)}
                    placeholder="Megjegyzés"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeComment(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Gombok */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="text-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tétel hozzáadása
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addComment}
              className="text-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Megjegyzés hozzáadása
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Tétel sor komponens a csíkban
interface SlipInvoiceItemRowProps {
  item: InvoiceItem;
  index: number;
  currency?: string | null;
  onUpdate: (updates: Partial<InvoiceItem>) => void;
  onRemove: () => void;
  // Más csíkokban már használt exkluzív típusok - ezeket nem lehet választani
  usedExclusiveTypes?: InvoiceItemType[];
  // Ebben a csíkban már használt exkluzív típusok (a jelenlegi tétel kivételével)
  usedInThisSlip?: InvoiceItemType[];
}

const SlipInvoiceItemRow = ({
  item,
  index,
  currency,
  onUpdate,
  onRemove,
  usedExclusiveTypes = [],
  usedInThisSlip = [],
}: SlipInvoiceItemRowProps) => {
  const [showComment, setShowComment] = useState(!!item.comment);

  const isMultiplication = item.item_type === "multiplication";
  const isAmount = item.item_type === "amount";
  const isWorkshopOrCrisis = ["workshop", "crisis", "other-activity"].includes(
    item.item_type
  );
  const isContractHolder =
    item.item_type.startsWith("optum-") ||
    item.item_type.startsWith("compsych-");
  const needsVolumeAndAmount = isMultiplication || isContractHolder;
  const needsAmountOnly = isAmount;

  const bgColor = !item.item_type ? "bg-purple-100/50" : "bg-primary/10";

  return (
    <div className="flex gap-3 items-stretch">
      {/* Fő panel */}
      <div className={cn("flex-1 rounded-lg p-4 space-y-4", bgColor)}>
        {/* Első sor: Tétel neve + Típus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Tétel megnevezése
            </Label>
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
                onUpdate({
                  item_type:
                    val === "none"
                      ? "multiplication"
                      : (val as InvoiceItemType),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kérjük, válasszon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kérjük, válasszon</SelectItem>
                {INVOICE_ITEM_TYPES.map((type) => {
                  // Ha ez exkluzív típus és már használva van máshol, tiltjuk
                  const isExclusive = EXCLUSIVE_ITEM_TYPES.includes(type.id as InvoiceItemType);
                  const isUsedElsewhere = usedExclusiveTypes.includes(type.id as InvoiceItemType);
                  const isUsedInSlip = usedInThisSlip.includes(type.id as InvoiceItemType);
                  const isDisabled = isExclusive && (isUsedElsewhere || isUsedInSlip);
                  
                  return (
                    <SelectItem 
                      key={type.id} 
                      value={type.id}
                      disabled={isDisabled}
                      className={isDisabled ? "opacity-50" : ""}
                    >
                      {type.name}
                      {isDisabled && " (már használva)"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Opciók sor */}
        <div className="flex flex-wrap gap-6 pt-1">
          {isWorkshopOrCrisis && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`activity-id-${item.id}`}
                checked={item.show_activity_id}
                onCheckedChange={(checked) =>
                  onUpdate({ show_activity_id: !!checked })
                }
              />
              <Label
                htmlFor={`activity-id-${item.id}`}
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                Activity ID megjelenik
              </Label>
            </div>
          )}
          {(isMultiplication || isContractHolder) && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`by-item-${item.id}`}
                checked={item.show_by_item}
                onCheckedChange={(checked) =>
                  onUpdate({ show_by_item: !!checked })
                }
              />
              <Label
                htmlFor={`by-item-${item.id}`}
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                Tételesen
              </Label>
            </div>
          )}
        </div>

        {/* Szorzás: Létszám + PEPM */}
        {needsVolumeAndAmount && (
          <div className="space-y-4 pt-2 border-t">
            {/* Létszám sor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Létszám mező neve
                </Label>
                <Input
                  value={item.volume_name || "Munkavállalói létszám"}
                  onChange={(e) =>
                    onUpdate({ volume_name: e.target.value || null })
                  }
                  placeholder="Munkavállalói létszám"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Létszám érték
                </Label>
                {item.is_volume_changing ? (
                  <div className="bg-amber-500 text-amber-50 h-10 flex items-center justify-center rounded-lg text-sm">
                    Létszám a 'Számlázás' fül alatt!
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={item.volume_value || ""}
                    onChange={(e) =>
                      onUpdate({ volume_value: e.target.value || null })
                    }
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
                  onChange={(checked) =>
                    onUpdate({ is_volume_changing: checked })
                  }
                />
              )}
            </div>

            {/* PEPM sor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  PEPM mező neve
                </Label>
                <Input
                  value={item.amount_name || "PEPM"}
                  onChange={(e) =>
                    onUpdate({ amount_name: e.target.value || null })
                  }
                  placeholder="PEPM"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  PEPM érték ({currency?.toUpperCase() || "---"})
                </Label>
                <Input
                  type="number"
                  value={item.amount_value || ""}
                  onChange={(e) =>
                    onUpdate({ amount_value: e.target.value || null })
                  }
                  placeholder="Összeg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Összeg típus */}
        {needsAmountOnly && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Összeg mező neve
                </Label>
                <Input
                  value={item.amount_name || "Összeg"}
                  onChange={(e) =>
                    onUpdate({ amount_name: e.target.value || null })
                  }
                  placeholder="Összeg"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Összeg ({currency?.toUpperCase() || "---"})
                </Label>
                <Input
                  type="number"
                  value={item.amount_value || ""}
                  onChange={(e) =>
                    onUpdate({ amount_value: e.target.value || null })
                  }
                  placeholder="Összeg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tételhez fűzött megjegyzés */}
        {showComment && (
          <div className="space-y-1 pt-2 border-t">
            <Label className="text-xs text-muted-foreground">
              Megjegyzés a tételhez... (Megjelenik a számlán)
            </Label>
            <Textarea
              value={item.comment || ""}
              onChange={(e) => onUpdate({ comment: e.target.value || null })}
              placeholder="Megjegyzés a tételhez..."
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Oldalsó akció panel */}
      <div className="flex flex-col gap-1 justify-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9",
            item.with_timestamp
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          )}
          onClick={() => onUpdate({ with_timestamp: !item.with_timestamp })}
          title="Időbélyeg"
        >
          <Calendar className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9",
            showComment || item.comment
              ? "text-cgp-teal bg-cgp-teal/10"
              : "text-cgp-teal/40"
          )}
          onClick={() => setShowComment(!showComment)}
          title="Megjegyzés"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-destructive"
          onClick={onRemove}
          title="Törlés"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default InvoiceSlipCard;
