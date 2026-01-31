import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CDWizard } from '../client-dashboard/CDWizard';
import { CDWizardState, ReportConfiguration, ClientDashboardUser } from '@/types/client-dashboard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings2, Users, Plus, RefreshCw } from 'lucide-react';

interface ClientDashboardTabContentProps {
  companyId: string;
  countryIds: string[];
}

export const ClientDashboardTabContent = ({ companyId, countryIds }: ClientDashboardTabContentProps) => {
  const [showWizard, setShowWizard] = useState(false);
  const [existingConfig, setExistingConfig] = useState<ReportConfiguration | null>(null);
  const [existingUsers, setExistingUsers] = useState<ClientDashboardUser[]>([]);
  const [entityIds, setEntityIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Meglévő konfiguráció és felhasználók betöltése
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Konfiguráció
        const { data: configData } = await supabase
          .from('company_report_configuration')
          .select('*')
          .eq('company_id', companyId)
          .single();
        
        if (configData) {
          setExistingConfig(configData as unknown as ReportConfiguration);
        }

        // Felhasználók
        const { data: usersData } = await supabase
          .from('client_dashboard_users')
          .select(`
            *,
            scopes:client_dashboard_user_scopes(*),
            permissions:client_dashboard_user_permissions(*)
          `)
          .eq('company_id', companyId);
        
        if (usersData) {
          setExistingUsers(usersData as unknown as ClientDashboardUser[]);
        }

        // Entitások
        const { data: entitiesData } = await supabase
          .from('company_contracted_entities')
          .select('id')
          .eq('company_id', companyId)
          .eq('is_active', true);
        
        if (entitiesData) {
          setEntityIds(entitiesData.map(e => e.id));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const handleWizardComplete = async (state: CDWizardState) => {
    try {
      // 1. Konfiguráció mentése/frissítése
      const configPayload = {
        company_id: companyId,
        report_type: state.reportType,
        access_type: state.accessType,
        configuration: {
          country_ids: state.selectedCountryIds,
          entity_ids: state.selectedEntityIds,
        },
      };

      if (existingConfig) {
        await supabase
          .from('company_report_configuration')
          .update(configPayload)
          .eq('id', existingConfig.id);
      } else {
        await supabase
          .from('company_report_configuration')
          .insert(configPayload);
      }

      // 2. Meglévő felhasználók törlése
      if (existingUsers.length > 0) {
        await supabase
          .from('client_dashboard_users')
          .delete()
          .eq('company_id', companyId);
      }

      // 3. Új felhasználók létrehozása
      for (const user of state.users) {
        const { data: newUser, error: userError } = await supabase
          .from('client_dashboard_users')
          .insert({
            company_id: companyId,
            username: user.username || '',
            password: user.password || '',
            is_superuser: user.is_superuser || false,
            can_view_aggregated: user.can_view_aggregated || false,
            language_id: user.language_id || null,
          })
          .select()
          .single();

        if (userError || !newUser) {
          console.error('Error creating user:', userError);
          continue;
        }

        // Scope-ok mentése
        if (user.scopes && user.scopes.length > 0) {
          const scopePayloads = user.scopes.map(scope => ({
            user_id: newUser.id,
            country_id: scope.country_id,
            contracted_entity_id: scope.contracted_entity_id,
          }));

          await supabase
            .from('client_dashboard_user_scopes')
            .insert(scopePayloads);
        }

        // Jogosultságok mentése
        if (user.permissions && user.permissions.length > 0) {
          const permPayloads = user.permissions.map(perm => ({
            user_id: newUser.id,
            menu_item: perm.menu_item,
            is_enabled: perm.is_enabled,
          }));

          await supabase
            .from('client_dashboard_user_permissions')
            .insert(permPayloads);
        }
      }

      toast.success('Client Dashboard konfiguráció mentve');
      setShowWizard(false);
      
      // Újratöltés
      const { data: usersData } = await supabase
        .from('client_dashboard_users')
        .select(`
          *,
          scopes:client_dashboard_user_scopes(*),
          permissions:client_dashboard_user_permissions(*)
        `)
        .eq('company_id', companyId);
      
      if (usersData) {
        setExistingUsers(usersData as unknown as ClientDashboardUser[]);
      }

      const { data: configData } = await supabase
        .from('company_report_configuration')
        .select('*')
        .eq('company_id', companyId)
        .single();
      
      if (configData) {
        setExistingConfig(configData as unknown as ReportConfiguration);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Hiba a konfiguráció mentésekor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showWizard) {
    // Build initialState including users when editing
    const buildInitialState = (): Partial<CDWizardState> | undefined => {
      if (!existingConfig) return undefined;
      
      return {
        reportType: existingConfig.report_type as CDWizardState['reportType'],
        accessType: existingConfig.access_type as CDWizardState['accessType'],
        selectedCountryIds: existingConfig.configuration?.country_ids || [],
        selectedEntityIds: existingConfig.configuration?.entity_ids || [],
        users: existingUsers.map(user => ({
          id: user.id,
          company_id: user.company_id,
          username: user.username,
          password: user.password || '',
          language_id: user.language_id,
          is_superuser: user.is_superuser,
          can_view_aggregated: user.can_view_aggregated,
          created_at: user.created_at,
          updated_at: user.updated_at,
          scopes: user.scopes || [],
          permissions: user.permissions || [],
        })),
      };
    };

    return (
      <CDWizard
        companyId={companyId}
        countryIds={countryIds}
        entityIds={entityIds}
        onComplete={handleWizardComplete}
        onCancel={() => setShowWizard(false)}
        initialState={buildInitialState()}
      />
    );
  }

  // Nincs még konfiguráció
  if (!existingConfig || existingUsers.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Client Dashboard hozzáférések kezelése országonként és entitásonként.
        </p>

        <div className="bg-muted/30 border rounded-lg p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Settings2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Nincs még beállítva</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Állítsa be a riport struktúrát és hozzon létre felhasználókat a Client Dashboardhoz
          </p>
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Konfiguráció indítása
          </Button>
        </div>
      </div>
    );
  }

  // Meglévő konfiguráció megjelenítése
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Client Dashboard hozzáférések kezelése
        </p>
        <Button variant="outline" onClick={() => setShowWizard(true)}>
          <Settings2 className="h-4 w-4 mr-2" />
          Konfiguráció szerkesztése
        </Button>
      </div>

      {/* Összefoglaló kártyák */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Riport struktúra</h4>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              Típus: <Badge variant="outline">
                {existingConfig.report_type === 'single' && 'Egyetlen riport'}
                {existingConfig.report_type === 'per_country' && 'Országonként'}
                {existingConfig.report_type === 'per_entity' && 'Entitásonként'}
                {existingConfig.report_type === 'custom' && 'Egyedi'}
              </Badge>
            </p>
            <p>
              Hozzáférés: <Badge variant="outline">
                {existingConfig.access_type === 'single_user' && 'Egy felhasználó'}
                {existingConfig.access_type === 'per_report' && 'Riportonként'}
                {existingConfig.access_type === 'with_superuser' && 'Szuperuserrel'}
              </Badge>
            </p>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Felhasználók</h4>
          </div>
          <div className="space-y-1 text-sm">
            <p>{existingUsers.length} felhasználó létrehozva</p>
            {existingUsers.some(u => u.is_superuser) && (
              <p className="text-amber-600">• 1 szuperuser</p>
            )}
          </div>
        </div>
      </div>

      {/* Felhasználók listája */}
      <div className="border rounded-lg divide-y">
        {existingUsers.map(user => (
          <div key={user.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${user.is_superuser ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}
              `}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium">{user.username || 'Névtelen'}</p>
                <p className="text-xs text-muted-foreground">
                  {user.is_superuser ? 'Szuperuser' : `${user.scopes?.length || 0} scope`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.can_view_aggregated && (
                <Badge variant="outline" className="text-xs">Aggregált</Badge>
              )}
              {user.is_superuser && (
                <Badge className="bg-amber-500">Superuser</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
