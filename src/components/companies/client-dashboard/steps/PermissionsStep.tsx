import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CDWizardState, CD_MENU_ITEMS, ClientDashboardUserPermission, ClientDashboardUserScope } from '@/types/client-dashboard';
import { supabase } from '@/integrations/supabase/client';
import { User, Crown, Check, X, Globe, Building2, Layers } from 'lucide-react';

interface PermissionsStepProps {
  state: CDWizardState;
  onUpdate: (updates: Partial<CDWizardState>) => void;
  countryIds: string[];
  entityIds: string[];
  companyId: string;
}

export const PermissionsStep = ({
  state,
  onUpdate,
  countryIds,
  entityIds,
  companyId,
}: PermissionsStepProps) => {
  const [countries, setCountries] = useState<Record<string, string>>({});
  const [entities, setEntities] = useState<Record<string, { name: string; countryId: string }>>({});

  // Referencia adatok betöltése
  useEffect(() => {
    const fetchData = async () => {
      // Országok
      if (countryIds.length > 0) {
        const { data } = await supabase
          .from('countries')
          .select('id, name')
          .in('id', countryIds);
        
        const map: Record<string, string> = {};
        data?.forEach(c => { map[c.id] = c.name; });
        setCountries(map);
      }

      // Entitások
      const { data: entitiesData } = await supabase
        .from('company_contracted_entities')
        .select('id, name, country_id')
        .eq('company_id', companyId)
        .eq('is_active', true);
      
      const entityMap: Record<string, { name: string; countryId: string }> = {};
      entitiesData?.forEach(e => { 
        entityMap[e.id] = { name: e.name, countryId: e.country_id }; 
      });
      setEntities(entityMap);
    };

    fetchData();
  }, [countryIds, companyId]);

  // Inicializáljuk a jogosultságokat ha még nincsenek
  const getUserPermissions = (userIndex: number): Record<string, boolean> => {
    const user = state.users[userIndex];

    // Default: minden engedélyezve
    const defaults: Record<string, boolean> = {};
    CD_MENU_ITEMS.forEach(item => {
      defaults[item.id] = true;
    });

    // Ha nincs user, vagy a permissions nem tömb (rossz initialState / részlegesen feltöltött adat)
    const maybePerms = (user as any)?.permissions;
    if (!user || !Array.isArray(maybePerms) || maybePerms.length === 0) {
      return defaults;
    }

    const perms: Record<string, boolean> = { ...defaults };
    (maybePerms as Array<{ menu_item?: string; is_enabled?: boolean }>).forEach(p => {
      if (!p?.menu_item) return;
      perms[p.menu_item] = !!p.is_enabled;
    });
    return perms;
  };

  const togglePermission = (userIndex: number, menuItem: string) => {
    const newUsers = [...(state.users || [])];
    const user = newUsers[userIndex];
    if (!user) return;
    
    // Jelenlegi jogosultságok
    const currentPerms = getUserPermissions(userIndex);
    const newValue = !currentPerms[menuItem];
    
    // Frissített permissions tömb
    const updatedPermissions: Partial<ClientDashboardUserPermission>[] = CD_MENU_ITEMS.map(item => ({
      menu_item: item.id,
      is_enabled: item.id === menuItem ? newValue : (currentPerms[item.id] ?? true),
    }));

    newUsers[userIndex] = {
      ...user,
      permissions: updatedPermissions as any,
    };

    onUpdate({ users: newUsers });
  };

  const toggleAllForUser = (userIndex: number, enabled: boolean) => {
    const newUsers = [...(state.users || [])];
    const user = newUsers[userIndex];
    if (!user) return;
    
    const updatedPermissions: Partial<ClientDashboardUserPermission>[] = CD_MENU_ITEMS.map(item => ({
      menu_item: item.id,
      is_enabled: enabled,
    }));

    newUsers[userIndex] = {
      ...user,
      permissions: updatedPermissions as any,
    };

    onUpdate({ users: newUsers });
  };

  const toggleAggregatedView = (userIndex: number) => {
    const newUsers = [...(state.users || [])];
    const user = newUsers[userIndex];
    if (!user) return;

    newUsers[userIndex] = {
      ...user,
      can_view_aggregated: !user.can_view_aggregated,
    };

    onUpdate({ users: newUsers });
  };

  const toggleSuperuserScope = (userIndex: number, scopeType: 'country' | 'entity', scopeId: string) => {
    const newUsers = [...(state.users || [])];
    const user = newUsers[userIndex];
    if (!user) return;

    const currentScopes = user.scopes || [];
    
    // Ellenőrizzük, hogy már van-e ilyen scope
    const existingIndex = currentScopes.findIndex(s => 
      scopeType === 'country' ? s.country_id === scopeId : s.contracted_entity_id === scopeId
    );

    let updatedScopes: Partial<ClientDashboardUserScope>[];
    
    if (existingIndex >= 0) {
      // Töröljük
      updatedScopes = currentScopes.filter((_, i) => i !== existingIndex);
    } else {
      // Hozzáadjuk
      const newScope: Partial<ClientDashboardUserScope> = {
        id: crypto.randomUUID(),
        user_id: '',
        country_id: scopeType === 'country' ? scopeId : null,
        contracted_entity_id: scopeType === 'entity' ? scopeId : null,
        created_at: new Date().toISOString(),
      };
      updatedScopes = [...currentScopes, newScope];
    }

    newUsers[userIndex] = {
      ...user,
      scopes: updatedScopes as any,
    };

    onUpdate({ users: newUsers });
  };

  const isScopeSelected = (userIndex: number, scopeType: 'country' | 'entity', scopeId: string): boolean => {
    const user = state.users[userIndex];
    if (!user?.scopes) return false;
    
    return user.scopes.some(s => 
      scopeType === 'country' ? s.country_id === scopeId : s.contracted_entity_id === scopeId
    );
  };

  const getUserLabel = (index: number): string => {
    const user = state.users[index];
    if (user?.is_superuser) return 'Superuser';
    if (user?.username) return user.username;
    return `Felhasználó ${index + 1}`;
  };

  const getUserIcon = (index: number) => {
    const user = state.users[index];
    if (user?.is_superuser) return <Crown className="h-4 w-4 text-amber-500" />;
    return <User className="h-4 w-4" />;
  };

  const getEnabledCount = (userIndex: number): number => {
    const perms = getUserPermissions(userIndex);
    return Object.values(perms).filter(Boolean).length;
  };

  const getScopeCount = (userIndex: number): number => {
    const user = state.users[userIndex];
    return user?.scopes?.length || 0;
  };

  // Ha nincsenek felhasználók, ne rendereljünk semmit
  if (!state.users || state.users.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Nincsenek felhasználók a jogosultságok beállításához.</p>
        <p className="text-sm mt-2">Kérjük, lépjen vissza és adjon hozzá legalább egy felhasználót.</p>
      </div>
    );
  }

  // Több riport van-e (összesített nézet releváns)
  const hasMultipleReports = state.reportType !== 'single';

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-2">Jogosultságok és hozzáférések</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Állítsa be, hogy az egyes felhasználók mely menüpontokat és adatokat láthatják
        </p>
      </div>

      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={(state.users || [])
          .map((u, i) => (u ? `user-${i}` : null))
          .filter(Boolean) as string[]}
      >
        {(state.users || []).map((user, userIndex) => {
          if (!user) return null;
          
          const permissions = getUserPermissions(userIndex);
          const enabledCount = getEnabledCount(userIndex);

          return (
            <AccordionItem
              key={userIndex}
              value={`user-${userIndex}`}
              className={`
                border rounded-lg px-4
                ${user.is_superuser ? 'border-amber-500/50 bg-amber-500/5' : ''}
              `}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {getUserIcon(userIndex)}
                  <span className="font-medium">{getUserLabel(userIndex)}</span>
                  <span className="ml-2 text-xs text-muted-foreground border rounded px-2 py-0.5">
                    {enabledCount}/{CD_MENU_ITEMS.length} menüpont
                  </span>
                  {user.is_superuser && (
                    <span className="text-xs text-muted-foreground border rounded px-2 py-0.5">
                      {getScopeCount(userIndex)} scope
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                <div className="space-y-6">
                  {/* Szuperuser scope választás */}
                  {user.is_superuser && (
                    <div className="space-y-3 p-4 border rounded-lg bg-amber-500/5">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-amber-600" />
                        <h5 className="font-medium text-sm">Látható országok és entitások</h5>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Válassza ki, mely országok és entitások adatait láthatja a Superuser
                      </p>
                      
                      {/* Országok */}
                      {countryIds.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Országok</Label>
                          <div className="grid gap-2">
                            {countryIds.map(countryId => (
                              <Label
                                key={countryId}
                                className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
                              >
                                <Checkbox
                                  checked={isScopeSelected(userIndex, 'country', countryId)}
                                  onCheckedChange={() => toggleSuperuserScope(userIndex, 'country', countryId)}
                                />
                                <Globe className="h-3 w-3 text-blue-500" />
                                <span className="text-sm">{countries[countryId] || countryId}</span>
                              </Label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Entitások */}
                      {Object.keys(entities).length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Entitások</Label>
                          <div className="grid gap-2">
                            {Object.entries(entities).map(([entityId, entity]) => (
                              <Label
                                key={entityId}
                                className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
                              >
                                <Checkbox
                                  checked={isScopeSelected(userIndex, 'entity', entityId)}
                                  onCheckedChange={() => toggleSuperuserScope(userIndex, 'entity', entityId)}
                                />
                                <Building2 className="h-3 w-3 text-green-500" />
                                <span className="text-sm">{entity.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({countries[entity.countryId] || entity.countryId})
                                </span>
                              </Label>
                            ))}
                          </div>
                        </div>
                      )}

                      {getScopeCount(userIndex) === 0 && (
                        <p className="text-xs text-amber-600">
                          ⚠️ Nincs scope kiválasztva - a Superuser nem fog adatokat látni
                        </p>
                      )}
                    </div>
                  )}

                  {/* Összesített nézet opció (több riportnál, Superuser-nek is) */}
                  {hasMultipleReports && (
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <Label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={user.can_view_aggregated || false}
                          onCheckedChange={() => toggleAggregatedView(userIndex)}
                        />
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary" />
                          <div>
                            <span className="text-sm font-medium">Összesített nézet engedélyezése</span>
                            <p className="text-xs text-muted-foreground">
                              Az összes hozzáférésű riport adatai egyben láthatók
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  )}

                  {/* Menüpont jogosultságok */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Menüpont jogosultságok</h5>
                    
                    {/* Gyors műveletek */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAllForUser(userIndex, true)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Mind engedélyezése
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button
                        type="button"
                        onClick={() => toggleAllForUser(userIndex, false)}
                        className="text-xs text-destructive hover:underline flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Mind tiltása
                      </button>
                    </div>

                    {/* Menüpontok */}
                    <div className="grid gap-3">
                      {CD_MENU_ITEMS.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                          <Switch
                            checked={permissions[item.id] ?? true}
                            onCheckedChange={() => togglePermission(userIndex, item.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Összefoglaló */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h5 className="font-medium mb-2">Jogosultságok összefoglalója</h5>
        <div className="text-sm text-muted-foreground space-y-1">
          {state.users.map((user, index) => {
            if (!user) return null;
            return (
              <div key={index} className="flex items-center gap-2">
                {getUserIcon(index)}
                <span>{getUserLabel(index)}:</span>
                <span className="font-medium">
                  {getEnabledCount(index)}/{CD_MENU_ITEMS.length} menüpont
                </span>
                {user.is_superuser && (
                  <span className="text-amber-600">• {getScopeCount(index)} scope</span>
                )}
                {user.can_view_aggregated && (
                  <span className="text-primary">• Összesített nézet</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};