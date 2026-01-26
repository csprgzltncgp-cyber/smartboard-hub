import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, ArrowDownLeft, ArrowUpRight, Building2, BarChart3, Users, Scale } from "lucide-react";
import { useCountries } from "@/hooks/useActivityPlan";
import { MONTH_NAMES } from "@/data/financialMockData";
import FinancialSummaryTab from "@/components/financial/FinancialSummaryTab";
import RevenueTab from "@/components/financial/RevenueTab";
import ExpensesTab from "@/components/financial/ExpensesTab";
import ContractHoldersTab from "@/components/financial/ContractHoldersTab";
import ComparisonTab from "@/components/financial/ComparisonTab";

const DataPage = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Global filters
  const [filterYear, setFilterYear] = useState(currentYear.toString());
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  
  const { data: countries } = useCountries();
  
  // Generate year options (2022 to current year)
  const years = [];
  for (let y = 2022; y <= currentYear; y++) {
    years.push(y);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-calibri-bold mb-2">Pénzügyi adatok</h1>
        <p className="text-muted-foreground">
          Bevételek, kiadások és profitabilitás áttekintése
        </p>
      </div>

      {/* Global Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Év:</span>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Hónap:</span>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Összes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes hónap</SelectItem>
                {MONTH_NAMES.map((name, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Ország:</span>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Összes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes ország</SelectItem>
                {countries?.map(country => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="bg-white border p-1 h-auto flex-wrap gap-1">
          <TabsTrigger 
            value="summary" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <TrendingUp className="w-4 h-4" />
            Összefoglaló
          </TabsTrigger>
          <TabsTrigger 
            value="revenue"
            className="flex items-center gap-2 data-[state=active]:bg-cgp-badge-new data-[state=active]:text-white"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Bevételek
          </TabsTrigger>
          <TabsTrigger 
            value="expenses"
            className="flex items-center gap-2 data-[state=active]:bg-cgp-badge-lastday data-[state=active]:text-white"
          >
            <ArrowUpRight className="w-4 h-4" />
            Kiadások
          </TabsTrigger>
          <TabsTrigger 
            value="contract-holders"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="w-4 h-4" />
            Tanácsadások száma
          </TabsTrigger>
          <TabsTrigger 
            value="comparison"
            className="flex items-center gap-2 data-[state=active]:bg-cgp-teal-light data-[state=active]:text-white"
          >
            <Scale className="w-4 h-4" />
            Összehasonlító tábla
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="summary">
          <FinancialSummaryTab
            year={parseInt(filterYear)}
            month={filterMonth !== 'all' ? parseInt(filterMonth) : undefined}
            country={filterCountry !== 'all' ? filterCountry : undefined}
          />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueTab
            year={parseInt(filterYear)}
            month={filterMonth !== 'all' ? parseInt(filterMonth) : undefined}
            country={filterCountry !== 'all' ? filterCountry : undefined}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesTab
            year={parseInt(filterYear)}
            month={filterMonth !== 'all' ? parseInt(filterMonth) : undefined}
          />
        </TabsContent>

        <TabsContent value="contract-holders">
          <ContractHoldersTab
            year={parseInt(filterYear)}
            month={filterMonth !== 'all' ? parseInt(filterMonth) : undefined}
            country={filterCountry !== 'all' ? filterCountry : undefined}
          />
        </TabsContent>

        <TabsContent value="comparison">
          <ComparisonTab
            year={parseInt(filterYear)}
            month={filterMonth !== 'all' ? parseInt(filterMonth) : undefined}
            country={filterCountry !== 'all' ? filterCountry : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataPage;
