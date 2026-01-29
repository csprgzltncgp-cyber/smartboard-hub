interface OnboardingTabContentProps {
  companyId: string;
}

export const OnboardingTabContent = ({ companyId }: OnboardingTabContentProps) => {
  return (
    <div className="space-y-6">
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
