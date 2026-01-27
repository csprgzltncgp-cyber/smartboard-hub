import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExperts } from "@/hooks/useExperts";
import { toast } from "sonner";
import {
  ExpertBasicInfoCard,
  ExpertContactInfoCard,
  ExpertAddressCard,
  ExpertInvoiceCard,
  ExpertProfessionalCard,
  ExpertPermissionsCard,
  ExpertDashboardCard,
  ExpertEapOnlineCard,
} from "./components";

interface CustomInvoiceItem {
  id: string;
  name: string;
  countryId: string;
  amount: string;
}

const ExpertForm = () => {
  const navigate = useNavigate();
  const { expertId } = useParams();
  const isEdit = !!expertId;

  const {
    countries,
    permissions,
    specializations,
    languageSkills,
    loading,
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
  } = useExperts();

  // Basic data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone_prefix: "+36",
    phone_number: "",
    country_id: "",
    language: "hu",
    is_cgp_employee: false,
    is_eap_online_expert: false,
    crisis_psychologist: false,
  });

  // Address data
  const [addressData, setAddressData] = useState({
    post_code: "",
    country_id: "",
    city_id: "",
    street: "",
    street_suffix: "",
    house_number: "",
  });

  // Invoice data
  const [invoiceData, setInvoiceData] = useState({
    invoicing_type: "normal" as "normal" | "fixed" | "custom",
    currency: "eur",
    hourly_rate_50: "",
    hourly_rate_30: "",
    hourly_rate_15: "",
    fixed_wage: "",
    ranking_hourly_rate: "",
    single_session_rate: "",
  });

  // Professional data
  const [professionalData, setProfessionalData] = useState({
    native_language: "",
    max_inprogress_cases: "10",
    min_inprogress_cases: "0",
  });

  // EAP Online data
  const [eapOnlineData, setEapOnlineData] = useState({
    description: "",
    image: null as File | null,
    imagePreview: "",
  });

  // Relations
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCrisisCountries, setSelectedCrisisCountries] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguageSkills, setSelectedLanguageSkills] = useState<string[]>([]);

  // Files
  const [tempContracts, setTempContracts] = useState<File[]>([]);
  const [tempCertificates, setTempCertificates] = useState<File[]>([]);
  const [existingContracts, setExistingContracts] = useState<{ id: string; filename: string }[]>([]);
  const [existingCertificates, setExistingCertificates] = useState<{ id: string; filename: string }[]>([]);

  // Custom invoice items
  const [customInvoiceItems, setCustomInvoiceItems] = useState<CustomInvoiceItem[]>([]);

  const [saving, setSaving] = useState(false);

  // Check if single session rate is required
  const singleSessionRateRequired = selectedPermissions.some((id) => {
    const perm = permissions.find((p) => p.id === id);
    return perm?.name?.toLowerCase().includes("single session");
  });

  useEffect(() => {
    if (isEdit && expertId) {
      loadExpertData();
    }
  }, [expertId, isEdit]);

  const loadExpertData = async () => {
    if (!expertId) return;

    const expert = await getExpertById(expertId);
    if (expert) {
      setFormData({
        name: expert.name || "",
        email: expert.email || "",
        username: expert.username || "",
        phone_prefix: expert.phone_prefix || "+36",
        phone_number: expert.phone_number || "",
        country_id: expert.country_id || "",
        language: expert.language || "hu",
        is_cgp_employee: expert.is_cgp_employee || false,
        is_eap_online_expert: expert.is_eap_online_expert || false,
        crisis_psychologist: expert.crisis_psychologist || false,
      });

      const data = await getExpertData(expertId);
      if (data) {
        setAddressData({
          post_code: data.post_code || "",
          country_id: "",
          city_id: data.city_id || "",
          street: data.street || "",
          street_suffix: data.street_suffix || "",
          house_number: data.house_number || "",
        });
        setProfessionalData({
          native_language: data.native_language || "",
          max_inprogress_cases: String(data.max_inprogress_cases || 10),
          min_inprogress_cases: String(data.min_inprogress_cases || 0),
        });
      }

      const invoice = await getExpertInvoiceData(expertId);
      if (invoice) {
        setInvoiceData({
          invoicing_type: (invoice.invoicing_type as "normal" | "fixed" | "custom") || "normal",
          currency: invoice.currency || "eur",
          hourly_rate_50: invoice.hourly_rate_50 ? String(invoice.hourly_rate_50) : "",
          hourly_rate_30: invoice.hourly_rate_30 ? String(invoice.hourly_rate_30) : "",
          hourly_rate_15: invoice.hourly_rate_15 ? String(invoice.hourly_rate_15) : "",
          fixed_wage: invoice.fixed_wage ? String(invoice.fixed_wage) : "",
          ranking_hourly_rate: invoice.ranking_hourly_rate ? String(invoice.ranking_hourly_rate) : "",
          single_session_rate: invoice.single_session_rate ? String(invoice.single_session_rate) : "",
        });
      }

      const expertCountries = await getExpertCountries(expertId);
      setSelectedCountries(expertCountries);

      const crisisCountries = await getExpertCrisisCountries(expertId);
      setSelectedCrisisCountries(crisisCountries);

      const expertPermissions = await getExpertPermissions(expertId);
      setSelectedPermissions(expertPermissions);

      const expertSpecs = await getExpertSpecializations(expertId);
      setSelectedSpecializations(expertSpecs);

      const expertLangs = await getExpertLanguageSkills(expertId);
      setSelectedLanguageSkills(expertLangs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Név és email megadása kötelező");
      return;
    }

    setSaving(true);

    try {
      let currentExpertId = expertId;

      if (isEdit && expertId) {
        await updateExpert(expertId, formData);
      } else {
        currentExpertId = await createExpert(formData);
      }

      if (currentExpertId) {
        await updateExpertData(currentExpertId, {
          ...addressData,
          native_language: professionalData.native_language,
          max_inprogress_cases: parseInt(professionalData.max_inprogress_cases) || 10,
          min_inprogress_cases: parseInt(professionalData.min_inprogress_cases) || 0,
        });

        await updateExpertInvoiceData(currentExpertId, {
          invoicing_type: invoiceData.invoicing_type,
          currency: invoiceData.currency,
          hourly_rate_50:
            invoiceData.invoicing_type === "normal" && invoiceData.hourly_rate_50
              ? parseFloat(invoiceData.hourly_rate_50)
              : null,
          hourly_rate_30:
            invoiceData.invoicing_type === "normal" && invoiceData.hourly_rate_30
              ? parseFloat(invoiceData.hourly_rate_30)
              : null,
          hourly_rate_15:
            invoiceData.invoicing_type === "normal" && invoiceData.hourly_rate_15
              ? parseFloat(invoiceData.hourly_rate_15)
              : null,
          fixed_wage:
            invoiceData.invoicing_type === "fixed" && invoiceData.fixed_wage
              ? parseFloat(invoiceData.fixed_wage)
              : null,
          ranking_hourly_rate:
            invoiceData.invoicing_type === "fixed" && invoiceData.ranking_hourly_rate
              ? parseFloat(invoiceData.ranking_hourly_rate)
              : null,
          single_session_rate: invoiceData.single_session_rate
            ? parseFloat(invoiceData.single_session_rate)
            : null,
        });

        await updateExpertCountries(currentExpertId, selectedCountries);
        await updateExpertCrisisCountries(currentExpertId, selectedCrisisCountries);
        await updateExpertPermissions(currentExpertId, selectedPermissions);
        await updateExpertSpecializations(currentExpertId, selectedSpecializations);
        await updateExpertLanguageSkills(currentExpertId, selectedLanguageSkills);
      }

      navigate("/dashboard/settings/experts");
    } catch (error) {
      console.error("Error saving expert:", error);
      toast.error("Hiba a mentéskor");
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/settings/experts")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-calibri-bold">
          {isEdit ? formData.name || "Szakértő szerkesztése" : "Új szakértő"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. ALAPADATOK */}
        <ExpertBasicInfoCard
          formData={{
            name: formData.name,
            is_cgp_employee: formData.is_cgp_employee,
            is_eap_online_expert: formData.is_eap_online_expert,
          }}
          onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
        />

        {/* 2. KAPCSOLATI INFORMÁCIÓK */}
        <ExpertContactInfoCard
          formData={{
            email: formData.email,
            phone_prefix: formData.phone_prefix,
            phone_number: formData.phone_number,
          }}
          onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
        />

        {/* 3. POSTÁZÁSI CÍM (only for non-CGP employees) */}
        {!formData.is_cgp_employee && (
          <ExpertAddressCard
            addressData={addressData}
            countries={countries}
            onChange={(data) => setAddressData((prev) => ({ ...prev, ...data }))}
          />
        )}

        {/* 4. SZÁMLÁZÁSI INFORMÁCIÓK */}
        <ExpertInvoiceCard
          invoiceData={invoiceData}
          countries={countries}
          singleSessionRateRequired={singleSessionRateRequired}
          customInvoiceItems={customInvoiceItems}
          onInvoiceChange={(data) => setInvoiceData((prev) => ({ ...prev, ...data }))}
          onCustomItemsChange={setCustomInvoiceItems}
        />

        {/* 5. SZAKMAI INFORMÁCIÓK */}
        <ExpertProfessionalCard
          isCgpEmployee={formData.is_cgp_employee}
          professionalData={professionalData}
          countries={countries}
          languageSkills={languageSkills}
          specializations={specializations}
          selectedCountries={selectedCountries}
          selectedCrisisCountries={selectedCrisisCountries}
          selectedLanguageSkills={selectedLanguageSkills}
          selectedSpecializations={selectedSpecializations}
          tempContracts={tempContracts}
          tempCertificates={tempCertificates}
          existingContracts={existingContracts}
          existingCertificates={existingCertificates}
          onProfessionalChange={(data) => setProfessionalData((prev) => ({ ...prev, ...data }))}
          onCountriesChange={setSelectedCountries}
          onCrisisCountriesChange={setSelectedCrisisCountries}
          onLanguageSkillsChange={setSelectedLanguageSkills}
          onSpecializationsChange={setSelectedSpecializations}
          onContractsChange={setTempContracts}
          onCertificatesChange={setTempCertificates}
        />

        {/* 6. JOGOSULTSÁGOK */}
        <ExpertPermissionsCard
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          onPermissionsChange={setSelectedPermissions}
        />

        {/* 7. EXPERT DASHBOARD INFORMÁCIÓK */}
        <ExpertDashboardCard
          formData={{
            username: formData.username,
            language: formData.language,
          }}
          onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
        />

        {/* 8. EAP ONLINE (only if EAP online expert) */}
        {formData.is_eap_online_expert && (
          <ExpertEapOnlineCard
            eapOnlineData={eapOnlineData}
            onChange={(data) => setEapOnlineData((prev) => ({ ...prev, ...data }))}
          />
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-cgp-teal hover:bg-cgp-teal/90 text-white px-8"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Mentés..." : "Mentés"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpertForm;
