import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CDWizardState, AccessType, ClientDashboardUser, ReportSlot } from '@/types/client-dashboard';
import { supabase } from '@/integrations/supabase/client';
import { User, Users, Crown, Plus, Trash2, Eye, EyeOff, Globe, Building2 } from 'lucide-react';

interface UserAssignmentStepProps {
  state: CDWizardState;
  countryIds: string[];
  entityIds: string[];
  companyId: string;
  onUpdate: (updates: Partial<CDWizardState>) => void;
}

const ACCESS_TYPE_OPTIONS: { value: AccessType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'single_user',
    label: 'Egy felhasználó',
    description: 'Egyetlen felhasználó látja az összes riportot',
    icon: <User className="h-5 w-5" />,
  },
  {
    value: 'per_report',
    label: 'Riportonként',
    description: 'Minden riporthoz külön felhasználó',
    icon: <Users className="h-5 w-5" />,
  },
  {
    value: 'with_superuser',
    label: 'Szuperuserrel',
    description: 'Riportonkénti userek + egy szuperuser aki mindent lát',
    icon: <Crown className="h-5 w-5" />,
  },
];

export const UserAssignmentStep = ({
  state,
  countryIds,
  entityIds,
  companyId,
  onUpdate,
}: UserAssignmentStepProps) => {
  const [reportSlots, setReportSlots] = useState<ReportSlot[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [countries, setCountries] = useState<Record<string, string>>({});
  const [entities, setEntities] = useState<Record<string, { name: string; countryId: string }>>({});

  // Riport slotok és referencia adatok betöltése
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

  // Riport slotok generálása a konfiguráció alapján
  useEffect(() => {
    const slots: ReportSlot[] = [];

    if (state.reportType === 'single') {
      slots.push({ id: 'single', type: 'aggregated', name: 'Összes adat' });
    } else if (state.reportType === 'per_country') {
      countryIds.forEach(countryId => {
        slots.push({
          id: `country-${countryId}`,
          type: 'country',
          name: countries[countryId] || countryId,
          countryId,
        });
      });
    } else if (state.reportType === 'per_entity') {
      Object.entries(entities).forEach(([entityId, entity]) => {
        slots.push({
          id: `entity-${entityId}`,
          type: 'entity',
          name: entity.name,
          entityId,
        });
      });
    } else if (state.reportType === 'custom') {
      state.selectedCountryIds?.forEach(countryId => {
        slots.push({
          id: `country-${countryId}`,
          type: 'country',
          name: countries[countryId] || countryId,
          countryId,
        });
      });
      state.selectedEntityIds?.forEach(entityId => {
        const entity = entities[entityId];
        if (entity) {
          slots.push({
            id: `entity-${entityId}`,
            type: 'entity',
            name: entity.name,
            entityId,
          });
        }
      });
    }

    setReportSlots(slots);
  }, [state.reportType, state.selectedCountryIds, state.selectedEntityIds, countries, entities, countryIds]);

  // Felhasználók automatikus generálása az access type változásakor
  useEffect(() => {
    if (!state.accessType || reportSlots.length === 0) return;

    const generateUsers = (): Partial<ClientDashboardUser>[] => {
      if (state.accessType === 'single_user') {
        return [{
          username: '',
          password: '',
          is_superuser: false,
          can_view_aggregated: reportSlots.length > 1,
          scopes: reportSlots.map(slot => ({
            id: crypto.randomUUID(),
            user_id: '',
            country_id: slot.countryId || null,
            contracted_entity_id: slot.entityId || null,
            created_at: new Date().toISOString(),
          })),
        }];
      }

      if (state.accessType === 'per_report') {
        return reportSlots.map(slot => ({
          username: '',
          password: '',
          is_superuser: false,
          can_view_aggregated: false,
          scopes: [{
            id: crypto.randomUUID(),
            user_id: '',
            country_id: slot.countryId || null,
            contracted_entity_id: slot.entityId || null,
            created_at: new Date().toISOString(),
          }],
        }));
      }

      if (state.accessType === 'with_superuser') {
        const users: Partial<ClientDashboardUser>[] = reportSlots.map(slot => ({
          username: '',
          password: '',
          is_superuser: false,
          can_view_aggregated: false,
          scopes: [{
            id: crypto.randomUUID(),
            user_id: '',
            country_id: slot.countryId || null,
            contracted_entity_id: slot.entityId || null,
            created_at: new Date().toISOString(),
          }],
        }));

        // Szuperuser hozzáadása
        users.push({
          username: '',
          password: '',
          is_superuser: true,
          can_view_aggregated: true,
          scopes: reportSlots.map(slot => ({
            id: crypto.randomUUID(),
            user_id: '',
            country_id: slot.countryId || null,
            contracted_entity_id: slot.entityId || null,
            created_at: new Date().toISOString(),
          })),
        });

        return users;
      }

      return [];
    };

    // Csak akkor generálunk újra, ha nincs még user vagy access type változott
    if (state.users.length === 0) {
      onUpdate({ users: generateUsers() });
    }
  }, [state.accessType, reportSlots]);

  const handleAccessTypeChange = (value: AccessType) => {
    onUpdate({ accessType: value, users: [] }); // Reset users when changing type
  };

  const updateUser = (index: number, updates: Partial<ClientDashboardUser>) => {
    const newUsers = [...state.users];
    newUsers[index] = { ...newUsers[index], ...updates };
    onUpdate({ users: newUsers });
  };

  const getSlotLabel = (index: number): string => {
    if (state.accessType === 'single_user') return 'Felhasználó';
    if (state.users[index]?.is_superuser) return 'Szuperuser';
    if (reportSlots[index]) return reportSlots[index].name;
    return `Felhasználó ${index + 1}`;
  };

  const getSlotIcon = (index: number) => {
    if (state.users[index]?.is_superuser) return <Crown className="h-4 w-4 text-amber-500" />;
    const slot = reportSlots[index];
    if (!slot) return <User className="h-4 w-4" />;
    if (slot.type === 'country') return <Globe className="h-4 w-4 text-blue-500" />;
    if (slot.type === 'entity') return <Building2 className="h-4 w-4 text-green-500" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-2">Hozzáférési mód kiválasztása</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Határozza meg, hogyan lesznek a felhasználók hozzárendelve a riportokhoz
        </p>

        <RadioGroup
          value={state.accessType}
          onValueChange={(value) => handleAccessTypeChange(value as AccessType)}
          className="grid gap-3"
        >
          {ACCESS_TYPE_OPTIONS.map(option => {
            // Single user csak akkor releváns, ha egy riport van
            if (option.value === 'per_report' && reportSlots.length <= 1) return null;
            if (option.value === 'with_superuser' && reportSlots.length <= 1) return null;

            return (
              <Label
                key={option.value}
                className={`
                  flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors
                  ${state.accessType === option.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                  }
                `}
              >
                <RadioGroupItem value={option.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Felhasználók szerkesztése */}
      {state.accessType && state.users.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Felhasználók beállítása</h4>

          <div className="grid gap-4">
            {state.users.map((user, index) => (
              <div
                key={index}
                className={`
                  p-4 border rounded-lg space-y-4
                  ${user.is_superuser ? 'border-amber-500/50 bg-amber-500/5' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  {getSlotIcon(index)}
                  <span className="font-medium">{getSlotLabel(index)}</span>
                  {user.is_superuser && (
                    <Badge variant="outline" className="ml-auto border-amber-500 text-amber-600">
                      Minden riportot lát
                    </Badge>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`username-${index}`}>Felhasználónév</Label>
                    <Input
                      id={`username-${index}`}
                      value={user.username || ''}
                      onChange={(e) => updateUser(index, { username: e.target.value })}
                      placeholder="pl. company_hu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`password-${index}`}>Jelszó</Label>
                    <div className="relative">
                      <Input
                        id={`password-${index}`}
                        type={showPasswords[index] ? 'text' : 'password'}
                        value={user.password || ''}
                        onChange={(e) => updateUser(index, { password: e.target.value })}
                        placeholder="Jelszó megadása"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPasswords(prev => ({ ...prev, [index]: !prev[index] }))}
                      >
                        {showPasswords[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Összefoglaló */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h5 className="font-medium mb-2">Felhasználók összefoglalója</h5>
        <div className="text-sm text-muted-foreground">
          <p>{state.users.length} felhasználó lesz létrehozva</p>
          {state.users.some(u => u.is_superuser) && (
            <p className="text-amber-600">• 1 szuperuser teljes hozzáféréssel</p>
          )}
        </div>
      </div>
    </div>
  );
};
