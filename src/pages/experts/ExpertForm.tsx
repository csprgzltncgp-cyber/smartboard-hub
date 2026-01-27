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

  // Szakértő alapadatai
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isCgpEmployee, setIsCgpEmployee] = useState(false);
  const [isEapOnlineExpert, setIsEapOnlineExpert] = useState(false);

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

  // Számlázási adatok
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
      const [countriesRes, permissionsRes, specializationsRes, languageSkillsRes] = await Promise.all([
        supabase.from("countries").select("*").order("code"),
        supabase.from("permissions").select("*").order("name"),
        supabase.from("specializations").select("*").order("name"),
        supabase.from("language_skills").select("*").order("name"),
      ]);

      if (countriesRes.data) setCountries(countriesRes.data);
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
        setName(expert.name);
        setEmail(expert.email);
        setUsername(expert.username || "");
        setPhonePrefix(expert.phone_prefix || "");
        setPhoneNumber(expert.phone_number || "");
        setDashboardLanguage(expert.language || "hu");
        setIsCrisisPsychologist(expert.crisis_psychologist || false);
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
      const [countriesRes, crisisCountriesRes, permissionsRes, specializationsRes, languageSkillsRes, customItemsRes] = await Promise.all([
        supabase.from("expert_countries").select("country_id").eq("expert_id", expertId),
        supabase.from("expert_crisis_countries").select("country_id").eq("expert_id", expertId),
        supabase.from("expert_permissions").select("permission_id").eq("expert_id", expertId),
        supabase.from("expert_specializations").select("specialization_id").eq("expert_id", expertId),
        supabase.from("expert_language_skills").select("language_skill_id").eq("expert_id", expertId),
        supabase.from("custom_invoice_items").select("*").eq("expert_id", expertId),
      ]);

      if (countriesRes.data) setSelectedCountries(countriesRes.data.map((c) => c.country_id));
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
    } catch (error) {
      console.error("Error fetching expert data:", error);
      toast.error("Hiba a szakértő adatainak betöltésekor");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("A név és email megadása kötelező");
      return;
    }

    try {
      if (isEditMode && expertId) {
        // Szakértő alapadatok frissítése
        await supabase
          .from("experts")
          .update({
            name,
            email,
            username: username || null,
            phone_prefix: phonePrefix || null,
            phone_number: phoneNumber || null,
            language: dashboardLanguage,
            crisis_psychologist: isCrisisPsychologist,
          })
          .eq("id", expertId);

        // Expert data frissítése
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

        // Invoice data frissítése
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

        // Kapcsolódó adatok frissítése (törlés + újra beszúrás)
        await supabase.from("expert_countries").delete().eq("expert_id", expertId);
        if (selectedCountries.length > 0) {
          await supabase.from("expert_countries").insert(
            selectedCountries.map((countryId) => ({ expert_id: expertId, country_id: countryId }))
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

        // Custom invoice items mentése
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

        toast.success("Szakértő sikeresen frissítve");
      } else {
        // Új szakértő létrehozása
        const { data: newExpert, error } = await supabase
          .from("experts")
          .insert({
            name,
            email,
            username: username || null,
            phone_prefix: phonePrefix || null,
            phone_number: phoneNumber || null,
            language: dashboardLanguage,
            crisis_psychologist: isCrisisPsychologist,
            country_id: selectedCountries[0] || null,
          })
          .select()
          .single();

        if (error) throw error;

        const newExpertId = newExpert.id;

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

        // Custom invoice items mentése új szakértőhöz
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

        toast.success("Szakértő sikeresen létrehozva");
      }

      navigate("/dashboard/settings/experts");
    } catch (error) {
      console.error("Error saving expert:", error);
      toast.error("Hiba a mentés során");
    }
  };

  const toggleMultiSelect = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/settings/experts")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-calibri-bold">
          {isEditMode ? name || "Szakértő szerkesztése" : "Új szakértő hozzáadása"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
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

          <div className="flex items-center space-x-3 p-4 border-2 border-cgp-teal/50 rounded-lg">
            <Checkbox
              id="isEapOnlineExpert"
              checked={isEapOnlineExpert}
              onCheckedChange={(checked) => setIsEapOnlineExpert(checked as boolean)}
            />
            <Label htmlFor="isEapOnlineExpert" className="text-cgp-teal cursor-pointer">
              EAP Online Szakértő
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
            
            {/* Meglévő tételek */}
            {customInvoiceItems.map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-2">
                <Input
                  value={item.name}
                  disabled
                  className="flex-1"
                />
                <Input
                  value={countries.find((c) => c.id === item.country_id)?.name || ""}
                  disabled
                  className="w-32"
                />
                <Input
                  value={item.amount}
                  disabled
                  className="w-24"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCustomInvoiceItems(customInvoiceItems.filter((_, i) => i !== index));
                  }}
                  className="text-destructive hover:text-destructive/80"
                >
                  ×
                </Button>
              </div>
            ))}

            {/* Új tétel hozzáadása */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Megnevezés</Label>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Tétel megnevezése"
                />
              </div>
              <div className="w-36 space-y-1">
                <Label className="text-xs">Ország</Label>
                <Select value={newItemCountryId} onValueChange={setNewItemCountryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ország" />
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
              <div className="w-24 space-y-1">
                <Label className="text-xs">Összeg</Label>
                <Input
                  type="number"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newItemName && newItemCountryId && newItemAmount) {
                    setCustomInvoiceItems([
                      ...customInvoiceItems,
                      { name: newItemName, country_id: newItemCountryId, amount: newItemAmount },
                    ]);
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

        {/* Szakmai adatok */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Szakmai adatok</h2>

          {/* Országok */}
          <div className="space-y-2">
            <Label>Országok</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
              {countries.map((country) => (
                <div
                  key={country.id}
                  onClick={() => toggleMultiSelect(country.id, selectedCountries, setSelectedCountries)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    selectedCountries.includes(country.id)
                      ? "bg-cgp-teal text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {country.code}
                </div>
              ))}
            </div>
          </div>

          {/* Krízis pszichológus */}
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

          {/* Krízis országok - csak ha krízis pszichológus */}
          {isCrisisPsychologist && (
            <div className="space-y-2">
              <Label>Krízis országok</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                {countries.map((country) => (
                  <div
                    key={country.id}
                    onClick={() => toggleMultiSelect(country.id, selectedCrisisCountries, setSelectedCrisisCountries)}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      selectedCrisisCountries.includes(country.id)
                        ? "bg-red-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {country.code}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jogosultságok */}
          <div className="space-y-2">
            <Label>Szakterületek</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  onClick={() => toggleMultiSelect(permission.id, selectedPermissions, setSelectedPermissions)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    selectedPermissions.includes(permission.id)
                      ? "bg-cgp-teal text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {permission.name}
                </div>
              ))}
            </div>
          </div>

          {/* Specializációk */}
          <div className="space-y-2">
            <Label>Specializációk</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
              {specializations.map((spec) => (
                <div
                  key={spec.id}
                  onClick={() => toggleMultiSelect(spec.id, selectedSpecializations, setSelectedSpecializations)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    selectedSpecializations.includes(spec.id)
                      ? "bg-cgp-teal text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {spec.name}
                </div>
              ))}
            </div>
          </div>

          {/* Anyanyelv */}
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

          {/* Nyelvtudás */}
          <div className="space-y-2">
            <Label>Nyelvtudás</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
              {languageSkills.map((lang) => (
                <div
                  key={lang.id}
                  onClick={() => toggleMultiSelect(lang.id, selectedLanguageSkills, setSelectedLanguageSkills)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    selectedLanguageSkills.includes(lang.id)
                      ? "bg-cgp-teal text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {lang.name}
                </div>
              ))}
            </div>
          </div>

          {/* Esetek */}
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
