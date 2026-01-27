import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, X, Upload } from "lucide-react";
import { useExperts } from "@/hooks/useExperts";
import { Expert } from "@/types/expert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { value: "czk", label: "CZK" },
  { value: "eur", label: "EUR" },
  { value: "huf", label: "HUF" },
  { value: "mdl", label: "MDL" },
  { value: "pln", label: "PLN" },
  { value: "ron", label: "RON" },
  { value: "rsd", label: "RSD" },
  { value: "usd", label: "USD" },
  { value: "chf", label: "CHF" },
];

const PHONE_PREFIXES = [
  { code: "HU", dial_code: "+36" },
  { code: "CZ", dial_code: "+420" },
  { code: "PL", dial_code: "+48" },
  { code: "RO", dial_code: "+40" },
  { code: "SK", dial_code: "+421" },
  { code: "AT", dial_code: "+43" },
  { code: "DE", dial_code: "+49" },
];

const STREET_SUFFIXES = [
  { id: "1", name: "utca" },
  { id: "2", name: "tér" },
  { id: "3", name: "út" },
  { id: "4", name: "körút" },
  { id: "5", name: "köz" },
];

// Laravel-style input group component
const InputGroup = ({ 
  label, 
  children, 
  className = "" 
}: { 
  label: string; 
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex mb-5 w-full p-0", className)}>
    <div className="flex-shrink-0">
      <div className="bg-transparent border-l-2 border-t-2 border-b-2 border-r-0 border-cgp-teal-light text-cgp-teal-light px-3 py-2.5 text-sm whitespace-nowrap h-full flex items-center">
        {label}:
      </div>
    </div>
    {children}
  </div>
);

// Laravel-style text input
const FormInput = ({
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    className={cn(
      "flex-1 border-2 border-l-0 border-cgp-teal-light px-4 py-2.5 text-foreground outline-none",
      disabled && "bg-muted",
      className
    )}
  />
);

// Laravel-style select
const FormSelect = ({
  value,
  onChange,
  options,
  placeholder = "Válassz...",
  required = false,
  disabled = false,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    required={required}
    disabled={disabled}
    className={cn(
      "flex-1 border-2 border-l-0 border-cgp-teal-light px-4 py-2.5 text-foreground outline-none appearance-none bg-background",
      disabled && "bg-muted",
      className
    )}
  >
    <option value="" disabled>{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

// Laravel-style checkbox with custom styling
const FormCheckbox = ({
  label,
  checked,
  onChange,
  className = "",
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) => (
  <label 
    className={cn(
      "flex items-center justify-between w-full cursor-pointer",
      "text-cgp-teal-light p-3.5 border-2 border-cgp-teal-light text-base mt-2",
      className
    )}
  >
    <span>{label}</span>
    <span 
      className={cn(
        "w-12 h-full flex items-center justify-center border-l-2 border-cgp-teal-light -my-3.5 -mr-3.5 py-3.5",
        checked ? "bg-cgp-teal-light" : "bg-muted"
      )}
    >
      {checked ? (
        <Check className="w-6 h-6 text-white" />
      ) : (
        <X className="w-5 h-5 text-muted-foreground" />
      )}
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="hidden"
    />
  </label>
);

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
    getExpertPermissions,
    updateExpertPermissions,
  } = useExperts();

  // Form state
  const [formData, setFormData] = useState<Partial<Expert>>({
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

  // Expert data (address)
  const [expertData, setExpertData] = useState({
    post_code: "",
    country_id: "",
    city_id: "",
    street: "",
    street_suffix: "",
    house_number: "",
    min_inprogress_cases: "3",
    max_inprogress_cases: "10",
    native_language: "",
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

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCrisisCountries, setSelectedCrisisCountries] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguageSkills, setSelectedLanguageSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && expertId) {
      loadExpertData();
    }
  }, [expertId, isEdit]);

  const loadExpertData = async () => {
    if (!expertId) return;
    
    const expert = await getExpertById(expertId);
    if (expert) {
      setFormData(expert);
      
      const countries = await getExpertCountries(expertId);
      setSelectedCountries(countries);
      
      const permissions = await getExpertPermissions(expertId);
      setSelectedPermissions(permissions);
    }
  };

  const handleInputChange = (field: keyof Expert, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpertDataChange = (field: string, value: string) => {
    setExpertData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInvoiceDataChange = (field: string, value: string) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryToggle = (countryId: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryId)
        ? prev.filter((id) => id !== countryId)
        : [...prev, countryId]
    );
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSpecializationToggle = (specId: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(specId)
        ? prev.filter((id) => id !== specId)
        : [...prev, specId]
    );
  };

  const handleLanguageSkillToggle = (skillId: string) => {
    setSelectedLanguageSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Név és email megadása kötelező");
      return;
    }

    setSaving(true);

    try {
      if (isEdit && expertId) {
        await updateExpert(expertId, formData);
        await updateExpertCountries(expertId, selectedCountries);
        await updateExpertPermissions(expertId, selectedPermissions);
      } else {
        const newExpertId = await createExpert(formData);
        if (newExpertId) {
          await updateExpertCountries(newExpertId, selectedCountries);
          await updateExpertPermissions(newExpertId, selectedPermissions);
        }
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
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-2">
        Beállítások / Szakértők / {isEdit ? "Szerkesztés" : "Új szakértő"}
      </div>

      {/* Page Title - Laravel style */}
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? formData.name || "Szakértő szerkesztése" : "Új szakértő létrehozása"}
      </h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: "750px" }}>
        {/* Basic Information Section */}
        <div className="mb-16">
          <InputGroup label="Név">
            <FormInput
              value={formData.name || ""}
              onChange={(value) => handleInputChange("name", value)}
              required
            />
          </InputGroup>

          {/* CGP Employee checkbox - Laravel style */}
          <FormCheckbox
            label="CGP alkalmazott"
            checked={formData.is_cgp_employee || false}
            onChange={(checked) => handleInputChange("is_cgp_employee", checked)}
          />

          {/* EAP Online Expert checkbox */}
          <FormCheckbox
            label="EAP Online szakértő"
            checked={formData.is_eap_online_expert || false}
            onChange={(checked) => handleInputChange("is_eap_online_expert", checked)}
          />
        </div>

        {/* Contact Information Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Kapcsolattartási adatok:</h2>
          
          <InputGroup label="Email">
            <FormInput
              type="email"
              value={formData.email || ""}
              onChange={(value) => handleInputChange("email", value)}
              required
            />
          </InputGroup>

          {/* Phone row */}
          <div className="flex gap-0 mb-5">
            <div className="w-1/3">
              <input 
                type="text" 
                value="Telefon" 
                disabled 
                className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
              />
            </div>
            <div className="w-1/3">
              <div className="flex h-full">
                <div className="flex-shrink-0">
                  <div className="bg-transparent border-l-2 border-t-2 border-b-2 border-r-0 border-cgp-teal-light text-cgp-teal-light px-3 py-2.5 text-sm whitespace-nowrap h-full flex items-center">
                    Előhívó:
                  </div>
                </div>
                <select
                  value={formData.phone_prefix || ""}
                  onChange={(e) => handleInputChange("phone_prefix", e.target.value)}
                  className="flex-1 border-2 border-l-0 border-cgp-teal-light px-2 py-2.5 text-foreground outline-none appearance-none bg-background"
                >
                  <option value="" disabled>Válassz...</option>
                  {PHONE_PREFIXES.map((prefix) => (
                    <option key={prefix.code} value={prefix.dial_code}>
                      {prefix.code} {prefix.dial_code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-1/3">
              <input
                type="number"
                value={formData.phone_number || ""}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-foreground outline-none"
              />
            </div>
          </div>
        </div>

        {/* Post Address Section - hidden if CGP employee */}
        <div className={cn("mb-12", formData.is_cgp_employee && "hidden")}>
          <h2 className="text-xl font-bold mb-4">Postázási cím:</h2>

          <InputGroup label="Irányítószám">
            <FormInput
              value={expertData.post_code}
              onChange={(value) => handleExpertDataChange("post_code", value)}
            />
          </InputGroup>

          <InputGroup label="Ország">
            <FormSelect
              value={expertData.country_id}
              onChange={(value) => handleExpertDataChange("country_id", value)}
              options={countries.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Válassz..."
            />
          </InputGroup>

          <InputGroup label="Város">
            <FormInput
              value={expertData.city_id}
              onChange={(value) => handleExpertDataChange("city_id", value)}
              placeholder="Város neve"
            />
          </InputGroup>

          {/* Street row */}
          <div className="flex gap-0 mb-5">
            <div className="w-1/2 pr-0">
              <InputGroup label="Utca" className="mb-0">
                <FormInput
                  value={expertData.street}
                  onChange={(value) => handleExpertDataChange("street", value)}
                />
              </InputGroup>
            </div>
            <div className="w-1/2">
              <InputGroup label="Közterület típusa" className="mb-0">
                <FormSelect
                  value={expertData.street_suffix}
                  onChange={(value) => handleExpertDataChange("street_suffix", value)}
                  options={STREET_SUFFIXES.map((s) => ({ value: s.id, label: s.name }))}
                  placeholder="Válassz..."
                />
              </InputGroup>
            </div>
          </div>

          <InputGroup label="Házszám">
            <FormInput
              value={expertData.house_number}
              onChange={(value) => handleExpertDataChange("house_number", value)}
            />
          </InputGroup>
        </div>

        {/* Invoice Information Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Számlázási adatok:</h2>

          <InputGroup label="Számlázás típusa">
            <FormSelect
              value={invoiceData.invoicing_type}
              onChange={(value) => handleInvoiceDataChange("invoicing_type", value)}
              options={[
                { value: "normal", label: "Normál (óradíjas)" },
                { value: "fixed", label: "Fix bér" },
                { value: "custom", label: "Egyedi tételek" },
              ]}
            />
          </InputGroup>

          {/* Currency row */}
          <div className="flex gap-0 mb-5">
            <div className="flex-1">
              <input 
                type="text" 
                value="Pénznem" 
                disabled 
                className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
              />
            </div>
            <div className="w-24">
              <select
                value={invoiceData.currency}
                onChange={(e) => handleInvoiceDataChange("currency", e.target.value)}
                className="w-full border-2 border-cgp-teal-light px-2 py-2.5 text-foreground outline-none appearance-none bg-background"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.value} value={curr.value}>{curr.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Normal invoicing - hourly rates */}
          {invoiceData.invoicing_type === "normal" && (
            <>
              {/* 50 min rate */}
              <div className="flex gap-0 mb-5">
                <div className="w-7/12">
                  <input 
                    type="text" 
                    value="Óradíj (50 perc)" 
                    disabled 
                    className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
                  />
                </div>
                <div className="w-3/12">
                  <input 
                    type="text" 
                    value="50 perc" 
                    disabled 
                    className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
                  />
                </div>
                <div className="w-2/12">
                  <input
                    type="number"
                    value={invoiceData.hourly_rate_50}
                    onChange={(e) => handleInvoiceDataChange("hourly_rate_50", e.target.value)}
                    className="w-full border-2 border-cgp-teal-light px-2 py-2.5 text-foreground outline-none"
                  />
                </div>
              </div>

              {/* 30 min rate */}
              <div className="flex gap-0 mb-5">
                <div className="w-7/12">
                  <input 
                    type="text" 
                    value="Óradíj (30 perc)" 
                    disabled 
                    className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
                  />
                </div>
                <div className="w-3/12">
                  <input 
                    type="text" 
                    value="30 perc" 
                    disabled 
                    className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
                  />
                </div>
                <div className="w-2/12">
                  <input
                    type="number"
                    value={invoiceData.hourly_rate_30}
                    onChange={(e) => handleInvoiceDataChange("hourly_rate_30", e.target.value)}
                    className="w-full border-2 border-cgp-teal-light px-2 py-2.5 text-foreground outline-none"
                  />
                </div>
              </div>

              {/* 15 min rate */}
              <div className="flex gap-0 mb-5">
                <div className="w-7/12">
                  <input 
                    type="text" 
                    value="Óradíj (15 perc)" 
                    disabled 
                    className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
                  />
                </div>
                <div className="w-3/12">
                  <input 
                    type="text" 
                    value="15 perc" 
                    disabled 
                    className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
                  />
                </div>
                <div className="w-2/12">
                  <input
                    type="number"
                    value={invoiceData.hourly_rate_15}
                    onChange={(e) => handleInvoiceDataChange("hourly_rate_15", e.target.value)}
                    className="w-full border-2 border-cgp-teal-light px-2 py-2.5 text-foreground outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Fixed invoicing */}
          {invoiceData.invoicing_type === "fixed" && (
            <>
              <div className="flex gap-0 mb-5">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value="Fix bér" 
                    disabled 
                    className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={invoiceData.fixed_wage}
                    onChange={(e) => handleInvoiceDataChange("fixed_wage", e.target.value)}
                    className="w-full border-2 border-cgp-teal-light px-2 py-2.5 text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-0 mb-5">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value="Rangsoroló óradíj" 
                    disabled 
                    className="w-full border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={invoiceData.ranking_hourly_rate}
                    onChange={(e) => handleInvoiceDataChange("ranking_hourly_rate", e.target.value)}
                    className="w-full border-2 border-cgp-teal-light px-2 py-2.5 text-foreground outline-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Professional Information Section */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-4">Szakmai adatok:</h2>

          {/* Contract upload - hidden if CGP employee */}
          <div className={cn("mb-5", formData.is_cgp_employee && "hidden")}>
            <div className="flex gap-4">
              <input 
                type="text" 
                value="Beszkennelt szerződés" 
                disabled 
                className="flex-1 border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
              />
              <button 
                type="button"
                className="flex items-center gap-1 bg-cgp-teal-light text-white px-4 py-2.5 font-bold"
              >
                <Upload className="w-5 h-5" />
                Feltöltés
              </button>
            </div>
          </div>

          {/* Certificate upload - hidden if CGP employee */}
          <div className={cn("mb-5", formData.is_cgp_employee && "hidden")}>
            <div className="flex gap-4">
              <input 
                type="text" 
                value="Beszkennelt oklevél" 
                disabled 
                className="flex-1 border-2 border-cgp-teal-light px-4 py-2.5 text-cgp-teal-light bg-transparent"
              />
              <button 
                type="button"
                className="flex items-center gap-1 bg-cgp-teal-light text-white px-4 py-2.5 font-bold"
              >
                <Upload className="w-5 h-5" />
                Feltöltés
              </button>
            </div>
          </div>

          {/* Countries multi-select (simulated with checkboxes) */}
          <InputGroup label="Ország">
            <div className="flex-1 border-2 border-l-0 border-cgp-teal-light p-2 min-h-[48px] flex flex-wrap gap-2">
              {countries.map((country) => (
                <label 
                  key={country.id}
                  className={cn(
                    "px-2 py-1 cursor-pointer text-sm",
                    selectedCountries.includes(country.id)
                      ? "bg-cgp-teal-light text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country.id)}
                    onChange={() => handleCountryToggle(country.id)}
                    className="hidden"
                  />
                  {country.name}
                </label>
              ))}
            </div>
          </InputGroup>

          {/* Permissions multi-select */}
          <InputGroup label="Szakterületek">
            <div className="flex-1 border-2 border-l-0 border-cgp-teal-light p-2 min-h-[48px] flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <label 
                  key={permission.id}
                  className={cn(
                    "px-2 py-1 cursor-pointer text-sm",
                    selectedPermissions.includes(permission.id)
                      ? "bg-cgp-teal-light text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="hidden"
                  />
                  {permission.name}
                </label>
              ))}
            </div>
          </InputGroup>

          {/* Specializations */}
          <InputGroup label="Specializációk">
            <div className="flex-1 border-2 border-l-0 border-cgp-teal-light p-2 min-h-[48px] flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <label 
                  key={spec.id}
                  className={cn(
                    "px-2 py-1 cursor-pointer text-sm",
                    selectedSpecializations.includes(spec.id)
                      ? "bg-cgp-teal-light text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedSpecializations.includes(spec.id)}
                    onChange={() => handleSpecializationToggle(spec.id)}
                    className="hidden"
                  />
                  {spec.name}
                </label>
              ))}
            </div>
          </InputGroup>

          {/* Language Skills */}
          <InputGroup label="Nyelvtudás">
            <div className="flex-1 border-2 border-l-0 border-cgp-teal-light p-2 min-h-[48px] flex flex-wrap gap-2">
              {languageSkills.map((skill) => (
                <label 
                  key={skill.id}
                  className={cn(
                    "px-2 py-1 cursor-pointer text-sm",
                    selectedLanguageSkills.includes(skill.id)
                      ? "bg-cgp-teal-light text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguageSkills.includes(skill.id)}
                    onChange={() => handleLanguageSkillToggle(skill.id)}
                    className="hidden"
                  />
                  {skill.name}
                </label>
              ))}
            </div>
          </InputGroup>

          {/* Case limits */}
          <div className="flex gap-0 mb-5">
            <InputGroup label="Min. esetek száma" className="w-1/2 mb-0">
              <FormInput
                type="number"
                value={expertData.min_inprogress_cases}
                onChange={(value) => handleExpertDataChange("min_inprogress_cases", value)}
              />
            </InputGroup>
            <InputGroup label="Max. esetek száma" className="w-1/2 mb-0">
              <FormInput
                type="number"
                value={expertData.max_inprogress_cases}
                onChange={(value) => handleExpertDataChange("max_inprogress_cases", value)}
              />
            </InputGroup>
          </div>

          {/* Crisis psychologist checkbox */}
          <FormCheckbox
            label="Krízis pszichológus"
            checked={formData.crisis_psychologist || false}
            onChange={(checked) => handleInputChange("crisis_psychologist", checked)}
          />
        </div>

        {/* Submit Button - Laravel style */}
        <button
          type="submit"
          disabled={saving}
          className="bg-cgp-teal-light text-white font-bold w-full py-3 px-4 text-left flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? "Mentés..." : "Mentés"}
        </button>
      </form>
    </div>
  );
};

export default ExpertForm;
