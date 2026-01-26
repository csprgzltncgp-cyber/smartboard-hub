import { useState } from "react";
import { Plus, Trash2, Scale, Building2, Calendar, MapPin, Users, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountries } from "@/hooks/useActivityPlan";
import { formatCurrency, formatNumber, MONTH_NAMES } from "@/data/financialMockData";
import { CONTRACT_HOLDER_LABELS, CONTRACT_HOLDER_COLORS, ContractHolderType } from "@/types/financial";
import { useContractHolderRevenue } from "@/hooks/useFinancialData";

// Metric types for comparison
type MetricType = 'revenue' | 'consultation_count' | 'consultation_cost' | 'profit' | 'profit_margin';

const METRIC_LABELS: Record<MetricType, string> = {
  revenue: 'Bevétel',
  consultation_count: 'Tanácsadások száma',
  consultation_cost: 'Tanácsadási költség',
  profit: 'Profit',
  profit_margin: 'Profit margó',
};

// Mock companies per contract holder (same as in other tabs)
const MOCK_COMPANIES: Record<ContractHolderType, string[]> = {
  cgp_europe: ["Deutsche Telekom", "Siemens AG", "BMW Group", "Allianz SE", "SAP SE", "Henkel"],
  telus: ["Shell Hungary", "Vodafone HU", "Tesco CE", "British Petrol"],
  telus_wpo: ["Morgan Stanley", "Goldman Sachs", "JP Morgan"],
  compsych: ["Microsoft HU", "Google Hungary", "Amazon Services"],
};

interface ComparisonSide {
  year: number;
  month: number;
  countryId: string | null;
  contractHolder: ContractHolderType;
  company: string | null;
}

interface ComparisonItem {
  id: string;
  metric: MetricType;
  left: ComparisonSide;
  right: ComparisonSide;
}

interface ComparisonTabProps {
  year: number;
  month?: number;
  country?: string;
}

