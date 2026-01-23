import { useState } from "react";
import { Calendar, Plus, Building2, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Company, ActivityPlan } from "@/types/activityPlan";
import { useActivityPlans, useActivityPlanEvents } from "@/hooks/useActivityPlan";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import ActivityPlanTimeline from "./ActivityPlanTimeline";
import ActivityPlanHeader from "./ActivityPlanHeader";
import CreatePlanDialog from "./CreatePlanDialog";

interface ClientExpandableRowProps {
  company: Company;
  userId: string;
  activePlan?: ActivityPlan;
  planCount: number;
}

const ClientExpandableRow = ({ company, userId, activePlan, planCount }: ClientExpandableRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Get activity plans for this company (only when expanded)
  const { data: activityPlans, isLoading: plansLoading } = useActivityPlans(undefined, company.id);

  // Determine selected plan
  const currentPlan = selectedPlanId
    ? activityPlans?.find(p => p.id === selectedPlanId)
    : activityPlans?.find(p => p.is_active) || activityPlans?.[0];

  // Get events for selected plan
  const { data: events, isLoading: eventsLoading } = useActivityPlanEvents(currentPlan?.id);

  // Set selected plan when data loads
  if (!selectedPlanId && currentPlan && !plansLoading && isExpanded) {
    setSelectedPlanId(currentPlan.id);
  }

  const isLoading = plansLoading || eventsLoading;

  return (
    <>
      <div className="border-b border-border">
        {/* Header Row */}
        <div
          className="flex items-center gap-4 py-3 px-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Company Icon */}
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>

          {/* Company Name */}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-foreground">{company.name}</span>
            {company.country && (
              <span className="text-muted-foreground ml-2 text-sm">
                ({company.country.name})
              </span>
            )}
          </div>

          {/* Active Plan Badge */}
          {activePlan ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Calendar className="w-3 h-3 mr-1" />
              {activePlan.title}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Nincs aktív terv
            </Badge>
          )}

          {/* Plan Count */}
          <Badge variant="secondary">{planCount} terv</Badge>

          {/* New Plan Button */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              setShowCreatePlan(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Új terv
          </Button>

          {/* Chevron */}
          <button className="p-1 hover:bg-muted rounded">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 py-4 bg-background border-t">
            {activityPlans && activityPlans.length > 0 ? (
              <Tabs
                value={selectedPlanId || activityPlans[0]?.id}
                onValueChange={setSelectedPlanId}
              >
                <TabsList className="h-auto flex-wrap gap-1 mb-4">
                  {activityPlans.map(plan => (
                    <TabsTrigger
                      key={plan.id}
                      value={plan.id}
                      className="flex items-center gap-2 text-sm"
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
                  <TabsContent key={plan.id} value={plan.id} className="mt-0">
                    {/* Plan Header */}
                    <ActivityPlanHeader plan={plan} />

                    {/* Timeline */}
                    <div className="mt-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <ActivityPlanTimeline
                          planId={plan.id}
                          events={events || []}
                        />
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              /* No plans */
              <div className="bg-muted/50 rounded-xl border border-dashed p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Nincs Activity Plan</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Hozz létre egy új Activity Plan-t az ügyfél számára.
                </p>
                <Button
                  onClick={() => setShowCreatePlan(true)}
                  className="rounded-xl"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Új Activity Plan
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        open={showCreatePlan}
        onOpenChange={setShowCreatePlan}
        companyId={company.id}
        userId={userId}
      />
    </>
  );
};

export default ClientExpandableRow;
