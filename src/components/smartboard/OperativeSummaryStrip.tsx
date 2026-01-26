import { 
  CheckSquare, 
  UserX, 
  Clock, 
  XCircle, 
  Calendar,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  Bell,
  Search
} from "lucide-react";

interface OperativeSummaryStripProps {
  todayTasksCount: number;
  notDispatchedCount: number;
  warning24hCount: number;
  warning5dayCount: number;
  rejectedCount: number;
  month2Count: number;
  month3Count: number;
  fraudSuspicionCount: number;
  overBillingCount: number;
  lowPSICount: number;
  workshopLowRatingCount: number;
  unreadNotificationsCount: number;
  unansweredFeedbackCount: number;
  overdueSearchCount: number;
}

interface SummaryItemProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  onClick?: () => void;
  highlight?: boolean;
  isAI?: boolean;
}

const SummaryItem = ({ icon, count, label, onClick, highlight, isAI }: SummaryItemProps) => (
  <div 
    className={`flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity ${highlight && count > 0 ? 'text-cgp-badge-overdue' : ''}`}
    onClick={onClick}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${highlight && count > 0 ? 'bg-cgp-badge-overdue/20 text-cgp-badge-overdue' : 'bg-muted text-muted-foreground'}`}>
      {icon}
    </div>
    <div>
      <div className="flex items-center gap-1">
        <p className="text-2xl font-calibri-bold leading-none">{count}</p>
        {isAI && <Sparkles className="w-3 h-3 text-cgp-teal-light" />}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

interface CategoryRowProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'info' | 'ai';
}

const CategoryRow = ({ title, children, variant = 'default' }: CategoryRowProps) => {
  const borderColor = variant === 'warning' ? 'border-l-cgp-badge-overdue' : 
                      variant === 'info' ? 'border-l-cgp-teal-light' : 
                      variant === 'ai' ? 'border-l-cgp-task-completed-purple' :
                      'border-l-primary';
  
  return (
    <div className={`border-l-4 ${borderColor} pl-4`}>
      <p className="text-xs uppercase text-muted-foreground font-medium mb-3 tracking-wide">{title}</p>
      <div className="flex flex-wrap items-center gap-6">
        {children}
      </div>
    </div>
  );
};

const scrollToElement = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const OperativeSummaryStrip = ({
  todayTasksCount,
  notDispatchedCount,
  warning24hCount,
  warning5dayCount,
  rejectedCount,
  month2Count,
  month3Count,
  fraudSuspicionCount,
  overBillingCount,
  lowPSICount,
  workshopLowRatingCount,
  unreadNotificationsCount,
  unansweredFeedbackCount,
  overdueSearchCount,
}: OperativeSummaryStripProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <div className="space-y-6">
        {/* Sor 1: Alapok */}
        <CategoryRow title="Alapok">
          <SummaryItem
            icon={<CheckSquare className="w-5 h-5" />}
            count={todayTasksCount}
            label="Mai feladatok"
            onClick={() => scrollToElement("today-tasks-panel")}
          />
        </CategoryRow>

        {/* Sor 2: Eset figyelmeztetések */}
        <CategoryRow title="Eset figyelmeztetések" variant="warning">
          <SummaryItem
            icon={<UserX className="w-5 h-5" />}
            count={notDispatchedCount}
            label="Kiközvetítetlen"
            highlight
            onClick={() => scrollToElement("case-warnings-panel")}
          />
          <SummaryItem
            icon={<Clock className="w-5 h-5" />}
            count={warning24hCount}
            label="24 óra!"
            highlight
            onClick={() => scrollToElement("case-warnings-panel")}
          />
          <SummaryItem
            icon={<Clock className="w-5 h-5" />}
            count={warning5dayCount}
            label="5 nap!"
            highlight
            onClick={() => scrollToElement("case-warnings-panel")}
          />
          <SummaryItem
            icon={<XCircle className="w-5 h-5" />}
            count={rejectedCount}
            label="Elutasított"
            highlight
            onClick={() => scrollToElement("case-warnings-panel")}
          />
          <SummaryItem
            icon={<Calendar className="w-5 h-5" />}
            count={month2Count}
            label="2 hónap+"
            highlight={month2Count > 0}
            onClick={() => scrollToElement("case-warnings-panel")}
          />
          <SummaryItem
            icon={<Calendar className="w-5 h-5" />}
            count={month3Count}
            label="3 hónap+"
            highlight
            onClick={() => scrollToElement("case-warnings-panel")}
          />
        </CategoryRow>

        {/* Sor 3: AI / Minőség */}
        <CategoryRow title="Minőség & AI elemzés" variant="ai">
          <SummaryItem
            icon={<AlertTriangle className="w-5 h-5" />}
            count={fraudSuspicionCount}
            label="Visszaélés gyanú"
            highlight
            isAI
            onClick={() => scrollToElement("fraud-panel")}
          />
          <SummaryItem
            icon={<AlertTriangle className="w-5 h-5" />}
            count={overBillingCount}
            label="Túlszámlázás"
            highlight={overBillingCount > 0}
            isAI
            onClick={() => scrollToElement("overbilling-panel")}
          />
          <SummaryItem
            icon={<AlertTriangle className="w-5 h-5" />}
            count={lowPSICount}
            label="Alacsony PSI"
            highlight={lowPSICount > 0}
            isAI
            onClick={() => scrollToElement("low-psi-panel")}
          />
          <SummaryItem
            icon={<MessageSquare className="w-5 h-5" />}
            count={workshopLowRatingCount}
            label="Rossz workshop"
            highlight={workshopLowRatingCount > 0}
            onClick={() => scrollToElement("workshop-feedback-panel")}
          />
        </CategoryRow>

        {/* Sor 4: Egyéb */}
        <CategoryRow title="Kommunikáció & Keresés" variant="info">
          <SummaryItem
            icon={<Bell className="w-5 h-5" />}
            count={unreadNotificationsCount}
            label="Olvasatlan értesítés"
            onClick={() => scrollToElement("notifications-panel")}
          />
          <SummaryItem
            icon={<MessageSquare className="w-5 h-5" />}
            count={unansweredFeedbackCount}
            label="Megválaszolatlan feedback"
            highlight={unansweredFeedbackCount > 0}
            onClick={() => scrollToElement("eap-feedback-panel")}
          />
          <SummaryItem
            icon={<Search className="w-5 h-5" />}
            count={overdueSearchCount}
            label="Keresés lejárt"
            highlight
            onClick={() => scrollToElement("search-deadline-panel")}
          />
        </CategoryRow>
      </div>
    </div>
  );
};

export default OperativeSummaryStrip;
