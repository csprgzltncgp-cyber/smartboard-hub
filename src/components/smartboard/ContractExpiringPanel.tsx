import { AlertTriangle, Building2, Calendar, MapPin } from "lucide-react";
import { ContractExpiringCompany } from "@/types/smartboard";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";

interface ContractExpiringPanelProps {
  contracts: ContractExpiringCompany[];
}

const ContractExpiringPanel = ({ contracts }: ContractExpiringPanelProps) => {
  const getUrgencyColor = (days: number) => {
    if (days <= 7) return "bg-cgp-badge-overdue"; // Red - critical
    if (days <= 14) return "bg-cgp-badge-lastday"; // Orange - warning
    return "bg-cgp-badge-new"; // Green - upcoming
  };

  const getUrgencyText = (days: number) => {
    if (days <= 0) return "LEJÁRT!";
    if (days === 1) return "1 nap";
    return `${days} nap`;
  };

  return (
    <div id="contract-expiring-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-badge-lastday text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 md:w-8 md:h-8" />
          Szerződés lejár: {contracts.length}
        </h2>
        <div className="text-cgp-teal-light text-sm flex items-center gap-1 pb-2">
          <span className="hidden sm:inline">30 napon belül</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-badge-lastday/20 p-6 md:p-8">
        {contracts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nincs lejáró szerződés a következő 30 napban.
          </p>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Company Icon */}
                <div className="bg-cgp-teal text-white p-2 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>

                {/* Company Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-calibri-bold text-foreground">
                    {contract.companyName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{contract.country}</span>
                    <span className="mx-1">•</span>
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(parseISO(contract.contractEndDate), "yyyy. MMM d.", { locale: hu })}
                    </span>
                  </div>
                </div>

                {/* Countdown Badge */}
                <div
                  className={`${getUrgencyColor(contract.daysUntilExpiry)} text-white px-4 py-2 flex items-center gap-2 font-calibri-bold`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {getUrgencyText(contract.daysUntilExpiry)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractExpiringPanel;
