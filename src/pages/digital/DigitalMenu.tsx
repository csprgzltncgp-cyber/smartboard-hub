import { useNavigate } from "react-router-dom";
import { 
  Coffee, 
  Globe, 
  Monitor, 
  Gift, 
  Brain, 
  Database 
} from "lucide-react";

interface DigitalMenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const digitalMenuItems: DigitalMenuItem[] = [
  { label: "Business Breakfast", path: "/dashboard/digital/business-breakfast", icon: Coffee },
  { label: "Blog", path: "/dashboard/digital/blog", icon: Globe },
  { label: "EAP online", path: "/dashboard/digital/eap-online", icon: Monitor },
  { label: "Nyereményjáték", path: "/dashboard/digital/prizegame", icon: Gift },
  { label: "Pszichoszociális kockázatfelmérés", path: "/dashboard/digital/psychosocial-risk-assessment", icon: Brain },
  { label: "Adatok", path: "/dashboard/digital/data", icon: Database },
];

const DigitalMenu = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-calibri-bold mb-6">Digital</h1>
      
      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-col gap-2">
          {digitalMenuItems.map((item) => (
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

export default DigitalMenu;
