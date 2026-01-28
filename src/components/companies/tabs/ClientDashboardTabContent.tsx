import { Monitor } from "lucide-react";

interface ClientDashboardTabContentProps {
  companyId: string;
  countryIds: string[];
}

export const ClientDashboardTabContent = ({ companyId, countryIds }: ClientDashboardTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Monitor className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Client Dashboard</h2>
      </div>
      
      <p className="text-muted-foreground">
        Client Dashboard hozzáférések kezelése országonként.
      </p>

      <div className="bg-muted/30 border rounded-lg p-6">
        <p className="text-center text-muted-foreground">
          Client Dashboard beállítások - fejlesztés alatt
        </p>
      </div>
    </div>
  );
};
