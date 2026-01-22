import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { createOperator } from "@/stores/operatorStore";
import { UserFormData, LANGUAGES } from "@/types/user";
import { toast } from "sonner";

const OperatorForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    username: "",
    phone: "",
    languageId: "hu",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "A név megadása kötelező";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Az email megadása kötelező";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Érvénytelen email formátum";
    }

    if (!formData.username.trim()) {
      newErrors.username = "A felhasználónév megadása kötelező";
    } else if (formData.username.length < 3) {
      newErrors.username = "A felhasználónév legalább 3 karakter legyen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Kérjük javítsd a hibákat");
      return;
    }

    const newOperator = createOperator(formData);
    toast.success("Operátor sikeresen létrehozva");
    
    // Navigate to permissions page for the new operator
    navigate(`/dashboard/settings/operators/${newOperator.id}/permissions`);
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/settings/operators")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-calibri-bold">Új operátor regisztrálása</h1>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Megjegyzés:</strong> Az operátor automatikusan megkapja az Operátor interfész hozzáférését. 
          A regisztráció után beállíthatod, mely menüpontokhoz férhet hozzá.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Alapadatok</h2>
          
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Név <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Teljes név"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@pelda.hu"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Felhasználónév <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="felhasznalonev"
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+36 30 123 4567"
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Nyelv</Label>
              <Select
                value={formData.languageId || "hu"}
                onValueChange={(value) => handleChange("languageId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz nyelvet" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex items-center gap-4 mt-6">
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Regisztráció és jogosultságok beállítása
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/settings/operators")}
          >
            Mégse
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OperatorForm;
