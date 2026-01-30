import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface RequireGroupNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (groupName: string) => void;
  onCancel: () => void;
}

export const RequireGroupNameDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: RequireGroupNameDialogProps) => {
  const [groupName, setGroupName] = useState("");

  const handleConfirm = () => {
    if (groupName.trim()) {
      onConfirm(groupName.trim());
      setGroupName("");
    }
  };

  const handleCancel = () => {
    setGroupName("");
    onCancel();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cégcsoport neve szükséges</DialogTitle>
          <DialogDescription>
            Az országonkénti alapadatok bekapcsolásához meg kell adnod a cégcsoport nevét. 
            Ez a név fog megjelenni a Cégek listában.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Cégcsoport neve</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Add meg a cégcsoport nevét..."
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Mégse
          </Button>
          <Button onClick={handleConfirm} disabled={!groupName.trim()}>
            Bekapcsolás
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
