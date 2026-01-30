import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CDWizardState, CD_MENU_ITEMS, ClientDashboardUserPermission } from '@/types/client-dashboard';
import { User, Crown, Check, X } from 'lucide-react';

interface PermissionsStepProps {
  state: CDWizardState;
  onUpdate: (updates: Partial<CDWizardState>) => void;
}

export const PermissionsStep = ({
  state,
  onUpdate,
}: PermissionsStepProps) => {
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

  const getUserLabel = (index: number): string => {
    const user = state.users[index];
    if (user?.is_superuser) return 'Szuperuser';
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

  // Ha nincsenek felhasználók, ne rendereljünk semmit
  if (!state.users || state.users.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Nincsenek felhasználók a jogosultságok beállításához.</p>
        <p className="text-sm mt-2">Kérjük, lépjen vissza és adjon hozzá legalább egy felhasználót.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-2">Menüpont jogosultságok</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Állítsa be, hogy az egyes felhasználók mely menüpontokat láthatják a Client Dashboardon
        </p>
      </div>

      <Accordion type="multiple" className="space-y-2" defaultValue={state.users.map((_, i) => `user-${i}`)}>
        {state.users.map((user, userIndex) => {
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
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                <div className="space-y-4">
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
                  {getEnabledCount(index)}/{CD_MENU_ITEMS.length} menüpont engedélyezve
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
