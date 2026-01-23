import { useState, useEffect, useMemo } from "react";
import { Building2, Crown, Calendar, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserClientAssignments, useActivityPlans, useCompanies, useCountries } from "@/hooks/useActivityPlan";
import { useSeedActivityPlanData } from "@/hooks/useSeedActivityPlanData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ClientExpandableRow from "@/components/activity-plan/ClientExpandableRow";
const MyClientsPage = () => {
  const { currentUser } = useAuth();
  const { isSeeding } = useSeedActivityPlanData();
  
  const [isClientDirector, setIsClientDirector] = useState(false);
  const [clientDirectorLoading, setClientDirectorLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  
  // Fetch countries for filter
  const { data: countries } = useCountries();
  
  
  // Check if user is admin (has admin smartboard)
  const isAdmin = currentUser?.smartboardPermissions?.some(
    p => p.smartboardId === "admin"
  ) ?? false;
  
  // Check if user is client director from database
  useEffect(() => {
    const checkClientDirector = async () => {
      if (!currentUser?.id) {
        setClientDirectorLoading(false);
        return;
      }
      
      // Admin users are automatically client directors
      if (isAdmin) {
        setIsClientDirector(true);
        setClientDirectorLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("app_users")
          .select("is_client_director")
          .eq("id", currentUser.id)
          .maybeSingle();
        
        if (!error && data) {
          setIsClientDirector(data.is_client_director);
        }
      } catch (e) {
        console.error("Failed to check client director status:", e);
      } finally {
        setClientDirectorLoading(false);
      }
    };
    
    checkClientDirector();
  }, [currentUser?.id, isAdmin]);
  
  // Decide whether to show all companies or just assigned ones
  const hasFullAccess = isAdmin || isClientDirector;
  
  // Get user's assigned clients (only used when not client director)
  const { data: assignments, isLoading: assignmentsLoading } = useUserClientAssignments(
    hasFullAccess ? undefined : currentUser?.id
  );
  
  // Get all companies (only used when client director/admin)
  const { data: allCompanies, isLoading: companiesLoading } = useCompanies();
  
  // Get all activity plans
  const { data: activityPlans, isLoading: plansLoading } = useActivityPlans();

  const isLoading = isSeeding || clientDirectorLoading || 
    (hasFullAccess ? companiesLoading : assignmentsLoading) || plansLoading;

  // Build list of companies to display
  const clientsToShow = useMemo(() => {
    const baseList = hasFullAccess 
      ? allCompanies?.map(company => ({ id: company.id, company })) || []
      : assignments || [];
    
    // Apply country filter
    if (selectedCountry === "all") {
      return baseList;
    }
    
    return baseList.filter(item => item.company?.country_id === selectedCountry);
  }, [hasFullAccess, allCompanies, assignments, selectedCountry]);

  // Helper functions
  const getActivePlan = (companyId: string) => {
    return activityPlans?.find(plan => plan.company_id === companyId && plan.is_active);
  };

  const getPlanCount = (companyId: string) => {
    return activityPlans?.filter(plan => plan.company_id === companyId).length || 0;
  };
  
  // Companies with active plans
  const companiesWithPlans = useMemo(() => {
    return clientsToShow.filter(item => getPlanCount(item.company?.id || "") > 0);
  }, [clientsToShow, activityPlans]);
  
  // Companies without plans
  const companiesWithoutPlans = useMemo(() => {
    return clientsToShow.filter(item => getPlanCount(item.company?.id || "") === 0);
  }, [clientsToShow, activityPlans]);
  
  // Get unique countries from the client list (for showing only relevant countries)
  const availableCountries = useMemo(() => {
    const baseList = hasFullAccess 
      ? allCompanies?.map(company => ({ id: company.id, company })) || []
      : assignments || [];
    
    const countryIds = new Set(baseList.map(item => item.company?.country_id).filter(Boolean));
    return countries?.filter(c => countryIds.has(c.id)) || [];
  }, [hasFullAccess, allCompanies, assignments, countries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Betöltés...</p>
        </div>
      </div>
    );
  }

  const hasClients = clientsToShow.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-calibri-bold">Ügyfeleim</h1>
            <p className="text-muted-foreground">
              {hasFullAccess 
                ? "Teljes hozzáférés az összes ügyfél Activity Plan-jéhez"
                : "A hozzád rendelt ügyfelek és Activity Plan-jeik kezelése"
              }
            </p>
          </div>
          {hasFullAccess && (
            <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
              <Crown className="w-3 h-3 mr-1" />
              {isAdmin ? "Admin" : "Client Director"}
            </Badge>
          )}
        </div>
        
        {/* Country Filter */}
        {availableCountries.length > 1 && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ország szűrő" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes ország</SelectItem>
                {availableCountries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!hasClients ? (
        /* Empty state */
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasFullAccess ? "Nincsenek cégek a rendszerben" : "Nincs hozzárendelt ügyfél"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasFullAccess 
                ? "Adj hozzá cégeket a Cégek menüpontban."
                : "Kérd meg az adminisztrátort, hogy rendeljen hozzád ügyfeleket a Felhasználók menüben."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        /* LIST VIEW - Expandable Rows */
        <div className="space-y-6">
          {/* Companies with Activity Plans */}
          {companiesWithPlans.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Aktív ügyfelek ({companiesWithPlans.length})
              </h2>
              <Card className="overflow-hidden">
                {companiesWithPlans.map((item) => {
                  const company = item.company!;
                  return (
                    <ClientExpandableRow
                      key={item.id}
                      company={company}
                      userId={currentUser?.id || ""}
                      activePlan={getActivePlan(company.id)}
                      planCount={getPlanCount(company.id)}
                    />
                  );
                })}
              </Card>
            </div>
          )}

          {/* Companies without Activity Plans */}
          {companiesWithoutPlans.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                Terv nélküli ügyfelek ({companiesWithoutPlans.length})
              </h2>
              <Card className="overflow-hidden">
                {companiesWithoutPlans.map((item) => {
                  const company = item.company!;
                  return (
                    <ClientExpandableRow
                      key={item.id}
                      company={company}
                      userId={currentUser?.id || ""}
                      activePlan={undefined}
                      planCount={0}
                    />
                  );
                })}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyClientsPage;
