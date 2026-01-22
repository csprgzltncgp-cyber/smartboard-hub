import { useState, useRef, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { 
  ClipboardList, 
  FileText, 
  Monitor, 
  Users, 
  BarChart3, 
  FileSpreadsheet, 
  Bell, 
  FolderOpen,
  Calendar,
  Search,
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Globe,
  MapPin,
  Shield,
  UserCog,
  Headphones,
  GraduationCap,
  Coffee,
  Gift,
  Brain,
  Database,
  ListChecks,
  Contact
} from "lucide-react";
import { SMARTBOARDS } from "@/config/smartboards";
import cgpLogo from "@/assets/cgp_logo_green.svg";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  badgeColor?: string;
}

const menuItems: MenuItem[] = [
  // Eredeti menüpontok
  { label: "TODO", icon: ClipboardList, path: "/dashboard", badge: 5, badgeColor: "bg-green-500" },
  { label: "Összes eset", icon: FileText, path: "/dashboard/cases/closed" },
  { label: "Folyamatban lévő esetek", icon: ClipboardList, path: "/dashboard/cases/in-progress" },
  { label: "WS/CI/O", icon: Users, path: "/dashboard/outsources" },
  { label: "Riportok", icon: BarChart3, path: "/dashboard/reports" },
  { label: "Számlák", icon: FileSpreadsheet, path: "/dashboard/invoices" },
  { label: "Értesítés", icon: Bell, path: "/dashboard/notifications" },
  { label: "Leltár", icon: FolderOpen, path: "/dashboard/assets" },
  { label: "Ügyfeleim", icon: Calendar, path: "/dashboard/activity-plan" },
  { label: "Feedback", icon: FileText, path: "/dashboard/feedback", badge: 3, badgeColor: "bg-orange-500" },
  { label: "Szakértő keresés", icon: Search, path: "/dashboard/affiliate-search" },
  // Digital almenük (korábban Digital gyűjtőmenü alatt)
  { label: "Business Breakfast", icon: Coffee, path: "/dashboard/digital/business-breakfast" },
  { label: "Blog", icon: Globe, path: "/dashboard/digital/blog" },
  { label: "EAP online", icon: Monitor, path: "/dashboard/digital/eap-online" },
  { label: "Nyereményjáték", icon: Gift, path: "/dashboard/digital/prizegame" },
  { label: "Pszichoszociális kockázatfelmérés", icon: Brain, path: "/dashboard/digital/psychosocial-risk-assessment" },
  { label: "Adatok", icon: Database, path: "/dashboard/digital/data" },
  // Beállítások almenük (korábban Beállítások gyűjtőmenü alatt)
  { label: "Cégek", icon: Building2, path: "/dashboard/settings/companies" },
  { label: "Inputok", icon: ListChecks, path: "/dashboard/inputs" },
  { label: "Országok", icon: Globe, path: "/dashboard/settings/countries" },
  { label: "Városok", icon: MapPin, path: "/dashboard/settings/cities" },
  { label: "Cég jogosultságok", icon: Shield, path: "/dashboard/settings/permissions" },
  { label: "Felhasználók", icon: UserCog, path: "/dashboard/users" },
  { label: "Szakértők", icon: Users, path: "/dashboard/settings/experts" },
  { label: "Operátorok", icon: Headphones, path: "/dashboard/settings/operators" },
  { label: "Operátor dokumentumok", icon: FileText, path: "/dashboard/settings/documents" },
  { label: "Training Dashboard", icon: GraduationCap, path: "/dashboard/settings/training" },
  { label: "CRM", icon: Contact, path: "/dashboard/crm" },
];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSmartboardMenuOpen, setIsSmartboardMenuOpen] = useState(false);
  const smartboardMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close smartboard menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (smartboardMenuRef.current && !smartboardMenuRef.current.contains(event.target as Node)) {
        setIsSmartboardMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out client smartboard for the menu
  const availableSmartboards = SMARTBOARDS.filter(sb => sb.id !== "client");

  // Build breadcrumb based on current path (without SmartBoard category names like "Admin")
  const buildBreadcrumb = () => {
    const path = location.pathname;
    const breadcrumbs: { label: string; path: string }[] = [];

    // Special routes mapping - egyszerűsített, nincs gyűjtőoldal
    const specialRoutes: Record<string, { label: string; parentPath?: string; parentLabel?: string }> = {
      "/dashboard": { label: "TODO" },
      "/dashboard/users": { label: "Felhasználók" },
      "/dashboard/users/new": { label: "Új felhasználó regisztrálása", parentPath: "/dashboard/users", parentLabel: "Felhasználók" },
      "/dashboard/settings/operators": { label: "Operátorok" },
      "/dashboard/settings/operators/new": { label: "Új operátor regisztrálása", parentPath: "/dashboard/settings/operators", parentLabel: "Operátorok" },
    };

    // Check for user permissions route pattern
    const permissionsMatch = path.match(/^\/dashboard\/users\/(\d+)\/permissions$/);
    if (permissionsMatch) {
      return [
        { label: "Felhasználók", path: "/dashboard/users" },
        { label: "Jogosultságok szerkesztése", path: path },
      ];
    }

    // Check for operator permissions route pattern
    const operatorPermissionsMatch = path.match(/^\/dashboard\/settings\/operators\/([^/]+)\/permissions$/);
    if (operatorPermissionsMatch) {
      return [
        { label: "Operátorok", path: "/dashboard/settings/operators" },
        { label: "Jogosultságok szerkesztése", path: path },
      ];
    }

    // Check special routes first
    if (specialRoutes[path]) {
      const route = specialRoutes[path];
      // Add parent if exists
      if (route.parentPath && route.parentLabel) {
        breadcrumbs.push({ label: route.parentLabel, path: route.parentPath });
      }
      breadcrumbs.push({ label: route.label, path: path });
      return breadcrumbs;
    }

    // Find matching SmartBoard menu item (without adding SmartBoard name)
    for (const smartboard of SMARTBOARDS) {
      const menuItem = smartboard.menuItems.find(item => path.startsWith(item.path));
      if (menuItem) {
        breadcrumbs.push({ label: menuItem.label, path: menuItem.path });
        
        // Check for sub-routes (like /new, /edit, etc.)
        if (path !== menuItem.path) {
          const subPath = path.replace(menuItem.path, "");
          if (subPath.includes("/new")) {
            breadcrumbs.push({ label: "Új létrehozása", path: path });
          } else if (subPath.includes("/edit")) {
            breadcrumbs.push({ label: "Szerkesztés", path: path });
          }
        }
        return breadcrumbs;
      }
    }

    // Default fallback
    return [{ label: "Dashboard", path: "/dashboard" }];
  };

  const breadcrumbs = buildBreadcrumb();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-background pt-2">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <img 
                src={cgpLogo} 
                alt="Chestnut Global Partners" 
                className="w-20 h-20"
              />
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

      {/* SmartBoard Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4" ref={smartboardMenuRef}>
        <div className="flex items-center gap-1 text-sm">
          {/* SmartBoard root - not clickable yet */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>...</span>
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium">SmartBoard</span>
          </div>

          {/* Breadcrumb path */}
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-muted-foreground">/</span>
              {index === breadcrumbs.length - 1 ? (
                // Last item - not clickable, current page
                <span className="text-foreground font-medium">{crumb.label}</span>
              ) : (
                // Clickable breadcrumb
                <button
                  onClick={() => navigate(crumb.path)}
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  {crumb.label}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pb-24">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
