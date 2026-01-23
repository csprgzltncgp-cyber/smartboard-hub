import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { Calendar, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityPlan, PERIOD_LABELS } from "@/types/activityPlan";
import { useUpdateActivityPlan } from "@/hooks/useActivityPlan";

interface ActivityPlanHeaderProps {
  plan: ActivityPlan;
}

const ActivityPlanHeader = ({ plan }: ActivityPlanHeaderProps) => {
  const updatePlan = useUpdateActivityPlan();

  const toggleActive = () => {
    updatePlan.mutate({
      id: plan.id,
      is_active: !plan.is_active,
    });
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-semibold">{plan.title}</h2>
            <Badge variant={plan.is_active ? "default" : "secondary"}>
              {plan.is_active ? "Aktív" : "Inaktív"}
            </Badge>
            <Badge variant="outline">
              {PERIOD_LABELS[plan.period_type]}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(plan.period_start), "yyyy. MMMM d.", { locale: hu })} - {" "}
              {format(new Date(plan.period_end), "yyyy. MMMM d.", { locale: hu })}
            </span>
          </div>
          {plan.notes && (
            <p className="mt-3 text-sm text-muted-foreground">{plan.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleActive}
            className="rounded-xl"
          >
            {plan.is_active ? (
              <>
                <ToggleRight className="w-4 h-4 mr-2" />
                Deaktiválás
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 mr-2" />
                Aktiválás
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityPlanHeader;
