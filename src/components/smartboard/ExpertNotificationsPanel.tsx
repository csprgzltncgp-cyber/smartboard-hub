import { Bell, User, Eye, EyeOff, Calendar } from "lucide-react";
import { ExpertNotification } from "@/data/operativeMockData";
import { useNavigate } from "react-router-dom";

interface ExpertNotificationsPanelProps {
  notifications: ExpertNotification[];
}

const ExpertNotificationsPanel = ({ notifications }: ExpertNotificationsPanelProps) => {
  const navigate = useNavigate();

  const totalUnread = notifications.reduce((sum, n) => sum + n.unreadCount, 0);
  const totalSent = notifications.reduce((sum, n) => sum + n.totalSent, 0);

  if (notifications.length === 0) return null;

  return (
    <div id="notifications-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-teal text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <Bell className="w-6 h-6 md:w-8 md:h-8" />
          Értesítések statisztika
        </h2>
        <div className="flex items-center gap-4 pb-2 text-sm">
          <span className="text-muted-foreground">
            Összesen: <span className="font-calibri-bold">{totalSent}</span> küldött
          </span>
          <span className="text-cgp-badge-overdue font-calibri-bold">
            {totalUnread} olvasatlan
          </span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-teal/20 p-6 md:p-8">
        <div className="space-y-3">
          {notifications.map((notification) => {
            const readPercent = Math.round((notification.readCount / notification.totalSent) * 100);
            
            return (
              <div
                key={notification.id}
                className="flex flex-wrap items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
                onClick={() => navigate("/dashboard/experts")}
              >
                {/* Icon */}
                <div className="bg-cgp-teal text-white p-2 rounded-lg">
                  <User className="w-5 h-5" />
                </div>

                {/* Expert Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-calibri-bold text-foreground">{notification.expertName}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Utolsó aktivitás: {notification.lastActivity}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cgp-badge-new" />
                    <span className="font-calibri-bold text-cgp-badge-new">{notification.readCount}</span>
                    <span className="text-muted-foreground">olvasott</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-cgp-badge-overdue" />
                    <span className="font-calibri-bold text-cgp-badge-overdue">{notification.unreadCount}</span>
                    <span className="text-muted-foreground">olvasatlan</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-32">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cgp-badge-new rounded-full transition-all"
                      style={{ width: `${readPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-1">{readPercent}% olvasott</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpertNotificationsPanel;
