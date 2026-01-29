import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractedEntity, createDefaultEntity } from "@/types/contracted-entity";

interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  countryId: string;
  entity?: ContractedEntity;
  onSave: (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  title: string;
}

export const EntityFormDialog = ({
  open,
  onOpenChange,
  companyId,
  countryId,
  entity,
  onSave,
  title,
}: EntityFormDialogProps) => {
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [contractDate, setContractDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entity) {
      setName(entity.name);
      setOrgId(entity.org_id || "");
      setContractDate(entity.contract_date || "");
      setContractEndDate(entity.contract_end_date || "");
    } else {
      setName("");
      setOrgId("");
      setContractDate("");
      setContractEndDate("");
    }
  }, [entity, open]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const baseEntity = entity 
        ? { ...entity }
        : createDefaultEntity(companyId, countryId, name);

      await onSave({
        ...baseEntity,
        name: name.trim(),
        org_id: orgId.trim() || null,
        contract_date: contractDate || null,
        contract_end_date: contractEndDate || null,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="entity-name">Entitás neve *</Label>
            <Input
              id="entity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="pl. Henkel Hungary Kft."
            />
            <p className="text-xs text-muted-foreground">
              A jogi személy neve, akivel a szerződést kötötték
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity-org-id">ORG ID</Label>
            <Input
              id="entity-org-id"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              placeholder="ORG ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entity-contract-start">Szerződés kezdete</Label>
              <Input
                id="entity-contract-start"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-contract-end">Szerződés lejárta</Label>
              <Input
                id="entity-contract-end"
                type="date"
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? "Mentés..." : "Mentés"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
