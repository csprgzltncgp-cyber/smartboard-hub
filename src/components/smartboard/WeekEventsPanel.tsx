import { Calendar, Building2, Clock, MapPin, Video, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";

export interface WeekEvent {
  id: string;
  title: string;
  companyName: string;
  companyId: string;
  eventDate: string;
  eventTime?: string;
  eventType: 'workshop' | 'webinar' | 'meeting' | 'health_day' | 'orientation' | 'communication_refresh' | 'other';
  location?: string;
}

interface WeekEventsPanelProps {
  events: WeekEvent[];
}

const getEventTypeLabel = (type: WeekEvent['eventType']) => {
  const labels: Record<WeekEvent['eventType'], string> = {
    workshop: 'Workshop',
    webinar: 'Webinárium',
    meeting: 'Meeting',
    health_day: 'Egészségnap',
    orientation: 'Orientáció',
    communication_refresh: 'Kommunikációs frissítő',
    other: 'Egyéb',
  };
  return labels[type] || type;
};

const getEventTypeIcon = (type: WeekEvent['eventType']) => {
  switch (type) {
    case 'webinar':
      return <Video className="w-4 h-4" />;
    case 'workshop':
    case 'health_day':
      return <Users className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

const WeekEventsPanel = ({ events }: WeekEventsPanelProps) => {
  const navigate = useNavigate();

  return (
    <div id="week-events-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-primary text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <Calendar className="w-6 h-6 md:w-8 md:h-8" />
          Események a héten: {events.length}
        </h2>
        <button
          onClick={() => navigate("/dashboard/my-clients")}
          className="text-cgp-link hover:text-cgp-link-hover hover:underline pb-2 text-sm"
        >
          Activity Plan →
        </button>
      </div>

      {/* Panel Content */}
      <div className="bg-primary/10 p-6 md:p-8">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nincs esemény ezen a héten.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboard/my-clients/${event.companyId}`)}
              >
                {/* Event Type Icon */}
                <div className="bg-primary text-white p-2 rounded-lg">
                  {getEventTypeIcon(event.eventType)}
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-calibri-bold text-foreground">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span>{event.companyName}</span>
                    {event.location && (
                      <>
                        <span className="mx-1">•</span>
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-calibri-bold">
                    {format(parseISO(event.eventDate), "MMM d. (EEEE)", { locale: hu })}
                  </span>
                  {event.eventTime && (
                    <span className="text-muted-foreground">{event.eventTime}</span>
                  )}
                </div>

                {/* Event Type Badge */}
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-calibri-bold flex items-center gap-1">
                  {getEventTypeIcon(event.eventType)}
                  {getEventTypeLabel(event.eventType)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekEventsPanel;
