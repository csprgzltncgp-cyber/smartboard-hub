import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContractedEntity, createDefaultEntity, CountryEntities } from '@/types/contracted-entity';
import { ConsultationRow, PriceHistoryEntry } from '@/types/company';

/**
 * Hook a szerződött entitások kezelésére
 * @param companyId - Opcionális cég ID. Ha meg van adva, automatikusan lekéri az entitásokat.
 */
export const useContractedEntities = (companyId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entities, setEntities] = useState<ContractedEntity[]>([]);

  /**
   * Lekéri egy cég összes szerződött entitását
   */
  const getEntitiesByCompanyId = useCallback(async (targetCompanyId: string): Promise<ContractedEntity[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_contracted_entities')
        .select('*')
        .eq('company_id', targetCompanyId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(mapDbToEntity);
    } catch (e: any) {
      console.error('[ContractedEntities] Failed to fetch entities:', e);
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Frissíti a helyi entitás listát
   */
  const refreshEntities = useCallback(async () => {
    if (!companyId) {
      setEntities([]);
      return;
    }
    const fetchedEntities = await getEntitiesByCompanyId(companyId);
    setEntities(fetchedEntities);
  }, [companyId, getEntitiesByCompanyId]);

  // Automatikus lekérés ha companyId változik
  useEffect(() => {
    refreshEntities();
  }, [refreshEntities]);

  /**
   * Lekéri egy adott ország entitásait egy cégen belül
   */
  const getEntitiesByCountry = useCallback(async (
    companyId: string, 
    countryId: string
  ): Promise<ContractedEntity[]> => {
    try {
      const { data, error } = await supabase
        .from('company_contracted_entities')
        .select('*')
        .eq('company_id', companyId)
        .eq('country_id', countryId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(mapDbToEntity);
    } catch (e: any) {
      console.error('[ContractedEntities] Failed to fetch entities by country:', e);
      return [];
    }
  }, []);

  /**
   * Létrehoz egy új szerződött entitást
   */
  const createEntity = useCallback(async (
    entity: Omit<ContractedEntity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ContractedEntity | null> => {
    try {
      setLoading(true);
      const insertData = {
        company_id: entity.company_id,
        country_id: entity.country_id,
        name: entity.name,
        org_id: entity.org_id,
        contract_date: entity.contract_date,
        contract_end_date: entity.contract_end_date,
        reporting_data: entity.reporting_data,
        contract_holder_type: entity.contract_holder_type,
        contract_price: entity.contract_price,
        price_type: entity.price_type,
        contract_currency: entity.contract_currency,
        pillars: entity.pillars,
        occasions: entity.occasions,
        industry: entity.industry,
        consultation_rows: entity.consultation_rows as any,
        price_history: entity.price_history as any,
        workshop_data: entity.workshop_data as any,
        crisis_data: entity.crisis_data as any,
        headcount: entity.headcount,
        inactive_headcount: entity.inactive_headcount,
      };
      
      const { data, error } = await supabase
        .from('company_contracted_entities')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      const newEntity = mapDbToEntity(data);
      // Frissítjük a lokális listát
      setEntities(prev => [...prev, newEntity]);
      return newEntity;
    } catch (e: any) {
      console.error('[ContractedEntities] Failed to create entity:', e);
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Frissít egy szerződött entitást
   */
  const updateEntity = useCallback(async (
    id: string,
    updates: Partial<ContractedEntity>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.org_id !== undefined) updateData.org_id = updates.org_id;
      if (updates.contract_date !== undefined) updateData.contract_date = updates.contract_date;
      if (updates.contract_end_date !== undefined) updateData.contract_end_date = updates.contract_end_date;
      if (updates.reporting_data !== undefined) updateData.reporting_data = updates.reporting_data;
      if (updates.contract_holder_type !== undefined) updateData.contract_holder_type = updates.contract_holder_type;
      if (updates.contract_price !== undefined) updateData.contract_price = updates.contract_price;
      if (updates.price_type !== undefined) updateData.price_type = updates.price_type;
      if (updates.contract_currency !== undefined) updateData.contract_currency = updates.contract_currency;
      if (updates.pillars !== undefined) updateData.pillars = updates.pillars;
      if (updates.occasions !== undefined) updateData.occasions = updates.occasions;
      if (updates.industry !== undefined) updateData.industry = updates.industry;
      if (updates.consultation_rows !== undefined) updateData.consultation_rows = updates.consultation_rows;
      if (updates.price_history !== undefined) updateData.price_history = updates.price_history;
      if (updates.workshop_data !== undefined) updateData.workshop_data = updates.workshop_data;
      if (updates.crisis_data !== undefined) updateData.crisis_data = updates.crisis_data;
      if (updates.headcount !== undefined) updateData.headcount = updates.headcount;
      if (updates.inactive_headcount !== undefined) updateData.inactive_headcount = updates.inactive_headcount;
      
      const { error } = await supabase
        .from('company_contracted_entities')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Frissítjük a lokális listát
      setEntities(prev => prev.map(e => 
        e.id === id ? { ...e, ...updates } : e
      ));
      
      return true;
    } catch (e: any) {
      console.error('[ContractedEntities] Failed to update entity:', e);
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Töröl egy szerződött entitást
   */
  const deleteEntity = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('company_contracted_entities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Frissítjük a lokális listát
      setEntities(prev => prev.filter(e => e.id !== id));
      
      return true;
    } catch (e: any) {
      console.error('[ContractedEntities] Failed to delete entity:', e);
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Csoportosítja az entitásokat országonként
   */
  const groupEntitiesByCountry = useCallback((
    entities: ContractedEntity[],
    countries: { id: string; name: string; code: string }[]
  ): CountryEntities[] => {
    const grouped = new Map<string, ContractedEntity[]>();
    
    entities.forEach(entity => {
      const existing = grouped.get(entity.country_id) || [];
      grouped.set(entity.country_id, [...existing, entity]);
    });
    
    return Array.from(grouped.entries()).map(([countryId, countryEntities]) => {
      const country = countries.find(c => c.id === countryId);
      return {
        country_id: countryId,
        country_name: country?.name || 'Ismeretlen',
        country_code: country?.code || '??',
        entities: countryEntities,
        has_multiple_entities: countryEntities.length > 1,
      };
    });
  }, []);

  /**
   * Migrálja a meglévő company_country_settings adatokat entitásokká
   * Akkor használjuk, amikor egy országnál bekapcsolják a több entitás opciót
   */
  const migrateCountrySettingsToEntity = useCallback(async (
    companyId: string,
    countryId: string,
    entityName: string,
    existingSettings?: any
  ): Promise<ContractedEntity | null> => {
    const entityData = createDefaultEntity(companyId, countryId, entityName);
    
    // Ha vannak meglévő beállítások, átmásoljuk
    if (existingSettings) {
      entityData.org_id = existingSettings.org_id || null;
      entityData.contract_date = existingSettings.contract_start || null;
      entityData.contract_end_date = existingSettings.contract_end || null;
      entityData.headcount = existingSettings.head_count || null;
      // További mezők átvétele...
    }
    
    return createEntity(entityData);
  }, [createEntity]);

  return {
    entities,
    loading,
    error,
    refreshEntities,
    getEntitiesByCompanyId,
    getEntitiesByCountry,
    createEntity,
    updateEntity,
    deleteEntity,
    groupEntitiesByCountry,
    migrateCountrySettingsToEntity,
  };
};

/**
 * Adatbázis rekord átalakítása ContractedEntity típusra
 */
function mapDbToEntity(row: any): ContractedEntity {
  return {
    id: row.id,
    company_id: row.company_id,
    country_id: row.country_id,
    name: row.name,
    org_id: row.org_id,
    contract_date: row.contract_date,
    contract_end_date: row.contract_end_date,
    reporting_data: row.reporting_data || {},
    contract_holder_type: row.contract_holder_type,
    contract_price: row.contract_price,
    price_type: row.price_type,
    contract_currency: row.contract_currency,
    pillars: row.pillars,
    occasions: row.occasions,
    industry: row.industry,
    consultation_rows: parseJsonArray(row.consultation_rows),
    price_history: parseJsonArray(row.price_history),
    workshop_data: row.workshop_data || {},
    crisis_data: row.crisis_data || {},
    headcount: row.headcount,
    inactive_headcount: row.inactive_headcount,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * JSON tömb parse segédfüggvény
 */
function parseJsonArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
