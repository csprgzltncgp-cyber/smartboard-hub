interface StatisticsTabContentProps {
  companyId: string;
  entityId?: string;
  entityName?: string;
}

export const StatisticsTabContent = ({ companyId, entityId, entityName }: StatisticsTabContentProps) => {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        {entityName 
          ? `Igénybevételi adatok, bevétel/költség elemzés, riasztások - ${entityName}`
          : "Igénybevételi adatok, bevétel/költség elemzés, riasztások."
        }
      </p>

      <div className="bg-muted/30 border rounded-lg p-6">
        <p className="text-center text-muted-foreground">
          Statisztikák - fejlesztés alatt
          {entityId && <span className="block text-xs mt-1">(Entitás: {entityName || entityId})</span>}
        </p>
      </div>
    </div>
  );
};
