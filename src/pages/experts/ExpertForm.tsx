import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useExperts } from "@/hooks/useExperts";
import { Expert, ExpertFormData } from "@/types/expert";
import { toast } from "sonner";

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

const INVOICING_TYPES = [
  { value: "normal", label: "Normál (óradíjas)" },
  { value: "fixed", label: "Fix bér" },
  { value: "custom", label: "Egyedi tételek" },
];

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
  });

  const [invoiceData, setInvoiceData] = useState({
    invoicing_type: "normal" as "normal" | "fixed" | "custom",
    currency: "eur",
    hourly_rate_50: "",
    hourly_rate_30: "",
    hourly_rate_15: "",
    fixed_wage: "",
    ranking_hourly_rate: "",
  });

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
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
      
      // Load related data
      const countries = await getExpertCountries(expertId);
      setSelectedCountries(countries);
      
      const permissions = await getExpertPermissions(expertId);
      setSelectedPermissions(permissions);
    }
  };

  const handleInputChange = (field: keyof Expert, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/settings/experts")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-calibri-bold">
          {isEdit ? formData.name || "Szakértő szerkesztése" : "Új szakértő"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-cgp-teal">Alapadatok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Név *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Felhasználónév</Label>
                <Input
                  id="username"
                  value={formData.username || ""}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ország</Label>
                <Select
                  value={formData.country_id || ""}
                  onValueChange={(value) => handleInputChange("country_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz országot" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.code} - {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_prefix">Telefon előhívó</Label>
                <Input
                  id="phone_prefix"
                  value={formData.phone_prefix || ""}
                  onChange={(e) => handleInputChange("phone_prefix", e.target.value)}
                  placeholder="+36"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="phone_number">Telefonszám</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number || ""}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_cgp_employee"
                  checked={formData.is_cgp_employee || false}
                  onCheckedChange={(checked) => handleInputChange("is_cgp_employee", checked)}
                />
                <Label htmlFor="is_cgp_employee" className="cursor-pointer">
                  CGP alkalmazott
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_eap_online_expert"
                  checked={formData.is_eap_online_expert || false}
                  onCheckedChange={(checked) => handleInputChange("is_eap_online_expert", checked)}
                />
                <Label htmlFor="is_eap_online_expert" className="cursor-pointer">
                  EAP Online szakértő
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-cgp-teal">Működési területek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {countries.map((country) => (
                <div key={country.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`country-${country.id}`}
                    checked={selectedCountries.includes(country.id)}
                    onCheckedChange={() => handleCountryToggle(country.id)}
                  />
                  <Label htmlFor={`country-${country.id}`} className="cursor-pointer text-sm">
                    {country.code}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-cgp-teal">Jogosultságok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                  />
                  <Label htmlFor={`permission-${permission.id}`} className="cursor-pointer">
                    {permission.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-cgp-teal">Számlázási adatok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Számlázás típusa</Label>
                <Select
                  value={invoiceData.invoicing_type}
                  onValueChange={(value: "normal" | "fixed" | "custom") =>
                    setInvoiceData((prev) => ({ ...prev, invoicing_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>Pénznem</Label>
                <Select
                  value={invoiceData.currency}
                  onValueChange={(value) =>
                    setInvoiceData((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {invoiceData.invoicing_type === "normal" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Óradíj (50 perc)</Label>
                  <Input
                    type="number"
                    value={invoiceData.hourly_rate_50}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({ ...prev, hourly_rate_50: e.target.value }))
                    }
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Óradíj (30 perc)</Label>
                  <Input
                    type="number"
                    value={invoiceData.hourly_rate_30}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({ ...prev, hourly_rate_30: e.target.value }))
                    }
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Óradíj (15 perc)</Label>
                  <Input
                    type="number"
                    value={invoiceData.hourly_rate_15}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({ ...prev, hourly_rate_15: e.target.value }))
                    }
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>
              </div>
            )}

            {invoiceData.invoicing_type === "fixed" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fix bér</Label>
                  <Input
                    type="number"
                    value={invoiceData.fixed_wage}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({ ...prev, fixed_wage: e.target.value }))
                    }
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rangsoroló óradíj</Label>
                  <Input
                    type="number"
                    value={invoiceData.ranking_hourly_rate}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({ ...prev, ranking_hourly_rate: e.target.value }))
                    }
                    placeholder={invoiceData.currency.toUpperCase()}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/settings/experts")}
          >
            Mégse
          </Button>
          <Button type="submit" disabled={saving} className="bg-cgp-teal hover:bg-cgp-teal/90">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Mentés..." : "Mentés"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpertForm;
