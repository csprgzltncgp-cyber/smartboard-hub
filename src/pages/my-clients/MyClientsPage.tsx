import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Users, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserClientAssignments, useActivityPlans } from "@/hooks/useActivityPlan";
import { useSeedActivityPlanData } from "@/hooks/useSeedActivityPlanData";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

// Mock current user - in real app this would come from auth context
const MOCK_CURRENT_USER_ID = "mock-user-1";

const MyClientsPage = () => {
  const navigate = useNavigate();
  const { isSeeding } = useSeedActivityPlanData();
  
  // Get user's assigned clients
  const { data: assignments, isLoading: assignmentsLoading } = useUserClientAssignments(MOCK_CURRENT_USER_ID);
  
  // Get all activity plans for this user
  const { data: activityPlans, isLoading: plansLoading } = useActivityPlans(MOCK_CURRENT_USER_ID);

  const isLoading = isSeeding || assignmentsLoading || plansLoading;

  // Get active plan for a company
  const getActivePlan = (companyId: string) => {
    return activityPlans?.find(plan => plan.company_id === companyId && plan.is_active);
  };

  // Get plan count for a company
  const getPlanCount = (companyId: string) => {
    return activityPlans?.filter(plan => plan.company_id === companyId).length || 0;
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

  const hasClients = assignments && assignments.length > 0;

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
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Útmutató:</strong> Válaszd ki az ügyfelet, akinek az Activity Plan-jét szeretnéd kezelni. 
          Minden céghez létrehozhatsz éves vagy féléves tervet, amelyben rögzítheted a tervezett eseményeket.
        </p>
      </div>

      {!hasClients ? (
        /* Empty state */
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nincs hozzárendelt ügyfél</h3>
            <p className="text-muted-foreground mb-4">
              Kérd meg az adminisztrátort, hogy rendeljen hozzád ügyfeleket a Felhasználók menüben.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Client list */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => {
            const company = assignment.company;
            const activePlan = getActivePlan(company?.id || "");
            const planCount = getPlanCount(company?.id || "");

            return (
              <Card 
                key={assignment.id} 
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`/dashboard/my-clients/${company?.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {company?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {company?.country?.name}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  {activePlan ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Aktív terv: {activePlan.title}
                        </span>
                      </div>
                      <p className="text-xs text-green-600">
                        {format(new Date(activePlan.period_start), "yyyy. MMM d.", { locale: hu })} - {" "}
                        {format(new Date(activePlan.period_end), "yyyy. MMM d.", { locale: hu })}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">
                        Nincs aktív Activity Plan
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Badge variant="secondary">
                      {planCount} terv összesen
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/my-clients/${company?.id}/new-plan`);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Új terv
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyClientsPage;
