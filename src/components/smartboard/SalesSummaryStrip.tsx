import { Users, FileText, Handshake, PenTool, Calendar, AlertTriangle } from "lucide-react";

interface SalesSummaryStripProps {
  leadsCount: number;
  offersCount: number;
  dealsCount: number;
  signedCount: number;
  upcomingMeetingsCount: number;
  expiringContractsCount: number;
}

interface SummaryItemProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  color: string;
}

const SummaryItem = ({ icon, count, label, color }: SummaryItemProps) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-calibri-bold leading-none">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

const SalesSummaryStrip = ({
  leadsCount,
  offersCount,
  dealsCount,
  signedCount,
  upcomingMeetingsCount,
  expiringContractsCount,
}: SalesSummaryStripProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <SummaryItem
          icon={<Users className="w-5 h-5 text-white" />}
          count={leadsCount}
          label="Leadek"
          color="bg-cgp-teal-light"
        />
        <SummaryItem
          icon={<FileText className="w-5 h-5 text-white" />}
          count={offersCount}
          label="Ajánlatok"
          color="bg-cgp-badge-new"
        />
        <SummaryItem
          icon={<Handshake className="w-5 h-5 text-white" />}
          count={dealsCount}
          label="Tárgyalások"
          color="bg-cgp-badge-lastday"
        />
        <SummaryItem
          icon={<PenTool className="w-5 h-5 text-white" />}
          count={signedCount}
          label="Aláírt"
          color="bg-cgp-task-completed-purple"
        />
        <div className="h-10 w-px bg-border" />
        <SummaryItem
          icon={<Calendar className="w-5 h-5 text-white" />}
          count={upcomingMeetingsCount}
          label="Találkozók"
          color="bg-primary"
        />
        <SummaryItem
          icon={<AlertTriangle className="w-5 h-5 text-white" />}
          count={expiringContractsCount}
          label="Lejáró szerződés"
          color="bg-cgp-badge-overdue"
        />
      </div>
    </div>
  );
};

export default SalesSummaryStrip;
