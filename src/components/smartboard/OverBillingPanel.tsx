import { AlertTriangle, Sparkles, User, FileText, TrendingUp } from "lucide-react";
import { OverBilling } from "@/data/operativeMockData";
import { useNavigate } from "react-router-dom";

interface OverBillingPanelProps {
  items: OverBilling[];
  type: 'billing' | 'fees';
}

const formatAmount = (amount: number, currency: string) => {
  if (currency === 'HUF') {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  }
  return `€${amount.toLocaleString('hu-HU')}`;
};

const OverBillingPanel = ({ items, type }: OverBillingPanelProps) => {
  const navigate = useNavigate();
  const isBilling = type === 'billing';
  const title = isBilling ? 'Túl magas számlázás' : 'Túl magas díjazás';
  const panelId = isBilling ? 'overbilling-panel' : 'high-fees-panel';

  if (items.length === 0) return null;

  return (
    <div id={panelId} className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-badge-lastday text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />
          {title}: {items.length}
        </h2>
        <div className="flex items-center gap-2 pb-2 text-sm text-cgp-teal-light">
          <Sparkles className="w-4 h-4" />
          <span>AI elemzés</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-badge-lastday/20 p-6 md:p-8">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
              onClick={() => navigate("/dashboard/experts")}
            >
              {/* Icon */}
              <div className="bg-cgp-badge-lastday text-white p-2 rounded-lg">
                <User className="w-5 h-5" />
              </div>

              {/* Expert Info */}
              <div className="flex-1 min-w-[200px]">
                <p className="font-calibri-bold text-foreground">{item.expertName}</p>
                {item.caseNumber !== 'N/A' && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FileText className="w-3 h-3" />
                    <span>{item.caseNumber}</span>
                  </div>
                )}
              </div>

              {/* Amounts */}
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Számlázott</p>
                  <p className="font-calibri-bold text-cgp-badge-overdue">
                    {formatAmount(item.billedAmount, item.currency)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Elvárt</p>
                  <p className="font-calibri-bold">
                    {formatAmount(item.expectedAmount, item.currency)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Eltérés</p>
                  <p className="font-calibri-bold text-cgp-badge-overdue">
                    +{formatAmount(item.difference, item.currency)}
                  </p>
                </div>
              </div>

              {/* Warning Icon */}
              <AlertTriangle className="w-5 h-5 text-cgp-badge-lastday" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverBillingPanel;
