import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, MONTH_NAMES } from "@/data/financialMockData";
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory, MonthlyExpense } from "@/types/financial";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ExpenseCategorySummaryTableProps {
  expenses: MonthlyExpense[] | undefined;
  year: number;
  month?: number;
}

type SortDirection = "asc" | "desc";

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  gross_salary: '#00575f',
  corporate_tax: '#00575f',
  innovation_fee: '#00575f',
  vat: '#00575f',
  car_tax: '#00575f',
  local_business_tax: '#00575f',
  other_costs: '#00575f',
  supplier_invoices: '#00575f',
  custom: '#00575f',
};

const ExpenseCategorySummaryTable = ({ expenses, year, month }: ExpenseCategorySummaryTableProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<ExpenseCategory>>(new Set());
  const [sortDirection, setSortDirection] = useState<Record<ExpenseCategory, SortDirection>>({
    gross_salary: "desc",
    corporate_tax: "desc",
    innovation_fee: "desc",
    vat: "desc",
    car_tax: "desc",
    local_business_tax: "desc",
    other_costs: "desc",
    supplier_invoices: "desc",
    custom: "desc",
  });

  // Aggregate expenses by category
  const expensesByCategory = useMemo(() => {
    if (!expenses) return {};
    
    const result: Record<ExpenseCategory, number> = {
      gross_salary: 0,
      corporate_tax: 0,
      innovation_fee: 0,
      vat: 0,
      car_tax: 0,
      local_business_tax: 0,
      other_costs: 0,
      supplier_invoices: 0,
      custom: 0,
    };

    expenses.forEach(e => {
      result[e.category] += Number(e.amount);
    });

    return result;
  }, [expenses]);

  // Get monthly breakdown for a category
  const getMonthlyDetails = (category: ExpenseCategory) => {
    if (!expenses) return [];
    
    const categoryExpenses = expenses.filter(e => e.category === category);
    const monthlyData: Array<{ month: number; monthName: string; amount: number }> = [];
    
    categoryExpenses.forEach(e => {
      const existing = monthlyData.find(m => m.month === e.month);
      if (existing) {
        existing.amount += Number(e.amount);
      } else {
        monthlyData.push({
          month: e.month,
          monthName: MONTH_NAMES[e.month - 1],
          amount: Number(e.amount),
        });
      }
    });

    const direction = sortDirection[category];
    return monthlyData.sort((a, b) => 
      direction === "desc" ? b.amount - a.amount : a.amount - b.amount
    );
  };

  const toggleExpand = (category: ExpenseCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSort = (category: ExpenseCategory) => {
    setSortDirection(prev => ({
      ...prev,
      [category]: prev[category] === "desc" ? "asc" : "desc",
    }));
  };

  // Sort categories by expense amount
  const sortedCategories = useMemo(() => {
    return (Object.keys(expensesByCategory) as ExpenseCategory[])
      .filter(category => expensesByCategory[category] > 0)
      .sort((a, b) => expensesByCategory[b] - expensesByCategory[a]);
  }, [expensesByCategory]);

  if (sortedCategories.length === 0) {
    return null;
  }

  const totalExpenses = (Object.values(expensesByCategory) as number[]).reduce((sum, val) => sum + val, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Kiadás összesítő táblázat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg font-medium text-sm text-muted-foreground">
            <div className="col-span-6">Kategória</div>
            <div className="col-span-3 text-right">Összeg</div>
            <div className="col-span-3 text-right">Arány</div>
          </div>

          {/* Category Rows */}
          {sortedCategories.map(category => {
            const amount = expensesByCategory[category] as number;
            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
            const isExpanded = expandedCategories.has(category);
            const monthlyDetails = getMonthlyDetails(category);

            return (
              <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleExpand(category)}>
                <CollapsibleTrigger asChild>
                  <div 
                    className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/30"
                    style={{ 
                      borderLeft: `4px solid ${CATEGORY_COLORS[category]}`,
                      backgroundColor: isExpanded ? 'hsl(var(--muted) / 0.5)' : undefined,
                    }}
                  >
                    <div className="col-span-6 flex items-center gap-2 font-medium">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-primary">
                        {EXPENSE_CATEGORY_LABELS[category]}
                      </span>
                    </div>
                    <div className="col-span-3 text-right font-bold text-primary">
                      {formatCurrency(amount)}
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
                      <div className="col-span-7">Hónap</div>
                      <div className="col-span-3 text-right flex items-center justify-end gap-1">
                        Összeg
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSort(category);
                          }}
                        >
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="col-span-2 text-right">Arány</div>
                    </div>

                    {/* Monthly Rows */}
                    {monthlyDetails.map((monthData, idx) => (
                      <div 
                        key={idx} 
                        className="grid grid-cols-12 gap-4 px-4 py-2 text-sm border-t border-border/50 hover:bg-muted/20"
                      >
                        <div className="col-span-7 flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full bg-primary" 
                          />
                          {monthData.monthName}
                        </div>
                        <div className="col-span-3 text-right font-medium">
                          {formatCurrency(monthData.amount)}
                        </div>
                        <div className="col-span-2 text-right text-muted-foreground">
                          {amount > 0 ? ((monthData.amount / amount) * 100).toFixed(0) : 0}%
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
              {formatCurrency(totalExpenses)}
            </div>
            <div className="col-span-3 text-right text-primary">100%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCategorySummaryTable;
