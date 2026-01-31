import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Settings2 } from 'lucide-react';
import { CDWizardState, createDefaultWizardState, WizardStep } from '@/types/client-dashboard';
import { ReportStructureStep } from './steps/ReportStructureStep';
import { UserAssignmentStep } from './steps/UserAssignmentStep';
import { PermissionsStep } from './steps/PermissionsStep';

interface CDWizardProps {
  companyId: string;
  countryIds: string[];
  entityIds: string[];
  onComplete: (state: CDWizardState) => void;
  onCancel: () => void;
  initialState?: Partial<CDWizardState>;
}

const STEPS: { key: WizardStep; label: string; description: string }[] = [
  { key: 'report_structure', label: 'Riport struktúra', description: 'Országok és entitások riport beállításai' },
  { key: 'user_assignment', label: 'Felhasználók', description: 'Hozzáférések és userek hozzárendelése' },
  { key: 'permissions', label: 'Jogosultságok', description: 'Menüpontok és jogosultságok finomhangolása' },
];

export const CDWizard = ({
  companyId,
  countryIds,
  entityIds,
  onComplete,
  onCancel,
  initialState,
}: CDWizardProps) => {
  const [state, setState] = useState<CDWizardState>(() => ({
    ...createDefaultWizardState(),
    ...initialState,
    selectedCountryIds: countryIds,
    selectedEntityIds: entityIds,
  }));

  const currentStepIndex = STEPS.findIndex(s => s.key === state.currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const canGoNext = () => {
    switch (state.currentStep) {
      case 'report_structure':
        return state.reportType !== undefined;
      case 'user_assignment':
        return state.users.length > 0;
      case 'permissions':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setState(prev => ({ ...prev, currentStep: STEPS[nextIndex].key }));
    } else {
      // Utolsó lépés - befejezés
      setState(prev => {
        const finalState = { ...prev, isComplete: true };
        // Mindig a legfrissebb state menjen ki
        onComplete(finalState);
        return finalState;
      });
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setState(prev => ({ ...prev, currentStep: STEPS[prevIndex].key }));
    }
  };

  const updateState = (updates: Partial<CDWizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Client Dashboard konfiguráció</h3>
            <p className="text-sm text-muted-foreground">
              {STEPS[currentStepIndex]?.description}
            </p>
          </div>
        </div>
        
        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${index < currentStepIndex 
                    ? 'bg-primary text-primary-foreground' 
                    : index === currentStepIndex 
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <Progress value={progress} className="h-1" />
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {state.currentStep === 'report_structure' && (
            <ReportStructureStep
              state={state}
              countryIds={countryIds}
              entityIds={entityIds}
              companyId={companyId}
              onUpdate={updateState}
            />
          )}
          {state.currentStep === 'user_assignment' && (
            <UserAssignmentStep
              state={state}
              countryIds={countryIds}
              entityIds={entityIds}
              companyId={companyId}
              onUpdate={updateState}
            />
          )}
          {state.currentStep === 'permissions' && (
            <PermissionsStep
              state={state}
              onUpdate={updateState}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={currentStepIndex === 0 ? onCancel : handleBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentStepIndex === 0 ? 'Mégse' : 'Vissza'}
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext()}
        >
          {currentStepIndex === STEPS.length - 1 ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Befejezés
            </>
          ) : (
            <>
              Tovább
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
