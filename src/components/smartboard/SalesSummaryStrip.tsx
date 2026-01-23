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
}

const SummaryItem = ({ icon, count, label, onClick }: SummaryItemProps) => (
  <div 
    className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
    onClick={onClick}
  >
    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-calibri-bold leading-none">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

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
      <div className="flex flex-wrap items-center justify-between gap-6">
        <SummaryItem
          icon={<CheckSquare className="w-5 h-5" />}
          count={todayTasksCount}
          label="Mai feladatok"
          onClick={() => scrollToElement("today-tasks-panel")}
        />
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
        <div className="h-10 w-px bg-border" />
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
          onClick={() => scrollToElement("contract-expiring-panel")}
        />
      </div>
    </div>
  );
};

export default SalesSummaryStrip;
