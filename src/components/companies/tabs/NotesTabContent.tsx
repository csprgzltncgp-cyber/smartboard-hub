interface NotesTabContentProps {
  companyId: string;
}

export const NotesTabContent = ({ companyId }: NotesTabContentProps) => {
  return (
    <div className="space-y-6">
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
