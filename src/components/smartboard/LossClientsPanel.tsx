import { AlertTriangle, Building2, TrendingDown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface LossReason {
  reason: string;
  amount: number;
}

export interface LossClient {
  id: string;
  companyName: string;
  country: string;
  totalLoss: number;
  reasons: LossReason[];
  aiAnalysis?: string;
}

interface LossClientsPanelProps {
  clients: LossClient[];
}

const LossClientsPanel = ({ clients }: LossClientsPanelProps) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div id="loss-clients-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-task-completed-purple text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <TrendingDown className="w-6 h-6 md:w-8 md:h-8" />
          Veszteséget okozó ügyfelek: {clients.length}
        </h2>
        <div className="flex items-center gap-2 pb-2 text-sm text-cgp-teal-light">
          <Sparkles className="w-4 h-4" />
          <span>AI elemzés</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-task-completed-purple/20 p-6 md:p-8">
        {clients.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nincs veszteséget okozó ügyfél. 🎉
          </p>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("/dashboard/my-clients")}
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {/* Company Icon */}
                  <div className="bg-cgp-task-completed-purple text-white p-2 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-calibri-bold text-foreground">
                      {client.companyName}
                    </p>
                    <p className="text-sm text-muted-foreground">{client.country}</p>
                  </div>

                  {/* Total Loss */}
                  <div className="bg-cgp-badge-overdue text-white px-4 py-2 flex items-center gap-2 font-calibri-bold">
                    <AlertTriangle className="w-4 h-4" />
                    {formatCurrency(client.totalLoss)}
                  </div>
                </div>

                {/* Loss Reasons */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
                  {client.reasons.map((reason, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
                      <span className="text-muted-foreground">{reason.reason}:</span>
                      <span className="font-medium ml-1">{formatCurrency(reason.amount)}</span>
                    </div>
                  ))}
                </div>

                {/* AI Analysis */}
                {client.aiAnalysis && (
                  <div className="bg-cgp-teal/5 border border-cgp-teal/20 rounded-lg p-3 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-cgp-teal-light mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{client.aiAnalysis}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LossClientsPanel;
