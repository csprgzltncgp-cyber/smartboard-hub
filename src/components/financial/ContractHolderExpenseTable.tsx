import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, MONTH_NAMES } from "@/data/financialMockData";
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

  // Get monthly breakdown for a contract holder
  const getMonthlyDetails = (holder: ContractHolderType) => {
    if (!revenues) return [];
    
    const holderRevenues = revenues.filter(r => r.contract_holder === holder);
    const monthlyData = holderRevenues.map(r => ({
      month: r.month,
      monthName: MONTH_NAMES[r.month - 1],
      cost: Number(r.consultation_cost),
      consultationCount: r.consultation_count,
    }));

    const direction = sortDirection[holder];
    return monthlyData.sort((a, b) => 
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
            const monthlyDetails = getMonthlyDetails(holder);

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
                      <div className="col-span-5">Hónap</div>
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
                      <div className="col-span-2 text-right">Tanácsadások</div>
                      <div className="col-span-2 text-right">Arány</div>
                    </div>

                    {/* Monthly Rows */}
                    {monthlyDetails.map((item, idx) => {
                      const holderTotal = costsByHolder[holder] || 0;
                      const monthPercentage = holderTotal > 0 ? (item.cost / holderTotal) * 100 : 0;
                      
                      return (
                        <div 
                          key={idx} 
                          className="grid grid-cols-12 gap-4 px-4 py-2 text-sm border-t border-border/50 hover:bg-muted/20"
                        >
                          <div className="col-span-5 flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: CONTRACT_HOLDER_COLORS[holder] }} 
                            />
                            {item.monthName}
                          </div>
                          <div className="col-span-3 text-right font-medium">
                            {formatCurrency(item.cost)}
                          </div>
                          <div className="col-span-2 text-right text-muted-foreground">
                            {item.consultationCount} db
                          </div>
                          <div className="col-span-2 text-right text-muted-foreground">
                            {monthPercentage.toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
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
