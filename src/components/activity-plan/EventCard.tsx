import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { Clock, MapPin, DollarSign, FileText, Gift, User, Monitor, SmilePlus, Smile, Meh, Frown, Angry } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ActivityPlanEvent, 
  EVENT_TYPE_LABELS,
  MeetingMood,
} from "@/types/activityPlan";

// Map mood to Lucide icons
const MoodIcons: Record<MeetingMood, React.ComponentType<{ className?: string }>> = {
  very_positive: SmilePlus,
  positive: Smile,
  neutral: Meh,
  negative: Frown,
  very_negative: Angry,
};

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
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    {event.meeting_type === 'personal' ? (
                      <><User className="w-3 h-3" /> Személyes</>
                    ) : (
                      <><Monitor className="w-3 h-3" /> Online</>
                    )}
                  </Badge>
                )}
                {event.meeting_location && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {event.meeting_location}
                  </span>
                )}
                {event.meeting_mood && (() => {
                  const MoodIcon = MoodIcons[event.meeting_mood];
                  return <MoodIcon className="w-5 h-5" />;
                })()}
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

            {/* Price/Free */}
            <Badge 
              variant="outline" 
              className={`text-xs flex items-center gap-1 ${event.is_free ? 'bg-cgp-badge-new/20 text-foreground border-cgp-badge-new' : ''}`}
            >
              {event.is_free ? (
                <><Gift className="w-3 h-3" /> Ingyenes</>
              ) : event.price ? (
                <>
                  <DollarSign className="w-3 h-3" />
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
