import { Settings } from "lucide-react";

interface InputsTabContentProps {
  companyId: string;
}

export const InputsTabContent = ({ companyId }: InputsTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Settings className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Egyedi inputok</h2>
      </div>
      
      <p className="text-muted-foreground">
        Itt hozhatsz létre és szerkeszthetsz cég-specifikus egyedi inputokat.
      </p>

      <div className="bg-muted/30 border rounded-lg p-6">
        <p className="text-center text-muted-foreground">
          Inputok kezelése - fejlesztés alatt
        </p>
      </div>
    </div>
  );
};
