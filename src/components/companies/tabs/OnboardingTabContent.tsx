import { Info } from "lucide-react";

interface OnboardingTabContentProps {
  companyId: string;
}

export const OnboardingTabContent = ({ companyId }: OnboardingTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Info className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Bevezetés</h2>
      </div>
      
      <p className="text-muted-foreground">
        Ez a szekció az "Új érkező" státuszú cégeknél aktív. 
        Itt követheted és kezelheted a bevezetési lépéssorozatot.
      </p>

      <div className="bg-muted/30 border rounded-lg p-6">
        <p className="text-center text-muted-foreground">
          Bevezetési workflow - fejlesztés alatt
        </p>
      </div>
    </div>
  );
};
