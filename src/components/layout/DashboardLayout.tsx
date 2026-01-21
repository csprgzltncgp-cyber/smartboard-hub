import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { 
  ClipboardList, 
  FileText, 
  Monitor, 
  Settings, 
  Users, 
  BarChart3, 
  FileSpreadsheet, 
  Bell, 
  FolderOpen,
  Calendar,
  Search,
  Menu,
  X
} from "lucide-react";
import cgpLogo from "@/assets/cgp_logo_green.svg";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  badgeColor?: string;
}

const menuItems: MenuItem[] = [
  { label: "Lezárt esetek", icon: FileText, path: "/dashboard/cases/closed" },
  { label: "Folyamatban lévő esetek", icon: ClipboardList, path: "/dashboard/cases/in-progress" },
  { label: "Digital", icon: Monitor, path: "/dashboard/digital" },
  { label: "Beállítások", icon: Settings, path: "/dashboard/settings" },
  { label: "Partnerek", icon: Users, path: "/dashboard/outsources" },
  { label: "Riportok", icon: BarChart3, path: "/dashboard/reports" },
  { label: "Számlák", icon: FileSpreadsheet, path: "/dashboard/invoices" },
  { label: "Értesítések", icon: Bell, path: "/dashboard/notifications" },
  { label: "Eszközök", icon: FolderOpen, path: "/dashboard/assets" },
  { label: "Tevékenység terv", icon: Calendar, path: "/dashboard/activity-plan" },
  { label: "Feedback", icon: FileText, path: "/dashboard/feedback", badge: 3, badgeColor: "bg-orange-500" },
  { label: "TODO", icon: ClipboardList, path: "/dashboard", badge: 5, badgeColor: "bg-green-500" },
  { label: "Partner keresés", icon: Search, path: "/dashboard/affiliate-search" },
];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-background pt-2 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <img 
                src={cgpLogo} 
                alt="Chestnut Global Partners" 
                className="w-20 h-20"
              />
              <span className="text-primary uppercase text-lg font-calibri-bold -mt-1">
                Admin Dashboard
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu}
              className="lg:hidden bg-cgp-teal-light text-white px-4 py-3 rounded-xl flex items-center gap-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              MENÜ
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-background border-b px-4 py-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`${item.badgeColor} text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop Menu Button (shown on desktop) */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 lg:px-8 mt-4">
        <div className="flex justify-end">
          <button 
            onClick={toggleMenu}
            className="bg-cgp-teal-light text-white px-6 py-3 rounded-xl flex items-center gap-2 font-calibri-bold uppercase hover:bg-primary transition-colors"
          >
            <Menu className="w-5 h-5" />
            MENÜ
          </button>
        </div>

        {/* Desktop Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-8 mt-2 w-80 bg-white shadow-lg rounded-xl z-50 border">
            <nav className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`${item.badgeColor} text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <p className="text-sm text-muted-foreground">
          ... Home (TODO)
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pb-24">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
