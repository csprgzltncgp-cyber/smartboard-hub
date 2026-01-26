import { useState, useMemo } from "react";
import { Plus, ArrowDownLeft, Building2, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useContractHolderRevenue, useManualEntries, useCreateManualEntry } from "@/hooks/useFinancialData";
import { formatCurrency, MONTH_NAMES } from "@/data/financialMockData";
import { CONTRACT_HOLDER_LABELS, CONTRACT_HOLDER_COLORS, ContractHolderType } from "@/types/financial";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ContractHolderRevenueTable from "./ContractHolderRevenueTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCountries } from "@/hooks/useActivityPlan";

interface RevenueTabProps {
  year: number;
  month?: number;
  country?: string;
}

const RevenueTab = ({ year, month, country }: RevenueTabProps) => {
  const { data: revenues, isLoading } = useContractHolderRevenue({ year, month, country });
  const { data: manualEntries } = useManualEntries({ year, month });
  const { data: countries } = useCountries();
  const createManualEntry = useCreateManualEntry();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    year,
    month: month || new Date().getMonth() + 1,
    description: '',
    amount: '',
    contract_holder: '' as ContractHolderType | '',
    country_id: '',
    notes: '',
  });

  // Filter income entries only
  const incomeEntries = useMemo(() => {
    return manualEntries?.filter(e => e.entry_type === 'income') || [];
  }, [manualEntries]);

  // Total revenue calculation
  const totalContractHolderRevenue = useMemo(() => {
    return revenues?.reduce((sum, r) => sum + Number(r.revenue), 0) || 0;
  }, [revenues]);

  const totalManualIncome = useMemo(() => {
    return incomeEntries.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [incomeEntries]);

  // Revenue by contract holder for chart
  const chartData = useMemo(() => {
    if (!revenues) return [];
    
    const byMonth: Record<number, Record<string, number>> = {};
    
    revenues.forEach(r => {
      if (!byMonth[r.month]) {
        byMonth[r.month] = {};
      }
      byMonth[r.month][r.contract_holder] = (byMonth[r.month][r.contract_holder] || 0) + Number(r.revenue);
    });

    return Object.entries(byMonth).map(([monthNum, data]) => ({
      name: MONTH_NAMES[parseInt(monthNum) - 1].substring(0, 3),
      ...data,
    }));
  }, [revenues]);

  // Handle form submit
  const handleSubmit = async () => {
    if (!newEntry.description || !newEntry.amount) return;
    
    await createManualEntry.mutateAsync({
      year: newEntry.year,
      month: newEntry.month,
      entry_type: 'income',
      description: newEntry.description,
      amount: parseFloat(newEntry.amount),
      currency: 'EUR',
      contract_holder: newEntry.contract_holder || undefined,
      country_id: newEntry.country_id || undefined,
      notes: newEntry.notes || undefined,
    });

    setShowAddDialog(false);
    setNewEntry({
      year,
      month: month || new Date().getMonth() + 1,
      description: '',
      amount: '',
      contract_holder: '',
      country_id: '',
      notes: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-calibri-bold flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-cgp-badge-new" />
            Bevételek
          </h2>
          <p className="text-muted-foreground text-sm">
            Contract Holder bevételek és manuális bevétel tételek
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="rounded-xl bg-cgp-badge-new hover:bg-cgp-badge-new/90">
          <Plus className="w-4 h-4 mr-2" />
          Bevétel hozzáadása
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Összes bevétel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalContractHolderRevenue + totalManualIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contract Holder bevétel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cgp-badge-new">
              {formatCurrency(totalContractHolderRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Manuális bevételek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cgp-teal-light">
              {formatCurrency(totalManualIncome)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart by Contract Holder */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Bevétel Contract Holder-enként
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="cgp_europe" name="CGP Europe" fill={CONTRACT_HOLDER_COLORS.cgp_europe} stackId="a" />
                  <Bar dataKey="telus" name="Telus" fill={CONTRACT_HOLDER_COLORS.telus} stackId="a" />
                  <Bar dataKey="telus_wpo" name="Telus/WPO" fill={CONTRACT_HOLDER_COLORS.telus_wpo} stackId="a" />
                  <Bar dataKey="compsych" name="ComPsych" fill={CONTRACT_HOLDER_COLORS.compsych} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Holder Revenue Summary Table */}
      <ContractHolderRevenueTable revenues={revenues} year={year} month={month} />

      {/* Manual Income Entries List */}
      {incomeEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manuális bevétel tételek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incomeEntries.map(entry => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cgp-badge-new" />
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {MONTH_NAMES[entry.month - 1]} {entry.year}
                        {entry.contract_holder && ` • ${CONTRACT_HOLDER_LABELS[entry.contract_holder]}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-cgp-badge-new">
                    {formatCurrency(Number(entry.amount))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Income Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bevétel hozzáadása</DialogTitle>
            <DialogDescription>
              Manuális bevétel tétel rögzítése
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Év</Label>
                <Select 
                  value={newEntry.year.toString()} 
                  onValueChange={(v) => setNewEntry(prev => ({ ...prev, year: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2022, 2023, 2024, 2025, 2026].map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hónap</Label>
                <Select 
                  value={newEntry.month.toString()} 
                  onValueChange={(v) => setNewEntry(prev => ({ ...prev, month: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((name, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Megnevezés *</Label>
              <Input
                value={newEntry.description}
                onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Pl. Egyéb tanácsadási díj"
              />
            </div>
            <div className="space-y-2">
              <Label>Összeg (EUR) *</Label>
              <Input
                type="number"
                value={newEntry.amount}
                onChange={(e) => setNewEntry(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Contract Holder (opcionális)</Label>
              <Select 
                value={newEntry.contract_holder} 
                onValueChange={(v) => setNewEntry(prev => ({ ...prev, contract_holder: v as ContractHolderType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_HOLDER_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ország (opcionális)</Label>
              <Select 
                value={newEntry.country_id} 
                onValueChange={(v) => setNewEntry(prev => ({ ...prev, country_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz..." />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Megjegyzés</Label>
              <Textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Opcionális megjegyzés..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Mégse
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!newEntry.description || !newEntry.amount}
              className="bg-cgp-badge-new hover:bg-cgp-badge-new/90"
            >
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RevenueTab;
