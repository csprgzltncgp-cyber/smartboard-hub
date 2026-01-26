import { TrendingUp, TrendingDown, Building2, AlertTriangle, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface UsageAlertClient {
  id: string;
  companyName: string;
  country: string;
  usagePercent: number;
  contractLimit: number;
  currentUsage: number;
}

interface UsageAlertPanelProps {
  clients: UsageAlertClient[];
  type: 'high' | 'low';
}

const UsageAlertPanel = ({ clients, type }: UsageAlertPanelProps) => {
  const navigate = useNavigate();
  const isHigh = type === 'high';

  const headerColor = isHigh ? "bg-cgp-badge-overdue" : "bg-cgp-badge-lastday";
  const headerBg = isHigh ? "bg-cgp-badge-overdue/20" : "bg-cgp-badge-lastday/20";
  const iconColor = isHigh ? "bg-cgp-badge-overdue" : "bg-cgp-badge-lastday";

  return (
    <div id={isHigh ? "high-usage-panel" : "low-usage-panel"} className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className={`${headerColor} text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3`}>
          {isHigh ? (
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />
          ) : (
            <TrendingDown className="w-6 h-6 md:w-8 md:h-8" />
          )}
          {isHigh ? "Túl magas igénybevétel" : "Túl alacsony igénybevétel"}: {clients.length}
        </h2>
        <button
          onClick={() => navigate("/dashboard/my-clients")}
          className="text-cgp-link hover:text-cgp-link-hover hover:underline pb-2 text-sm"
        >
          Részletek →
        </button>
      </div>

      {/* Panel Content */}
      <div className={`${headerBg} p-6 md:p-8`}>
        {clients.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nincs {isHigh ? "kritikusan magas" : "aggasztóan alacsony"} igénybevételű ügyfél.
          </p>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("/dashboard/my-clients")}
              >
                {/* Company Icon */}
                <div className={`${iconColor} text-white p-2 rounded-lg`}>
                  <Building2 className="w-5 h-5" />
                </div>

                {/* Company Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-calibri-bold text-foreground">
                    {client.companyName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{client.country}</span>
                    <span className="mx-1">•</span>
                    <span>Használat: {client.currentUsage} / {client.contractLimit}</span>
                  </div>
                </div>

                {/* Usage Badge */}
                <div className={`${iconColor} text-white px-4 py-2 flex items-center gap-2 font-calibri-bold`}>
                  <Percent className="w-4 h-4" />
                  {client.usagePercent}%
                </div>

                {/* Alert Icon */}
                <AlertTriangle className={`w-5 h-5 ${isHigh ? 'text-cgp-badge-overdue' : 'text-cgp-badge-lastday'}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageAlertPanel;
