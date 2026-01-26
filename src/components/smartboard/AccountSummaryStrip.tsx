import { CheckSquare, Building2, TrendingUp, TrendingDown, AlertTriangle, Calendar, Gift, Brain, Briefcase } from "lucide-react";

interface AccountSummaryStripProps {
  todayTasksCount: number;
  incomingClientsCount: number;
  highUsageCount: number;
  lowUsageCount: number;
  lossClientsCount: number;
  weekEventsCount: number;
  psychoRiskCount: number;
  prizeGameCount: number;
  breakfastCount: number;
}

interface SummaryItemProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  onClick?: () => void;
  highlight?: boolean;
}

const SummaryItem = ({ icon, count, label, onClick, highlight }: SummaryItemProps) => (
  <div 
    className={`flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity ${highlight && count > 0 ? 'text-cgp-badge-overdue' : ''}`}
    onClick={onClick}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${highlight && count > 0 ? 'bg-cgp-badge-overdue/20 text-cgp-badge-overdue' : 'bg-muted text-muted-foreground'}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-calibri-bold leading-none">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

interface CategoryRowProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'info';
}

const CategoryRow = ({ title, children, variant = 'default' }: CategoryRowProps) => {
  const borderColor = variant === 'warning' ? 'border-l-cgp-badge-overdue' : 
                      variant === 'info' ? 'border-l-cgp-teal-light' : 
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

const AccountSummaryStrip = ({
  todayTasksCount,
  incomingClientsCount,
  highUsageCount,
  lowUsageCount,
  lossClientsCount,
  weekEventsCount,
  psychoRiskCount,
  prizeGameCount,
  breakfastCount,
}: AccountSummaryStripProps) => {
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
          <SummaryItem
            icon={<Building2 className="w-5 h-5" />}
            count={incomingClientsCount}
            label="Új érkező"
            onClick={() => scrollToElement("incoming-clients-panel")}
          />
        </CategoryRow>

        {/* Sor 2: Figyelmeztetések */}
        <CategoryRow title="Figyelmeztetések" variant="warning">
          <SummaryItem
            icon={<TrendingUp className="w-5 h-5" />}
            count={highUsageCount}
            label="Magas igénybevétel"
            highlight
            onClick={() => scrollToElement("high-usage-panel")}
          />
          <SummaryItem
            icon={<TrendingDown className="w-5 h-5" />}
            count={lowUsageCount}
            label="Alacsony igénybevétel"
            highlight
            onClick={() => scrollToElement("low-usage-panel")}
          />
          <SummaryItem
            icon={<AlertTriangle className="w-5 h-5" />}
            count={lossClientsCount}
            label="Veszteség"
            highlight
            onClick={() => scrollToElement("loss-clients-panel")}
          />
        </CategoryRow>

        {/* Sor 3: Események & Tevékenységek */}
        <CategoryRow title="Események & Tevékenységek" variant="info">
          <SummaryItem
            icon={<Calendar className="w-5 h-5" />}
            count={weekEventsCount}
            label="Heti események"
            onClick={() => scrollToElement("week-events-panel")}
          />
          <SummaryItem
            icon={<Brain className="w-5 h-5" />}
            count={psychoRiskCount}
            label="Kockázatfelmérés"
            onClick={() => scrollToElement("psycho-risk-panel")}
          />
          <SummaryItem
            icon={<Gift className="w-5 h-5" />}
            count={prizeGameCount}
            label="Nyereményjáték"
            onClick={() => scrollToElement("prize-game-panel")}
          />
          <SummaryItem
            icon={<Briefcase className="w-5 h-5" />}
            count={breakfastCount}
            label="Business Breakfast"
            onClick={() => scrollToElement("breakfast-panel")}
          />
        </CategoryRow>
      </div>
    </div>
  );
};

export default AccountSummaryStrip;