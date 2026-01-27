import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MultiSelectField } from "@/components/experts/MultiSelectField";
import { HierarchicalSpecializationSelect } from "@/components/experts/HierarchicalSpecializationSelect";
import { ExpertFileUpload } from "@/components/experts/ExpertFileUpload";
import { ExpertTypeSwitcher } from "@/components/experts/ExpertTypeSwitcher";
import { CompanyDataPanel } from "@/components/experts/CompanyDataPanel";
import { CompanyBillingPanel } from "@/components/experts/CompanyBillingPanel";
import { TeamMembersPanel, createEmptyTeamMember } from "@/components/experts/TeamMembersPanel";
import { TeamMember } from "@/components/experts/TeamMemberCard";
import { ConsultationTypeSettings, ConsultationSettings, defaultConsultationSettings } from "@/components/experts/ConsultationTypeSettings";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface Specialization {
  id: string;
  name: string;
}

interface LanguageSkill {
  id: string;
  name: string;
  code: string | null;
}

interface City {
  id: string;
  name: string;
}

// Utcatípusok
const STREET_SUFFIXES = [
  { id: "1", name: "Utca" },
  { id: "2", name: "Tér" },
  { id: "3", name: "Út" },
];

// Pénznemek
const CURRENCIES = [
  { id: "czk", name: "CZK" },
  { id: "eur", name: "EUR" },
  { id: "huf", name: "HUF" },
  { id: "mdl", name: "MDL" },
  { id: "pln", name: "PLN" },
  { id: "ron", name: "RON" },
  { id: "rsd", name: "RSD" },
  { id: "usd", name: "USD" },
  { id: "chf", name: "CHF" },
];

// Számlázási típusok
const INVOICING_TYPES = [
  { id: "normal", name: "Normál" },
  { id: "fixed", name: "Fix" },
  { id: "custom", name: "Egyedi" },
];

// Nyelvek a dashboard-hoz
const DASHBOARD_LANGUAGES = [
  { id: "hu", name: "Magyar" },
  { id: "en", name: "English" },
  { id: "de", name: "Deutsch" },
];

// Telefon előhívók
const PHONE_PREFIXES = [
  { code: "HU", dial_code: "+36" },
  { code: "CZ", dial_code: "+420" },
  { code: "SK", dial_code: "+421" },
  { code: "RO", dial_code: "+40" },
  { code: "RS", dial_code: "+381" },
  { code: "PL", dial_code: "+48" },
  { code: "MD", dial_code: "+373" },
  { code: "AL", dial_code: "+355" },
  { code: "XK", dial_code: "+383" },
  { code: "MK", dial_code: "+389" },
  { code: "UA", dial_code: "+380" },
];

