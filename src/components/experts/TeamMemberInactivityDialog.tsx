import { useState } from "react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface TeamMemberInactivityPeriod {
  id: string;
  startDate: Date;
  endDate: Date | null;
  isIndefinite: boolean;
  reason: string;
}

interface TeamMemberInactivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  inactivityPeriods: TeamMemberInactivityPeriod[];
  onAddPeriod: (period: Omit<TeamMemberInactivityPeriod, "id">) => void;
  onRemovePeriod: (id: string) => void;
  onActivate: () => void;
}

const REASON_PRESETS = [
  { id: "vacation", label: "Szabadság" },
  { id: "no_cases", label: "Nem akarunk esetet adni" },
  { id: "sick_leave", label: "Betegszabadság" },
  { id: "maternity", label: "Szülési szabadság" },
  { id: "other", label: "Egyéb (szabadszöveges)" },
];

export const TeamMemberInactivityDialog = ({
  open,
  onOpenChange,
  memberName,
  inactivityPeriods,
  onAddPeriod,
  onRemovePeriod,
  onActivate,
}: TeamMemberInactivityDialogProps) => {
  const [durationType, setDurationType] = useState<"definite" | "indefinite">("definite");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reasonType, setReasonType] = useState<string>("vacation");
  const [customReason, setCustomReason] = useState("");

  const handleSave = () => {
    if (!startDate) {
      toast.error("Kérlek add meg a kezdő dátumot");
      return;
    }

    if (durationType === "definite" && !endDate) {
      toast.error("Kérlek add meg a befejező dátumot");
      return;
    }

    const reason = reasonType === "other" 
      ? customReason 
      : REASON_PRESETS.find(r => r.id === reasonType)?.label || "";

    onAddPeriod({
      startDate,
      endDate: durationType === "indefinite" ? null : endDate!,
      isIndefinite: durationType === "indefinite",
      reason,
    });

    toast.success("Inaktivitási időszak beállítva");
    onOpenChange(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    // Check if this is the last period BEFORE removing
    const isLastPeriod = inactivityPeriods.length <= 1;
    
    onRemovePeriod(id);
    
    if (isLastPeriod) {
      onActivate();
      toast.success("Inaktivitási időszak törölve, csapattag aktiválva");
    } else {
      toast.success("Inaktivitási időszak törölve");
    }
    
    // Reset form after delete
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setDurationType("definite");
    setStartDate(new Date());
    setEndDate(undefined);
    setReasonType("vacation");
    setCustomReason("");
  };

  const formatPeriodDate = (date: Date | null) => {
    if (!date) return "Határozatlan";
    return format(date, "yyyy. MMM. d.", { locale: hu });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Inaktivitási időszak
          </DialogTitle>
          <DialogDescription>
            {memberName} inaktivitási időszakának beállítása
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Existing periods */}
          {inactivityPeriods.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Aktív időszakok</Label>
              <div className="space-y-2">
                {inactivityPeriods.map((period) => (
                  <div
                    key={period.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm"
                  >
                    <div>
                      <div className="font-medium">
                        {formatPeriodDate(period.startDate)} – {formatPeriodDate(period.endDate)}
                        {period.isIndefinite && (
                          <span className="ml-2 text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">
                            Határozatlan
                          </span>
                        )}
                      </div>
                      {period.reason && (
                        <div className="text-muted-foreground">{period.reason}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(period.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Törlés
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duration type */}
          <div className="space-y-3">
            <Label>Időtartam típusa</Label>
            <RadioGroup
              value={durationType}
              onValueChange={(v) => setDurationType(v as "definite" | "indefinite")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="definite" id="tm_definite" />
                <Label htmlFor="tm_definite" className="cursor-pointer">Meghatározott ideig</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="indefinite" id="tm_indefinite" />
                <Label htmlFor="tm_indefinite" className="cursor-pointer">Határozatlan ideig</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kezdő dátum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "yyyy. MMM. d.", { locale: hu }) : "Válassz dátumot"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={hu}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {durationType === "definite" && (
              <div className="space-y-2">
                <Label>Befejező dátum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "yyyy. MMM. d.", { locale: hu }) : "Válassz dátumot"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      locale={hu}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {durationType === "indefinite" && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Befejező dátum</Label>
                <div className="flex items-center h-10 px-3 border rounded-md bg-muted text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Határozatlan
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <Label>Indoklás</Label>
            <Select value={reasonType} onValueChange={setReasonType}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz indoklást..." />
              </SelectTrigger>
              <SelectContent>
                {REASON_PRESETS.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {reasonType === "other" && (
              <Textarea
                placeholder="Írd le az indoklást..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button onClick={handleSave}>
            Mentés
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
