import { AlertTriangle, Sparkles, Phone, Mail, User, FileText, Link2 } from "lucide-react";
import { FraudSuspicion } from "@/data/operativeMockData";
import { useNavigate } from "react-router-dom";

interface FraudSuspicionPanelProps {
  suspicions: FraudSuspicion[];
}

const getMatchIcon = (matchType: string) => {
  switch (matchType) {
    case 'phone': return Phone;
    case 'email': return Mail;
    case 'name': return User;
    default: return Link2;
  }
};

const getMatchLabel = (matchType: string) => {
  switch (matchType) {
    case 'phone': return 'Egyező telefonszám';
    case 'email': return 'Egyező email cím';
    case 'name': return 'Egyező név';
    default: return 'Egyezés';
  }
};

const FraudSuspicionPanel = ({ suspicions }: FraudSuspicionPanelProps) => {
  const navigate = useNavigate();

  if (suspicions.length === 0) return null;

  return (
    <div id="fraud-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-badge-overdue text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 md:w-8 md:h-8" />
          Visszaélés gyanú: {suspicions.length}
        </h2>
        <div className="flex items-center gap-2 pb-2 text-sm text-cgp-teal-light">
          <Sparkles className="w-4 h-4" />
          <span>AI elemzés</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-badge-overdue/20 p-6 md:p-8">
        <div className="space-y-3">
          {suspicions.map((item) => {
            const MatchIcon = getMatchIcon(item.matchType);
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-cgp-badge-overdue/30"
                onClick={() => navigate("/dashboard/all-cases")}
              >
                {/* Risk Level Icon */}
                <div className={`p-2 rounded-lg ${item.riskLevel === 'high' ? 'bg-cgp-badge-overdue text-white' : 'bg-cgp-badge-lastday text-white'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>

                {/* Case Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <p className="font-calibri-bold text-foreground">{item.caseNumber}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.riskLevel === 'high' ? 'bg-cgp-badge-overdue text-white' : 'bg-cgp-badge-lastday text-white'}`}>
                      {item.riskLevel === 'high' ? 'Magas kockázat' : 'Közepes kockázat'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.clientName}</p>
                </div>

                {/* Match Type */}
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-lg">
                  <MatchIcon className="w-4 h-4 text-cgp-badge-overdue" />
                  <span>{getMatchLabel(item.matchType)}</span>
                </div>

                {/* Matched Cases */}
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Kapcsolódó esetek:</span>{" "}
                  {item.matchedCases.join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FraudSuspicionPanel;
