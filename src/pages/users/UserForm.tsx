import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, User, X } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createUser, updateUser, getUserById } from "@/stores/userStore";
import { UserFormData, LANGUAGES } from "@/types/user";
import { toast } from "sonner";

const UserForm = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = Boolean(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    username: "",
    phone: "",
    languageId: "hu",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  // Load user data in edit mode
  useEffect(() => {
    if (isEditMode && userId) {
      const user = getUserById(userId);
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone || "",
          languageId: user.languageId || "hu",
          avatarUrl: user.avatarUrl || "",
        });
      } else {
        toast.error("Felhasználó nem található");
        navigate("/dashboard/users");
      }
    }
  }, [isEditMode, userId, navigate]);

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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isEditMode && userId) {
      updateUser(userId, formData);
      toast.success("Felhasználó sikeresen frissítve");
      navigate("/dashboard/users");
    } else {
      const newUser = createUser(formData);
      toast.success("Felhasználó sikeresen létrehozva");
      // Navigate to permissions page to set up smartboards
      navigate(`/dashboard/users/${newUser.id}/permissions`);
    }
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A kép mérete maximum 5MB lehet");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Csak képfájlok tölthetők fel");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatarUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData(prev => ({ ...prev, avatarUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/users")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-calibri-bold">
          {isEditMode ? "Felhasználó szerkesztése" : "Új felhasználó regisztrálása"}
        </h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Alapadatok</h2>

            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>Profilkép</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-2 border-muted">
                    <AvatarImage src={formData.avatarUrl} alt="Avatar" />
                    <AvatarFallback className="bg-cgp-teal/10 text-cgp-teal text-xl">
                      {formData.name ? getInitials(formData.name) : <User className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Kép feltöltése
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG vagy GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Név *</Label>
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
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Felhasználónév *</Label>
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
              <Label htmlFor="phone">Telefonszám</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+36 XX XXX XXXX"
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Nyelv</Label>
              <Select
                value={formData.languageId}
                onValueChange={(value) => handleChange("languageId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz nyelvet..." />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language.id} value={language.id}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? "Mentés" : "Mentés és jogosultságok beállítása"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/users")}
            >
              Mégse
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
