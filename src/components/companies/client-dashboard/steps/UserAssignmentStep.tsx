import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CDWizardState, AccessType, ClientDashboardUser, ReportSlot } from '@/types/client-dashboard';
import { supabase } from '@/integrations/supabase/client';
import { User, Users, Crown, Plus, Trash2, Eye, EyeOff, Globe, Building2, UserPlus } from 'lucide-react';

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
    label: 'Közös hozzáférés',
    description: 'Minden felhasználó látja az összes riportot',
    icon: <Users className="h-5 w-5" />,
  },
  {
    value: 'per_report',
    label: 'Riportonként',
    description: 'Minden riporthoz külön felhasználók rendelhetők',
    icon: <User className="h-5 w-5" />,
  },
  {
    value: 'with_superuser',
    label: 'Superuserrel',
    description: 'Riportonkénti userek + Superuserek akik mindent látnak',
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
      // Először kiszámoljuk, mely országoknak van kiválasztott entitásuk
      const countriesWithSelectedEntities = new Set<string>();
      state.selectedEntityIds?.forEach(entityId => {
        const entity = entities[entityId];
        if (entity) {
          countriesWithSelectedEntities.add(entity.countryId);
        }
      });

      // Országokat csak akkor adjuk hozzá, ha NINCS alattuk kiválasztott entitás
      // (mert ha van, akkor az entitások lefedik az országot)
      state.selectedCountryIds?.forEach(countryId => {
        if (!countriesWithSelectedEntities.has(countryId)) {
          slots.push({
            id: `country-${countryId}`,
            type: 'country',
            name: countries[countryId] || countryId,
            countryId,
          });
        }
      });

      // Entitásokat mindig hozzáadjuk
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
  // CSAK ha nincs meglévő user (új konfiguráció)
  useEffect(() => {
    if (!state.accessType || reportSlots.length === 0) return;
    
    // Ha már vannak userek (pl. szerkesztés), NE generáljunk újakat
    if (state.users.length > 0) return;

    const generateUsers = (): Partial<ClientDashboardUser>[] => {
      if (state.accessType === 'single_user') {
        // Közös hozzáférés: egy user az összes scope-pal
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
        // Riportonként: egy user per riport (kezdőpont)
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

        // Egy Superuser hozzáadása
        users.push({
          username: '',
          password: '',
          is_superuser: true,
          can_view_aggregated: true,
          scopes: [],
        });

        return users;
      }

      return [];
    };

    onUpdate({ users: generateUsers() });
  }, [state.accessType, reportSlots]);

  // Ha access type változik ÉS a user törli a meglévőket, újragenerálás
  const handleAccessTypeChange = (value: AccessType) => {
    // Reset users when changing type - így újragenerálódnak a megfelelő slotok szerint
    onUpdate({ accessType: value, users: [] });
  };

  const updateUser = (index: number, updates: Partial<ClientDashboardUser>) => {
    const newUsers = [...state.users];
    newUsers[index] = { ...newUsers[index], ...updates };
    onUpdate({ users: newUsers });
  };

  const removeUser = (index: number) => {
    const newUsers = state.users.filter((_, i) => i !== index);
    onUpdate({ users: newUsers });
  };

  // Új felhasználó hozzáadása egy adott riport slot-hoz
  const addUserToSlot = (slot: ReportSlot) => {
    const newUser: Partial<ClientDashboardUser> = {
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
    };
    onUpdate({ users: [...state.users, newUser] });
  };

  // Új Superuser hozzáadása
  const addSuperuser = () => {
    const newUser: Partial<ClientDashboardUser> = {
      username: '',
      password: '',
      is_superuser: true,
      can_view_aggregated: true,
      scopes: [],
    };
    onUpdate({ users: [...state.users, newUser] });
  };

  // Új közös hozzáférésű felhasználó hozzáadása (minden riporthoz)
  const addSharedUser = () => {
    const newUser: Partial<ClientDashboardUser> = {
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
    };
    onUpdate({ users: [...state.users, newUser] });
  };

  // Csoportosított felhasználók riport slot szerint
  const getUsersForSlot = (slot: ReportSlot) => {
    return state.users.map((user, index) => ({ user, index })).filter(({ user }) => {
      if (user.is_superuser) return false;
      return user.scopes?.some(scope => {
        if (slot.type === 'country') return scope.country_id === slot.countryId && !scope.contracted_entity_id;
        if (slot.type === 'entity') return scope.contracted_entity_id === slot.entityId;
        if (slot.type === 'aggregated') return true;
        return false;
      });
    });
  };

  const getSuperusers = () => {
    return state.users.map((user, index) => ({ user, index })).filter(({ user }) => user.is_superuser);
  };

  const getSharedUsers = () => {
    // Közös hozzáférés: userek akik minden scope-ot látnak
    return state.users.map((user, index) => ({ user, index })).filter(({ user }) => {
      if (user.is_superuser) return false;
      return (user.scopes?.length || 0) >= reportSlots.length;
    });
  };

  const getSlotIcon = (slot: ReportSlot) => {
    if (slot.type === 'country') return <Globe className="h-4 w-4 text-primary" />;
    if (slot.type === 'entity') return <Building2 className="h-4 w-4 text-primary" />;
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
      {state.accessType && (
        <div className="space-y-6 pt-4 border-t">
          <h4 className="font-medium">Felhasználók beállítása</h4>

          {/* Közös hozzáférés mód */}
          {state.accessType === 'single_user' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Minden felhasználó látja az összes riportot
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSharedUser}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Felhasználó hozzáadása
                </Button>
              </div>

              <div className="grid gap-4">
                {getSharedUsers().map(({ user, index }) => (
                  <UserCard
                    key={index}
                    user={user}
                    index={index}
                    label="Felhasználó"
                    showPasswords={showPasswords}
                    setShowPasswords={setShowPasswords}
                    updateUser={updateUser}
                    removeUser={removeUser}
                    canRemove={getSharedUsers().length > 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Riportonkénti és Superuserrel módok */}
          {(state.accessType === 'per_report' || state.accessType === 'with_superuser') && (
            <div className="space-y-6">
              {/* Riport slotok szerinti csoportosítás */}
              {reportSlots.map(slot => {
                const slotUsers = getUsersForSlot(slot);
                return (
                  <div key={slot.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSlotIcon(slot)}
                        <span className="font-medium">{slot.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {slotUsers.length} felhasználó
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addUserToSlot(slot)}
                        className="gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Hozzáadás
                      </Button>
                    </div>

                    <div className="grid gap-3 pl-6 border-l-2 border-muted">
                      {slotUsers.map(({ user, index }) => (
                        <UserCard
                          key={index}
                          user={user}
                          index={index}
                          label={`${slot.name} felhasználó`}
                          showPasswords={showPasswords}
                          setShowPasswords={setShowPasswords}
                          updateUser={updateUser}
                          removeUser={removeUser}
                          canRemove={slotUsers.length > 1}
                        />
                      ))}
                      {slotUsers.length === 0 && (
                        <p className="text-sm text-muted-foreground py-2">
                          Nincs hozzárendelt felhasználó
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Superuserek */}
              {state.accessType === 'with_superuser' && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">Superuserek</span>
                      <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
                        Minden riportot látnak
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSuperuser}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Superuser hozzáadása
                    </Button>
                  </div>

                  <div className="grid gap-3 pl-6 border-l-2 border-amber-500/30">
                    {getSuperusers().map(({ user, index }) => (
                      <UserCard
                        key={index}
                        user={user}
                        index={index}
                        label="Superuser"
                        isSuperuser
                        showPasswords={showPasswords}
                        setShowPasswords={setShowPasswords}
                        updateUser={updateUser}
                        removeUser={removeUser}
                        canRemove={getSuperusers().length > 1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Összefoglaló */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h5 className="font-medium mb-2">Felhasználók összefoglalója</h5>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>{state.users.length} felhasználó lesz létrehozva</p>
          {getSuperusers().length > 0 && (
            <p className="text-amber-600">• {getSuperusers().length} Superuser teljes hozzáféréssel</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Külön UserCard komponens az átláthatóságért
interface UserCardProps {
  user: Partial<ClientDashboardUser>;
  index: number;
  label: string;
  isSuperuser?: boolean;
  showPasswords: Record<number, boolean>;
  setShowPasswords: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  updateUser: (index: number, updates: Partial<ClientDashboardUser>) => void;
  removeUser: (index: number) => void;
  canRemove: boolean;
}

const UserCard = ({
  user,
  index,
  label,
  isSuperuser,
  showPasswords,
  setShowPasswords,
  updateUser,
  removeUser,
  canRemove,
}: UserCardProps) => (
  <div
    className={`
      p-4 border rounded-lg space-y-4
      ${isSuperuser ? 'border-amber-500/50 bg-amber-500/5' : ''}
    `}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => removeUser(index)}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
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
);
