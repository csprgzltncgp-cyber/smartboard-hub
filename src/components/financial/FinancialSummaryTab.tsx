import { useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownLeft, DollarSign, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialSummary, useUpsertContractHolderRevenue, useUpsertMonthlyExpense } from "@/hooks/useFinancialData";
import { useContractHolderRevenue, useMonthlyExpenses } from "@/hooks/useFinancialData";
import { formatCurrency, MONTH_NAMES, generateMockContractHolderRevenue, generateMockMonthlyExpenses } from "@/data/financialMockData";
import { CONTRACT_HOLDER_LABELS, CONTRACT_HOLDER_COLORS, ContractHolderType } from "@/types/financial";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FinancialSummaryTabProps {
  year: number;
  month?: number;
  country?: string;
}

const FinancialSummaryTab = ({ year, month, country }: FinancialSummaryTabProps) => {
  const { data: summaries, isLoading, refetch } = useFinancialSummary({ year, month, country });
  const { data: revenues } = useContractHolderRevenue({ year });
  const { data: expenses } = useMonthlyExpenses({ year });
  
  // Check if we have data
  const hasData = (revenues && revenues.length > 0) || (expenses && expenses.length > 0);

  // Seed mock data function - only for 2025
  const seedMockData = async () => {
    if (year === 2026) {
      toast.error('2026-ra nem tölthetők be mock adatok');
      return;
    }
    
    try {
      // Generate and insert revenue data for 2025
      const revenueData = generateMockContractHolderRevenue(2025);
      const { error: revenueError } = await supabase
        .from('contract_holder_revenue')
        .upsert(revenueData, { onConflict: 'year,month,contract_holder,country_id' });
      
      if (revenueError) throw revenueError;

      // Generate and insert expense data for 2025
      const expenseData = generateMockMonthlyExpenses(2025);
      const { error: expenseError } = await supabase
        .from('monthly_expenses')
        .upsert(expenseData, { onConflict: 'year,month,category,custom_category_name' });

      if (expenseError) throw expenseError;

      toast.success('2025 éves mock adatok betöltve');
      refetch();
    } catch (error) {
      console.error(error);
      toast.error('Hiba történt az adatok betöltésekor');
    }
  };
  
  // Calculate totals
  const totals = useMemo(() => {
    if (!summaries) return null;
    
    const filtered = month ? summaries.filter(s => s.month === month) : summaries;
    
    const totalRevenue = filtered.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalExpenses = filtered.reduce((sum, s) => sum + s.totalExpenses, 0); // Fixed + manual only
    const consultationCosts = filtered.reduce((sum, s) => sum + s.consultationCosts, 0);
    const totalCosts = filtered.reduce((sum, s) => sum + s.totalCosts, 0); // For profit
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    return { totalRevenue, totalExpenses, consultationCosts, totalCosts, profit, profitMargin, isProfitable: profit > 0 };
  }, [summaries, month]);

  // Chart data for monthly trend - filter by month if selected
  const chartData = useMemo(() => {
    if (!summaries) return [];
    const filtered = month ? summaries.filter(s => s.month === month) : summaries;
    return filtered.map(s => ({
      name: MONTH_NAMES[s.month - 1].substring(0, 3),
      month: s.month,
      Bevétel: s.totalRevenue,
      Kiadás: s.totalExpenses,
      Profit: s.profit,
    }));
  }, [summaries, month]);

  // Contract holder revenue pie data
  const revenuePieData = useMemo(() => {
    if (!summaries) return [];
    
    const filtered = month ? summaries.filter(s => s.month === month) : summaries;
    const totals: Record<ContractHolderType, number> = {
      cgp_europe: 0,
      telus: 0,
      telus_wpo: 0,
      compsych: 0,
    };

    filtered.forEach(s => {
      Object.entries(s.revenueByContractHolder).forEach(([key, value]) => {
        totals[key as ContractHolderType] += value;
      });
    });

    return Object.entries(totals)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: CONTRACT_HOLDER_LABELS[key as ContractHolderType],
        value,
        color: CONTRACT_HOLDER_COLORS[key as ContractHolderType],
      }));
  }, [summaries, month]);

  // Contract holder expenses pie data (Szakértői költségek = consultation_cost)
  const expensePieData = useMemo(() => {
    if (!summaries) return [];
    
    const filtered = month ? summaries.filter(s => s.month === month) : summaries;
    const totals: Record<ContractHolderType, number> = {
      cgp_europe: 0,
      telus: 0,
      telus_wpo: 0,
      compsych: 0,
    };

    filtered.forEach(s => {
      Object.entries(s.consultationCostsByContractHolder).forEach(([key, value]) => {
        totals[key as ContractHolderType] += value;
      });
    });

    return Object.entries(totals)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: CONTRACT_HOLDER_LABELS[key as ContractHolderType],
        value,
        color: CONTRACT_HOLDER_COLORS[key as ContractHolderType],
      }));
  }, [summaries, month]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show seed button if no data
  if (!hasData) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center">
        <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nincs pénzügyi adat</h3>
        <p className="text-muted-foreground mb-6">
          A {year}. évre még nincsenek pénzügyi adatok rögzítve.
        </p>
        {year !== 2026 && (
          <Button onClick={seedMockData} className="rounded-xl">
            Mock adatok betöltése (2025)
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Profitability & Margin - CGP Teal colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profit/Loss - Teal when profitable, Red when loss */}
        <Card className={totals?.isProfitable ? 'bg-primary/25' : 'bg-cgp-badge-overdue/25'}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${totals?.isProfitable ? 'text-primary' : 'text-cgp-badge-overdue'}`}>
              {totals?.isProfitable ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              Eredmény
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totals?.isProfitable ? 'text-primary' : 'text-cgp-badge-overdue'}`}>
              {formatCurrency(totals?.profit || 0)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${totals?.isProfitable ? 'bg-primary/20 text-primary' : 'bg-cgp-badge-overdue/20 text-cgp-badge-overdue'}`}>
                {totals?.isProfitable ? 'PROFITÁBILIS' : 'VESZTESÉGES'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {month ? MONTH_NAMES[month - 1] : `${year} teljes év`}
            </p>
          </CardContent>
        </Card>

        {/* Profit Margin - Same style as Eredmény */}
        <Card className={totals?.isProfitable ? 'bg-primary/25' : 'bg-cgp-badge-overdue/25'}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${totals?.isProfitable ? 'text-primary' : 'text-cgp-badge-overdue'}`}>
              <Percent className="w-4 h-4" />
              Profit margó
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totals?.isProfitable ? 'text-primary' : 'text-cgp-badge-overdue'}`}>
              {totals?.profitMargin.toFixed(1)}%
            </div>
            <div className="w-full bg-white/50 rounded-full h-3 mt-3">
              <div 
                className={`h-3 rounded-full transition-all ${totals?.isProfitable ? 'bg-primary' : 'bg-cgp-badge-overdue'}`}
                style={{ width: `${Math.max(0, Math.min(100, totals?.profitMargin || 0))}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {month ? MONTH_NAMES[month - 1] : `${year} teljes év`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Revenue - Green */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-cgp-badge-new" />
              Összes bevétel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cgp-badge-new">
              {formatCurrency(totals?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {month ? MONTH_NAMES[month - 1] : `${year} teljes év`}
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses - Orange */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-cgp-badge-lastday" />
              Összes kiadás
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cgp-badge-lastday">
              {formatCurrency(totals?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {month ? MONTH_NAMES[month - 1] : `${year} teljes év`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Havi pénzügyi trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Bar dataKey="Bevétel" fill="#91b752" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Kiadás" fill="#eb7e30" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bevétel megoszlás</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenuePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenuePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Distribution Pie Chart (Szakértői költségek) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Szakértői költségek megoszlása</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profit alakulás</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line 
                  type="monotone" 
                  dataKey="Profit" 
                  stroke="#00575f"
                  strokeWidth={3}
                  dot={{ fill: '#00575f', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummaryTab;