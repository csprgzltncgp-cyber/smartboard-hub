import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  ActivityPlanEvent, 
  EVENT_TYPE_LABELS, 
  EVENT_TYPE_ICONS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/types/activityPlan";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import EventCard from "./EventCard";
import CreateEventDialog from "./CreateEventDialog";
import EventDetailDialog from "./EventDetailDialog";

interface ActivityPlanTimelineProps {
  planId: string;
  events: ActivityPlanEvent[];
}

const ActivityPlanTimeline = ({ planId, events }: ActivityPlanTimelineProps) => {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ActivityPlanEvent | null>(null);

  // Group events by status for visual organization
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

  // Separate archived events
  const activeEvents = sortedEvents.filter(e => e.status !== 'archived');
  const archivedEvents = sortedEvents.filter(e => e.status === 'archived');

  return (
    <div>
      {/* Add Event Button */}
      <div className="flex justify-end mb-6">
        <Button 
          onClick={() => setShowCreateEvent(true)}
          className="rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Új esemény
        </Button>
      </div>

      {/* Timeline */}
      {activeEvents.length === 0 && archivedEvents.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Még nincsenek események ebben a tervben.
          </p>
          <Button 
            onClick={() => setShowCreateEvent(true)}
            variant="outline"
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Első esemény hozzáadása
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />

          {/* Active events */}
          <div className="space-y-4">
            {activeEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    event.status === 'completed' 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : event.status === 'in_progress'
                      ? 'bg-yellow-100 border-2 border-yellow-500'
                      : event.status === 'approved'
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}>
                    {EVENT_TYPE_ICONS[event.event_type]}
                  </div>
                </div>

                {/* Event card */}
                <div className="flex-1 pb-4">
                  <EventCard 
                    event={event} 
                    onClick={() => setSelectedEvent(event)}
                  />
                </div>

                {/* Arrow to next event */}
                {index < activeEvents.length - 1 && (
                  <ChevronRight className="absolute left-[42px] top-14 w-4 h-4 text-primary/30 -rotate-90" />
                )}
              </div>
            ))}
          </div>

          {/* Archived events section */}
          {archivedEvents.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-muted-foreground mb-4">
                Archivált események ({archivedEvents.length})
              </h3>
              <div className="space-y-3 opacity-60">
                {archivedEvents.map((event) => (
                  <div key={event.id} className="relative flex items-start gap-4">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gray-100 border-2 border-gray-300">
                        {EVENT_TYPE_ICONS[event.event_type]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <EventCard 
                        event={event} 
                        onClick={() => setSelectedEvent(event)}
                        compact
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={showCreateEvent}
        onOpenChange={setShowCreateEvent}
        planId={planId}
      />

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default ActivityPlanTimeline;
