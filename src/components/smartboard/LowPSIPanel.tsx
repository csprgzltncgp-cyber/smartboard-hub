import { TrendingDown, Sparkles, User, Star, AlertTriangle } from "lucide-react";
import { LowPSI } from "@/data/operativeMockData";
import { useNavigate } from "react-router-dom";

interface LowPSIPanelProps {
  experts: LowPSI[];
}

const LowPSIPanel = ({ experts }: LowPSIPanelProps) => {
  const navigate = useNavigate();

  if (experts.length === 0) return null;

  return (
    <div id="low-psi-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-task-completed-purple text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <TrendingDown className="w-6 h-6 md:w-8 md:h-8" />
          Alacsony PSI indexek: {experts.length}
        </h2>
        <div className="flex items-center gap-2 pb-2 text-sm text-cgp-teal-light">
          <Sparkles className="w-4 h-4" />
          <span>AI elemzés</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-task-completed-purple/20 p-6 md:p-8">
        <div className="space-y-3">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="flex flex-wrap items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
              onClick={() => navigate("/dashboard/experts")}
            >
              {/* Icon */}
              <div className="bg-cgp-task-completed-purple text-white p-2 rounded-lg">
                <User className="w-5 h-5" />
              </div>

              {/* Expert Info */}
              <div className="flex-1 min-w-[200px]">
                <p className="font-calibri-bold text-foreground">{expert.expertName}</p>
                <p className="text-sm text-muted-foreground">
                  {expert.feedbackCount} feedback alapján
                </p>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-cgp-badge-lastday fill-cgp-badge-lastday" />
                <span className="text-2xl font-calibri-bold text-cgp-badge-overdue">
                  {expert.averageScore.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
              </div>

              {/* Trend */}
              <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                expert.recentTrend === 'declining' 
                  ? 'bg-cgp-badge-overdue/20 text-cgp-badge-overdue' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {expert.recentTrend === 'declining' ? (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    <span>Romló</span>
                  </>
                ) : (
                  <span>Stabil</span>
                )}
              </div>

              {/* Warning */}
              {expert.averageScore < 3.0 && (
                <AlertTriangle className="w-5 h-5 text-cgp-badge-overdue" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LowPSIPanel;
