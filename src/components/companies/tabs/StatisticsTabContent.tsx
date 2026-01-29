interface StatisticsTabContentProps {
  companyId: string;
}

export const StatisticsTabContent = ({ companyId }: StatisticsTabContentProps) => {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Igénybevételi adatok, bevétel/költség elemzés, riasztások.
      </p>

      <div className="bg-muted/30 border rounded-lg p-6">
        <p className="text-center text-muted-foreground">
          Statisztikák - fejlesztés alatt
        </p>
      </div>
    </div>
  );
};
