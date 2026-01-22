import { Users, FileText, Handshake, PenTool, Calendar } from "lucide-react";
import { CrmLead } from "@/types/crm";
import { useNavigate } from "react-router-dom";

interface CrmSummaryPanelProps {
  leads: CrmLead[];
  offers: CrmLead[];
  deals: CrmLead[];
  signed: CrmLead[];
  upcomingMeetings: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
  onClick?: () => void;
}

const StatCard = ({ icon, label, count, color, onClick }: StatCardProps) => (
  <div
    onClick={onClick}
    className={`${color} text-white p-6 rounded-xl cursor-pointer hover:opacity-90 transition-opacity flex flex-col items-center justify-center min-w-[140px]`}
  >
    <div className="mb-2">{icon}</div>
    <p className="text-3xl font-calibri-bold">{count}</p>
    <p className="text-sm mt-1 opacity-90">{label}</p>
  </div>
);

const CrmSummaryPanel = ({ 
  leads, 
  offers, 
  deals, 
  signed, 
  upcomingMeetings 
}: CrmSummaryPanelProps) => {
  const navigate = useNavigate();

  const goToCrm = () => navigate("/dashboard/crm");

  return (
    <div className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-primary text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold">
          CRM Összefoglaló
        </h2>
        <button
          onClick={goToCrm}
          className="text-cgp-link hover:text-cgp-link-hover hover:underline pb-2 text-sm"
        >
          Megnyitás a CRM-ben →
        </button>
      </div>

      {/* Panel Content */}
      <div className="bg-primary/10 p-6 md:p-8">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Leadek"
            count={leads.length}
            color="bg-cgp-teal-light"
            onClick={goToCrm}
          />
          <StatCard
            icon={<FileText className="w-8 h-8" />}
            label="Ajánlatok"
            count={offers.length}
            color="bg-cgp-badge-new"
            onClick={goToCrm}
          />
          <StatCard
            icon={<Handshake className="w-8 h-8" />}
            label="Tárgyalások"
            count={deals.length}
            color="bg-cgp-badge-lastday"
            onClick={goToCrm}
          />
          <StatCard
            icon={<PenTool className="w-8 h-8" />}
            label="Aláírt"
            count={signed.length}
            color="bg-cgp-task-completed-purple"
            onClick={goToCrm}
          />
          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            label="Találkozók"
            count={upcomingMeetings}
            color="bg-primary"
            onClick={goToCrm}
          />
        </div>
      </div>
    </div>
  );
};

export default CrmSummaryPanel;
