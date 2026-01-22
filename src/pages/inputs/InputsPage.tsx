import { ListChecks, Plus } from "lucide-react";

const InputsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-calibri-bold text-foreground mb-2 flex items-center gap-2">
        <ListChecks className="w-6 h-6" />
        Inputok
      </h1>
      <a 
        href="#" 
        className="text-primary hover:underline text-sm inline-flex items-center gap-1 mb-6"
        onClick={(e) => {
          e.preventDefault();
          // TODO: Navigate to new input creation
        }}
      >
        <Plus className="w-4 h-4" />
        Új input létrehozása
      </a>
      
      <div className="bg-muted/30 rounded-xl p-8 text-center">
        <ListChecks className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-medium text-foreground mb-2">Default Inputok</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Itt jelennek meg az alapértelmezett inputok, amelyek minden cégnél megjelennek az esetfelvétel során.
          A cég-specifikus inputok az adott cég profiljában szerkeszthetők.
        </p>
      </div>
    </div>
  );
};

export default InputsPage;
