import { Brain, Gift, Briefcase, Building2, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";

export interface UpcomingActivity {
  id: string;
  title: string;
  companyName: string;
  companyId?: string;
  scheduledDate: string;
  participantsCount?: number;
}

interface UpcomingActivityPanelProps {
  type: 'psycho-risk' | 'prize-game' | 'breakfast';
  items: UpcomingActivity[];
}

const getPanelConfig = (type: UpcomingActivityPanelProps['type']) => {
  switch (type) {
    case 'psycho-risk':
      return {
        id: 'psycho-risk-panel',
        title: 'Pszichoszociális kockázatfelmérés',
        icon: Brain,
        color: 'bg-cgp-teal',
        bgColor: 'bg-cgp-teal/20',
        emptyMessage: 'Nincs közelgő kockázatfelmérés.',
      };
    case 'prize-game':
      return {
        id: 'prize-game-panel',
        title: 'Nyereményjáték',
        icon: Gift,
        color: 'bg-cgp-teal-light',
        bgColor: 'bg-cgp-teal-light/20',
        emptyMessage: 'Nincs aktív nyereményjáték.',
      };
    case 'breakfast':
      return {
        id: 'breakfast-panel',
        title: 'Business Breakfast',
        icon: Briefcase,
        color: 'bg-cgp-badge-new',
        bgColor: 'bg-cgp-badge-new/20',
        emptyMessage: 'Nincs aktuális Business Breakfast.',
      };
  }
};

const UpcomingActivityPanel = ({ type, items }: UpcomingActivityPanelProps) => {
  const navigate = useNavigate();
  const config = getPanelConfig(type);
  const Icon = config.icon;

  return (
    <div id={config.id} className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className={`${config.color} text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3`}>
          <Icon className="w-6 h-6 md:w-8 md:h-8" />
          {config.title}: {items.length}
        </h2>
      </div>

      {/* Panel Content */}
      <div className={`${config.bgColor} p-6 md:p-8`}>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {config.emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => item.companyId ? navigate(`/dashboard/my-clients/${item.companyId}`) : navigate("/dashboard/my-clients")}
              >
                {/* Icon */}
                <div className={`${config.color} text-white p-2 rounded-lg`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-calibri-bold text-foreground">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span>{item.companyName}</span>
                  </div>
                </div>

                {/* Participants (for breakfast) */}
                {type === 'breakfast' && item.participantsCount !== undefined && (
                  <div className="flex items-center gap-2 text-sm bg-cgp-badge-new/20 text-cgp-badge-new px-3 py-1 rounded-lg font-medium">
                    <Users className="w-4 h-4" />
                    {item.participantsCount} jelentkező
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-calibri-bold">
                    {format(parseISO(item.scheduledDate), "yyyy. MMM d.", { locale: hu })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingActivityPanel;