const ExpertForm = () => {
  const navigate = useNavigate();
  const { expertId } = useParams<{ expertId: string }>();
  const isEditMode = Boolean(expertId);

  // Referencia adatok
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [languageSkills, setLanguageSkills] = useState<LanguageSkill[]>([]);
  const [loading, setLoading] = useState(true);

  // Profil típusa
  const [expertType, setExpertType] = useState<"individual" | "company">("individual");

  // Szakértő alapadatai (egyéni)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isCgpEmployee, setIsCgpEmployee] = useState(false);
  // Note: isEapOnlineExpert is now managed inside consultationSettings

  // Kapcsolattartási adatok
  const [phonePrefix, setPhonePrefix] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Postai cím
  const [postCode, setPostCode] = useState("");
  const [addressCountryId, setAddressCountryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [street, setStreet] = useState("");
  const [streetSuffix, setStreetSuffix] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  // Számlázási adatok (egyéni)
  const [invoicingType, setInvoicingType] = useState("");
  const [currency, setCurrency] = useState("");
  const [hourlyRate50, setHourlyRate50] = useState("");
  const [hourlyRate30, setHourlyRate30] = useState("");
  const [hourlyRate15, setHourlyRate15] = useState("");
  const [fixedWage, setFixedWage] = useState("");
  const [rankingHourlyRate, setRankingHourlyRate] = useState("");
  const [singleSessionRate, setSingleSessionRate] = useState("");
  
  // Extra díjazások
  interface CustomInvoiceItem {
    id?: string;
    name: string;
    country_id: string;
    amount: string;
  }
  const [customInvoiceItems, setCustomInvoiceItems] = useState<CustomInvoiceItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCountryId, setNewItemCountryId] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");

  // Expert fájlok
  interface ExpertFile {
    id: string;
    filename: string;
    file_path: string;
    file_type: string;
  }
  const [contractFiles, setContractFiles] = useState<ExpertFile[]>([]);
  const [certificateFiles, setCertificateFiles] = useState<ExpertFile[]>([]);

  // Szakmai adatok
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedOutsourceCountries, setSelectedOutsourceCountries] = useState<string[]>([]);
  const [selectedCrisisCountries, setSelectedCrisisCountries] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguageSkills, setSelectedLanguageSkills] = useState<string[]>([]);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [isCrisisPsychologist, setIsCrisisPsychologist] = useState(false);
  const [maxInprogressCases, setMaxInprogressCases] = useState("");
  const [minInprogressCases, setMinInprogressCases] = useState("");

  // Dashboard adatok
  const [dashboardLanguage, setDashboardLanguage] = useState("hu");

  // Tanácsadási típusok beállításai
  const [consultationSettings, setConsultationSettings] = useState<ConsultationSettings>(defaultConsultationSettings);

  // === CÉGES ADATOK ===
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyPostalCode, setCompanyPostalCode] = useState("");
  const [companyCountryId, setCompanyCountryId] = useState("");

  // Céges számlázási adatok
  const [billingName, setBillingName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCountryId, setBillingCountryId] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingTaxNumber, setBillingTaxNumber] = useState("");

  // Csapattagok
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Betöltés
  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (isEditMode && expertId && !loading) {
      fetchExpertData();
    }
  }, [isEditMode, expertId, loading]);

  const fetchReferenceData = async () => {
    try {
      const [countriesRes, citiesRes, permissionsRes, specializationsRes, languageSkillsRes] = await Promise.all([
        supabase.from("countries").select("*").order("name"),
        supabase.from("cities").select("*").order("name"),
        supabase.from("permissions").select("*").order("name"),
        supabase.from("specializations").select("*").order("name"),
        supabase.from("language_skills").select("*").order("name"),
      ]);

      if (countriesRes.data) setCountries(countriesRes.data);
      if (citiesRes.data) setCities(citiesRes.data);
      if (permissionsRes.data) setPermissions(permissionsRes.data);
      if (specializationsRes.data) setSpecializations(specializationsRes.data);
      if (languageSkillsRes.data) setLanguageSkills(languageSkillsRes.data);
    } catch (error) {
      console.error("Error fetching reference data:", error);
      toast.error("Hiba az adatok betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpertData = async () => {
    if (!expertId) return;

    try {
      // Szakértő alapadatok
      const { data: expert } = await supabase
        .from("experts")
        .select("*")
        .eq("id", expertId)
        .single();

      if (expert) {
        setExpertType((expert.expert_type as "individual" | "company") || "individual");
        setName(expert.name);
        setEmail(expert.email);
        setUsername(expert.username || "");
        setPhonePrefix(expert.phone_prefix || "");
        setPhoneNumber(expert.phone_number || "");
        setDashboardLanguage(expert.language || "hu");
        setIsCgpEmployee(expert.is_cgp_employee || false);
        // isEapOnlineExpert is now loaded into consultationSettings below
        setIsCrisisPsychologist(expert.crisis_psychologist || false);

        // Tanácsadási típusok betöltése
        setConsultationSettings({
          acceptsPersonalConsultation: (expert as any).accepts_personal_consultation || false,
          acceptsVideoConsultation: (expert as any).accepts_video_consultation || false,
          acceptsPhoneConsultation: (expert as any).accepts_phone_consultation || false,
          acceptsChatConsultation: (expert as any).accepts_chat_consultation || false,
          videoConsultationType: ((expert as any).video_consultation_type as "eap_online_only" | "operator_only" | "both") || "both",
          acceptsOnsiteConsultation: (expert as any).accepts_onsite_consultation || false,
          isEapOnlineExpert: expert.is_eap_online_expert || false,
          eapOnlineImage: "",
          eapOnlineShortDescription: "",
          eapOnlineLongDescription: "",
        });

        // Céges adatok
        setCompanyName(expert.company_name || "");
        setTaxNumber(expert.tax_number || "");
        setCompanyRegistrationNumber(expert.company_registration_number || "");
        setCompanyAddress(expert.company_address || "");
        setCompanyCity(expert.company_city || "");
        setCompanyPostalCode(expert.company_postal_code || "");
        setCompanyCountryId(expert.company_country_id || "");
        setBillingName(expert.billing_name || "");
        setBillingAddress(expert.billing_address || "");
        setBillingCity(expert.billing_city || "");
        setBillingPostalCode(expert.billing_postal_code || "");
        setBillingCountryId(expert.billing_country_id || "");
        setBillingEmail(expert.billing_email || "");
        setBillingTaxNumber(expert.billing_tax_number || "");
      }

      // Expert data
      const { data: expertData } = await supabase
        .from("expert_data")
        .select("*")
        .eq("expert_id", expertId)
        .single();

      if (expertData) {
        setPostCode(expertData.post_code || "");
        setCityId(expertData.city_id || "");
        setStreet(expertData.street || "");
        setStreetSuffix(expertData.street_suffix || "");
        setHouseNumber(expertData.house_number || "");
        setNativeLanguage(expertData.native_language || "");
        setMaxInprogressCases(expertData.max_inprogress_cases?.toString() || "");
        setMinInprogressCases(expertData.min_inprogress_cases?.toString() || "");
      }

      // Invoice data
      const { data: invoiceData } = await supabase
        .from("expert_invoice_data")
        .select("*")
        .eq("expert_id", expertId)
        .single();

      if (invoiceData) {
        setInvoicingType(invoiceData.invoicing_type || "");
        setCurrency(invoiceData.currency || "");
        setHourlyRate50(invoiceData.hourly_rate_50?.toString() || "");
        setHourlyRate30(invoiceData.hourly_rate_30?.toString() || "");
        setHourlyRate15(invoiceData.hourly_rate_15?.toString() || "");
        setFixedWage(invoiceData.fixed_wage?.toString() || "");
        setRankingHourlyRate(invoiceData.ranking_hourly_rate?.toString() || "");
        setSingleSessionRate(invoiceData.single_session_rate?.toString() || "");
      }

      // Kapcsolódó adatok
      const [countriesRes, citiesRes, outsourceCountriesRes, crisisCountriesRes, permissionsRes, specializationsRes, languageSkillsRes, customItemsRes, contractFilesRes, certificateFilesRes, teamMembersRes] = await Promise.all([
        supabase.from("expert_countries").select("country_id").eq("expert_id", expertId),
        supabase.from("expert_cities").select("city_id").eq("expert_id", expertId),
        supabase.from("expert_outsource_countries").select("country_id").eq("expert_id", expertId),
        supabase.from("expert_crisis_countries").select("country_id").eq("expert_id", expertId),
        supabase.from("expert_permissions").select("permission_id").eq("expert_id", expertId),
        supabase.from("expert_specializations").select("specialization_id").eq("expert_id", expertId),
        supabase.from("expert_language_skills").select("language_skill_id").eq("expert_id", expertId),
        supabase.from("custom_invoice_items").select("*").eq("expert_id", expertId),
        supabase.from("expert_files").select("*").eq("expert_id", expertId).eq("file_type", "contract"),
        supabase.from("expert_files").select("*").eq("expert_id", expertId).eq("file_type", "certificate"),
        supabase.from("expert_team_members").select("*").eq("expert_id", expertId).order("created_at"),
      ]);

      if (countriesRes.data) setSelectedCountries(countriesRes.data.map((c) => c.country_id));
      if (citiesRes.data) setSelectedCities(citiesRes.data.map((c) => c.city_id));
      if (outsourceCountriesRes.data) setSelectedOutsourceCountries(outsourceCountriesRes.data.map((c) => c.country_id));
      if (crisisCountriesRes.data) setSelectedCrisisCountries(crisisCountriesRes.data.map((c) => c.country_id));
      if (permissionsRes.data) setSelectedPermissions(permissionsRes.data.map((p) => p.permission_id));
      if (specializationsRes.data) setSelectedSpecializations(specializationsRes.data.map((s) => s.specialization_id));
      if (languageSkillsRes.data) setSelectedLanguageSkills(languageSkillsRes.data.map((l) => l.language_skill_id));
      if (customItemsRes.data) {
        setCustomInvoiceItems(customItemsRes.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          country_id: item.country_id,
          amount: item.amount?.toString() || "",
        })));
      }
      if (contractFilesRes.data) setContractFiles(contractFilesRes.data);
      if (certificateFilesRes.data) setCertificateFiles(certificateFilesRes.data);

      // Load team members with their related data
      if (teamMembersRes.data && teamMembersRes.data.length > 0) {
        const membersWithData = await Promise.all(
          teamMembersRes.data.map(async (member) => {
            const [memberCountries, memberCities, memberPerms, memberSpecs, memberLangs] = await Promise.all([
              supabase.from("team_member_countries").select("country_id").eq("team_member_id", member.id),
              supabase.from("team_member_cities").select("city_id").eq("team_member_id", member.id),
              supabase.from("team_member_permissions").select("permission_id").eq("team_member_id", member.id),
              supabase.from("team_member_specializations").select("specialization_id").eq("team_member_id", member.id),
              supabase.from("team_member_language_skills").select("language_skill_id").eq("team_member_id", member.id),
            ]);

            return {
              id: member.id,
              name: member.name,
              email: member.email,
              phone_prefix: member.phone_prefix || "",
              phone_number: member.phone_number || "",
              is_team_leader: member.is_team_leader || false,
              is_active: member.is_active ?? true,
              is_cgp_employee: (member as any).is_cgp_employee || false,
              is_eap_online_expert: (member as any).is_eap_online_expert || false,
              language: member.language || "hu",
              selectedCountries: memberCountries.data?.map((c) => c.country_id) || [],
              selectedCities: memberCities.data?.map((c) => c.city_id) || [],
              selectedPermissions: memberPerms.data?.map((p) => p.permission_id) || [],
              selectedSpecializations: memberSpecs.data?.map((s) => s.specialization_id) || [],
              selectedLanguageSkills: memberLangs.data?.map((l) => l.language_skill_id) || [],
              nativeLanguage: "",
              maxInprogressCases: "10",
              minInprogressCases: "0",
              username: "",
              dashboardLanguage: member.language || "hu",
              // Consultation type settings
              acceptsPersonalConsultation: (member as any).accepts_personal_consultation || false,
              acceptsVideoConsultation: (member as any).accepts_video_consultation || false,
              acceptsPhoneConsultation: (member as any).accepts_phone_consultation || false,
              acceptsChatConsultation: (member as any).accepts_chat_consultation || false,
              videoConsultationType: ((member as any).video_consultation_type as "eap_online_only" | "operator_only" | "both") || "both",
              acceptsOnsiteConsultation: (member as any).accepts_onsite_consultation || false,
              // EAP Online extra fields
              eapOnlineImage: "",
              eapOnlineShortDescription: "",
              eapOnlineLongDescription: "",
            } as TeamMember;
          })
        );
        setTeamMembers(membersWithData);
      }
    } catch (error) {
      console.error("Error fetching expert data:", error);
      toast.error("Hiba a szakértő adatainak betöltésekor");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validáció
    if (expertType === "individual") {
      if (!name.trim() || !email.trim()) {
        toast.error("A név és email megadása kötelező");
        return;
      }
    } else {
      if (!companyName.trim()) {
        toast.error("A cégnév megadása kötelező");
        return;
      }
      if (teamMembers.length === 0) {
        toast.error("Legalább egy csapattagot hozzá kell adni");
        return;
      }
      if (!teamMembers.some((m) => m.is_team_leader)) {
        toast.error("Ki kell jelölni egy csapatvezetőt");
        return;
      }
    }

    try {
      if (isEditMode && expertId) {
        // Frissítés
        await supabase
          .from("experts")
          .update({
            expert_type: expertType,
            name: expertType === "individual" ? name : companyName,
            email: expertType === "individual" ? email : (teamMembers.find((m) => m.is_team_leader)?.email || email),
            username: expertType === "individual" ? (username || null) : null,
            phone_prefix: expertType === "individual" ? (phonePrefix || null) : null,
            phone_number: expertType === "individual" ? (phoneNumber || null) : null,
            language: dashboardLanguage,
            crisis_psychologist: expertType === "individual" ? isCrisisPsychologist : false,
            is_eap_online_expert: expertType === "individual" ? consultationSettings.isEapOnlineExpert : false,
            accepts_personal_consultation: expertType === "individual" ? consultationSettings.acceptsPersonalConsultation : false,
            accepts_video_consultation: expertType === "individual" ? consultationSettings.acceptsVideoConsultation : false,
            accepts_phone_consultation: expertType === "individual" ? consultationSettings.acceptsPhoneConsultation : false,
            accepts_chat_consultation: expertType === "individual" ? consultationSettings.acceptsChatConsultation : false,
            video_consultation_type: expertType === "individual" ? consultationSettings.videoConsultationType : "both",
            accepts_onsite_consultation: expertType === "individual" ? consultationSettings.acceptsOnsiteConsultation : false,
            company_name: expertType === "company" ? companyName : null,
            tax_number: expertType === "company" ? taxNumber : null,
            company_registration_number: expertType === "company" ? companyRegistrationNumber : null,
            company_address: expertType === "company" ? companyAddress : null,
            company_city: expertType === "company" ? companyCity : null,
            company_postal_code: expertType === "company" ? companyPostalCode : null,
            company_country_id: expertType === "company" && companyCountryId ? companyCountryId : null,
            billing_name: expertType === "company" ? billingName : null,
            billing_address: expertType === "company" ? billingAddress : null,
            billing_city: expertType === "company" ? billingCity : null,
            billing_postal_code: expertType === "company" ? billingPostalCode : null,
            billing_country_id: expertType === "company" && billingCountryId ? billingCountryId : null,
            billing_email: expertType === "company" ? billingEmail : null,
            billing_tax_number: expertType === "company" ? billingTaxNumber : null,
          })
          .eq("id", expertId);

        if (expertType === "individual") {
          // Expert data frissítése (csak egyéni)
          const { data: existingExpertData } = await supabase
            .from("expert_data")
            .select("id")
            .eq("expert_id", expertId)
            .single();

          const expertDataPayload = {
            expert_id: expertId,
            post_code: postCode || null,
            city_id: cityId || null,
            street: street || null,
            street_suffix: streetSuffix || null,
            house_number: houseNumber || null,
            native_language: nativeLanguage || null,
            max_inprogress_cases: maxInprogressCases ? parseInt(maxInprogressCases) : null,
            min_inprogress_cases: minInprogressCases ? parseInt(minInprogressCases) : null,
          };

          if (existingExpertData) {
            await supabase.from("expert_data").update(expertDataPayload).eq("expert_id", expertId);
          } else {
            await supabase.from("expert_data").insert(expertDataPayload);
          }

          // Invoice data frissítése (csak egyéni)
          const { data: existingInvoiceData } = await supabase
            .from("expert_invoice_data")
            .select("id")
            .eq("expert_id", expertId)
            .single();

          const invoiceDataPayload = {
            expert_id: expertId,
            invoicing_type: invoicingType || null,
            currency: currency || null,
            hourly_rate_50: hourlyRate50 ? parseFloat(hourlyRate50) : null,
            hourly_rate_30: hourlyRate30 ? parseFloat(hourlyRate30) : null,
            hourly_rate_15: hourlyRate15 ? parseFloat(hourlyRate15) : null,
            fixed_wage: fixedWage ? parseFloat(fixedWage) : null,
            ranking_hourly_rate: rankingHourlyRate ? parseFloat(rankingHourlyRate) : null,
            single_session_rate: singleSessionRate ? parseFloat(singleSessionRate) : null,
          };

          if (existingInvoiceData) {
            await supabase.from("expert_invoice_data").update(invoiceDataPayload).eq("expert_id", expertId);
          } else {
            await supabase.from("expert_invoice_data").insert(invoiceDataPayload);
          }

          // Kapcsolódó adatok frissítése
          await supabase.from("expert_countries").delete().eq("expert_id", expertId);
          if (selectedCountries.length > 0) {
            await supabase.from("expert_countries").insert(
              selectedCountries.map((countryId) => ({ expert_id: expertId, country_id: countryId }))
            );
          }

          await supabase.from("expert_cities").delete().eq("expert_id", expertId);
          if (selectedCities.length > 0) {
            await supabase.from("expert_cities").insert(
              selectedCities.map((cityId) => ({ expert_id: expertId, city_id: cityId }))
            );
          }

          await supabase.from("expert_outsource_countries").delete().eq("expert_id", expertId);
          if (selectedOutsourceCountries.length > 0) {
            await supabase.from("expert_outsource_countries").insert(
              selectedOutsourceCountries.map((countryId) => ({ expert_id: expertId, country_id: countryId }))
            );
          }

          await supabase.from("expert_crisis_countries").delete().eq("expert_id", expertId);
          if (selectedCrisisCountries.length > 0) {
            await supabase.from("expert_crisis_countries").insert(
              selectedCrisisCountries.map((countryId) => ({ expert_id: expertId, country_id: countryId }))
            );
          }

          await supabase.from("expert_permissions").delete().eq("expert_id", expertId);
          if (selectedPermissions.length > 0) {
            await supabase.from("expert_permissions").insert(
              selectedPermissions.map((permissionId) => ({ expert_id: expertId, permission_id: permissionId }))
            );
          }

          await supabase.from("expert_specializations").delete().eq("expert_id", expertId);
          if (selectedSpecializations.length > 0) {
            await supabase.from("expert_specializations").insert(
              selectedSpecializations.map((specializationId) => ({ expert_id: expertId, specialization_id: specializationId }))
            );
          }

          await supabase.from("expert_language_skills").delete().eq("expert_id", expertId);
          if (selectedLanguageSkills.length > 0) {
            await supabase.from("expert_language_skills").insert(
              selectedLanguageSkills.map((languageSkillId) => ({ expert_id: expertId, language_skill_id: languageSkillId }))
            );
          }

          await supabase.from("custom_invoice_items").delete().eq("expert_id", expertId);
          if (customInvoiceItems.length > 0) {
            await supabase.from("custom_invoice_items").insert(
              customInvoiceItems.map((item) => ({
                expert_id: expertId,
                name: item.name,
                country_id: item.country_id,
                amount: parseInt(item.amount) || 0,
              }))
            );
          }
        } else {
          // Céges mód: csapattagok mentése
          await saveTeamMembers(expertId);
        }

        toast.success("Szakértő sikeresen frissítve");
      } else {
        // Új létrehozás
        const { data: newExpert, error } = await supabase
          .from("experts")
          .insert({
            expert_type: expertType,
            name: expertType === "individual" ? name : companyName,
            email: expertType === "individual" ? email : (teamMembers.find((m) => m.is_team_leader)?.email || ""),
            username: expertType === "individual" ? (username || null) : null,
            phone_prefix: expertType === "individual" ? (phonePrefix || null) : null,
            phone_number: expertType === "individual" ? (phoneNumber || null) : null,
            language: dashboardLanguage,
            crisis_psychologist: expertType === "individual" ? isCrisisPsychologist : false,
            is_eap_online_expert: expertType === "individual" ? consultationSettings.isEapOnlineExpert : false,
            accepts_personal_consultation: expertType === "individual" ? consultationSettings.acceptsPersonalConsultation : false,
            accepts_video_consultation: expertType === "individual" ? consultationSettings.acceptsVideoConsultation : false,
            accepts_phone_consultation: expertType === "individual" ? consultationSettings.acceptsPhoneConsultation : false,
            accepts_chat_consultation: expertType === "individual" ? consultationSettings.acceptsChatConsultation : false,
            video_consultation_type: expertType === "individual" ? consultationSettings.videoConsultationType : "both",
            accepts_onsite_consultation: expertType === "individual" ? consultationSettings.acceptsOnsiteConsultation : false,
            country_id: selectedCountries[0] || null,
            company_name: expertType === "company" ? companyName : null,
            tax_number: expertType === "company" ? taxNumber : null,
            company_registration_number: expertType === "company" ? companyRegistrationNumber : null,
            company_address: expertType === "company" ? companyAddress : null,
            company_city: expertType === "company" ? companyCity : null,
            company_postal_code: expertType === "company" ? companyPostalCode : null,
            company_country_id: expertType === "company" && companyCountryId ? companyCountryId : null,
            billing_name: expertType === "company" ? billingName : null,
            billing_address: expertType === "company" ? billingAddress : null,
            billing_city: expertType === "company" ? billingCity : null,
            billing_postal_code: expertType === "company" ? billingPostalCode : null,
            billing_country_id: expertType === "company" && billingCountryId ? billingCountryId : null,
            billing_email: expertType === "company" ? billingEmail : null,
            billing_tax_number: expertType === "company" ? billingTaxNumber : null,
          })
          .select()
          .single();

        if (error) throw error;

        const newExpertId = newExpert.id;

        if (expertType === "individual") {
          // Expert data létrehozása
          await supabase.from("expert_data").insert({
            expert_id: newExpertId,
            post_code: postCode || null,
            city_id: cityId || null,
            street: street || null,
            street_suffix: streetSuffix || null,
            house_number: houseNumber || null,
            native_language: nativeLanguage || null,
            max_inprogress_cases: maxInprogressCases ? parseInt(maxInprogressCases) : null,
            min_inprogress_cases: minInprogressCases ? parseInt(minInprogressCases) : null,
          });

          // Invoice data létrehozása
          await supabase.from("expert_invoice_data").insert({
            expert_id: newExpertId,
            invoicing_type: invoicingType || null,
            currency: currency || null,
            hourly_rate_50: hourlyRate50 ? parseFloat(hourlyRate50) : null,
            hourly_rate_30: hourlyRate30 ? parseFloat(hourlyRate30) : null,
            hourly_rate_15: hourlyRate15 ? parseFloat(hourlyRate15) : null,
            fixed_wage: fixedWage ? parseFloat(fixedWage) : null,
            ranking_hourly_rate: rankingHourlyRate ? parseFloat(rankingHourlyRate) : null,
            single_session_rate: singleSessionRate ? parseFloat(singleSessionRate) : null,
          });

          // Kapcsolódó adatok
          if (selectedCountries.length > 0) {
            await supabase.from("expert_countries").insert(
              selectedCountries.map((countryId) => ({ expert_id: newExpertId, country_id: countryId }))
            );
          }

          if (selectedCities.length > 0) {
            await supabase.from("expert_cities").insert(
              selectedCities.map((cityId) => ({ expert_id: newExpertId, city_id: cityId }))
            );
          }

          if (selectedOutsourceCountries.length > 0) {
            await supabase.from("expert_outsource_countries").insert(
              selectedOutsourceCountries.map((countryId) => ({ expert_id: newExpertId, country_id: countryId }))
            );
          }

          if (selectedCrisisCountries.length > 0) {
            await supabase.from("expert_crisis_countries").insert(
              selectedCrisisCountries.map((countryId) => ({ expert_id: newExpertId, country_id: countryId }))
            );
          }

          if (selectedPermissions.length > 0) {
            await supabase.from("expert_permissions").insert(
              selectedPermissions.map((permissionId) => ({ expert_id: newExpertId, permission_id: permissionId }))
            );
          }

          if (selectedSpecializations.length > 0) {
            await supabase.from("expert_specializations").insert(
              selectedSpecializations.map((specializationId) => ({ expert_id: newExpertId, specialization_id: specializationId }))
            );
          }

          if (selectedLanguageSkills.length > 0) {
            await supabase.from("expert_language_skills").insert(
              selectedLanguageSkills.map((languageSkillId) => ({ expert_id: newExpertId, language_skill_id: languageSkillId }))
            );
          }

          if (customInvoiceItems.length > 0) {
            await supabase.from("custom_invoice_items").insert(
              customInvoiceItems.map((item) => ({
                expert_id: newExpertId,
                name: item.name,
                country_id: item.country_id,
                amount: parseInt(item.amount) || 0,
              }))
            );
          }
        } else {
          // Céges mód: csapattagok mentése
          await saveTeamMembers(newExpertId);
        }

        toast.success("Szakértő sikeresen létrehozva");
      }

      navigate("/dashboard/settings/experts");
    } catch (error) {
      console.error("Error saving expert:", error);
      toast.error("Hiba a mentés során");
    }
  };

  const saveTeamMembers = async (expId: string) => {
    // Töröljük a régi csapattagokat
    await supabase.from("expert_team_members").delete().eq("expert_id", expId);

    // Új csapattagok mentése
    for (const member of teamMembers) {
      const { data: newMember } = await supabase
        .from("expert_team_members")
        .insert({
          expert_id: expId,
          name: member.name,
          email: member.email,
          phone_prefix: member.phone_prefix || null,
          phone_number: member.phone_number || null,
          is_team_leader: member.is_team_leader,
          is_active: member.is_active,
          is_cgp_employee: member.is_cgp_employee,
          is_eap_online_expert: member.is_eap_online_expert,
          language: member.dashboardLanguage,
          accepts_personal_consultation: member.acceptsPersonalConsultation,
          accepts_video_consultation: member.acceptsVideoConsultation,
          accepts_phone_consultation: member.acceptsPhoneConsultation,
          accepts_chat_consultation: member.acceptsChatConsultation,
          video_consultation_type: member.videoConsultationType,
          accepts_onsite_consultation: member.acceptsOnsiteConsultation,
        })
        .select()
        .single();

      if (newMember) {
        // Kapcsolódó adatok mentése
        if (member.selectedCountries.length > 0) {
          await supabase.from("team_member_countries").insert(
            member.selectedCountries.map((countryId) => ({ team_member_id: newMember.id, country_id: countryId }))
          );
        }
        if (member.selectedCities.length > 0) {
          await supabase.from("team_member_cities").insert(
            member.selectedCities.map((cityId) => ({ team_member_id: newMember.id, city_id: cityId }))
          );
        }
        if (member.selectedPermissions.length > 0) {
          await supabase.from("team_member_permissions").insert(
            member.selectedPermissions.map((permissionId) => ({ team_member_id: newMember.id, permission_id: permissionId }))
          );
        }
        if (member.selectedSpecializations.length > 0) {
          await supabase.from("team_member_specializations").insert(
            member.selectedSpecializations.map((specializationId) => ({ team_member_id: newMember.id, specialization_id: specializationId }))
          );
        }
        if (member.selectedLanguageSkills.length > 0) {
          await supabase.from("team_member_language_skills").insert(
            member.selectedLanguageSkills.map((languageSkillId) => ({ team_member_id: newMember.id, language_skill_id: languageSkillId }))
          );
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  const getTitle = () => {
    if (isEditMode) {
      return expertType === "company" ? (companyName || "Cég szerkesztése") : (name || "Szakértő szerkesztése");
    }
    return "Új szakértő hozzáadása";
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/settings/experts")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-calibri-bold">{getTitle()}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* Profil típus választó */}
        <ExpertTypeSwitcher value={expertType} onChange={setExpertType} />

        {expertType === "individual" ? (
          <>
            {/* ========== EGYÉNI SZAKÉRTŐ ========== */}
            {/* Alapadatok */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Név *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Teljes név"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 p-4 border-2 border-cgp-teal/50 rounded-lg">
                <Checkbox
                  id="isCgpEmployee"
                  checked={isCgpEmployee}
                  onCheckedChange={(checked) => setIsCgpEmployee(checked as boolean)}
                />
                <Label htmlFor="isCgpEmployee" className="text-cgp-teal cursor-pointer">
                  CGP munkatárs
                </Label>
              </div>
            </div>

            {/* Kapcsolattartási adatok */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Kapcsolattartási adatok</h2>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Telefon előhívó</Label>
                  <Select value={phonePrefix} onValueChange={setPhonePrefix}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PHONE_PREFIXES.map((prefix) => (
                        <SelectItem key={prefix.code} value={prefix.code}>
                          {prefix.code} {prefix.dial_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="phoneNumber">Telefonszám</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="XX XXX XXXX"
                  />
                </div>
              </div>
            </div>

            {/* Postai cím - csak ha nem CGP munkatárs */}
            {!isCgpEmployee && (
              <div className="bg-white rounded-xl border p-6 space-y-4">
                <h2 className="text-lg font-semibold mb-4">Postai cím</h2>

                <div className="space-y-2">
                  <Label htmlFor="postCode">Irányítószám</Label>
                  <Input
                    id="postCode"
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                    placeholder="1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ország</Label>
                  <Select value={addressCountryId} onValueChange={setAddressCountryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz országot..." />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Utca</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Utca neve"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Utca típus</Label>
                    <Select value={streetSuffix} onValueChange={setStreetSuffix}>
                      <SelectTrigger>
                        <SelectValue placeholder="Válassz..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STREET_SUFFIXES.map((suffix) => (
                          <SelectItem key={suffix.id} value={suffix.id}>
                            {suffix.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="houseNumber">Házszám</Label>
                  <Input
                    id="houseNumber"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="12/A"
                  />
                </div>
              </div>
            )}

            {/* Számlázási adatok */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Számlázási adatok</h2>

              <div className="space-y-2">
                <Label>Számlázás típusa</Label>
                <Select value={invoicingType} onValueChange={setInvoicingType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz típust..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICING_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pénznem</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz pénznemet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.id} value={curr.id}>
                        {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {invoicingType === "normal" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate50">Óradíj (50 perc)</Label>
                      <Input
                        id="hourlyRate50"
                        type="number"
                        value={hourlyRate50}
                        onChange={(e) => setHourlyRate50(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate30">Óradíj (30 perc)</Label>
                      <Input
                        id="hourlyRate30"
                        type="number"
                        value={hourlyRate30}
                        onChange={(e) => setHourlyRate30(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate15">Óradíj (15 perc)</Label>
                    <Input
                      id="hourlyRate15"
                      type="number"
                      value={hourlyRate15}
                      onChange={(e) => setHourlyRate15(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </>
              )}

              {invoicingType === "fixed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fixedWage">Fix bér</Label>
                    <Input
                      id="fixedWage"
                      type="number"
                      value={fixedWage}
                      onChange={(e) => setFixedWage(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rankingHourlyRate">Rangsorolási óradíj</Label>
                    <Input
                      id="rankingHourlyRate"
                      type="number"
                      value={rankingHourlyRate}
                      onChange={(e) => setRankingHourlyRate(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="singleSessionRate">Egyszeri ülés díja</Label>
                <Input
                  id="singleSessionRate"
                  type="number"
                  value={singleSessionRate}
                  onChange={(e) => setSingleSessionRate(e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Extra díjazások */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-md font-medium">Extra díjazások</h3>
                
                {customInvoiceItems.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-2">
                    <Input value={item.name} disabled className="flex-1" />
                    <Input value={countries.find((c) => c.id === item.country_id)?.name || ""} disabled className="w-32" />
                    <Input value={item.amount} disabled className="w-24" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomInvoiceItems(customInvoiceItems.filter((_, i) => i !== index))}
                      className="text-destructive hover:text-destructive/80"
                    >
                      ×
                    </Button>
                  </div>
                ))}

                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Megnevezés</Label>
                    <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Tétel megnevezése" />
                  </div>
                  <div className="w-36 space-y-1">
                    <Label className="text-xs">Ország</Label>
                    <Select value={newItemCountryId} onValueChange={setNewItemCountryId}>
                      <SelectTrigger><SelectValue placeholder="Ország" /></SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Összeg</Label>
                    <Input type="number" value={newItemAmount} onChange={(e) => setNewItemAmount(e.target.value)} placeholder="0" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newItemName && newItemCountryId && newItemAmount) {
                        setCustomInvoiceItems([...customInvoiceItems, { name: newItemName, country_id: newItemCountryId, amount: newItemAmount }]);
                        setNewItemName("");
                        setNewItemCountryId("");
                        setNewItemAmount("");
                      }
                    }}
                    className="text-primary border-primary hover:bg-primary/10"
                  >
                    + Hozzáad
                  </Button>
                </div>
              </div>
            </div>

            {/* Tanácsadási típusok */}
            <ConsultationTypeSettings
              settings={consultationSettings}
              onChange={setConsultationSettings}
            />

            {/* Szakmai adatok */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Szakmai adatok</h2>

              {isEditMode && expertId && (
                <ExpertFileUpload
                  label="Szerződés szkennelt verziója"
                  expertId={expertId}
                  fileType="contract"
                  files={contractFiles}
                  onFilesChange={setContractFiles}
                />
              )}

              {isEditMode && expertId && (
                <ExpertFileUpload
                  label="Szakképesítést igazoló dokumentumok szkennelt verziója"
                  expertId={expertId}
                  fileType="certificate"
                  files={certificateFiles}
                  onFilesChange={setCertificateFiles}
                />
              )}

              <MultiSelectField
                label="Ország"
                options={countries.map((c) => ({ id: c.id, label: c.name }))}
                selectedIds={selectedCountries}
                onChange={setSelectedCountries}
                placeholder="Válassz országot..."
                badgeColor="teal"
              />

              <MultiSelectField
                label="Város"
                options={cities.map((c) => ({ id: c.id, label: c.name }))}
                selectedIds={selectedCities}
                onChange={setSelectedCities}
                placeholder="Válassz várost..."
                badgeColor="teal"
              />

              <MultiSelectField
                label="WS/CI/O Ország"
                options={countries.map((c) => ({ id: c.id, label: c.name }))}
                selectedIds={selectedOutsourceCountries}
                onChange={setSelectedOutsourceCountries}
                placeholder="Válassz célországot..."
                badgeColor="orange"
              />

              <HierarchicalSpecializationSelect
                selectedIds={selectedSpecializations}
                onChange={setSelectedSpecializations}
              />

              <div className="flex items-center space-x-3 p-4 border-2 border-cgp-teal/50 rounded-lg">
                <Checkbox
                  id="isCrisisPsychologist"
                  checked={isCrisisPsychologist}
                  onCheckedChange={(checked) => setIsCrisisPsychologist(checked as boolean)}
                />
                <Label htmlFor="isCrisisPsychologist" className="text-cgp-teal cursor-pointer">
                  Krízis pszichológus
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Anyanyelv</Label>
                <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz nyelvet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {languageSkills.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <MultiSelectField
                label="Nyelvtudás"
                options={languageSkills.map((l) => ({ id: l.id, label: l.name }))}
                selectedIds={selectedLanguageSkills}
                onChange={setSelectedLanguageSkills}
                placeholder="Válassz nyelveket..."
                badgeColor="teal"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxInprogressCases">Max. folyamatban lévő esetek</Label>
                  <Input
                    id="maxInprogressCases"
                    type="number"
                    value={maxInprogressCases}
                    onChange={(e) => setMaxInprogressCases(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minInprogressCases">Min. folyamatban lévő esetek</Label>
                  <Input
                    id="minInprogressCases"
                    type="number"
                    value={minInprogressCases}
                    onChange={(e) => setMinInprogressCases(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Dashboard adatok */}
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Expert Dashboard adatok</h2>

              <div className="space-y-2">
                <Label htmlFor="username">Felhasználónév</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="felhasznalonev"
                />
              </div>

              <div className="space-y-2">
                <Label>Dashboard nyelv</Label>
                <Select value={dashboardLanguage} onValueChange={setDashboardLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz nyelvet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DASHBOARD_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ========== CÉGES PROFIL ========== */}
            {/* Cégadatok */}
            <CompanyDataPanel
              companyName={companyName}
              setCompanyName={setCompanyName}
              taxNumber={taxNumber}
              setTaxNumber={setTaxNumber}
              companyRegistrationNumber={companyRegistrationNumber}
              setCompanyRegistrationNumber={setCompanyRegistrationNumber}
              companyAddress={companyAddress}
              setCompanyAddress={setCompanyAddress}
              companyCity={companyCity}
              setCompanyCity={setCompanyCity}
              companyPostalCode={companyPostalCode}
              setCompanyPostalCode={setCompanyPostalCode}
              companyCountryId={companyCountryId}
              setCompanyCountryId={setCompanyCountryId}
              countries={countries}
            />

            {/* Számlázási adatok */}
            <CompanyBillingPanel
              billingName={billingName}
              setBillingName={setBillingName}
              billingAddress={billingAddress}
              setBillingAddress={setBillingAddress}
              billingCity={billingCity}
              setBillingCity={setBillingCity}
              billingPostalCode={billingPostalCode}
              setBillingPostalCode={setBillingPostalCode}
              billingCountryId={billingCountryId}
              setBillingCountryId={setBillingCountryId}
              billingEmail={billingEmail}
              setBillingEmail={setBillingEmail}
              billingTaxNumber={billingTaxNumber}
              setBillingTaxNumber={setBillingTaxNumber}
              invoicingType={invoicingType}
              setInvoicingType={setInvoicingType}
              currency={currency}
              setCurrency={setCurrency}
              hourlyRate50={hourlyRate50}
              setHourlyRate50={setHourlyRate50}
              hourlyRate30={hourlyRate30}
              setHourlyRate30={setHourlyRate30}
              hourlyRate15={hourlyRate15}
              setHourlyRate15={setHourlyRate15}
              fixedWage={fixedWage}
              setFixedWage={setFixedWage}
              rankingHourlyRate={rankingHourlyRate}
              setRankingHourlyRate={setRankingHourlyRate}
              singleSessionRate={singleSessionRate}
              setSingleSessionRate={setSingleSessionRate}
              countries={countries}
              customInvoiceItems={customInvoiceItems}
              setCustomInvoiceItems={setCustomInvoiceItems}
              newItemName={newItemName}
              setNewItemName={setNewItemName}
              newItemCountryId={newItemCountryId}
              setNewItemCountryId={setNewItemCountryId}
              newItemAmount={newItemAmount}
              setNewItemAmount={setNewItemAmount}
            />

            {/* Csapattagok */}
            <TeamMembersPanel
              teamMembers={teamMembers}
              setTeamMembers={setTeamMembers}
              countries={countries}
              cities={cities}
              languageSkills={languageSkills}
            />
          </>
        )}

        {/* Műveletek */}
        <div className="flex items-center gap-4">
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Mentés
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard/settings/experts")}>
            Mégse
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpertForm;
