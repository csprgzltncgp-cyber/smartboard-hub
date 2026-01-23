import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Seed data for demo purposes
const SEED_COUNTRIES = [
  { name: "Magyarország", code: "HU" },
  { name: "Csehország", code: "CZ" },
  { name: "Szlovákia", code: "SK" },
  { name: "Románia", code: "RO" },
  { name: "Szerbia", code: "RS" },
];

const SEED_COMPANIES = [
  { name: "ABC Technológia Kft.", country_code: "HU", contact_email: "info@abc-tech.hu" },
  { name: "XYZ Consulting Zrt.", country_code: "HU", contact_email: "office@xyz.hu" },
  { name: "Demo Corporation", country_code: "HU", contact_email: "demo@corp.hu" },
  { name: "Praha Solutions s.r.o.", country_code: "CZ", contact_email: "info@praha-solutions.cz" },
  { name: "Bratislava Partners", country_code: "SK", contact_email: "contact@bp.sk" },
  { name: "Bucharest Industries", country_code: "RO", contact_email: "office@bi.ro" },
];

export const useSeedActivityPlanData = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    const checkAndSeedData = async () => {
      try {
        // Check if countries exist
        const { data: existingCountries } = await supabase
          .from("countries")
          .select("id")
          .limit(1);

        if (existingCountries && existingCountries.length > 0) {
          setIsSeeded(true);
          return;
        }

        setIsSeeding(true);

        // Insert countries
        const { data: countries, error: countriesError } = await supabase
          .from("countries")
          .insert(SEED_COUNTRIES)
          .select();

        if (countriesError) throw countriesError;

        // Create country code to ID map
        const countryMap = new Map(countries?.map(c => [c.code, c.id]));

        // Insert companies with country IDs
        const companiesWithCountryIds = SEED_COMPANIES.map(company => ({
          name: company.name,
          country_id: countryMap.get(company.country_code)!,
          contact_email: company.contact_email,
        }));

        const { error: companiesError } = await supabase
          .from("companies")
          .insert(companiesWithCountryIds);

        if (companiesError) throw companiesError;

        setIsSeeded(true);
        toast.success("Demo adatok betöltve");
      } catch (error) {
        console.error("Error seeding data:", error);
        toast.error("Hiba a demo adatok betöltésekor");
      } finally {
        setIsSeeding(false);
      }
    };

    checkAndSeedData();
  }, []);

  return { isSeeding, isSeeded };
};
