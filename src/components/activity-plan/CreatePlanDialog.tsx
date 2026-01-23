import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateActivityPlan } from "@/hooks/useActivityPlan";
import { PeriodType, PERIOD_LABELS } from "@/types/activityPlan";
import { format, addMonths, startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  userId: string;
}

interface FormData {
  title: string;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  notes?: string;
}

const CreatePlanDialog = ({ open, onOpenChange, companyId, userId }: CreatePlanDialogProps) => {
  const createPlan = useCreateActivityPlan();
  const [periodType, setPeriodType] = useState<PeriodType>("yearly");

  const currentYear = new Date().getFullYear();
  const defaultStart = format(startOfYear(new Date()), "yyyy-MM-dd");
  const defaultEnd = format(endOfYear(new Date()), "yyyy-MM-dd");

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: `${currentYear} éves terv`,
      period_type: "yearly",
      period_start: defaultStart,
      period_end: defaultEnd,
    },
  });

  const handlePeriodTypeChange = (type: PeriodType) => {
    setPeriodType(type);
    setValue("period_type", type);

    const now = new Date();
    const year = now.getFullYear();

    if (type === "yearly") {
      setValue("title", `${year} éves terv`);
      setValue("period_start", format(startOfYear(now), "yyyy-MM-dd"));
      setValue("period_end", format(endOfYear(now), "yyyy-MM-dd"));
    } else if (type === "half_yearly") {
      const isFirstHalf = now.getMonth() < 6;
      setValue("title", `${year} ${isFirstHalf ? 'H1' : 'H2'}`);
      if (isFirstHalf) {
        setValue("period_start", format(new Date(year, 0, 1), "yyyy-MM-dd"));
        setValue("period_end", format(new Date(year, 5, 30), "yyyy-MM-dd"));
      } else {
        setValue("period_start", format(new Date(year, 6, 1), "yyyy-MM-dd"));
        setValue("period_end", format(new Date(year, 11, 31), "yyyy-MM-dd"));
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    await createPlan.mutateAsync({
      user_id: userId,
      company_id: companyId,
      title: data.title,
      period_type: data.period_type,
      period_start: data.period_start,
      period_end: data.period_end,
      notes: data.notes,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Új Activity Plan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Period Type */}
          <div className="space-y-2">
            <Label>Időszak típusa</Label>
            <Select value={periodType} onValueChange={(v) => handlePeriodTypeChange(v as PeriodType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Terv neve *</Label>
            <Input
              id="title"
              {...register("title", { required: "Kötelező mező" })}
              placeholder="pl. 2024 éves terv"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start">Kezdés *</Label>
              <Input
                id="period_start"
                type="date"
                {...register("period_start", { required: "Kötelező mező" })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end">Befejezés *</Label>
              <Input
                id="period_end"
                type="date"
                {...register("period_end", { required: "Kötelező mező" })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Megjegyzés</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Opcionális megjegyzés a tervhez..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Mégse
            </Button>
            <Button type="submit" disabled={createPlan.isPending}>
              {createPlan.isPending ? "Mentés..." : "Létrehozás"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlanDialog;
