import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/data/financialMockData";
import { CONTRACT_HOLDER_LABELS, CONTRACT_HOLDER_COLORS, ContractHolderType } from "@/types/financial";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ContractHolderExpenseTableProps {
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

// Mock company data for each contract holder (same as revenue table)
const MOCK_COMPANIES: Record<ContractHolderType, Array<{ name: string; costShare: number }>> = {
  cgp_europe: [
    { name: "Richter Gedeon Nyrt.", costShare: 0.25 },
    { name: "MOL Magyar Olaj- és Gázipari Nyrt.", costShare: 0.22 },
    { name: "OTP Bank Nyrt.", costShare: 0.18 },
    { name: "Magyar Telekom Nyrt.", costShare: 0.15 },
    { name: "Bosch Magyarország", costShare: 0.12 },
    { name: "Egyéb cégek", costShare: 0.08 },
  ],
  telus: [
    { name: "Audi Hungaria Zrt.", costShare: 0.30 },
    { name: "Mercedes-Benz Manufacturing Hungary Kft.", costShare: 0.28 },
    { name: "Samsung SDI Magyarország Zrt.", costShare: 0.22 },
    { name: "Egyéb cégek", costShare: 0.20 },
  ],
  telus_wpo: [
    { name: "Continental Automotive Hungary Kft.", costShare: 0.35 },
    { name: "Knorr-Bremse Fékrendszerek Kft.", costShare: 0.30 },
    { name: "Egyéb cégek", costShare: 0.35 },
  ],
  compsych: [
    { name: "IBM Magyarország Kft.", costShare: 0.40 },
    { name: "Microsoft Magyarország Kft.", costShare: 0.35 },
    { name: "Egyéb cégek", costShare: 0.25 },
  ],
};

type SortDirection = "asc" | "desc";

const ContractHolderExpenseTable = ({ revenues, year, month }: ContractHolderExpenseTableProps) => {
  const [expandedHolders, setExpandedHolders] = useState<Set<ContractHolderType>>(new Set());
  const [sortDirection, setSortDirection] = useState<Record<ContractHolderType, SortDirection>>({
    cgp_europe: "desc",
    telus: "desc",
    telus_wpo: "desc",
    compsych: "desc",
  });

  // Aggregate consultation costs by contract holder
  const costsByHolder = useMemo(() => {
    if (!revenues) return {};
    
    const result: Record<ContractHolderType, number> = {
      cgp_europe: 0,
      telus: 0,
      telus_wpo: 0,
      compsych: 0,
    };

    revenues.forEach(r => {
      result[r.contract_holder] += Number(r.consultation_cost);
    });

    return result;
  }, [revenues]);

  // Get sorted company details for a contract holder
  const getCompanyDetails = (holder: ContractHolderType) => {
    const totalCost = costsByHolder[holder] || 0;
    const companies = MOCK_COMPANIES[holder].map(c => ({
      ...c,
      cost: Math.round(totalCost * c.costShare),
    }));

    const direction = sortDirection[holder];
    return companies.sort((a, b) => 
      direction === "desc" ? b.cost - a.cost : a.cost - b.cost
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

  // Sort contract holders by cost
  const sortedHolders = useMemo(() => {
    return (Object.keys(costsByHolder) as ContractHolderType[])
      .filter(holder => costsByHolder[holder] > 0)
      .sort((a, b) => costsByHolder[b] - costsByHolder[a]);
  }, [costsByHolder]);

  const totalCosts = useMemo(() => {
    return (Object.values(costsByHolder) as number[]).reduce((sum, c) => sum + c, 0);
  }, [costsByHolder]);

  if (sortedHolders.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Tanácsadási költségek contract holder szerint
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg font-medium text-sm text-muted-foreground">
            <div className="col-span-6">Contract Holder</div>
            <div className="col-span-3 text-right">Költség</div>
            <div className="col-span-3 text-right">Arány</div>
          </div>

          {/* Contract Holder Rows */}
          {sortedHolders.map(holder => {
            const cost = costsByHolder[holder];
            const percentage = totalCosts > 0 ? (cost / totalCosts) * 100 : 0;
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
                      {formatCurrency(cost)}
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
                        Költség
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
                          {formatCurrency(company.cost)}
                        </div>
                        <div className="col-span-2 text-right text-muted-foreground">
                          {(company.costShare * 100).toFixed(0)}%
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
              {formatCurrency(totalCosts)}
            </div>
            <div className="col-span-3 text-right text-primary">100%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractHolderExpenseTable;
