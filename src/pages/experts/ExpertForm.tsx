import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, Download, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useExperts } from "@/hooks/useExperts";
import { toast } from "sonner";

const CURRENCIES = [
  { value: "czk", label: "CZK" },
  { value: "eur", label: "EUR" },
  { value: "huf", label: "HUF" },
  { value: "mdl", label: "MDL" },
  { value: "oal", label: "OAL" },
  { value: "pln", label: "PLN" },
  { value: "ron", label: "RON" },
  { value: "rsd", label: "RSD" },
  { value: "usd", label: "USD" },
  { value: "chf", label: "CHF" },
];

const INVOICING_TYPES = [
  { value: "normal", label: "Normál (óradíjas)" },
  { value: "fixed", label: "Fix bér" },
  { value: "custom", label: "Egyedi tételek" },
];

const STREET_SUFFIXES = [
  { value: "1", label: "Utca" },
  { value: "2", label: "Tér" },
  { value: "3", label: "Út" },
];

const LANGUAGES = [
  { value: "hu", label: "Magyar" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "cz", label: "Čeština" },
  { value: "sk", label: "Slovenčina" },
  { value: "pl", label: "Polski" },
  { value: "ro", label: "Română" },
];

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
  const contractInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  // Address data (for non-CGP employees)
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
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedOutsourceCountries, setSelectedOutsourceCountries] = useState<string[]>([]);
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
  const [showCustomItemDialog, setShowCustomItemDialog] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState({ name: "", countryId: "", amount: "" });

  const [saving, setSaving] = useState(false);

  // Check if psychologist permission is selected (permission ID 1)
  const showPsychologistData = selectedPermissions.some(id => {
    const perm = permissions.find(p => p.id === id);
    return perm?.name?.toLowerCase().includes("pszichológus") || 
           perm?.name?.toLowerCase().includes("psychologist");
  });

  // Check if single session rate is required (permission ID 17 equivalent)
  const singleSessionRateRequired = selectedPermissions.some(id => {
    const perm = permissions.find(p => p.id === id);
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
      
      // Load expert_data
      const data = await getExpertData(expertId);
      if (data) {
        setAddressData({
          post_code: data.post_code || "",
          country_id: "",  // Country for address stored in main experts table
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

      // Load invoice data
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
      
      // Load related data
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

  const handleMultiSelectToggle = (
    value: string,
    selectedValues: string[],
    setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]
    );
  };

  const handleAddCustomItem = () => {
    if (!newCustomItem.name || !newCustomItem.countryId || !newCustomItem.amount) {
      toast.error("Minden mező kitöltése kötelező");
      return;
    }
    setCustomInvoiceItems((prev) => [
      ...prev,
      { ...newCustomItem, id: Date.now().toString() },
    ]);
    setNewCustomItem({ name: "", countryId: "", amount: "" });
    setShowCustomItemDialog(false);
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomInvoiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleContractUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTempContracts((prev) => [...prev, ...files]);
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTempCertificates((prev) => [...prev, ...files]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEapOnlineData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
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
        // Update expert_data
        await updateExpertData(currentExpertId, {
          ...addressData,
          native_language: professionalData.native_language,
          max_inprogress_cases: parseInt(professionalData.max_inprogress_cases) || 10,
          min_inprogress_cases: parseInt(professionalData.min_inprogress_cases) || 0,
        });

        // Update invoice data
        await updateExpertInvoiceData(currentExpertId, {
          invoicing_type: invoiceData.invoicing_type,
          currency: invoiceData.currency,
          hourly_rate_50: invoiceData.invoicing_type === "normal" && invoiceData.hourly_rate_50 
            ? parseFloat(invoiceData.hourly_rate_50) : null,
          hourly_rate_30: invoiceData.invoicing_type === "normal" && invoiceData.hourly_rate_30 
            ? parseFloat(invoiceData.hourly_rate_30) : null,
          hourly_rate_15: invoiceData.invoicing_type === "normal" && invoiceData.hourly_rate_15 
            ? parseFloat(invoiceData.hourly_rate_15) : null,
          fixed_wage: invoiceData.invoicing_type === "fixed" && invoiceData.fixed_wage 
            ? parseFloat(invoiceData.fixed_wage) : null,
          ranking_hourly_rate: invoiceData.invoicing_type === "fixed" && invoiceData.ranking_hourly_rate 
            ? parseFloat(invoiceData.ranking_hourly_rate) : null,
          single_session_rate: invoiceData.single_session_rate 
            ? parseFloat(invoiceData.single_session_rate) : null,
        });

        // Update relations
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
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Név:</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="border-cgp-teal"
              />
            </div>

            {/* CGP munkatárs checkbox */}
            <div className="flex items-center justify-between p-4 border-2 border-cgp-teal rounded-lg">
              <span className="text-cgp-teal">CGP munkatárs</span>
              <Checkbox
                id="is_cgp_employee"
                checked={formData.is_cgp_employee}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_cgp_employee: !!checked }))
                }
              />
            </div>

            {/* EAP Online szakértő checkbox */}
            <div className="flex items-center justify-between p-4 border-2 border-cgp-teal rounded-lg">
              <span className="text-cgp-teal">EAP online szakértő</span>
              <Checkbox
                id="is_eap_online_expert"
                checked={formData.is_eap_online_expert}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_eap_online_expert: !!checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. KAPCSOLATI INFORMÁCIÓK */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-cgp-teal">Kapcsolati információk:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email:</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="border-cgp-teal"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Telefonszám</Label>
                <Input disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Országhívó:</Label>
                <Select
                  value={formData.phone_prefix}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, phone_prefix: value }))}
                >
                  <SelectTrigger className="border-cgp-teal">
                    <SelectValue placeholder="Válassz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+36">HU +36</SelectItem>
                    <SelectItem value="+420">CZ +420</SelectItem>
                    <SelectItem value="+421">SK +421</SelectItem>
                    <SelectItem value="+48">PL +48</SelectItem>
                    <SelectItem value="+40">RO +40</SelectItem>
                    <SelectItem value="+43">AT +43</SelectItem>
                    <SelectItem value="+49">DE +49</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value }))}
                  className="border-cgp-teal"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. POSTÁZÁSI CÍM (only for non-CGP employees) */}
        {!formData.is_cgp_employee && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-cgp-teal">Postázási cím:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Irányítószám:</Label>
                <Input
                  value={addressData.post_code}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, post_code: e.target.value }))}
                  className="border-cgp-teal"
                />
              </div>

              <div className="space-y-2">
                <Label>Ország:</Label>
                <Select
                  value={addressData.country_id}
                  onValueChange={(value) => setAddressData((prev) => ({ ...prev, country_id: value }))}
                >
                  <SelectTrigger className="border-cgp-teal">
                    <SelectValue placeholder="Kérjük válasszon" />
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

              <div className="space-y-2">
                <Label>Város:</Label>
                <Input
                  value={addressData.city_id}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, city_id: e.target.value }))}
                  className="border-cgp-teal"
                  placeholder="Város neve"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Utca:</Label>
                  <Input
                    value={addressData.street}
                    onChange={(e) => setAddressData((prev) => ({ ...prev, street: e.target.value }))}
                    className="border-cgp-teal"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Közterület:</Label>
                  <Select
                    value={addressData.street_suffix}
                    onValueChange={(value) => setAddressData((prev) => ({ ...prev, street_suffix: value }))}
                  >
                    <SelectTrigger className="border-cgp-teal">
                      <SelectValue placeholder="Válassz" />
                    </SelectTrigger>
                    <SelectContent>
                      {STREET_SUFFIXES.map((suffix) => (
                        <SelectItem key={suffix.value} value={suffix.value}>
                          {suffix.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Házszám:</Label>
                <Input
                  value={addressData.house_number}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, house_number: e.target.value }))}
                  className="border-cgp-teal"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. SZÁMLÁZÁSI INFORMÁCIÓK */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-cgp-teal">Számlázási információk:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Számlázás típusa:</Label>
              <Select
                value={invoiceData.invoicing_type}
                onValueChange={(value: "normal" | "fixed" | "custom") =>
                  setInvoiceData((prev) => ({ ...prev, invoicing_type: value }))
                }
              >
                <SelectTrigger className="border-cgp-teal">
                  <SelectValue placeholder="Kérjük válasszon" />
                </SelectTrigger>
                <SelectContent>
                  {INVOICING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <div className="space-y-2">
                <Label>Devizanem</Label>
                <Input disabled className="bg-muted" />
              </div>
              <Select
                value={invoiceData.currency}
                onValueChange={(value) => setInvoiceData((prev) => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="border-cgp-teal w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Normal type - hourly rates */}
            {invoiceData.invoicing_type === "normal" && (
              <>
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Óradíj (nettó)</Label>
                    <Input disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Időtartam 50 perc</Label>
                    <Input disabled className="bg-muted w-32" />
                  </div>
                  <Input
                    type="number"
                    value={invoiceData.hourly_rate_50}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, hourly_rate_50: e.target.value }))}
                    className="border-cgp-teal w-24"
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>

                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Óradíj (nettó)</Label>
                    <Input disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Időtartam 30 perc</Label>
                    <Input disabled className="bg-muted w-32" />
                  </div>
                  <Input
                    type="number"
                    value={invoiceData.hourly_rate_30}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, hourly_rate_30: e.target.value }))}
                    className="border-cgp-teal w-24"
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>

                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Óradíj (nettó)</Label>
                    <Input disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Időtartam 15 perc</Label>
                    <Input disabled className="bg-muted w-32" />
                  </div>
                  <Input
                    type="number"
                    value={invoiceData.hourly_rate_15}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, hourly_rate_15: e.target.value }))}
                    className="border-cgp-teal w-24"
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>
              </>
            )}

            {/* Fixed type */}
            {invoiceData.invoicing_type === "fixed" && (
              <>
                <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Nettó fix díj</Label>
                    <Input disabled className="bg-muted" />
                  </div>
                  <Input
                    type="number"
                    value={invoiceData.fixed_wage}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, fixed_wage: e.target.value }))}
                    className="border-cgp-teal w-24"
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Rangsoroló óradíj</Label>
                    <Input disabled className="bg-muted" />
                  </div>
                  <Input
                    type="number"
                    value={invoiceData.ranking_hourly_rate}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, ranking_hourly_rate: e.target.value }))}
                    className="border-cgp-teal w-24"
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>
              </>
            )}

            {/* Single session rate (if required) */}
            {singleSessionRateRequired && (
              <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label>Egyszeri konzultáció díja</Label>
                  <Input disabled className="bg-muted" />
                </div>
                <Input
                  type="number"
                  value={invoiceData.single_session_rate}
                  onChange={(e) => setInvoiceData((prev) => ({ ...prev, single_session_rate: e.target.value }))}
                  className="border-cgp-teal w-24"
                  placeholder={invoiceData.currency.toUpperCase()}
                />
              </div>
            )}

            {/* Custom invoice items list */}
            {customInvoiceItems.length > 0 && (
              <div className="space-y-2">
                <Label className="text-lg">Egyedi tételek:</Label>
                {customInvoiceItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
                    <Input disabled value={item.name} className="bg-muted" />
                    <Input
                      disabled
                      value={countries.find((c) => c.id === item.countryId)?.name || ""}
                      className="bg-muted w-32"
                    />
                    <Input disabled value={item.amount} className="bg-muted w-24" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCustomItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-cgp-teal" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add custom item button */}
            {invoiceData.currency && (
              <Button
                type="button"
                variant="outline"
                className="border-cgp-teal text-cgp-teal hover:bg-cgp-teal hover:text-white"
                onClick={() => setShowCustomItemDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Extra díjazás hozzáadása
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 5. SZAKMAI INFORMÁCIÓK */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-cgp-teal">Szakmai információk:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contract upload (only for non-CGP employees) */}
            {!formData.is_cgp_employee && (
              <>
                <div className="flex items-center gap-4">
                  <Input disabled value="Szerződés szkennelt verziója" className="flex-1 bg-muted" />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cgp-teal text-cgp-teal"
                    onClick={() => contractInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Feltöltés
                  </Button>
                  <input
                    ref={contractInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleContractUpload}
                  />
                </div>

                {/* Temp contracts list */}
                {tempContracts.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <Input disabled value={file.name} className="flex-1 bg-cgp-dark-teal text-white" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTempContracts((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Törlés
                    </Button>
                  </div>
                ))}

                {/* Existing contracts */}
                {existingContracts.map((file) => (
                  <div key={file.id} className="flex items-center gap-4">
                    <Input disabled value={file.filename} className="flex-1 bg-cgp-dark-teal text-white" />
                    <Button type="button" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Letöltés
                    </Button>
                    <Button type="button" variant="outline">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Törlés
                    </Button>
                  </div>
                ))}

                {/* Certificate upload */}
                <div className="flex items-center gap-4">
                  <Input
                    disabled
                    value="Szakképesítést igazoló dokumentumok szkennelt verziója"
                    className="flex-1 bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cgp-teal text-cgp-teal"
                    onClick={() => certificateInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Feltöltés
                  </Button>
                  <input
                    ref={certificateInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleCertificateUpload}
                  />
                </div>

                {/* Temp certificates list */}
                {tempCertificates.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <Input disabled value={file.name} className="flex-1 bg-cgp-dark-teal text-white" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTempCertificates((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Törlés
                    </Button>
                  </div>
                ))}
              </>
            )}

            {/* Crisis countries (only shown when crisis psychologist and psychologist permission) */}
            {showPsychologistData && formData.crisis_psychologist && (
              <div className="space-y-2">
                <Label>Krízis országok:</Label>
                <div className="flex flex-wrap gap-2 p-3 border-2 border-cgp-teal rounded-lg min-h-[48px]">
                  {countries.map((country) => (
                    <div
                      key={country.id}
                      onClick={() =>
                        handleMultiSelectToggle(country.id, selectedCrisisCountries, setSelectedCrisisCountries)
                      }
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                        selectedCrisisCountries.includes(country.id)
                          ? "bg-cgp-teal text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {country.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target countries */}
            <div className="space-y-2">
              <Label>Ország:</Label>
              <div className="flex flex-wrap gap-2 p-3 border-2 border-cgp-teal rounded-lg min-h-[48px]">
                {countries.map((country) => (
                  <div
                    key={country.id}
                    onClick={() =>
                      handleMultiSelectToggle(country.id, selectedCountries, setSelectedCountries)
                    }
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      selectedCountries.includes(country.id)
                        ? "bg-cgp-teal text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {country.name}
                  </div>
                ))}
              </div>
            </div>

            {/* WS/CI/O Countries */}
            <div className="space-y-2">
              <Label>WS/CI/O Ország:</Label>
              <div className="flex flex-wrap gap-2 p-3 border-2 border-cgp-teal rounded-lg min-h-[48px]">
                {countries.map((country) => (
                  <div
                    key={country.id}
                    onClick={() =>
                      handleMultiSelectToggle(country.id, selectedOutsourceCountries, setSelectedOutsourceCountries)
                    }
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      selectedOutsourceCountries.includes(country.id)
                        ? "bg-cgp-teal text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {country.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions / Areas of expertise */}
            <div className="space-y-2">
              <Label>Szakterületek:</Label>
              <div className="flex flex-wrap gap-2 p-3 border-2 border-cgp-teal rounded-lg min-h-[48px]">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    onClick={() =>
                      handleMultiSelectToggle(permission.id, selectedPermissions, setSelectedPermissions)
                    }
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      selectedPermissions.includes(permission.id)
                        ? "bg-cgp-teal text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {permission.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Crisis psychologist checkbox (only when psychologist permission selected) */}
            {showPsychologistData && (
              <div className="flex items-center justify-between p-4 border-2 border-cgp-teal rounded-lg">
                <span className="text-cgp-teal">Krízis pszichológus</span>
                <Checkbox
                  checked={formData.crisis_psychologist}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, crisis_psychologist: !!checked }))
                  }
                />
              </div>
            )}

            {/* Specializations (only when psychologist permission selected) */}
            {showPsychologistData && (
              <div className="space-y-2">
                <Label>Specializáció:</Label>
                <div className="flex flex-wrap gap-2 p-3 border-2 border-cgp-teal rounded-lg min-h-[48px]">
                  {specializations.map((spec) => (
                    <div
                      key={spec.id}
                      onClick={() =>
                        handleMultiSelectToggle(spec.id, selectedSpecializations, setSelectedSpecializations)
                      }
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                        selectedSpecializations.includes(spec.id)
                          ? "bg-cgp-teal text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {spec.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Native language */}
            <div className="space-y-2">
              <Label>Anyanyelv:</Label>
              <Select
                value={professionalData.native_language}
                onValueChange={(value) =>
                  setProfessionalData((prev) => ({ ...prev, native_language: value }))
                }
              >
                <SelectTrigger className="border-cgp-teal">
                  <SelectValue placeholder="Kérjük válasszon" />
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

            {/* Language skills */}
            <div className="space-y-2">
              <Label>Nyelvtudás:</Label>
              <div className="flex flex-wrap gap-2 p-3 border-2 border-cgp-teal rounded-lg min-h-[48px]">
                {languageSkills.map((lang) => (
                  <div
                    key={lang.id}
                    onClick={() =>
                      handleMultiSelectToggle(lang.id, selectedLanguageSkills, setSelectedLanguageSkills)
                    }
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      selectedLanguageSkills.includes(lang.id)
                        ? "bg-cgp-teal text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {lang.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Case limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Maximális folyamatban lévő esetek száma:</Label>
                <Input
                  type="number"
                  value={professionalData.max_inprogress_cases}
                  onChange={(e) =>
                    setProfessionalData((prev) => ({ ...prev, max_inprogress_cases: e.target.value }))
                  }
                  className="border-cgp-teal"
                />
              </div>
              <div className="space-y-2">
                <Label>Minimális folyamatban lévő esetek száma:</Label>
                <Input
                  type="number"
                  value={professionalData.min_inprogress_cases}
                  onChange={(e) =>
                    setProfessionalData((prev) => ({ ...prev, min_inprogress_cases: e.target.value }))
                  }
                  className="border-cgp-teal"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. EXPERT DASHBOARD INFORMÁCIÓK */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-cgp-teal">Expert Dashboard információk:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Felhasználónév:</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="border-cgp-teal"
              />
            </div>

            <div className="space-y-2">
              <Label>Dashboard nyelve:</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="border-cgp-teal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 7. EAP ONLINE INFORMÁCIÓK (only when is_eap_online_expert) */}
        {formData.is_eap_online_expert && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-cgp-teal">EAP Online információk:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  disabled
                  value={eapOnlineData.image ? eapOnlineData.image.name : "Fotó"}
                  className="flex-1 bg-muted"
                />
                {!eapOnlineData.image ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cgp-teal text-cgp-teal"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Feltöltés
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEapOnlineData((prev) => ({ ...prev, image: null, imagePreview: "" }))}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Törlés
                  </Button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              {eapOnlineData.imagePreview && (
                <div>
                  <img
                    src={eapOnlineData.imagePreview}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-lg border-2 border-cgp-teal"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Textarea
                  value={eapOnlineData.description}
                  onChange={(e) =>
                    setEapOnlineData((prev) => ({ ...prev, description: e.target.value.slice(0, 180) }))
                  }
                  placeholder="Leírás... (Max. 180 karakter)"
                  rows={4}
                  maxLength={180}
                  className="border-cgp-teal resize-none"
                />
                <div className="text-right text-sm text-muted-foreground">
                  {eapOnlineData.description.length}/180
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-cgp-teal hover:bg-cgp-teal/90 rounded-xl"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Mentés..." : "Mentés"}
          </Button>
        </div>
      </form>

      {/* Custom Invoice Item Dialog */}
      <Dialog open={showCustomItemDialog} onOpenChange={setShowCustomItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-cgp-teal">Egyedi tétel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-cgp-teal">Tétel megnevezése:</Label>
              <Input
                value={newCustomItem.name}
                onChange={(e) => setNewCustomItem((prev) => ({ ...prev, name: e.target.value }))}
                className="border-cgp-teal"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cgp-teal">Melyik országra érvényes:</Label>
              <Select
                value={newCustomItem.countryId}
                onValueChange={(value) => setNewCustomItem((prev) => ({ ...prev, countryId: value }))}
              >
                <SelectTrigger className="border-cgp-teal">
                  <SelectValue placeholder="Kérjük válasszon" />
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
            <div className="space-y-2">
              <Label className="text-cgp-teal">
                Összeg {invoiceData.currency.toUpperCase()}-ben kifejezve:
              </Label>
              <Input
                type="number"
                value={newCustomItem.amount}
                onChange={(e) => setNewCustomItem((prev) => ({ ...prev, amount: e.target.value }))}
                className="border-cgp-teal"
                placeholder={invoiceData.currency.toUpperCase()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleAddCustomItem}
              className="bg-cgp-teal hover:bg-cgp-teal/90"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpertForm;
