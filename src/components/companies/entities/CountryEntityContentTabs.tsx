import { useState, useEffect, useMemo } from "react";
import { Building2, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractedEntity } from "@/types/contracted-entity";
import { cn } from "@/lib/utils";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface CountryEntityContentTabsProps {
  entities: ContractedEntity[];
  countryIds: string[];
  countries: Country[];
  title: string;
  children: (entityId: string | null, entity: ContractedEntity | null, countryId: string, countryName: string) => React.ReactNode;
}

/**
 * Hierarchikus Ország → Entitás fül rendszer
 * 
 * - Ha több ország van: ország füleket mutat
 * - Az adott országon belül, ha több entitás van: entitás alfüleket mutat
 * - Egyébként egyszerűen megjeleníti a tartalmat
 */
export const CountryEntityContentTabs = ({
  entities,
  countryIds,
  countries,
  title,
  children,
}: CountryEntityContentTabsProps) => {
  const [activeCountryId, setActiveCountryId] = useState<string>(countryIds[0] || "");
  const [activeEntityIds, setActiveEntityIds] = useState<Record<string, string>>({});

  // Group entities by country
  const entitiesByCountry = useMemo(() => {
    const grouped = new Map<string, ContractedEntity[]>();
    countryIds.forEach(countryId => {
      grouped.set(countryId, entities.filter(e => e.country_id === countryId));
    });
    return grouped;
  }, [entities, countryIds]);

  // Get country name by ID
  const getCountryName = (countryId: string): string => {
    return countries.find(c => c.id === countryId)?.name || "Ismeretlen";
  };

  // Sync active country when countryIds change
  useEffect(() => {
    if (countryIds.length > 0 && !countryIds.includes(activeCountryId)) {
      setActiveCountryId(countryIds[0]);
    }
  }, [countryIds, activeCountryId]);

  // Initialize active entity for each country
  useEffect(() => {
    const newActiveEntityIds: Record<string, string> = { ...activeEntityIds };
    countryIds.forEach(countryId => {
      const countryEntities = entitiesByCountry.get(countryId) || [];
      if (countryEntities.length > 0 && !newActiveEntityIds[countryId]) {
        newActiveEntityIds[countryId] = countryEntities[0].id;
      }
      // If current active entity is not in the list, reset it
      if (newActiveEntityIds[countryId] && !countryEntities.find(e => e.id === newActiveEntityIds[countryId])) {
        newActiveEntityIds[countryId] = countryEntities[0]?.id || "";
      }
    });
    setActiveEntityIds(newActiveEntityIds);
  }, [entities, countryIds, entitiesByCountry]);

  const handleEntityChange = (countryId: string, entityId: string) => {
    setActiveEntityIds(prev => ({ ...prev, [countryId]: entityId }));
  };

  const getEntityTabLabel = (entity: ContractedEntity, index: number): string => {
    return entity.name || `Entitás ${index + 1}`;
  };

  // Render entity content for a specific country
  const renderCountryContent = (countryId: string) => {
    const countryEntities = entitiesByCountry.get(countryId) || [];
    const countryName = getCountryName(countryId);
    const hasMultipleEntities = countryEntities.length > 1;

    // No entities in this country - just render with country info
    if (countryEntities.length === 0) {
      return children(null, null, countryId, countryName);
    }

    // Single entity - render directly
    if (!hasMultipleEntities) {
      const entity = countryEntities[0];
      return children(entity.id, entity, countryId, countryName);
    }

    // Multiple entities - show entity tabs
    const activeEntityId = activeEntityIds[countryId] || countryEntities[0]?.id || "";

    return (
      <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-medium text-primary">Entitások</h4>
        </div>

        <Tabs
          value={activeEntityId}
          onValueChange={(entityId) => handleEntityChange(countryId, entityId)}
          className="w-full"
        >
          <div className="border-t pt-4">
            <TabsList className="h-auto p-1 bg-muted/50 flex-wrap gap-1">
              {countryEntities.map((entity, index) => (
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

          {countryEntities.map((entity) => (
            <TabsContent key={entity.id} value={entity.id} className="mt-4">
              {children(entity.id, entity, countryId, countryName)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  };

  // Single country - no country tabs needed
  if (countryIds.length <= 1) {
    const countryId = countryIds[0] || "";
    return <>{renderCountryContent(countryId)}</>;
  }

  // Multiple countries - show country tabs
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-primary" />
        <h4 className="text-sm font-medium text-primary">{title}</h4>
      </div>

      <Tabs
        value={activeCountryId}
        onValueChange={setActiveCountryId}
        className="w-full"
      >
        <TabsList className="h-auto p-1 bg-muted/50 flex-wrap gap-1">
          {countryIds.map((countryId) => {
            const countryEntities = entitiesByCountry.get(countryId) || [];
            const entityCount = countryEntities.length;
            
            return (
              <TabsTrigger
                key={countryId}
                value={countryId}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                )}
              >
                {getCountryName(countryId)}
                {entityCount > 1 && (
                  <span className="ml-2 text-xs opacity-70">({entityCount})</span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {countryIds.map((countryId) => (
          <TabsContent key={countryId} value={countryId} className="mt-4">
            {renderCountryContent(countryId)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
