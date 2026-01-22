import { Contact } from "lucide-react";

const CrmPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-calibri-bold text-foreground mb-6 flex items-center gap-2">
        <Contact className="w-6 h-6" />
        CRM
      </h1>
      
      <div className="bg-muted/30 rounded-xl p-8 text-center">
        <Contact className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-medium text-foreground mb-2">Sales CRM</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          A sales csapat számára készülő CRM funkciók hamarosan elérhetők lesznek.
        </p>
      </div>
    </div>
  );
};

export default CrmPage;
