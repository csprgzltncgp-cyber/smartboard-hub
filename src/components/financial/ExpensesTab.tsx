import { useState, useMemo } from "react";
import { Plus, ArrowUpRight, Trash2, Edit2, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMonthlyExpenses, useManualEntries, useContractHolderRevenue, useUpsertMonthlyExpense, useCreateManualEntry, useDeleteMonthlyExpense, useDeleteManualEntry } from "@/hooks/useFinancialData";
import { formatCurrency, MONTH_NAMES } from "@/data/financialMockData";
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory, CONTRACT_HOLDER_LABELS, CONTRACT_HOLDER_COLORS, ContractHolderType } from "@/types/financial";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseCategorySummaryTable from "./ExpenseCategorySummaryTable";
import ContractHolderExpenseTable from "./ContractHolderExpenseTable";

interface ExpensesTabProps {
  year: number;
  month?: number;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  // Frontend standard palette only (no red/blue/purple)
  gross_salary: '#eb7e30',
  corporate_tax: '#00575f',
  innovation_fee: '#59c6c6',
  vat: '#91b752',
  car_tax: '#00575f',
  local_business_tax: '#91b752',
  other_costs: '#59c6c6',
  supplier_invoices: '#eb7e30',
  custom: '#c0bfbf',
};

