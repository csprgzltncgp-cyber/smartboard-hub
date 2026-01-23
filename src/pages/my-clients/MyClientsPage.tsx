import { useState, useEffect, useMemo } from "react";
import { Building2, Calendar, Globe, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserClientAssignments, useActivityPlans, useCountries, useAllUserClientAssignments, useUsersWithClients } from "@/hooks/useActivityPlan";
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
  const [selectedColleague, setSelectedColleague] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("my-clients");
  
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
  
  // Get user's own assigned clients
  const { data: myAssignments, isLoading: myAssignmentsLoading } = useUserClientAssignments(currentUser?.id);
  
  // Get all assignments with user info (for Client Directors)
  const { data: allAssignments, isLoading: allAssignmentsLoading } = useAllUserClientAssignments();
  
  // Get users with clients (for colleague selector)
  const { data: usersWithClients } = useUsersWithClients();
  
  // Get all activity plans
  const { data: activityPlans, isLoading: plansLoading } = useActivityPlans();

  const isLoading = isSeeding || clientDirectorLoading || myAssignmentsLoading || 
    (hasFullAccess && allAssignmentsLoading) || plansLoading;

  // Helper functions
  const getActivePlan = (companyId: string) => {
    return activityPlans?.find(plan => plan.company_id === companyId && plan.is_active);
  };

  const getPlanCount = (companyId: string) => {
    return activityPlans?.filter(plan => plan.company_id === companyId).length || 0;
  };

  // My clients list
  const myClients = useMemo(() => {
    let list = myAssignments || [];
    
    if (selectedCountry !== "all") {
      list = list.filter(item => item.company?.country_id === selectedCountry);
    }
    
    return list;
  }, [myAssignments, selectedCountry]);

  // Team clients list (for Client Director view)
  const teamClients = useMemo(() => {
    if (!allAssignments) return [];
    
    let list = allAssignments;
    
    // Filter by colleague
    if (selectedColleague !== "all") {
      list = list.filter(item => item.user_id === selectedColleague);
    }
    
    // Filter by country
    if (selectedCountry !== "all") {
      list = list.filter(item => item.company?.country_id === selectedCountry);
    }
    
    return list;
  }, [allAssignments, selectedColleague, selectedCountry]);

  // Get colleagues for selector (excluding current user)
  const colleaguesForSelector = useMemo(() => {
    return usersWithClients?.filter(u => u.id !== currentUser?.id) || [];
  }, [usersWithClients, currentUser?.id]);

  // Separate my clients with/without plans
  const myClientsWithPlans = useMemo(() => {
    return myClients.filter(item => getPlanCount(item.company?.id || "") > 0);
  }, [myClients, activityPlans]);
  
  const myClientsWithoutPlans = useMemo(() => {
    return myClients.filter(item => getPlanCount(item.company?.id || "") === 0);
  }, [myClients, activityPlans]);

  // Separate team clients with/without plans
  const teamClientsWithPlans = useMemo(() => {
    return teamClients.filter(item => getPlanCount(item.company?.id || "") > 0);
  }, [teamClients, activityPlans]);
  
  const teamClientsWithoutPlans = useMemo(() => {
    return teamClients.filter(item => getPlanCount(item.company?.id || "") === 0);
  }, [teamClients, activityPlans]);
  
  // Get unique countries from the client list
  const availableCountries = useMemo(() => {
    const baseList = activeTab === "team-clients" ? teamClients : myClients;
    const countryIds = new Set(baseList.map(item => item.company?.country_id).filter(Boolean));
    return countries?.filter(c => countryIds.has(c.id)) || [];
  }, [activeTab, teamClients, myClients, countries]);

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

  const renderClientList = (
    clientsWithPlans: typeof myClientsWithPlans, 
    clientsWithoutPlans: typeof myClientsWithoutPlans,
    showOwner: boolean = false
  ) => {
    const hasClients = clientsWithPlans.length > 0 || clientsWithoutPlans.length > 0;

    if (!hasClients) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === "team-clients" ? "Nincs ügyfél a kiválasztott szűrőkkel" : "Nincs hozzárendelt ügyfél"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === "team-clients" 
                ? "Válassz másik munkatársat vagy országot."
                : "Kérd meg az adminisztrátort, hogy rendeljen hozzád ügyfeleket a Felhasználók menüben."
              }
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Companies with Activity Plans */}
        {clientsWithPlans.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Aktív ügyfelek ({clientsWithPlans.length})
            </h2>
            <Card className="overflow-hidden">
              {clientsWithPlans.map((item) => {
                const company = item.company!;
                const ownerName = showOwner && 'user' in item ? (item as any).user?.name : undefined;
                return (
                  <ClientExpandableRow
                    key={item.id}
                    company={company}
                    userId={currentUser?.id || ""}
                    activePlan={getActivePlan(company.id)}
                    planCount={getPlanCount(company.id)}
                    ownerName={ownerName}
                  />
                );
              })}
            </Card>
          </div>
        )}

        {/* Companies without Activity Plans */}
        {clientsWithoutPlans.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              Terv nélküli ügyfelek ({clientsWithoutPlans.length})
            </h2>
            <Card className="overflow-hidden">
              {clientsWithoutPlans.map((item) => {
                const company = item.company!;
                const ownerName = showOwner && 'user' in item ? (item as any).user?.name : undefined;
                return (
                  <ClientExpandableRow
                    key={item.id}
                    company={company}
                    userId={currentUser?.id || ""}
                    activePlan={undefined}
                    planCount={0}
                    ownerName={ownerName}
                  />
                );
              })}
            </Card>
          </div>
        )}
      </div>
    );
  };

  // Non-Client Director view - simple list
  if (!hasFullAccess) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-calibri-bold">Ügyfeleim</h1>
            <p className="text-muted-foreground">
              A hozzád rendelt ügyfelek és Activity Plan-jeik kezelése
            </p>
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

        {renderClientList(myClientsWithPlans, myClientsWithoutPlans)}
      </div>
    );
  }

  // Client Director / Admin view - tabbed interface
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-calibri-bold">Ügyfeleim</h1>
        <p className="text-muted-foreground">
          Teljes hozzáférés az összes ügyfél Activity Plan-jéhez
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="my-clients" className="gap-2">
              <Calendar className="w-4 h-4" />
              Saját ügyfeleim
            </TabsTrigger>
            <TabsTrigger value="team-clients" className="gap-2">
              <Users className="w-4 h-4" />
              Csapat ügyfelei
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Colleague filter - only on team tab */}
            {activeTab === "team-clients" && colleaguesForSelector.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedColleague} onValueChange={setSelectedColleague}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Munkatárs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Összes munkatárs</SelectItem>
                    {colleaguesForSelector.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
        </div>

        <TabsContent value="my-clients" className="mt-0">
          {renderClientList(myClientsWithPlans, myClientsWithoutPlans)}
        </TabsContent>

        <TabsContent value="team-clients" className="mt-0">
          {renderClientList(teamClientsWithPlans, teamClientsWithoutPlans, true)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyClientsPage;