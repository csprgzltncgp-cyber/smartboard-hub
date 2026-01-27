import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Expert, ExpertsByCountry, Country, Permission, Specialization, LanguageSkill } from "@/types/expert";
import { toast } from "sonner";

export const useExperts = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [languageSkills, setLanguageSkills] = useState<LanguageSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setExperts(data || []);
    } catch (error) {
      console.error("Error fetching experts:", error);
      toast.error("Hiba a szakértők betöltésekor");
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("code", { ascending: true });

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  }, []);

  const fetchSpecializations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("specializations")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setSpecializations(data || []);
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  }, []);

  const fetchLanguageSkills = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("language_skills")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setLanguageSkills(data || []);
    } catch (error) {
      console.error("Error fetching language skills:", error);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchExperts(),
      fetchCountries(),
      fetchPermissions(),
      fetchSpecializations(),
      fetchLanguageSkills(),
    ]);
    setLoading(false);
  }, [fetchExperts, fetchCountries, fetchPermissions, fetchSpecializations, fetchLanguageSkills]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Get experts grouped by country
  const getExpertsByCountry = useCallback((): ExpertsByCountry[] => {
    const grouped: ExpertsByCountry[] = [];

    countries.forEach((country) => {
      const countryExperts = experts.filter((e) => e.country_id === country.id);
      if (countryExperts.length > 0) {
        grouped.push({
          country,
          experts: countryExperts,
        });
      }
    });

    // Add experts without country
    const noCountryExperts = experts.filter((e) => !e.country_id);
    if (noCountryExperts.length > 0) {
      grouped.push({
        country: { id: "no-country", name: "Nincs ország", code: "N/A", created_at: "", updated_at: "" },
        experts: noCountryExperts,
      });
    }

    return grouped;
  }, [experts, countries]);

  // Toggle expert active status
  const toggleExpertActive = async (expertId: string) => {
    const expert = experts.find((e) => e.id === expertId);
    if (!expert) return;

    try {
      const { error } = await supabase
        .from("experts")
        .update({ is_active: !expert.is_active })
        .eq("id", expertId);

      if (error) throw error;
      await fetchExperts();
      toast.success(expert.is_active ? "Szakértő deaktiválva" : "Szakértő aktiválva");
    } catch (error) {
      console.error("Error toggling expert active:", error);
      toast.error("Hiba az állapot módosításakor");
    }
  };

  // Toggle expert locked status
  const toggleExpertLocked = async (expertId: string) => {
    const expert = experts.find((e) => e.id === expertId);
    if (!expert) return;

    try {
      const { error } = await supabase
        .from("experts")
        .update({ is_locked: !expert.is_locked })
        .eq("id", expertId);

      if (error) throw error;
      await fetchExperts();
      toast.success(expert.is_locked ? "Szakértő feloldva" : "Szakértő zárolva");
    } catch (error) {
      console.error("Error toggling expert locked:", error);
      toast.error("Hiba a zárolás módosításakor");
    }
  };

  // Cancel expert contract
  const cancelExpertContract = async (expertId: string) => {
    const expert = experts.find((e) => e.id === expertId);
    if (!expert) return;

    try {
      const { error } = await supabase
        .from("experts")
        .update({
          is_locked: true,
          is_active: false,
          contract_canceled: true,
        })
        .eq("id", expertId);

      if (error) throw error;
      await fetchExperts();
      toast.success("Szerződés felmondva");
    } catch (error) {
      console.error("Error canceling contract:", error);
      toast.error("Hiba a szerződés felmondásakor");
    }
  };

  // Delete expert
  const deleteExpert = async (expertId: string) => {
    try {
      const { error } = await supabase
        .from("experts")
        .delete()
        .eq("id", expertId);

      if (error) throw error;
      await fetchExperts();
      toast.success("Szakértő törölve");
    } catch (error) {
      console.error("Error deleting expert:", error);
      toast.error("Hiba a szakértő törlésekor");
    }
  };

  // Create expert
  const createExpert = async (data: Partial<Expert>): Promise<string | null> => {
    try {
      const insertData = {
        name: data.name || "",
        email: data.email || "",
        username: data.username,
        phone_prefix: data.phone_prefix,
        phone_number: data.phone_number,
        country_id: data.country_id,
        language: data.language || "hu",
        is_cgp_employee: data.is_cgp_employee || false,
        is_eap_online_expert: data.is_eap_online_expert || false,
        is_active: data.is_active !== undefined ? data.is_active : true,
        is_locked: data.is_locked || false,
        contract_canceled: data.contract_canceled || false,
        crisis_psychologist: data.crisis_psychologist || false,
      };

      const { data: newExpert, error } = await supabase
        .from("experts")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      await fetchExperts();
      toast.success("Szakértő létrehozva");
      return newExpert.id;
    } catch (error) {
      console.error("Error creating expert:", error);
      toast.error("Hiba a szakértő létrehozásakor");
      return null;
    }
  };

  // Update expert
  const updateExpert = async (expertId: string, data: Partial<Expert>) => {
    try {
      const { error } = await supabase
        .from("experts")
        .update(data)
        .eq("id", expertId);

      if (error) throw error;
      await fetchExperts();
      toast.success("Szakértő frissítve");
    } catch (error) {
      console.error("Error updating expert:", error);
      toast.error("Hiba a szakértő frissítésekor");
    }
  };

  // Get expert by ID
  const getExpertById = async (expertId: string): Promise<Expert | null> => {
    try {
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .eq("id", expertId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching expert:", error);
      return null;
    }
  };

  // =====================
  // EXPERT DATA (address, case limits, native language)
  // =====================
  const getExpertData = async (expertId: string) => {
    try {
      const { data, error } = await supabase
        .from("expert_data")
        .select("*")
        .eq("expert_id", expertId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching expert data:", error);
      return null;
    }
  };

  const updateExpertData = async (expertId: string, data: {
    post_code?: string;
    country_id?: string;
    city_id?: string;
    street?: string;
    street_suffix?: string;
    house_number?: string;
    native_language?: string;
    max_inprogress_cases?: number;
    min_inprogress_cases?: number;
  }) => {
    try {
      // Check if record exists
      const existing = await getExpertData(expertId);
      
      if (existing) {
        const { error } = await supabase
          .from("expert_data")
          .update(data)
          .eq("expert_id", expertId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("expert_data")
          .insert({ expert_id: expertId, ...data });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating expert data:", error);
      throw error;
    }
  };

  // =====================
  // EXPERT INVOICE DATA
  // =====================
  const getExpertInvoiceData = async (expertId: string) => {
    try {
      const { data, error } = await supabase
        .from("expert_invoice_data")
        .select("*")
        .eq("expert_id", expertId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching expert invoice data:", error);
      return null;
    }
  };

  const updateExpertInvoiceData = async (expertId: string, data: {
    invoicing_type?: string;
    currency?: string;
    hourly_rate_50?: number | null;
    hourly_rate_30?: number | null;
    hourly_rate_15?: number | null;
    fixed_wage?: number | null;
    ranking_hourly_rate?: number | null;
    single_session_rate?: number | null;
  }) => {
    try {
      const existing = await getExpertInvoiceData(expertId);
      
      if (existing) {
        const { error } = await supabase
          .from("expert_invoice_data")
          .update(data)
          .eq("expert_id", expertId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("expert_invoice_data")
          .insert({ expert_id: expertId, ...data });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating expert invoice data:", error);
      throw error;
    }
  };

  // =====================
  // EXPERT COUNTRIES
  // =====================
  const getExpertCountries = async (expertId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("expert_countries")
        .select("country_id")
        .eq("expert_id", expertId);

      if (error) throw error;
      return data?.map((d) => d.country_id) || [];
    } catch (error) {
      console.error("Error fetching expert countries:", error);
      return [];
    }
  };

  const updateExpertCountries = async (expertId: string, countryIds: string[]) => {
    try {
      await supabase.from("expert_countries").delete().eq("expert_id", expertId);
      if (countryIds.length > 0) {
        const { error } = await supabase.from("expert_countries").insert(
          countryIds.map((countryId) => ({ expert_id: expertId, country_id: countryId }))
        );
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating expert countries:", error);
      throw error;
    }
  };

  // =====================
  // EXPERT CRISIS COUNTRIES
  // =====================
  const getExpertCrisisCountries = async (expertId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("expert_crisis_countries")
        .select("country_id")
        .eq("expert_id", expertId);

      if (error) throw error;
      return data?.map((d) => d.country_id) || [];
    } catch (error) {
      console.error("Error fetching expert crisis countries:", error);
      return [];
    }
  };

  const updateExpertCrisisCountries = async (expertId: string, countryIds: string[]) => {
    try {
      await supabase.from("expert_crisis_countries").delete().eq("expert_id", expertId);
      if (countryIds.length > 0) {
        const { error } = await supabase.from("expert_crisis_countries").insert(
          countryIds.map((countryId) => ({ expert_id: expertId, country_id: countryId }))
        );
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating expert crisis countries:", error);
      throw error;
    }
  };

  // =====================
  // EXPERT PERMISSIONS
  // =====================
  const getExpertPermissions = async (expertId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("expert_permissions")
        .select("permission_id")
        .eq("expert_id", expertId);

      if (error) throw error;
      return data?.map((d) => d.permission_id) || [];
    } catch (error) {
      console.error("Error fetching expert permissions:", error);
      return [];
    }
  };

  const updateExpertPermissions = async (expertId: string, permissionIds: string[]) => {
    try {
      await supabase.from("expert_permissions").delete().eq("expert_id", expertId);
      if (permissionIds.length > 0) {
        const { error } = await supabase.from("expert_permissions").insert(
          permissionIds.map((permissionId) => ({ expert_id: expertId, permission_id: permissionId }))
        );
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating expert permissions:", error);
      throw error;
    }
  };

  // =====================
  // EXPERT SPECIALIZATIONS
  // =====================
  const getExpertSpecializations = async (expertId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("expert_specializations")
        .select("specialization_id")
        .eq("expert_id", expertId);

      if (error) throw error;
      return data?.map((d) => d.specialization_id) || [];
    } catch (error) {
      console.error("Error fetching expert specializations:", error);
      return [];
    }
  };

  const updateExpertSpecializations = async (expertId: string, specializationIds: string[]) => {
    try {
      await supabase.from("expert_specializations").delete().eq("expert_id", expertId);
      if (specializationIds.length > 0) {
        const { error } = await supabase.from("expert_specializations").insert(
          specializationIds.map((specializationId) => ({ expert_id: expertId, specialization_id: specializationId }))
        );
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating expert specializations:", error);
      throw error;
    }
  };

  // =====================
  // EXPERT LANGUAGE SKILLS
  // =====================
  const getExpertLanguageSkills = async (expertId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("expert_language_skills")
        .select("language_skill_id")
        .eq("expert_id", expertId);

      if (error) throw error;
      return data?.map((d) => d.language_skill_id) || [];
    } catch (error) {
      console.error("Error fetching expert language skills:", error);
      return [];
    }
  };

  const updateExpertLanguageSkills = async (expertId: string, languageSkillIds: string[]) => {
    try {
      await supabase.from("expert_language_skills").delete().eq("expert_id", expertId);
      if (languageSkillIds.length > 0) {
        const { error } = await supabase.from("expert_language_skills").insert(
          languageSkillIds.map((languageSkillId) => ({ expert_id: expertId, language_skill_id: languageSkillId }))
        );
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating expert language skills:", error);
      throw error;
    }
  };

  return {
    experts,
    countries,
    permissions,
    specializations,
    languageSkills,
    loading,
    getExpertsByCountry,
    toggleExpertActive,
    toggleExpertLocked,
    cancelExpertContract,
    deleteExpert,
    createExpert,
    updateExpert,
    getExpertById,
    getExpertCountries,
    updateExpertCountries,
    getExpertCrisisCountries,
    updateExpertCrisisCountries,
    getExpertPermissions,
    updateExpertPermissions,
    getExpertSpecializations,
    updateExpertSpecializations,
    getExpertLanguageSkills,
    updateExpertLanguageSkills,
    getExpertData,
    updateExpertData,
    getExpertInvoiceData,
    updateExpertInvoiceData,
    refetch: fetchAll,
  };
};
