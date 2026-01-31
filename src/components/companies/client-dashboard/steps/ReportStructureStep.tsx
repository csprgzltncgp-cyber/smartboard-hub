import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CDWizardState, ReportType } from '@/types/client-dashboard';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Globe, Building2, Layers } from 'lucide-react';

interface ReportStructureStepProps {
  state: CDWizardState;
  countryIds: string[];
  entityIds: string[];
  companyId: string;
  onUpdate: (updates: Partial<CDWizardState>) => void;
}

interface CountryInfo {
  id: string;
  name: string;
  code: string;
}

interface EntityInfo {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
}

const REPORT_TYPE_OPTIONS: { value: ReportType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'single',
    label: 'Egyetlen riport',
    description: 'Minden adat egy riportban',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    value: 'per_country',
    label: 'Országonként',
    description: 'Minden országnak külön riportja van',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    value: 'per_entity',
    label: 'Entitásonként',
    description: 'Minden szerződött entitásnak külön riportja van',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    value: 'custom',
    label: 'Egyedi beállítás',
    description: 'Válassza ki mely országok/entitások kapjanak külön riportot',
    icon: <Layers className="h-5 w-5" />,
  },
];

export const ReportStructureStep = ({
  state,
  countryIds,
  entityIds,
  companyId,
  onUpdate,
}: ReportStructureStepProps) => {
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [entities, setEntities] = useState<EntityInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Országok betöltése
        if (countryIds.length > 0) {
          const { data: countriesData } = await supabase
            .from('countries')
            .select('id, name, code')
            .in('id', countryIds);
          
          setCountries(countriesData || []);
        }

        // Entitások betöltése
        if (entityIds.length > 0) {
          const { data: entitiesData } = await supabase
            .from('company_contracted_entities')
            .select(`
              id,
              name,
              country_id,
              countries:country_id (name)
            `)
            .eq('company_id', companyId)
            .eq('is_active', true);
          
          setEntities((entitiesData || []).map(e => ({
            id: e.id,
            name: e.name,
            countryId: e.country_id,
            countryName: (e.countries as any)?.name || '',
          })));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [countryIds, entityIds, companyId]);

  const handleReportTypeChange = (value: ReportType) => {
    // Alapértelmezett kiválasztások beállítása a típus alapján
    let selectedCountryIds: string[] = [];
    let selectedEntityIds: string[] = [];

    if (value === 'per_country') {
      selectedCountryIds = countryIds;
    } else if (value === 'per_entity') {
      selectedEntityIds = entities.map(e => e.id);
    }

    onUpdate({
      reportType: value,
      selectedCountryIds,
      selectedEntityIds,
    });
  };

  const toggleCountry = (countryId: string) => {
    const current = state.selectedCountryIds || [];
    const updated = current.includes(countryId)
      ? current.filter(id => id !== countryId)
      : [...current, countryId];
    onUpdate({ selectedCountryIds: updated });
  };

  const toggleEntity = (entityId: string) => {
    const current = state.selectedEntityIds || [];
    const updated = current.includes(entityId)
      ? current.filter(id => id !== entityId)
      : [...current, entityId];
    onUpdate({ selectedEntityIds: updated });
  };

  // Csak releváns opciók megjelenítése
  const availableOptions = REPORT_TYPE_OPTIONS.filter(option => {
    if (option.value === 'per_country' && countryIds.length <= 1) return false;
    if (option.value === 'per_entity' && entities.length === 0) return false;
    if (option.value === 'custom' && countryIds.length <= 1 && entities.length === 0) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-2">Riport struktúra kiválasztása</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Határozza meg, hogyan legyenek strukturálva a riportok
        </p>

        <RadioGroup
          value={state.reportType}
          onValueChange={(value) => handleReportTypeChange(value as ReportType)}
          className="grid gap-3"
        >
          {availableOptions.map(option => (
            <Label
              key={option.value}
              className={`
                flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors
                ${state.reportType === option.value 
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
          ))}
        </RadioGroup>
      </div>

      {/* Egyedi beállítások */}
      {state.reportType === 'custom' && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Válassza ki a külön riportokat</h4>

          {countries.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Országok</Label>
              <div className="grid gap-2">
                {countries.map(country => (
                  <Label
                    key={country.id}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={state.selectedCountryIds?.includes(country.id)}
                      onCheckedChange={() => toggleCountry(country.id)}
                    />
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{country.name}</span>
                    <Badge variant="outline" className="ml-auto">{country.code}</Badge>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {entities.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Entitások</Label>
              <div className="grid gap-2">
                {entities.map(entity => (
                  <Label
                    key={entity.id}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={state.selectedEntityIds?.includes(entity.id)}
                      onCheckedChange={() => toggleEntity(entity.id)}
                    />
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{entity.name}</span>
                    <Badge variant="outline" className="ml-auto">{entity.countryName}</Badge>
                  </Label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Összefoglaló */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h5 className="font-medium mb-2">Riportok összefoglalója</h5>
        <div className="text-sm text-muted-foreground">
          {state.reportType === 'single' && (
            <p>1 riport lesz létrehozva az összes adattal</p>
          )}
          {state.reportType === 'per_country' && (
            <p>{countryIds.length} riport lesz létrehozva (országonként)</p>
          )}
          {state.reportType === 'per_entity' && (
            <p>{entities.length} riport lesz létrehozva (entitásonként)</p>
          )}
          {state.reportType === 'custom' && (
            <p>
              {(state.selectedCountryIds?.length || 0) + (state.selectedEntityIds?.length || 0)} riport lesz létrehozva
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
