import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DifferentPerCountryToggle } from "../DifferentPerCountryToggle";
import { ContractedEntity, createDefaultEntity } from "@/types/contracted-entity";
import { ContractHolder } from "@/types/company";
import { EntityDataPanel } from "./EntityDataPanel";
import { cn } from "@/lib/utils";

interface EntityTabsPanelProps {
  companyId: string;
  countryId: string;
  countryName: string;
  entities: ContractedEntity[];
  hasMultipleEntities: boolean;
  contractHolders: ContractHolder[];
  onToggleMultipleEntities: (enabled: boolean) => void;
  onAddEntity: (entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEntity: (id: string, updates: Partial<ContractedEntity>) => Promise<void>;
  onDeleteEntity: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const EntityTabsPanel = ({
  companyId,
  countryId,
  countryName,
  entities,
  hasMultipleEntities,
  contractHolders,
  onToggleMultipleEntities,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity,
  isLoading = false,
}: EntityTabsPanelProps) => {
  const [activeEntityId, setActiveEntityId] = useState<string>(entities[0]?.id || "");

  const handleToggle = (enabled: boolean) => {
    onToggleMultipleEntities(enabled);
  };

  const handleAddEntity = async () => {
    const newEntity = createDefaultEntity(companyId, countryId, `Új entitás ${entities.length + 1}`);
    await onAddEntity(newEntity);
  };

  const handleUpdateEntity = (entityId: string) => (updates: Partial<ContractedEntity>) => {
    onUpdateEntity(entityId, updates);
  };

  const handleDeleteEntity = (entityId: string) => async () => {
    await onDeleteEntity(entityId);
    // Ha a törölt entitás volt az aktív, váltsunk másikra
    if (activeEntityId === entityId) {
      const remainingEntities = entities.filter(e => e.id !== entityId);
      if (remainingEntities.length > 0) {
        setActiveEntityId(remainingEntities[0].id);
      }
    }
  };

  // Update active tab when entities change
  if (entities.length > 0 && !entities.find(e => e.id === activeEntityId)) {
    setActiveEntityId(entities[0].id);
  }

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
          {entities.length === 0 ? (
            <div className="text-center py-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Még nincs entitás hozzáadva. Kattintson az "Új entitás" gombra.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddEntity}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Új entitás
              </Button>
            </div>
          ) : (
            <Tabs 
              value={activeEntityId} 
              onValueChange={setActiveEntityId}
              className="w-full"
            >
              <div className="flex items-center justify-between border-t pt-4">
                <TabsList className="h-auto p-1 bg-muted/50 flex-wrap gap-1">
                  {entities.map((entity, index) => (
                    <TabsTrigger
                      key={entity.id}
                      value={entity.id}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm",
                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      )}
                    >
                      {entity.name || `Entitás ${index + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEntity}
                  disabled={isLoading}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Új entitás
                </Button>
              </div>

              {entities.map((entity) => (
                <TabsContent
                  key={entity.id}
                  value={entity.id}
                  className="mt-4 border-t pt-4"
                >
                  <EntityDataPanel
                    entity={entity}
                    contractHolders={contractHolders}
                    onUpdate={handleUpdateEntity(entity.id)}
                    onDelete={handleDeleteEntity(entity.id)}
                    canDelete={entities.length > 1}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </>
      )}
    </div>
  );
};
