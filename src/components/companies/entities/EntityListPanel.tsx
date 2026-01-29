import { useState } from "react";
import { Plus, Building2, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifferentPerCountryToggle } from "../DifferentPerCountryToggle";
import { ContractedEntity } from "@/types/contracted-entity";
import { EntityFormDialog } from "./EntityFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EntityListPanelProps {
  companyId: string;
  countryId: string;
  countryName: string;
  entities: ContractedEntity[];
  hasMultipleEntities: boolean;
  onToggleMultipleEntities: (enabled: boolean) => void;
  onAddEntity: (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEntity: (id: string, updates: Partial<ContractedEntity>) => Promise<void>;
  onDeleteEntity: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const EntityListPanel = ({
  companyId,
  countryId,
  countryName,
  entities,
  hasMultipleEntities,
  onToggleMultipleEntities,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity,
  isLoading = false,
}: EntityListPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingEntity, setEditingEntity] = useState<ContractedEntity | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteEntityId, setDeleteEntityId] = useState<string | null>(null);

  const handleToggle = (enabled: boolean) => {
    onToggleMultipleEntities(enabled);
  };

  const handleAddEntity = async (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => {
    await onAddEntity(entity);
    setIsAddDialogOpen(false);
  };

  const handleUpdateEntity = async (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingEntity) {
      await onUpdateEntity(editingEntity.id, entity);
      setEditingEntity(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteEntityId) {
      await onDeleteEntity(deleteEntityId);
      setDeleteEntityId(null);
    }
  };

  return (
    <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-medium text-primary">Szerződött entitások</h4>
        </div>
        <DifferentPerCountryToggle
          label="Több entitás"
          checked={hasMultipleEntities}
          onChange={handleToggle}
          disabled={isLoading}
        />
      </div>

      {hasMultipleEntities && (
        <>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {entities.length} entitás ({countryName})
              </span>
              {entities.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="h-8"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Új entitás
            </Button>
          </div>

          {isExpanded && entities.length > 0 && (
            <div className="space-y-2">
              {entities.map((entity) => (
                <div
                  key={entity.id}
                  className="flex items-center justify-between p-3 bg-background rounded-md border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{entity.name}</p>
                      {entity.org_id && (
                        <p className="text-xs text-muted-foreground">ORG ID: {entity.org_id}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingEntity(entity)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteEntityId(entity.id)}
                      disabled={entities.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {entities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Még nincs entitás hozzáadva. Kattintson az "Új entitás" gombra.
            </p>
          )}
        </>
      )}

      {/* Add Entity Dialog */}
      <EntityFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        companyId={companyId}
        countryId={countryId}
        onSave={handleAddEntity}
        title="Új entitás hozzáadása"
      />

      {/* Edit Entity Dialog */}
      <EntityFormDialog
        open={!!editingEntity}
        onOpenChange={(open) => !open && setEditingEntity(null)}
        companyId={companyId}
        countryId={countryId}
        entity={editingEntity || undefined}
        onSave={handleUpdateEntity}
        title="Entitás szerkesztése"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteEntityId} onOpenChange={(open) => !open && setDeleteEntityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Entitás törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretné ezt az entitást? Ez a művelet nem vonható vissza,
              és az entitáshoz tartozó számlázási adatok is törlődnek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
