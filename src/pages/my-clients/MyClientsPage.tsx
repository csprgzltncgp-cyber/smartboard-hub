import { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  Plus, 
  Crown, 
  Calendar, 
  LayoutGrid, 
  List, 
  Search,
  ChevronRight,
  MapPin,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUserClientAssignments, useActivityPlans, useCompanies } from "@/hooks/useActivityPlan";
import { useSeedActivityPlanData } from "@/hooks/useSeedActivityPlanData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { Company } from "@/types/activityPlan";
import ClientDetailSheet from "@/components/activity-plan/ClientDetailSheet";
import CreatePlanDialog from "@/components/activity-plan/CreatePlanDialog";

type ViewMode = "list" | "cards";

const MyClientsPage = () => {
  const { currentUser } = useAuth();
  const { isSeeding } = useSeedActivityPlanData();
  
  const [isClientDirector, setIsClientDirector] = useState(false);
  const [clientDirectorLoading, setClientDirectorLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createPlanCompanyId, setCreatePlanCompanyId] = useState<string | null>(null);
  
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
    const items = hasFullAccess 
      ? allCompanies?.map(company => ({ id: company.id, company })) || []
      : assignments || [];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return items.filter(item => 
        item.company?.name?.toLowerCase().includes(query) ||
        item.company?.country?.name?.toLowerCase().includes(query) ||
        item.company?.contact_email?.toLowerCase().includes(query)
      );
    }
    
    return items;
  }, [hasFullAccess, allCompanies, assignments, searchQuery]);

  // Helper functions
  const getActivePlan = (companyId: string) => {
    return activityPlans?.find(plan => plan.company_id === companyId && plan.is_active);
  };

  const getPlanCount = (companyId: string) => {
    return activityPlans?.filter(plan => plan.company_id === companyId).length || 0;
  };
  
  // Companies with active plans (for cards view)
  const companiesWithPlans = useMemo(() => {
    return clientsToShow.filter(item => getPlanCount(item.company?.id || "") > 0);
  }, [clientsToShow, activityPlans]);
  
  // Companies without plans (for list selection)
  const companiesWithoutPlans = useMemo(() => {
    return clientsToShow.filter(item => getPlanCount(item.company?.id || "") === 0);
  }, [clientsToShow, activityPlans]);

  const handleOpenCompany = (company: Company) => {
    setSelectedCompany(company);
    setSheetOpen(true);
  };

  const handleNewPlan = (companyId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCreatePlanCompanyId(companyId);
  };

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
        
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
            <ToggleGroupItem value="list" aria-label="Lista nézet">
              <List className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="cards" aria-label="Kártya nézet">
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Keresés cég, ország vagy email alapján..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
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
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        <div className="space-y-6">
          {/* Companies with Activity Plans */}
          {companiesWithPlans.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Aktív ügyfelek ({companiesWithPlans.length})
              </h2>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cég</TableHead>
                      <TableHead>Ország</TableHead>
                      <TableHead>Aktív terv</TableHead>
                      <TableHead className="text-center">Tervek száma</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companiesWithPlans.map((item) => {
                      const company = item.company!;
                      const activePlan = getActivePlan(company.id);
                      const planCount = getPlanCount(company.id);

                      return (
                        <TableRow 
                          key={item.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleOpenCompany(company)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{company.name}</p>
                                {company.contact_email && (
                                  <p className="text-sm text-muted-foreground">{company.contact_email}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{company.country?.name}</Badge>
                          </TableCell>
                          <TableCell>
                            {activePlan ? (
                              <div>
                                <p className="font-medium text-green-700">{activePlan.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(activePlan.period_start), "yyyy. MMM d.", { locale: hu })} - {" "}
                                  {format(new Date(activePlan.period_end), "yyyy. MMM d.", { locale: hu })}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{planCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cég</TableHead>
                      <TableHead>Ország</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[150px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companiesWithoutPlans.map((item) => {
                      const company = item.company!;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <p className="font-medium">{company.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{company.country?.name}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {company.contact_email || "-"}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm"
                              onClick={(e) => handleNewPlan(company.id, e)}
                              className="rounded-xl"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Új terv
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="space-y-6">
          {/* Companies with Activity Plans as Cards */}
          {companiesWithPlans.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Aktív ügyfelek ({companiesWithPlans.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companiesWithPlans.map((item) => {
                  const company = item.company!;
                  const activePlan = getActivePlan(company.id);
                  const planCount = getPlanCount(company.id);

                  return (
                    <Card 
                      key={item.id}
                      className="hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => handleOpenCompany(company)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {company.name}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {company.country?.name}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>

                        {activePlan && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                {activePlan.title}
                              </span>
                            </div>
                            <p className="text-xs text-green-600">
                              {format(new Date(activePlan.period_start), "yyyy. MMM d.", { locale: hu })} - {" "}
                              {format(new Date(activePlan.period_end), "yyyy. MMM d.", { locale: hu })}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <Badge variant="secondary">
                            {planCount} terv
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Companies without plans - compact list */}
          {companiesWithoutPlans.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                Terv nélküli ügyfelek ({companiesWithoutPlans.length})
              </h2>
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {companiesWithoutPlans.map((item) => {
                      const company = item.company!;
                      return (
                        <Badge 
                          key={item.id}
                          variant="outline"
                          className="py-2 px-3 cursor-pointer hover:bg-muted"
                          onClick={() => handleNewPlan(company.id)}
                        >
                          {company.name}
                          <Plus className="w-3 h-3 ml-1" />
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Client Detail Sheet */}
      <ClientDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        company={selectedCompany}
        userId={currentUser?.id || ""}
      />

      {/* Create Plan Dialog */}
      {createPlanCompanyId && (
        <CreatePlanDialog
          open={!!createPlanCompanyId}
          onOpenChange={(open) => !open && setCreatePlanCompanyId(null)}
          companyId={createPlanCompanyId}
          userId={currentUser?.id || ""}
        />
      )}
    </div>
  );
};

export default MyClientsPage;