const ComparisonTab = ({ year, month, country }: ComparisonTabProps) => {
  const { data: countries } = useCountries();
  const { data: revenues } = useContractHolderRevenue({ year });
  
  // Initial mock comparisons
  const initialComparisons: ComparisonItem[] = [
    {
      id: 'mock-1',
      metric: 'revenue',
      left: {
        year: 2025,
        month: 6,
        countryId: null,
        contractHolder: 'cgp_europe',
        company: null,
      },
      right: {
        year: 2025,
        month: 6,
        countryId: null,
        contractHolder: 'telus',
        company: null,
      },
    },
    {
      id: 'mock-2',
      metric: 'consultation_count',
      left: {
        year: 2025,
        month: 3,
        countryId: null,
        contractHolder: 'cgp_europe',
        company: 'Henkel',
      },
      right: {
        year: 2025,
        month: 3,
        countryId: null,
        contractHolder: 'cgp_europe',
        company: 'Siemens AG',
      },
    },
    {
      id: 'mock-3',
      metric: 'profit',
      left: {
        year: 2025,
        month: 1,
        countryId: null,
        contractHolder: 'telus_wpo',
        company: null,
      },
      right: {
        year: 2025,
        month: 1,
        countryId: null,
        contractHolder: 'compsych',
        company: null,
      },
    },
    {
      id: 'mock-4',
      metric: 'consultation_cost',
      left: {
        year: 2025,
        month: 4,
        countryId: null,
        contractHolder: 'cgp_europe',
        company: 'BMW Group',
      },
      right: {
        year: 2025,
        month: 4,
        countryId: null,
        contractHolder: 'telus',
        company: 'Shell Hungary',
      },
    },
    {
      id: 'mock-5',
      metric: 'profit_margin',
      left: {
        year: 2025,
        month: 5,
        countryId: null,
        contractHolder: 'cgp_europe',
        company: null,
      },
      right: {
        year: 2025,
        month: 5,
        countryId: null,
        contractHolder: 'telus_wpo',
        company: null,
      },
    },
  ];

  const [comparisons, setComparisons] = useState<ComparisonItem[]>(initialComparisons);
  const [isCreating, setIsCreating] = useState(false);
  
  // New comparison form state
  const [newMetric, setNewMetric] = useState<MetricType>('revenue');
  const [leftSide, setLeftSide] = useState<ComparisonSide>({
    year: year,
    month: month || 1,
    countryId: country || null,
    contractHolder: 'cgp_europe',
    company: null,
  });
  const [rightSide, setRightSide] = useState<ComparisonSide>({
    year: year,
    month: month || 1,
    countryId: country || null,
    contractHolder: 'telus',
    company: null,
  });

  // Generate years
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2022; y <= currentYear; y++) {
    years.push(y);
  }

  // Calculate value for a comparison side
  const calculateValue = (side: ComparisonSide, metric: MetricType): number => {
    if (!revenues) return 0;
    
    // Filter revenues based on side parameters
    let filtered = revenues.filter(r => 
      r.contract_holder === side.contractHolder &&
      r.month === side.month
    );
    
    if (side.countryId) {
      filtered = filtered.filter(r => r.country_id === side.countryId);
    }

    // Aggregate values
    const totalRevenue = filtered.reduce((sum, r) => sum + Number(r.revenue), 0);
    const totalConsultations = filtered.reduce((sum, r) => sum + r.consultation_count, 0);
    const totalCost = filtered.reduce((sum, r) => sum + Number(r.consultation_cost), 0);
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // If company is selected, apply share (mock data)
    const companyShare = side.company ? 0.25 : 1; // Mock: each company gets ~25% share

    switch (metric) {
      case 'revenue':
        return totalRevenue * companyShare;
      case 'consultation_count':
        return Math.round(totalConsultations * companyShare);
      case 'consultation_cost':
        return totalCost * companyShare;
      case 'profit':
        return profit * companyShare;
      case 'profit_margin':
        return profitMargin;
      default:
        return 0;
    }
  };

  // Format value based on metric type
  const formatValue = (value: number, metric: MetricType): string => {
    switch (metric) {
      case 'consultation_count':
        return formatNumber(value);
      case 'profit_margin':
        return `${value.toFixed(1)}%`;
      default:
        return formatCurrency(value);
    }
  };

  // Add new comparison
  const handleAddComparison = () => {
    const newComparison: ComparisonItem = {
      id: Date.now().toString(),
      metric: newMetric,
      left: { ...leftSide },
      right: { ...rightSide },
    };
    setComparisons([...comparisons, newComparison]);
    setIsCreating(false);
    
    // Reset form for next comparison
    setLeftSide({
      year: year,
      month: month || 1,
      countryId: country || null,
      contractHolder: 'cgp_europe',
      company: null,
    });
    setRightSide({
      year: year,
      month: month || 1,
      countryId: country || null,
      contractHolder: 'telus',
      company: null,
    });
  };

  // Remove single comparison
  const handleRemoveComparison = (id: string) => {
    setComparisons(comparisons.filter(c => c.id !== id));
  };

  // Clear all comparisons
  const handleClearAll = () => {
    setComparisons([]);
  };

  // Render comparison side selector
  const renderSideSelector = (
    side: ComparisonSide,
    setSide: React.Dispatch<React.SetStateAction<ComparisonSide>>,
    label: string,
    bgColor: string
  ) => (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Scale className="w-4 h-4" />
        {label}
      </h4>
      <div className="space-y-3">
        {/* Year & Month */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Év</label>
            <Select 
              value={side.year.toString()} 
              onValueChange={(v) => setSide({...side, year: parseInt(v)})}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Hónap</label>
            <Select 
              value={side.month.toString()} 
              onValueChange={(v) => setSide({...side, month: parseInt(v)})}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((name, idx) => (
                  <SelectItem key={idx + 1} value={(idx + 1).toString()}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="text-xs text-muted-foreground">Ország (opcionális)</label>
          <Select 
            value={side.countryId || "all"} 
            onValueChange={(v) => setSide({...side, countryId: v === "all" ? null : v})}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Összes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes ország</SelectItem>
              {countries?.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contract Holder */}
        <div>
          <label className="text-xs text-muted-foreground">Contract Holder</label>
          <Select 
            value={side.contractHolder} 
            onValueChange={(v) => setSide({...side, contractHolder: v as ContractHolderType, company: null})}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTRACT_HOLDER_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Company (optional) */}
        <div>
          <label className="text-xs text-muted-foreground">Cég (opcionális)</label>
          <Select 
            value={side.company || "all"} 
            onValueChange={(v) => setSide({...side, company: v === "all" ? null : v})}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Összes cég" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes cég</SelectItem>
              {MOCK_COMPANIES[side.contractHolder].map(company => (
                <SelectItem key={company} value={company}>{company}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // Render comparison bar
  const renderComparisonBar = (comparison: ComparisonItem) => {
    const leftValue = calculateValue(comparison.left, comparison.metric);
    const rightValue = calculateValue(comparison.right, comparison.metric);
    const total = leftValue + rightValue;
    const leftPercent = total > 0 ? (leftValue / total) * 100 : 50;
    const rightPercent = total > 0 ? (rightValue / total) * 100 : 50;

    // Fixed colors: teal for left, light teal for right
    const leftColor = '#00575f'; // CGP Teal
    const rightColor = '#59c6c6'; // CGP Teal Light

    const getCountryName = (countryId: string | null) => {
      if (!countryId) return 'Összes';
      return countries?.find(c => c.id === countryId)?.name || 'N/A';
    };

    return (
      <Card key={comparison.id} className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-cgp-badge-overdue"
          onClick={() => handleRemoveComparison(comparison.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            {METRIC_LABELS[comparison.metric]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Labels */}
          <div className="flex justify-between text-xs">
            <div className="text-left max-w-[45%]">
              <div className="font-medium" style={{ color: leftColor }}>
                {CONTRACT_HOLDER_LABELS[comparison.left.contractHolder]}
                {comparison.left.company && ` / ${comparison.left.company}`}
              </div>
              <div className="text-muted-foreground">
                {MONTH_NAMES[comparison.left.month - 1]} {comparison.left.year} • {getCountryName(comparison.left.countryId)}
              </div>
            </div>
            <div className="text-right max-w-[45%]">
              <div className="font-medium" style={{ color: rightColor }}>
                {CONTRACT_HOLDER_LABELS[comparison.right.contractHolder]}
                {comparison.right.company && ` / ${comparison.right.company}`}
              </div>
              <div className="text-muted-foreground">
                {MONTH_NAMES[comparison.right.month - 1]} {comparison.right.year} • {getCountryName(comparison.right.countryId)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex h-10 rounded-lg overflow-hidden bg-muted/30">
            <div 
              className="flex items-center justify-start transition-all duration-500"
              style={{ width: `${leftPercent}%`, backgroundColor: leftColor }}
            >
              <span className="text-white font-semibold text-sm px-3 truncate">
                {formatValue(leftValue, comparison.metric)}
              </span>
            </div>
            <div 
              className="flex items-center justify-end transition-all duration-500"
              style={{ width: `${rightPercent}%`, backgroundColor: rightColor }}
            >
              <span className="text-white font-semibold text-sm px-3 truncate">
                {formatValue(rightValue, comparison.metric)}
              </span>
            </div>
          </div>

          {/* Percentages */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{leftPercent.toFixed(1)}%</span>
            <span>{rightPercent.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-calibri-bold flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Összehasonlító tábla
          </h2>
          <p className="text-muted-foreground text-sm">
            Contract Holderek és cégek mutatóinak összehasonlítása
          </p>
        </div>
        <div className="flex gap-2">
          {comparisons.length > 0 && (
            <Button 
              variant="outline" 
              className="rounded-xl text-cgp-badge-overdue border-cgp-badge-overdue hover:bg-cgp-badge-overdue/10"
              onClick={handleClearAll}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Mindent töröl
            </Button>
          )}
          <Button 
            className="rounded-xl"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="w-4 h-4 mr-2" />
            Új összehasonlítás
          </Button>
        </div>
      </div>

      {/* Create New Comparison Form */}
      {isCreating && (
        <Card className="border-primary border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Új összehasonlítás létrehozása
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metric Selection */}
            <div>
              <label className="text-sm font-medium">Összehasonlítás alapja (mutató)</label>
              <Select value={newMetric} onValueChange={(v) => setNewMetric(v as MetricType)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(METRIC_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Two Sides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSideSelector(leftSide, setLeftSide, "Bal oldal", "bg-muted/30")}
              {renderSideSelector(rightSide, setRightSide, "Jobb oldal", "bg-muted/30")}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setIsCreating(false)}>
                Mégse
              </Button>
              <Button className="rounded-xl" onClick={handleAddComparison}>
                Összehasonlítás mentése
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Comparisons */}
      {comparisons.length > 0 ? (
        <div className="space-y-4">
          {comparisons.map(comparison => renderComparisonBar(comparison))}
        </div>
      ) : !isCreating && (
        <Card className="bg-muted/20">
          <CardContent className="py-12 text-center">
            <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nincs mentett összehasonlítás</h3>
            <p className="text-muted-foreground mb-4">
              Hozz létre összehasonlításokat a Contract Holderek és cégek mutatóinak vizsgálatához.
            </p>
            <Button className="rounded-xl" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Első összehasonlítás létrehozása
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparisonTab;