const ExpensesTab = ({ year, month }: ExpensesTabProps) => {
  const { data: expenses, isLoading } = useMonthlyExpenses({ year, month });
  const { data: manualEntries } = useManualEntries({ year, month });
  const { data: revenues } = useContractHolderRevenue({ year, month });
  const upsertExpense = useUpsertMonthlyExpense();
  const createManualEntry = useCreateManualEntry();
  const deleteExpense = useDeleteMonthlyExpense();
  const deleteManualEntry = useDeleteManualEntry();
  
  const [activeSubTab, setActiveSubTab] = useState<'fixed' | 'manual'>('fixed');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [expenseForm, setExpenseForm] = useState<Record<ExpenseCategory, string>>({
    gross_salary: '',
    corporate_tax: '',
    innovation_fee: '',
    vat: '',
    car_tax: '',
    local_business_tax: '',
    other_costs: '',
    supplier_invoices: '',
    custom: '',
  });
  const [manualForm, setManualForm] = useState({
    year,
    month: month || new Date().getMonth() + 1,
    description: '',
    amount: '',
    notes: '',
  });

  // Filter expense entries only
  const expenseEntries = useMemo(() => {
    return manualEntries?.filter(e => e.entry_type === 'expense') || [];
  }, [manualEntries]);

  // Totals
  const totalFixedExpenses = useMemo(() => {
    return expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  }, [expenses]);

  const totalManualExpenses = useMemo(() => {
    return expenseEntries.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenseEntries]);

  // Total expert/consultation costs
  const totalExpertCosts = useMemo(() => {
    return revenues?.reduce((sum, r) => sum + Number(r.consultation_cost), 0) || 0;
  }, [revenues]);

  // Expenses by category for pie chart
  const pieData = useMemo(() => {
    if (!expenses) return [];
    
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
    });

    return Object.entries(byCategory).map(([key, value]) => ({
      name: EXPENSE_CATEGORY_LABELS[key as ExpenseCategory],
      value,
      color: CATEGORY_COLORS[key as ExpenseCategory],
    }));
  }, [expenses]);

  // Consultation costs by contract holder for pie chart
  const contractHolderPieData = useMemo(() => {
    if (!revenues) return [];
    
    const byHolder: Record<string, number> = {};
    revenues.forEach(r => {
      byHolder[r.contract_holder] = (byHolder[r.contract_holder] || 0) + Number(r.consultation_cost);
    });

    return Object.entries(byHolder)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: CONTRACT_HOLDER_LABELS[key as ContractHolderType],
        value,
        color: CONTRACT_HOLDER_COLORS[key as ContractHolderType],
      }));
  }, [revenues]);

  // Monthly breakdown chart data
  const chartData = useMemo(() => {
    if (!expenses) return [];
    
    const byMonth: Record<number, number> = {};
    expenses.forEach(e => {
      byMonth[e.month] = (byMonth[e.month] || 0) + Number(e.amount);
    });

    return Object.entries(byMonth).map(([monthNum, total]) => ({
      name: MONTH_NAMES[parseInt(monthNum) - 1].substring(0, 3),
      month: parseInt(monthNum),
      Kiadás: total,
    }));
  }, [expenses]);

  // Open edit dialog for a month
  const handleEditMonth = (monthNum: number) => {
    const monthExpenses = expenses?.filter(e => e.month === monthNum) || [];
    const form: Record<ExpenseCategory, string> = {
      gross_salary: '',
      corporate_tax: '',
      innovation_fee: '',
      vat: '',
      car_tax: '',
      local_business_tax: '',
      other_costs: '',
      supplier_invoices: '',
      custom: '',
    };

    monthExpenses.forEach(e => {
      form[e.category] = e.amount.toString();
    });

    setExpenseForm(form);
    setEditingMonth(monthNum);
    setShowAddDialog(true);
  };

  // Save fixed expenses
  const handleSaveExpenses = async () => {
    if (!editingMonth) return;

    const categories = Object.keys(expenseForm) as ExpenseCategory[];
    
    for (const category of categories) {
      const amount = parseFloat(expenseForm[category]) || 0;
      if (amount > 0) {
        await upsertExpense.mutateAsync({
          year,
          month: editingMonth,
          category,
          amount,
          currency: 'EUR',
        });
      }
    }

    setShowAddDialog(false);
    setEditingMonth(null);
  };

  // Add manual expense
  const handleAddManualExpense = async () => {
    if (!manualForm.description || !manualForm.amount) return;

    await createManualEntry.mutateAsync({
      year: manualForm.year,
      month: manualForm.month,
      entry_type: 'expense',
      description: manualForm.description,
      amount: parseFloat(manualForm.amount),
      currency: 'EUR',
      notes: manualForm.notes || undefined,
    });

    setShowAddDialog(false);
    setManualForm({
      year,
      month: month || new Date().getMonth() + 1,
      description: '',
      amount: '',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-calibri-bold flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-cgp-badge-lastday" />
            Kiadások
          </h2>
          <p className="text-muted-foreground text-sm">
            Fix havi költségek és egyéb kiadások adminisztrálása
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Összes kiadás
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalFixedExpenses + totalManualExpenses + totalExpertCosts)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Szakértői költségek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalExpertCosts)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fix havi költségek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalFixedExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Egyéb kiadások
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalManualExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Category Summary Table */}
      <ExpenseCategorySummaryTable expenses={expenses} year={year} month={month} />

      {/* Contract Holder Expense Summary Table */}
      <ContractHolderExpenseTable revenues={revenues} year={year} month={month} />

      {/* Sub-tabs for Fixed vs Manual */}
      <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as 'fixed' | 'manual')}>
        <TabsList>
          <TabsTrigger value="fixed" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Fix költségek
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Egyéb kiadások
          </TabsTrigger>
        </TabsList>

        {/* Fixed Expenses Tab */}
        <TabsContent value="fixed" className="space-y-4 mt-4">
          {/* Monthly Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MONTH_NAMES.map((name, index) => {
              const monthNum = index + 1;
              const monthExpenses = expenses?.filter(e => e.month === monthNum) || [];
              const monthTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
              const hasData = monthTotal > 0;

              return (
                <Card 
                  key={monthNum} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${hasData ? '' : 'opacity-60'}`}
                  onClick={() => handleEditMonth(monthNum)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      {name}
                      <Edit2 className="w-3 h-3 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-lg font-bold ${hasData ? 'text-cgp-badge-lastday' : 'text-muted-foreground'}`}>
                      {hasData ? formatCurrency(monthTotal) : 'Nincs adat'}
                    </div>
                    {hasData && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {monthExpenses.length} tétel
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pie Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expense Category Pie Chart */}
            {pieData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Költség megoszlás kategóriánként</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contract Holder Consultation Costs Pie Chart */}
            {contractHolderPieData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tanácsadási költségek contract holder szerint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contractHolderPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {contractHolderPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Manual Expenses Tab */}
        <TabsContent value="manual" className="space-y-4 mt-4">
          <Button 
            onClick={() => {
              setActiveSubTab('manual');
              setEditingMonth(null);
              setShowAddDialog(true);
            }} 
            className="rounded-xl bg-cgp-badge-overdue hover:bg-cgp-badge-overdue/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Kiadás hozzáadása
          </Button>

          {expenseEntries.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Egyéb kiadás tételek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expenseEntries.map(entry => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cgp-badge-overdue" />
                        <div>
                          <p className="font-medium">{entry.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {MONTH_NAMES[entry.month - 1]} {entry.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-cgp-badge-overdue">
                          {formatCurrency(Number(entry.amount))}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteManualEntry.mutate(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nincs egyéb kiadás tétel rögzítve
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Fixed Expenses Dialog */}
      <Dialog open={showAddDialog && editingMonth !== null} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingMonth(null); }}}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingMonth && `${MONTH_NAMES[editingMonth - 1]} ${year} - Fix költségek`}
            </DialogTitle>
            <DialogDescription>
              Rögzítsd a havi fix költségeket kategóriánként
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[400px] overflow-y-auto">
            {Object.entries(EXPENSE_CATEGORY_LABELS).filter(([key]) => key !== 'custom').map(([key, label]) => (
              <div key={key} className="grid grid-cols-2 gap-4 items-center">
                <Label className="text-sm">{label}</Label>
                <Input
                  type="number"
                  value={expenseForm[key as ExpenseCategory]}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder="0 EUR"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingMonth(null); }}>
              Mégse
            </Button>
            <Button onClick={handleSaveExpenses} className="bg-cgp-badge-overdue hover:bg-cgp-badge-overdue/90">
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Manual Expense Dialog */}
      <Dialog open={showAddDialog && editingMonth === null && activeSubTab === 'manual'} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Egyéb kiadás hozzáadása</DialogTitle>
            <DialogDescription>
              Manuális kiadás tétel rögzítése
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Év</Label>
                <Select 
                  value={manualForm.year.toString()} 
                  onValueChange={(v) => setManualForm(prev => ({ ...prev, year: parseInt(v) }))}
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
                  value={manualForm.month.toString()} 
                  onValueChange={(v) => setManualForm(prev => ({ ...prev, month: parseInt(v) }))}
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
                value={manualForm.description}
                onChange={(e) => setManualForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Pl. Irodaszerek, Utazási költség"
              />
            </div>
            <div className="space-y-2">
              <Label>Összeg (EUR) *</Label>
              <Input
                type="number"
                value={manualForm.amount}
                onChange={(e) => setManualForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Megjegyzés</Label>
              <Textarea
                value={manualForm.notes}
                onChange={(e) => setManualForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Opcionális megjegyzés..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Mégse
            </Button>
            <Button 
              onClick={handleAddManualExpense} 
              disabled={!manualForm.description || !manualForm.amount}
              className="bg-cgp-badge-overdue hover:bg-cgp-badge-overdue/90"
            >
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesTab;
