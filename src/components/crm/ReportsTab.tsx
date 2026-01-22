import { BarChart3 } from "lucide-react";

const ReportsTab = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-calibri-bold text-foreground mb-2">
        Riportok
      </h3>
      <p className="text-muted-foreground text-sm text-center max-w-md">
        A riport funkciók hamarosan elérhetők lesznek. Itt láthatod majd a sales statisztikákat, konverziós arányokat és az értékesítési teljesítményt.
      </p>
    </div>
  );
};

export default ReportsTab;
