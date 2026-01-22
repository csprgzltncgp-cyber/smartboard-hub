import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Globe, 
  MapPin, 
  Shield, 
  UserCog, 
  Users, 
  Headphones, 
  FileText, 
  GraduationCap 
} from "lucide-react";

interface SettingsMenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsMenuItems: SettingsMenuItem[] = [
  { label: "Cégek", path: "/dashboard/settings/companies", icon: Building2 },
  { label: "Országok", path: "/dashboard/settings/countries", icon: Globe },
  { label: "Városok", path: "/dashboard/settings/cities", icon: MapPin },
  { label: "Jogosultságok", path: "/dashboard/settings/permissions", icon: Shield },
  { label: "Felhasználók", path: "/dashboard/users", icon: UserCog },
  { label: "Szakértők", path: "/dashboard/settings/experts", icon: Users },
  { label: "Operátorok", path: "/dashboard/settings/operators", icon: Headphones },
  { label: "Dokumentumok", path: "/dashboard/settings/documents", icon: FileText },
  { label: "Training Dashboard", path: "/dashboard/settings/training", icon: GraduationCap },
];

const SettingsMenu = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-calibri-bold mb-6">Beállítások</h1>
      
      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-col gap-2">
          {settingsMenuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors border-b last:border-b-0"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground hover:text-primary">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
