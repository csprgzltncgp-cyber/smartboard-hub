import { useState, useEffect } from "react";
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
  companyName?: string; // Cégnév - az első entitás neve lesz
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
  companyName,
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
  const [isCreatingInitialEntities, setIsCreatingInitialEntities] = useState(false);

  const handleToggle = async (enabled: boolean) => {
    onToggleMultipleEntities(enabled);
    
    // Ha bekapcsoljuk és nincs még entitás, automatikusan létrehozunk 2-t
    if (enabled && entities.length === 0 && !isCreatingInitialEntities) {
      setIsCreatingInitialEntities(true);
      try {
        // Első entitás: a cégnév vagy "Entitás 1"
        const entity1 = createDefaultEntity(companyId, countryId, companyName || "Entitás 1");
        await onAddEntity(entity1);
        
        // Második entitás
        const entity2 = createDefaultEntity(companyId, countryId, "Entitás 2");
        await onAddEntity(entity2);
      } finally {
        setIsCreatingInitialEntities(false);
      }
    }
  };

  const handleAddEntity = async () => {
    const newEntity = createDefaultEntity(companyId, countryId, `Entitás ${entities.length + 1}`);
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
  useEffect(() => {
    if (entities.length > 0 && !entities.find(e => e.id === activeEntityId)) {
      setActiveEntityId(entities[0].id);
    }
  }, [entities, activeEntityId]);

  // Set first entity as active when entities are loaded
  useEffect(() => {
    if (entities.length > 0 && !activeEntityId) {
      setActiveEntityId(entities[0].id);
    }
  }, [entities, activeEntityId]);

  const getEntityTabLabel = (entity: ContractedEntity, index: number): string => {
    return entity.name || `Entitás ${index + 1}`;
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
          disabled={isLoading || isCreatingInitialEntities}
        />
      </div>

      {hasMultipleEntities && (
        <>
          {(entities.length === 0 || isCreatingInitialEntities) ? (
            <div className="text-center py-8 border-t">
              <p className="text-sm text-muted-foreground">
                Entitások létrehozása...
              </p>
            </div>
          ) : (
            <Tabs 
              value={activeEntityId} 
              onValueChange={setActiveEntityId}
              className="w-full"
            >
              <div className="flex items-center gap-2 border-t pt-4 flex-wrap">
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
                      {getEntityTabLabel(entity, index)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEntity}
                  disabled={isLoading}
                  className="h-9"
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
