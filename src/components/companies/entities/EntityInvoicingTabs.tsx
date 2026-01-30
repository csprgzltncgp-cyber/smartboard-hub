import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractedEntity } from "@/types/contracted-entity";
import { cn } from "@/lib/utils";

interface EntityInvoicingTabsProps {
  entities: ContractedEntity[];
  hasMultipleEntities: boolean;
  activeEntityId?: string;
  onActiveEntityChange?: (entityId: string) => void;
  children: (entityId: string, entity: ContractedEntity) => React.ReactNode;
}

/**
 * Entitás fülek a Számlázás panelhez
 * Ugyanazt a fülstruktúrát használja mint az Alapadatok panel,
 * de nincs "+ Új entitás" gomb - csak tükrözi az Alapadatokban létrehozott entitásokat
 * 
 * Ha nincs activeEntityId megadva, a komponens maga kezeli az aktív állapotot (uncontrolled mode)
 */
export const EntityInvoicingTabs = ({
  entities,
  hasMultipleEntities,
  activeEntityId: controlledActiveEntityId,
  onActiveEntityChange,
  children,
}: EntityInvoicingTabsProps) => {
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

  // Ha nincs aktív entitás de van entitás, válasszuk ki az elsőt
  useEffect(() => {
    if (entities.length > 0 && !entities.find(e => e.id === activeEntityId)) {
      handleActiveEntityChange(entities[0].id);
    }
  }, [entities, activeEntityId]);

  // Sync internal state when entities change
  useEffect(() => {
    if (!isControlled && entities.length > 0 && !entities.find(e => e.id === internalActiveEntityId)) {
      setInternalActiveEntityId(entities[0].id);
    }
  }, [entities, internalActiveEntityId, isControlled]);

  const getEntityTabLabel = (entity: ContractedEntity, index: number): string => {
    return entity.name || `Entitás ${index + 1}`;
  };

  // Ha nincs bekapcsolva a több entitás, ne rendereljünk semmit
  if (!hasMultipleEntities || entities.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/30 border rounded-lg p-4 space-y-4 mb-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-primary" />
        <h4 className="text-sm font-medium text-primary">Számlázás entitásonként</h4>
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
