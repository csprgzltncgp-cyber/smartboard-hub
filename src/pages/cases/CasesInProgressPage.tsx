import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Case, CountryGroup, calculateCasePercentage, getCaseWarnings, CASE_STATUS_LABELS } from "@/types/case";
import CaseCard from "@/components/cases/CaseCard";
import { Button } from "@/components/ui/button";

// Mock countries - in production this would come from the database
const MOCK_COUNTRIES = [
  { id: 'hu', code: 'HU', name: 'Magyarország' },
  { id: 'at', code: 'AT', name: 'Ausztria' },
  { id: 'de', code: 'DE', name: 'Németország' },
  { id: 'pl', code: 'PL', name: 'Lengyelország' },
  { id: 'ro', code: 'RO', name: 'Románia' },
  { id: 'sk', code: 'SK', name: 'Szlovákia' },
  { id: 'cz', code: 'CZ', name: 'Csehország' },
];

// Mock cases generator for demo
function generateMockCases(countryId: string, count: number): Case[] {
  const statuses: Array<Case['status']> = ['opened', 'assigned_to_expert', 'employee_contacted', 'client_unreachable', 'interrupted'];
  const companies = ['ABC Kft.', 'XYZ Zrt.', 'Demo Company Ltd.', 'Test Corp.', 'Global Inc.'];
  const experts = [
    { id: '1', name: 'Dr. Kovács Anna', email: 'kovacs.anna@example.com' },
    { id: '2', name: 'Dr. Nagy Béla', email: 'nagy.bela@example.com' },
    { id: '3', name: 'Dr. Szabó Katalin', email: 'szabo.katalin@example.com' },
  ];
  
  const cases: Case[] = [];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const hasExpert = Math.random() > 0.2;
    const hasConsultations = status === 'employee_contacted' && Math.random() > 0.3;
    const expertAccepted = hasExpert ? (Math.random() > 0.2 ? 1 : Math.random() > 0.5 ? 0 : -1) : undefined;
    
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const employeeContactedAt = status !== 'opened' && status !== 'assigned_to_expert' 
      ? new Date(Date.now() - (daysAgo - Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    
    const caseData: Case = {
      id: `${countryId}-case-${i + 1}`,
      caseIdentifier: `CGP-${countryId.toUpperCase()}-${2024}-${String(i + 1).padStart(5, '0')}`,
      status,
      companyId: `company-${i % 5}`,
      companyName: companies[i % 5],
      countryId,
      countryCode: countryId.toUpperCase(),
      createdBy: 'operator-1',
      operatorName: 'Kiss Péter',
      employeeContactedAt,
      createdAt,
      updatedAt: createdAt,
      percentage: 0,
      values: [
        { id: `v1-${i}`, caseId: `${countryId}-case-${i + 1}`, caseInputId: 1, value: createdAt.split('T')[0], createdAt, updatedAt: createdAt },
      ],
      experts: hasExpert ? [
        { 
          id: experts[i % 3].id, 
          name: experts[i % 3].name, 
          email: experts[i % 3].email,
          accepted: expertAccepted as number,
          createdAt: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString()
        }
      ] : [],
      consultations: hasConsultations ? [
        { 
          id: `consult-${i}`, 
          caseId: `${countryId}-case-${i + 1}`, 
          permissionId: 1, 
          minuteLength: 50,
          createdAt: new Date(Date.now() - (daysAgo - 3) * 24 * 60 * 60 * 1000).toISOString()
        }
      ] : [],
      caseType: [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)] as 1 | 2 | 3 | 4 | 5,
      clientName: `Ügyfél ${i + 1}`,
      date: createdAt.split('T')[0],
    };
    
    caseData.percentage = calculateCasePercentage(caseData);
    cases.push(caseData);
  }
  
  return cases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function CasesInProgressPage() {
  const navigate = useNavigate();
  const [countryGroups, setCountryGroups] = useState<CountryGroup[]>(
    MOCK_COUNTRIES.map(country => ({
      countryId: country.id,
      countryCode: country.code,
      countryName: country.name,
      caseCount: Math.floor(Math.random() * 20) + 1, // Random count for demo
      isExpanded: false,
      isLoading: false,
      cases: [],
    }))
  );

  const toggleCountry = async (countryId: string) => {
    setCountryGroups(prev => prev.map(group => {
      if (group.countryId !== countryId) return group;
      
      // If already expanded, just collapse
      if (group.isExpanded) {
        return { ...group, isExpanded: false };
      }
      
      // If not loaded yet, load cases
      if (group.cases.length === 0) {
        return { ...group, isExpanded: true, isLoading: true };
      }
      
      // Already loaded, just expand
      return { ...group, isExpanded: true };
    }));

    // Simulate loading cases
    const group = countryGroups.find(g => g.countryId === countryId);
    if (group && !group.isExpanded && group.cases.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      setCountryGroups(prev => prev.map(g => {
        if (g.countryId !== countryId) return g;
        return {
          ...g,
          isLoading: false,
          cases: generateMockCases(countryId, g.caseCount),
        };
      }));
    }
  };

  const loadMore = (countryId: string) => {
    setCountryGroups(prev => prev.map(group => {
      if (group.countryId !== countryId) return group;
      
      const additionalCases = generateMockCases(countryId, 10);
      return {
        ...group,
        cases: [...group.cases, ...additionalCases],
        caseCount: group.caseCount + 10,
      };
    }));
  };

  const handleCaseSelect = (caseData: Case) => {
    // Navigate to case view page
    navigate(`/dashboard/cases/${caseData.id}`);
  };

  const handleCaseDelete = (caseData: Case) => {
    setCountryGroups(prev => prev.map(group => {
      if (group.countryId !== caseData.countryId) return group;
      return {
        ...group,
        cases: group.cases.filter(c => c.id !== caseData.id),
        caseCount: group.caseCount - 1,
      };
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Folyamatban lévő esetek</h1>
      </div>

      <div className="space-y-2">
        {countryGroups.map(group => (
          <div key={group.countryId} className="border border-border rounded-lg overflow-hidden">
            {/* Country Header */}
            <button
              onClick={() => toggleCountry(group.countryId)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 text-left transition-colors",
                "bg-[hsl(var(--cgp-light))] hover:bg-[hsl(var(--cgp-light))]/80",
                group.isExpanded && "bg-[hsl(var(--cgp-teal))] text-white hover:bg-[hsl(var(--cgp-teal))]/90"
              )}
            >
              <div className="flex items-center gap-3">
                {group.isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded">
                    {group.caseCount}
                  </span>
                )}
                <span className="font-semibold text-lg">{group.countryCode}</span>
                <span className="text-sm opacity-80">({group.countryName})</span>
              </div>
              {group.isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {/* Cases List */}
            {group.isExpanded && (
              <div className="divide-y divide-border">
                {group.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Esetek betöltése...</span>
                  </div>
                ) : group.cases.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Nincsenek esetek!
                  </div>
                ) : (
                  <>
                    {group.cases.map(caseData => (
                      <CaseCard
                        key={caseData.id}
                        caseData={caseData}
                        onSelect={handleCaseSelect}
                        onDelete={handleCaseDelete}
                        showDeleteButton={true}
                      />
                    ))}
                    
                    {/* Load More / Load All buttons */}
                    <div className="flex justify-center gap-3 py-4 bg-muted/30">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadMore(group.countryId)}
                        className="gap-2"
                      >
                        <ChevronDown className="h-4 w-4" />
                        Továbbiak betöltése
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadMore(group.countryId)}
                        className="gap-2"
                      >
                        <ChevronDown className="h-4 w-4" />
                        <ChevronDown className="h-4 w-4 -ml-2" />
                        Összes betöltése
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
