import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractedEntity } from "@/types/contracted-entity";
import { cn } from "@/lib/utils";

interface EntityContentTabsProps {
  entities: ContractedEntity[];
  hasMultipleEntities: boolean;
  activeEntityId?: string;
  onActiveEntityChange?: (entityId: string) => void;
  title: string;
  children: (entityId: string, entity: ContractedEntity) => React.ReactNode;
}

/**
 * Általános entitás-füles wrapper komponens
 * Használható: Inputok, Feljegyzések, Statisztikák füleknél
 * 
 * Ha nincs több entitás, egyszerűen rendereli a gyerek tartalmat a default entitással.
 * Ha van több entitás, entitás-füleket jelenít meg.
 */
export const EntityContentTabs = ({
  entities,
  hasMultipleEntities,
  activeEntityId: controlledActiveEntityId,
  onActiveEntityChange,
  title,
  children,
}: EntityContentTabsProps) => {
  // Internal state for uncontrolled mode
  const [internalActiveEntityId, setInternalActiveEntityId] = useState<string>(entities[0]?.id || "");
  
  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledActiveEntityId !== undefined && onActiveEntityChange !== undefined;
  const activeEntityId = isControlled ? controlledActiveEntityId : internalActiveEntityId;
  
  const handleActiveEntityChange = (entityId: string) => {
    if (isControlled && onActiveEntityChange) {
      onActiveEntityChange(entityId);
    } else {
      setInternalActiveEntityId(entityId);
    }
  };

  // Sync internal state when entities change
  useEffect(() => {
    if (entities.length > 0 && !entities.find(e => e.id === activeEntityId)) {
      handleActiveEntityChange(entities[0].id);
    }
  }, [entities, activeEntityId]);

  // Sync internal state when entities change (uncontrolled mode)
  useEffect(() => {
    if (!isControlled && entities.length > 0 && !entities.find(e => e.id === internalActiveEntityId)) {
      setInternalActiveEntityId(entities[0].id);
    }
  }, [entities, internalActiveEntityId, isControlled]);

  const getEntityTabLabel = (entity: ContractedEntity, index: number): string => {
    return entity.name || `Entitás ${index + 1}`;
  };

  // Ha nincs bekapcsolva a több entitás vagy nincs entitás
  if (!hasMultipleEntities || entities.length === 0) {
    // Single entity mode: render content for the first entity or with companyId
    const defaultEntity = entities[0];
    if (!defaultEntity) {
      return null;
    }
    return <>{children(defaultEntity.id, defaultEntity)}</>;
  }

  // Multiple entities mode: show tabs
  return (
    <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-primary" />
        <h4 className="text-sm font-medium text-primary">{title}</h4>
      </div>

      <Tabs 
        value={activeEntityId} 
        onValueChange={handleActiveEntityChange}
        className="w-full"
      >
        <div className="border-t pt-4">
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
        </div>

        {entities.map((entity) => (
          <TabsContent
            key={entity.id}
            value={entity.id}
            className="mt-4"
          >
            {children(entity.id, entity)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
