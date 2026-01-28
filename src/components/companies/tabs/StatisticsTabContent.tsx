import { BarChart3 } from "lucide-react";

interface StatisticsTabContentProps {
  companyId: string;
}

export const StatisticsTabContent = ({ companyId }: StatisticsTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <BarChart3 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Statisztikák</h2>
      </div>
      
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
