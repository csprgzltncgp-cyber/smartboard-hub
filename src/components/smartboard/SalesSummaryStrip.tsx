import { Users, FileText, Handshake, PenTool, Calendar, AlertTriangle, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SalesSummaryStripProps {
  leadsCount: number;
  offersCount: number;
  dealsCount: number;
  signedCount: number;
  upcomingMeetingsCount: number;
  expiringContractsCount: number;
  todayTasksCount: number;
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

const SalesSummaryStrip = ({
  leadsCount,
  offersCount,
  dealsCount,
  signedCount,
  upcomingMeetingsCount,
  expiringContractsCount,
  todayTasksCount,
}: SalesSummaryStripProps) => {
  const navigate = useNavigate();
  const goToCrm = () => navigate("/dashboard/crm");

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

        {/* Sor 2: CRM Pipeline */}
        <CategoryRow title="CRM Pipeline" variant="info">
          <SummaryItem
            icon={<Users className="w-5 h-5" />}
            count={leadsCount}
            label="Leadek"
            onClick={goToCrm}
          />
          <SummaryItem
            icon={<FileText className="w-5 h-5" />}
            count={offersCount}
            label="Ajánlatok"
            onClick={goToCrm}
          />
          <SummaryItem
            icon={<Handshake className="w-5 h-5" />}
            count={dealsCount}
            label="Tárgyalások"
            onClick={goToCrm}
          />
          <SummaryItem
            icon={<PenTool className="w-5 h-5" />}
            count={signedCount}
            label="Aláírt"
            onClick={goToCrm}
          />
        </CategoryRow>

        {/* Sor 3: Figyelmeztetések */}
        <CategoryRow title="Figyelmeztetések" variant="warning">
          <SummaryItem
            icon={<Calendar className="w-5 h-5" />}
            count={upcomingMeetingsCount}
            label="Találkozók"
            onClick={() => scrollToElement("upcoming-meetings-panel")}
          />
          <SummaryItem
            icon={<AlertTriangle className="w-5 h-5" />}
            count={expiringContractsCount}
            label="Lejáró szerződés"
            highlight
            onClick={() => scrollToElement("contract-expiring-panel")}
          />
        </CategoryRow>
      </div>
    </div>
  );
};

export default SalesSummaryStrip;