import { useMemo } from "react";
import { Building2, Users, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContractHolderRevenue } from "@/hooks/useFinancialData";
import { formatCurrency, formatNumber, MONTH_NAMES } from "@/data/financialMockData";
import { CONTRACT_HOLDER_LABELS, CONTRACT_HOLDER_COLORS, ContractHolderType } from "@/types/financial";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ContractHoldersTabProps {
  year: number;
  month?: number;
  country?: string;
}

const ContractHoldersTab = ({ year, month, country }: ContractHoldersTabProps) => {
  const { data: revenues, isLoading } = useContractHolderRevenue({ year, month, country });

  // Aggregate by contract holder
  const contractHolderSummary = useMemo(() => {
    if (!revenues) return [];
    
    const summary: Record<ContractHolderType, {
      revenue: number;
      consultations: number;
      cost: number;
      avgPerConsultation: number;
    }> = {
      cgp_europe: { revenue: 0, consultations: 0, cost: 0, avgPerConsultation: 0 },
      telus: { revenue: 0, consultations: 0, cost: 0, avgPerConsultation: 0 },
      telus_wpo: { revenue: 0, consultations: 0, cost: 0, avgPerConsultation: 0 },
      compsych: { revenue: 0, consultations: 0, cost: 0, avgPerConsultation: 0 },
    };

    revenues.forEach(r => {
      summary[r.contract_holder].revenue += Number(r.revenue);
      summary[r.contract_holder].consultations += r.consultation_count;
      summary[r.contract_holder].cost += Number(r.consultation_cost);
    });

    // Calculate averages
    Object.keys(summary).forEach(key => {
      const holder = key as ContractHolderType;
      if (summary[holder].consultations > 0) {
        summary[holder].avgPerConsultation = summary[holder].cost / summary[holder].consultations;
      }
    });

    return Object.entries(summary).map(([key, data]) => ({
      id: key as ContractHolderType,
      name: CONTRACT_HOLDER_LABELS[key as ContractHolderType],
      color: CONTRACT_HOLDER_COLORS[key as ContractHolderType],
      ...data,
      profit: data.revenue - data.cost,
      profitMargin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0,
    }));
  }, [revenues]);

  // Monthly breakdown by contract holder
  const monthlyData = useMemo(() => {
    if (!revenues) return [];
    
    const byMonth: Record<number, Record<ContractHolderType, { revenue: number; consultations: number }>> = {};
    
    revenues.forEach(r => {
      if (!byMonth[r.month]) {
        byMonth[r.month] = {
          cgp_europe: { revenue: 0, consultations: 0 },
          telus: { revenue: 0, consultations: 0 },
          telus_wpo: { revenue: 0, consultations: 0 },
          compsych: { revenue: 0, consultations: 0 },
        };
      }
      byMonth[r.month][r.contract_holder].revenue += Number(r.revenue);
      byMonth[r.month][r.contract_holder].consultations += r.consultation_count;
    });

    return Object.entries(byMonth).map(([monthNum, data]) => ({
      name: MONTH_NAMES[parseInt(monthNum) - 1].substring(0, 3),
      month: parseInt(monthNum),
      'CGP Europe': data.cgp_europe.revenue,
      'Telus': data.telus.revenue,
      'Telus/WPO': data.telus_wpo.revenue,
      'ComPsych': data.compsych.revenue,
    })).sort((a, b) => a.month - b.month);
  }, [revenues]);

  // Consultation trend data
  const consultationData = useMemo(() => {
    if (!revenues) return [];
    
    const byMonth: Record<number, Record<ContractHolderType, number>> = {};
    
    revenues.forEach(r => {
      if (!byMonth[r.month]) {
        byMonth[r.month] = {
          cgp_europe: 0,
          telus: 0,
          telus_wpo: 0,
          compsych: 0,
        };
      }
      byMonth[r.month][r.contract_holder] += r.consultation_count;
    });

    return Object.entries(byMonth).map(([monthNum, data]) => ({
      name: MONTH_NAMES[parseInt(monthNum) - 1].substring(0, 3),
      month: parseInt(monthNum),
      'CGP Europe': data.cgp_europe,
      'Telus': data.telus,
      'Telus/WPO': data.telus_wpo,
      'ComPsych': data.compsych,
    })).sort((a, b) => a.month - b.month);
  }, [revenues]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalRevenue = contractHolderSummary.reduce((sum, ch) => sum + ch.revenue, 0);
  const totalConsultations = contractHolderSummary.reduce((sum, ch) => sum + ch.consultations, 0);
  const totalCost = contractHolderSummary.reduce((sum, ch) => sum + ch.cost, 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-calibri-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Tanácsadások száma
        </h2>
        <p className="text-muted-foreground text-sm">
          Tanácsadások és bevételek Contract Holder-enként
        </p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {contractHolderSummary.map(ch => (
          <Card key={ch.id} className="border-l-4" style={{ borderLeftColor: ch.color }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{ch.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: ch.color }}>
                {formatNumber(ch.consultations)}
              </div>
              <div className="text-xs text-muted-foreground mb-2">tanácsadás</div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(ch.revenue)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Részletes összehasonlítás</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Holder</TableHead>
                <TableHead className="text-right">Tanácsadások</TableHead>
                <TableHead className="text-right">Bevétel</TableHead>
                <TableHead className="text-right">Tanácsadási költség</TableHead>
                <TableHead className="text-right">Átl. költség/tanácsadás</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margó</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contractHolderSummary.map(ch => (
                <TableRow key={ch.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ch.color }} />
                      {ch.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatNumber(ch.consultations)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(ch.revenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(ch.cost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(ch.avgPerConsultation)}</TableCell>
                  <TableCell className={`text-right font-medium ${ch.profit >= 0 ? 'text-cgp-badge-new' : 'text-cgp-badge-overdue'}`}>
                    {formatCurrency(ch.profit)}
                  </TableCell>
                  <TableCell className={`text-right ${ch.profitMargin >= 0 ? 'text-cgp-badge-new' : 'text-cgp-badge-overdue'}`}>
                    {ch.profitMargin.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Összesen</TableCell>
                <TableCell className="text-right">{formatNumber(totalConsultations)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalCost)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalCost / totalConsultations || 0)}</TableCell>
                <TableCell className={`text-right ${totalProfit >= 0 ? 'text-cgp-badge-new' : 'text-cgp-badge-overdue'}`}>
                  {formatCurrency(totalProfit)}
                </TableCell>
                <TableCell className={`text-right ${totalProfit >= 0 ? 'text-cgp-badge-new' : 'text-cgp-badge-overdue'}`}>
                  {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultations Trend - Now first */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tanácsadások száma havonta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consultationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="CGP Europe" fill={CONTRACT_HOLDER_COLORS.cgp_europe} />
                  <Bar dataKey="Telus" fill={CONTRACT_HOLDER_COLORS.telus} />
                  <Bar dataKey="Telus/WPO" fill={CONTRACT_HOLDER_COLORS.telus_wpo} />
                  <Bar dataKey="ComPsych" fill={CONTRACT_HOLDER_COLORS.compsych} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend - Now second */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Havi bevétel alakulás
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="CGP Europe" stroke={CONTRACT_HOLDER_COLORS.cgp_europe} strokeWidth={2} />
                  <Line type="monotone" dataKey="Telus" stroke={CONTRACT_HOLDER_COLORS.telus} strokeWidth={2} />
                  <Line type="monotone" dataKey="Telus/WPO" stroke={CONTRACT_HOLDER_COLORS.telus_wpo} strokeWidth={2} />
                  <Line type="monotone" dataKey="ComPsych" stroke={CONTRACT_HOLDER_COLORS.compsych} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractHoldersTab;
