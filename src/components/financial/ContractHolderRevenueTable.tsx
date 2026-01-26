import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/data/financialMockData";
import { CONTRACT_HOLDER_LABELS, CONTRACT_HOLDER_COLORS, ContractHolderType } from "@/types/financial";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ContractHolderRevenueTableProps {
  revenues: Array<{
    id: string;
    year: number;
    month: number;
    contract_holder: ContractHolderType;
    revenue: number;
    consultation_count: number;
    consultation_cost: number;
    currency: string;
  }> | undefined;
  year: number;
  month?: number;
}

// Mock company data for each contract holder (in real app, this would come from database)
const MOCK_COMPANIES: Record<ContractHolderType, Array<{ name: string; revenueShare: number }>> = {
  cgp_europe: [
    { name: "Richter Gedeon Nyrt.", revenueShare: 0.25 },
    { name: "MOL Magyar Olaj- és Gázipari Nyrt.", revenueShare: 0.22 },
    { name: "OTP Bank Nyrt.", revenueShare: 0.18 },
    { name: "Magyar Telekom Nyrt.", revenueShare: 0.15 },
    { name: "Bosch Magyarország", revenueShare: 0.12 },
    { name: "Egyéb cégek", revenueShare: 0.08 },
  ],
  telus: [
    { name: "Audi Hungaria Zrt.", revenueShare: 0.30 },
    { name: "Mercedes-Benz Manufacturing Hungary Kft.", revenueShare: 0.28 },
    { name: "Samsung SDI Magyarország Zrt.", revenueShare: 0.22 },
    { name: "Egyéb cégek", revenueShare: 0.20 },
  ],
  telus_wpo: [
    { name: "Continental Automotive Hungary Kft.", revenueShare: 0.35 },
    { name: "Knorr-Bremse Fékrendszerek Kft.", revenueShare: 0.30 },
    { name: "Egyéb cégek", revenueShare: 0.35 },
  ],
  compsych: [
    { name: "IBM Magyarország Kft.", revenueShare: 0.40 },
    { name: "Microsoft Magyarország Kft.", revenueShare: 0.35 },
    { name: "Egyéb cégek", revenueShare: 0.25 },
  ],
};

type SortDirection = "asc" | "desc";

const ContractHolderRevenueTable = ({ revenues, year, month }: ContractHolderRevenueTableProps) => {
  const [expandedHolders, setExpandedHolders] = useState<Set<ContractHolderType>>(new Set());
  const [sortDirection, setSortDirection] = useState<Record<ContractHolderType, SortDirection>>({
    cgp_europe: "desc",
    telus: "desc",
    telus_wpo: "desc",
    compsych: "desc",
  });

  // Aggregate revenue by contract holder
  const revenueByHolder = useMemo(() => {
    if (!revenues) return {};
    
    const result: Record<ContractHolderType, number> = {
      cgp_europe: 0,
      telus: 0,
      telus_wpo: 0,
      compsych: 0,
    };

    revenues.forEach(r => {
      result[r.contract_holder] += Number(r.revenue);
    });

    return result;
  }, [revenues]);

  // Get sorted company details for a contract holder
  const getCompanyDetails = (holder: ContractHolderType) => {
    const totalRevenue = revenueByHolder[holder] || 0;
    const companies = MOCK_COMPANIES[holder].map(c => ({
      ...c,
      revenue: Math.round(totalRevenue * c.revenueShare),
    }));

    const direction = sortDirection[holder];
    return companies.sort((a, b) => 
      direction === "desc" ? b.revenue - a.revenue : a.revenue - b.revenue
    );
  };

  const toggleExpand = (holder: ContractHolderType) => {
    const newExpanded = new Set(expandedHolders);
    if (newExpanded.has(holder)) {
      newExpanded.delete(holder);
    } else {
      newExpanded.add(holder);
    }
    setExpandedHolders(newExpanded);
  };

  const toggleSort = (holder: ContractHolderType) => {
    setSortDirection(prev => ({
      ...prev,
      [holder]: prev[holder] === "desc" ? "asc" : "desc",
    }));
  };

  // Sort contract holders by revenue
  const sortedHolders = useMemo(() => {
    return (Object.keys(revenueByHolder) as ContractHolderType[])
      .filter(holder => revenueByHolder[holder] > 0)
      .sort((a, b) => revenueByHolder[b] - revenueByHolder[a]);
  }, [revenueByHolder]);

  if (sortedHolders.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Bevétel összesítő táblázat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg font-medium text-sm text-muted-foreground">
            <div className="col-span-6">Contract Holder</div>
            <div className="col-span-3 text-right">Bevétel</div>
            <div className="col-span-3 text-right">Arány</div>
          </div>

          {/* Contract Holder Rows */}
          {sortedHolders.map(holder => {
            const revenue = revenueByHolder[holder];
            const totalRevenue = (Object.values(revenueByHolder) as number[]).reduce((sum, r) => sum + r, 0);
            const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
            const isExpanded = expandedHolders.has(holder);
            const companies = getCompanyDetails(holder);

            return (
              <Collapsible key={holder} open={isExpanded} onOpenChange={() => toggleExpand(holder)}>
                <CollapsibleTrigger asChild>
                  <div 
                    className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/30"
                    style={{ 
                      borderLeft: `4px solid ${CONTRACT_HOLDER_COLORS[holder]}`,
                      backgroundColor: isExpanded ? 'hsl(var(--muted) / 0.5)' : undefined,
                    }}
                  >
                    <div className="col-span-6 flex items-center gap-2 font-medium">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span style={{ color: CONTRACT_HOLDER_COLORS[holder] }}>
                        {CONTRACT_HOLDER_LABELS[holder]}
                      </span>
                    </div>
                    <div className="col-span-3 text-right font-bold" style={{ color: CONTRACT_HOLDER_COLORS[holder] }}>
                      {formatCurrency(revenue)}
                    </div>
                    <div className="col-span-3 text-right text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="ml-8 mr-4 mb-2 bg-muted/20 rounded-lg overflow-hidden">
                    {/* Sub-table Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/30 text-sm text-muted-foreground">
                      <div className="col-span-7">Cég neve</div>
                      <div className="col-span-3 text-right flex items-center justify-end gap-1">
                        Bevétel
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSort(holder);
                          }}
                        >
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="col-span-2 text-right">Arány</div>
                    </div>

                    {/* Company Rows */}
                    {companies.map((company, idx) => (
                      <div 
                        key={idx} 
                        className="grid grid-cols-12 gap-4 px-4 py-2 text-sm border-t border-border/50 hover:bg-muted/20"
                      >
                        <div className="col-span-7 flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: CONTRACT_HOLDER_COLORS[holder] }} 
                          />
                          {company.name}
                        </div>
                        <div className="col-span-3 text-right font-medium">
                          {formatCurrency(company.revenue)}
                        </div>
                        <div className="col-span-2 text-right text-muted-foreground">
                          {(company.revenueShare * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {/* Total Row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-primary/10 rounded-lg font-bold mt-4">
            <div className="col-span-6 text-primary">Összesen</div>
            <div className="col-span-3 text-right text-primary">
              {formatCurrency((Object.values(revenueByHolder) as number[]).reduce((sum, r) => sum + r, 0))}
            </div>
            <div className="col-span-3 text-right text-primary">100%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractHolderRevenueTable;
