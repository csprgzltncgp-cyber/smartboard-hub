import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { Clock, MapPin, DollarSign, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ActivityPlanEvent, 
  EVENT_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  MOOD_ICONS,
} from "@/types/activityPlan";

interface EventCardProps {
  event: ActivityPlanEvent;
  onClick?: () => void;
  compact?: boolean;
}

const EventCard = ({ event, onClick, compact }: EventCardProps) => {
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        compact ? 'opacity-70' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Title and type */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>
                {event.title}
              </h4>
              <Badge variant="outline" className="text-xs">
                {event.custom_type_name || EVENT_TYPE_LABELS[event.event_type]}
              </Badge>
            </div>

            {/* Date and time */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span className="font-medium text-foreground">
                {format(new Date(event.event_date), "yyyy. MMMM d. (EEEE)", { locale: hu })}
              </span>
              {event.event_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.event_time.slice(0, 5)}
                </span>
              )}
            </div>

            {/* Meeting specific info */}
            {event.event_type === 'meeting' && (
              <div className="flex items-center gap-4 text-sm mb-2">
                {event.meeting_type && (
                  <Badge variant="secondary" className="text-xs">
                    {event.meeting_type === 'personal' ? '👤 Személyes' : '💻 Online'}
                  </Badge>
                )}
                {event.meeting_location && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {event.meeting_location}
                  </span>
                )}
                {event.meeting_mood && (
                  <span className="text-lg" title={`Hangulat: ${event.meeting_mood}`}>
                    {MOOD_ICONS[event.meeting_mood]}
                  </span>
                )}
              </div>
            )}

            {/* Description preview */}
            {event.description && !compact && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Right side badges */}
          <div className="flex flex-col items-end gap-2">
            {/* Status */}
            <Badge className={STATUS_COLORS[event.status]}>
              {STATUS_LABELS[event.status]}
            </Badge>

            {/* Price/Free */}
            <Badge variant={event.is_free ? "secondary" : "outline"} className="text-xs">
              {event.is_free ? (
                "🎁 Ingyenes"
              ) : event.price ? (
                <>
                  <DollarSign className="w-3 h-3 mr-1" />
                  {event.price.toLocaleString('hu-HU')} Ft
                </>
              ) : (
                "Fizetős"
              )}
            </Badge>

            {/* Notes indicator */}
            {event.notes && (
              <FileText className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
