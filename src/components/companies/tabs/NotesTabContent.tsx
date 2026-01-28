import { StickyNote } from "lucide-react";

interface NotesTabContentProps {
  companyId: string;
}

export const NotesTabContent = ({ companyId }: NotesTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <StickyNote className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Feljegyzések</h2>
      </div>
      
      <p className="text-muted-foreground">
        Céggel kapcsolatos jegyzetek, fontos információk rögzítése.
      </p>

      <div className="bg-muted/30 border rounded-lg p-6">
        <p className="text-center text-muted-foreground">
          Feljegyzések - fejlesztés alatt
        </p>
      </div>
    </div>
  );
};
