import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateEvent } from "@/hooks/useActivityPlan";
import { ActivityEventType, EVENT_TYPE_LABELS, EVENT_TYPE_ICONS } from "@/types/activityPlan";
import { format } from "date-fns";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

interface FormData {
  event_type: ActivityEventType;
  custom_type_name?: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  is_free: boolean;
  price?: number;
  notes?: string;
  meeting_location?: string;
  meeting_type?: 'personal' | 'online';
}

const CreateEventDialog = ({ open, onOpenChange, planId }: CreateEventDialogProps) => {
  const createEvent = useCreateEvent();
  const [eventType, setEventType] = useState<ActivityEventType>("workshop");
  const [isFree, setIsFree] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      event_type: "workshop",
      event_date: format(new Date(), "yyyy-MM-dd"),
      is_free: false,
    },
  });

  const watchEventType = watch("event_type");

  const onSubmit = async (data: FormData) => {
    await createEvent.mutateAsync({
      activity_plan_id: planId,
      event_type: data.event_type,
      custom_type_name: data.event_type === 'other' ? data.custom_type_name : undefined,
      title: data.title,
      description: data.description,
      event_date: data.event_date,
      event_time: data.event_time || undefined,
      is_free: data.is_free,
      price: data.is_free ? undefined : data.price,
      notes: data.notes,
      meeting_location: data.meeting_location,
      meeting_type: data.meeting_type,
    });
    reset();
    setEventType("workshop");
    setIsFree(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Új esemény
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Event Type */}
          <div className="space-y-2">
            <Label>Esemény típusa *</Label>
            <Select 
              value={eventType} 
              onValueChange={(v) => {
                setEventType(v as ActivityEventType);
                setValue("event_type", v as ActivityEventType);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <span>{EVENT_TYPE_ICONS[value as ActivityEventType]}</span>
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom type name for "other" */}
          {eventType === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom_type_name">Egyedi típus neve *</Label>
              <Input
                id="custom_type_name"
                {...register("custom_type_name", { 
                  required: eventType === 'other' ? "Kötelező mező" : false 
                })}
                placeholder="pl. Csapatépítő"
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Esemény neve *</Label>
            <Input
              id="title"
              {...register("title", { required: "Kötelező mező" })}
              placeholder="pl. Stresszkezelés Workshop"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Dátum *</Label>
              <Input
                id="event_date"
                type="date"
                {...register("event_date", { required: "Kötelező mező" })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_time">Időpont</Label>
              <Input
                id="event_time"
                type="time"
                {...register("event_time")}
              />
            </div>
          </div>

          {/* Meeting specific fields */}
          {eventType === 'meeting' && (
            <>
              <div className="space-y-2">
                <Label>Meeting típusa</Label>
                <Select 
                  onValueChange={(v) => setValue("meeting_type", v as 'personal' | 'online')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">👤 Személyes</SelectItem>
                    <SelectItem value="online">💻 Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_location">Helyszín / Link</Label>
                <Input
                  id="meeting_location"
                  {...register("meeting_location")}
                  placeholder="pl. Budapest, Váci út 1. vagy Zoom link"
                />
              </div>
            </>
          )}

          {/* Free/Paid toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label htmlFor="is_free" className="text-base font-medium">
                Ingyenes esemény
              </Label>
              <p className="text-sm text-muted-foreground">
                Az ügyfél nem fizet ezért az eseményért
              </p>
            </div>
            <Switch
              id="is_free"
              checked={isFree}
              onCheckedChange={(checked) => {
                setIsFree(checked);
                setValue("is_free", checked);
              }}
            />
          </div>

          {/* Price (if not free) */}
          {!isFree && (
            <div className="space-y-2">
              <Label htmlFor="price">Ár (Ft)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="pl. 150000"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Leírás</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Rövid leírás az eseményről..."
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Belső jegyzet</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Csak belső használatra..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Mégse
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? "Mentés..." : "Létrehozás"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
