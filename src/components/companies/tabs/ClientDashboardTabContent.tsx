interface ClientDashboardTabContentProps {
  companyId: string;
  countryIds: string[];
}

export const ClientDashboardTabContent = ({ companyId, countryIds }: ClientDashboardTabContentProps) => {
  return (
    <div className="space-y-6">
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
