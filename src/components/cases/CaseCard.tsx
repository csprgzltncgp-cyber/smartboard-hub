import { AlertTriangle, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Case, getCaseWarnings, CaseWarning, CASE_EXPERT_STATUS_VALUES } from "@/types/case";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CaseCardProps {
  caseData: Case;
  onSelect: (caseData: Case) => void;
  onDelete?: (caseData: Case) => void;
  showDeleteButton?: boolean;
  userType?: 'operator' | 'expert' | 'admin';
}

export default function CaseCard({ 
  caseData, 
  onSelect, 
  onDelete,
  showDeleteButton = false,
  userType = 'operator' 
}: CaseCardProps) {
  const warnings = getCaseWarnings(caseData, userType);
  const acceptedExpert = caseData.experts.find(e => e.accepted === CASE_EXPERT_STATUS_VALUES.ACCEPTED);
  
  // Case type labels
  const caseTypeLabels: Record<number, string> = {
    1: 'Pszichológiai',
    2: 'Jogi',
    3: 'Pénzügyi',
    4: 'Egyéb',
    5: 'Munkajogi',
    6: 'Életvezetési',
    7: 'Munkahelyi',
    11: 'Coaching',
  };

  // Progress bar gradient - from Laravel
  const getProgressGradient = (percentage: number) => {
    const progressColor = 'rgb(195, 203, 207)'; // Gray progress
    const remainingColor = 'rgb(226, 239, 241)'; // Light blue/teal remaining
    
    return {
      background: `linear-gradient(to right, ${progressColor} 0%, ${progressColor} ${percentage}%, ${remainingColor} ${percentage}%, ${remainingColor} 100%)`,
    };
  };

  const renderWarningBadge = (warning: CaseWarning) => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium";
    const colorClasses = {
      error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };

    return (
      <span key={warning.type} className={cn(baseClasses, colorClasses[warning.severity])}>
        <AlertTriangle className="h-3 w-3" />
        {warning.label}
      </span>
    );
  };

  return (
    <div className="group">
      <div 
        className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/50"
        style={getProgressGradient(caseData.percentage)}
      >
        {/* Case Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-semibold text-sm">
              {caseData.caseIdentifier}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className="text-sm">{caseData.date}</span>
            {userType !== 'expert' && caseData.companyName && (
              <>
                <span className="text-muted-foreground">-</span>
                <span className="text-sm font-medium">{caseData.companyName}</span>
              </>
            )}
            {acceptedExpert && (
              <>
                <span className="text-muted-foreground">-</span>
                <span className="text-sm text-[hsl(var(--cgp-teal))]">{acceptedExpert.name}</span>
              </>
            )}
            {caseData.caseType && caseTypeLabels[caseData.caseType] && (
              <>
                <span className="text-muted-foreground">-</span>
                <span className="text-sm text-muted-foreground">{caseTypeLabels[caseData.caseType]}</span>
              </>
            )}
            {userType === 'expert' && caseData.clientName && (
              <>
                <span className="text-muted-foreground">-</span>
                <span className="text-sm">{caseData.clientName}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(caseData)}
            className="gap-2 bg-white hover:bg-gray-50"
          >
            <Check className="h-4 w-4" />
            Kiválasztás
          </Button>

          {showDeleteButton && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eset törlése</AlertDialogTitle>
                  <AlertDialogDescription>
                    Biztosan törölni szeretnéd a(z) <strong>{caseData.caseIdentifier}</strong> esetet?
                    Ez a művelet nem vonható vissza.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Mégse</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(caseData)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Törlés
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Warnings Row */}
      {warnings.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-2 bg-muted/30 border-t border-border/50 flex-wrap">
          {warnings.map(warning => renderWarningBadge(warning))}
        </div>
      )}
    </div>
  );
}
