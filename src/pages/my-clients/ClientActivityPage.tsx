import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, Settings, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanies, useActivityPlans, useActivityPlanEvents } from "@/hooks/useActivityPlan";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import ActivityPlanTimeline from "@/components/activity-plan/ActivityPlanTimeline";
import ActivityPlanHeader from "@/components/activity-plan/ActivityPlanHeader";
import CreatePlanDialog from "@/components/activity-plan/CreatePlanDialog";

// Mock current user
const MOCK_CURRENT_USER_ID = "mock-user-1";

const ClientActivityPage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Get company details
  const { data: companies } = useCompanies();
  const company = companies?.find(c => c.id === companyId);

  // Get activity plans for this company
  const { data: activityPlans, isLoading: plansLoading } = useActivityPlans(MOCK_CURRENT_USER_ID, companyId);

  // Get events for selected plan
  const activePlan = selectedPlanId 
    ? activityPlans?.find(p => p.id === selectedPlanId)
    : activityPlans?.find(p => p.is_active) || activityPlans?.[0];

  const { data: events, isLoading: eventsLoading } = useActivityPlanEvents(activePlan?.id);

  // Set selected plan when data loads
  if (!selectedPlanId && activePlan && !plansLoading) {
    setSelectedPlanId(activePlan.id);
  }

  const isLoading = plansLoading || eventsLoading;

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cég nem található</p>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/my-clients")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-calibri-bold">{company.name}</h1>
          <p className="text-muted-foreground">{company.country?.name}</p>
        </div>
        <Button 
          onClick={() => setShowCreatePlan(true)}
          className="rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Új Activity Plan
        </Button>
      </div>

      {/* Plans selector */}
      {activityPlans && activityPlans.length > 0 ? (
        <div className="mb-6">
          <Tabs 
            value={selectedPlanId || activityPlans[0]?.id} 
            onValueChange={setSelectedPlanId}
          >
            <TabsList className="h-auto flex-wrap">
              {activityPlans.map(plan => (
                <TabsTrigger 
                  key={plan.id} 
                  value={plan.id}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {plan.title}
                  {plan.is_active && (
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {activityPlans.map(plan => (
              <TabsContent key={plan.id} value={plan.id} className="mt-6">
                {/* Plan Header */}
                <ActivityPlanHeader plan={plan} />

                {/* Timeline */}
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ActivityPlanTimeline 
                    planId={plan.id} 
                    events={events || []} 
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      ) : (
        /* No plans */
        <div className="bg-white rounded-xl border p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nincs Activity Plan</h3>
          <p className="text-muted-foreground mb-6">
            Hozz létre egy új Activity Plan-t az ügyfél számára.
          </p>
          <Button 
            onClick={() => setShowCreatePlan(true)}
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Új Activity Plan létrehozása
          </Button>
        </div>
      )}

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        open={showCreatePlan}
        onOpenChange={setShowCreatePlan}
        companyId={companyId!}
        userId={MOCK_CURRENT_USER_ID}
      />
    </div>
  );
};

export default ClientActivityPage;
