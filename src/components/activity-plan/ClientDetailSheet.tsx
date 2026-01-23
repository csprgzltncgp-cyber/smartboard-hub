import { useState } from "react";
import { Calendar, Plus, Building2, MapPin, Mail, Phone, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Company, ActivityPlan, ActivityPlanEvent, PERIOD_LABELS } from "@/types/activityPlan";
import { useActivityPlans, useActivityPlanEvents } from "@/hooks/useActivityPlan";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import ActivityPlanTimeline from "./ActivityPlanTimeline";
import ActivityPlanHeader from "./ActivityPlanHeader";
import CreatePlanDialog from "./CreatePlanDialog";

interface ClientDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  userId: string;
}

const ClientDetailSheet = ({ open, onOpenChange, company, userId }: ClientDetailSheetProps) => {
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Get activity plans for this company
  const { data: activityPlans, isLoading: plansLoading } = useActivityPlans(undefined, company?.id);

  // Determine active/selected plan
  const activePlan = selectedPlanId
    ? activityPlans?.find(p => p.id === selectedPlanId)
    : activityPlans?.find(p => p.is_active) || activityPlans?.[0];

  // Get events for selected plan
  const { data: events, isLoading: eventsLoading } = useActivityPlanEvents(activePlan?.id);

  // Set selected plan when data loads
  if (!selectedPlanId && activePlan && !plansLoading) {
    setSelectedPlanId(activePlan.id);
  }

  if (!company) return null;

  const isLoading = plansLoading || eventsLoading;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl p-0">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b bg-muted/30">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-2xl font-calibri-bold mb-1">
                  {company.name}
                </SheetTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {company.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {company.country.name}
                    </span>
                  )}
                  {company.contact_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {company.contact_email}
                    </span>
                  )}
                  {company.contact_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {company.contact_phone}
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowCreatePlan(true)}
                size="sm"
                className="rounded-xl shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                Új terv
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-6">
              {/* Plans */}
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

                      <Separator className="my-4" />

                      {/* Timeline */}
                      {isLoading ? (
                        <div className="flex items-center justify-center h-48">
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
              ) : (
                /* No plans */
                <div className="bg-muted/50 rounded-xl border border-dashed p-12 text-center">
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
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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

export default ClientDetailSheet;
