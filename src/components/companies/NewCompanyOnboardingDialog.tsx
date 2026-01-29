import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardList, Building2 } from "lucide-react";

interface NewCompanyOnboardingDialogProps {
  open: boolean;
  onChoice: (withOnboarding: boolean) => void;
}

export const NewCompanyOnboardingDialog = ({
  open,
  onChoice,
}: NewCompanyOnboardingDialogProps) => {
  // X gomb vagy kívülre kattintás = Bevezetés nélkül
  const handleClose = () => {
    onChoice(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Új cég létrehozása</DialogTitle>
          <DialogDescription>
            Hogyan szeretnéd létrehozni az új céget?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-3 h-auto py-6 border-2 hover:border-[#91b752] hover:bg-[#91b752]/10 transition-all"
            onClick={() => onChoice(true)}
          >
            <ClipboardList className="h-8 w-8 text-[#91b752]" />
            <div className="text-center">
              <p className="font-semibold">Bevezetéssel</p>
              <p className="text-xs text-muted-foreground mt-1">
                Új érkező, bevezető folyamattal
              </p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-3 h-auto py-6 border-2 hover:border-primary hover:bg-primary/10 transition-all"
            onClick={() => onChoice(false)}
          >
            <Building2 className="h-8 w-8 text-primary" />
            <div className="text-center">
              <p className="font-semibold">Bevezetés nélkül</p>
              <p className="text-xs text-muted-foreground mt-1">
                Már aktív cég hozzáadása
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
