import { useState } from "react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  Archive,
  CheckCircle,
  Play,
  ThumbsUp,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUpdateEvent, useDeleteEvent } from "@/hooks/useActivityPlan";
import { 
  ActivityPlanEvent, 
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ICONS,
  STATUS_LABELS,
  STATUS_COLORS,
  MOOD_LABELS,
  MOOD_ICONS,
  ActivityEventStatus,
  MeetingMood,
} from "@/types/activityPlan";

interface EventDetailDialogProps {
  event: ActivityPlanEvent | null;
  onClose: () => void;
}

const EventDetailDialog = ({ event, onClose }: EventDetailDialogProps) => {
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(event?.notes || "");
  const [meetingSummary, setMeetingSummary] = useState(event?.meeting_summary || "");
  const [editingMood, setEditingMood] = useState(false);

  if (!event) return null;

  const handleStatusChange = async (status: ActivityEventStatus) => {
    await updateEvent.mutateAsync({ id: event.id, status });
  };

  const handleMoodChange = async (mood: MeetingMood) => {
    await updateEvent.mutateAsync({ id: event.id, meeting_mood: mood });
    setEditingMood(false);
  };

  const handleSaveNotes = async () => {
    await updateEvent.mutateAsync({ id: event.id, notes });
    setEditingNotes(false);
  };

  const handleSaveMeetingSummary = async () => {
    await updateEvent.mutateAsync({ id: event.id, meeting_summary: meetingSummary });
  };

  const handleDelete = async () => {
    await deleteEvent.mutateAsync(event.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const statusActions = [
    { status: 'approved' as const, icon: ThumbsUp, label: 'Jóváhagyás', color: 'text-blue-600' },
    { status: 'in_progress' as const, icon: Play, label: 'Indítás', color: 'text-yellow-600' },
    { status: 'completed' as const, icon: CheckCircle, label: 'Befejezés', color: 'text-green-600' },
    { status: 'archived' as const, icon: Archive, label: 'Archiválás', color: 'text-purple-600' },
  ];

  return (
    <>
      <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                <span className="text-2xl">{EVENT_TYPE_ICONS[event.event_type]}</span>
                {event.title}
              </DialogTitle>
              <Badge className={STATUS_COLORS[event.status]}>
                {STATUS_LABELS[event.status]}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Event info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Típus</Label>
                <p className="font-medium">
                  {event.custom_type_name || EVENT_TYPE_LABELS[event.event_type]}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Ár</Label>
                <p className="font-medium">
                  {event.is_free ? "🎁 Ingyenes" : event.price ? `${event.price.toLocaleString('hu-HU')} Ft` : "Fizetős"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Dátum</Label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(event.event_date), "yyyy. MMMM d. (EEEE)", { locale: hu })}
                </p>
              </div>
              {event.event_time && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Időpont</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {event.event_time.slice(0, 5)}
                  </p>
                </div>
              )}
            </div>

            {/* Meeting specific info */}
            {event.event_type === 'meeting' && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-4">
                <h4 className="font-semibold">Meeting részletek</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {event.meeting_type && (
                    <div>
                      <Label className="text-muted-foreground">Típus</Label>
                      <p className="font-medium">
                        {event.meeting_type === 'personal' ? '👤 Személyes' : '💻 Online'}
                      </p>
                    </div>
                  )}
                  {event.meeting_location && (
                    <div>
                      <Label className="text-muted-foreground">Helyszín</Label>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.meeting_location}
                      </p>
                    </div>
                  )}
                </div>

                {/* Mood selector */}
                <div>
                  <Label className="text-muted-foreground">Hangulat</Label>
                  {editingMood ? (
                    <div className="flex gap-2 mt-2">
                      {Object.entries(MOOD_ICONS).map(([mood, icon]) => (
                        <Button
                          key={mood}
                          variant={event.meeting_mood === mood ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleMoodChange(mood as MeetingMood)}
                          title={MOOD_LABELS[mood as MeetingMood]}
                        >
                          {icon}
                        </Button>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => setEditingMood(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      {event.meeting_mood ? (
                        <span className="text-xl">{MOOD_ICONS[event.meeting_mood]} {MOOD_LABELS[event.meeting_mood]}</span>
                      ) : (
                        <span className="text-muted-foreground">Nincs beállítva</span>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setEditingMood(true)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Meeting summary */}
                <div>
                  <Label htmlFor="meeting_summary">Mi történt a meetingen?</Label>
                  <Textarea
                    id="meeting_summary"
                    value={meetingSummary}
                    onChange={(e) => setMeetingSummary(e.target.value)}
                    onBlur={handleSaveMeetingSummary}
                    placeholder="Rögzítsd a fontos részleteket..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div>
                <Label className="text-muted-foreground">Leírás</Label>
                <p className="mt-1">{event.description}</p>
              </div>
            )}

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Belső jegyzetek</Label>
                {!editingNotes && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingNotes(true)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Szerkesztés
                  </Button>
                )}
              </div>
              {editingNotes ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Belső jegyzetek..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNotes}>Mentés</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>Mégse</Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-muted-foreground">
                  {event.notes || "Nincs jegyzet"}
                </p>
              )}
            </div>

            {/* Status actions */}
            <div className="border-t pt-4">
              <Label className="text-muted-foreground mb-3 block">Státusz módosítása</Label>
              <div className="flex flex-wrap gap-2">
                {statusActions
                  .filter(action => action.status !== event.status)
                  .map(action => (
                    <Button
                      key={action.status}
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(action.status)}
                      className="rounded-xl"
                    >
                      <action.icon className={`w-4 h-4 mr-2 ${action.color}`} />
                      {action.label}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Timestamps */}
            {(event.completed_at || event.archived_at) && (
              <div className="text-xs text-muted-foreground border-t pt-4">
                {event.completed_at && (
                  <p>Befejezve: {format(new Date(event.completed_at), "yyyy. MMM d. HH:mm", { locale: hu })}</p>
                )}
                {event.archived_at && (
                  <p>Archiválva: {format(new Date(event.archived_at), "yyyy. MMM d. HH:mm", { locale: hu })}</p>
                )}
              </div>
            )}

            {/* Delete button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Esemény törlése
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törlöd az eseményt?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet nem vonható vissza. Az esemény véglegesen törlődik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventDetailDialog;
