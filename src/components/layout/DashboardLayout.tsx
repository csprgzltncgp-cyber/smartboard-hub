import { useState, useRef, useEffect, useMemo } from "react";
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
  Contact,
  Send,
  LogOut,
  User,
  Filter,
  MessageCircle
} from "lucide-react";
import { SMARTBOARDS } from "@/config/smartboards";
import cgpLogo from "@/assets/cgp_logo_green.svg";
import { useAuth } from "@/contexts/AuthContext";
import { filterMenuItems } from "@/utils/menuPermissions";
import SearchFilterPanel from "@/components/panels/SearchFilterPanel";
import ChatPanel from "@/components/panels/ChatPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  badgeColor?: string;
}

const allMenuItems: MenuItem[] = [
  { label: "Adatok", icon: Database, path: "/dashboard/digital/data" },
  { label: "Blog", icon: Globe, path: "/dashboard/digital/blog" },
  { label: "Business Breakfast", icon: Coffee, path: "/dashboard/digital/business-breakfast" },
  { label: "Cég jogosultságok", icon: Shield, path: "/dashboard/settings/permissions" },
  { label: "Cégek", icon: Building2, path: "/dashboard/settings/companies" },
  { label: "CRM", icon: Contact, path: "/dashboard/crm" },
  { label: "EAP online", icon: Monitor, path: "/dashboard/digital/eap-online" },
  { label: "Értesítés", icon: Bell, path: "/dashboard/notifications" },
  { label: "Eset kiközvetítése", icon: Send, path: "/dashboard/case-dispatch" },
  { label: "Feedback", icon: FileText, path: "/dashboard/feedback", badge: 3, badgeColor: "bg-orange-500" },
  { label: "Felhasználók", icon: UserCog, path: "/dashboard/users" },
  { label: "Folyamatban lévő esetek", icon: ClipboardList, path: "/dashboard/cases/in-progress" },
  { label: "Inputok", icon: ListChecks, path: "/dashboard/inputs" },
  { label: "Leltár", icon: FolderOpen, path: "/dashboard/assets" },
  { label: "Nyereményjáték", icon: Gift, path: "/dashboard/digital/prizegame" },
  { label: "Operátor dokumentumok", icon: FileText, path: "/dashboard/settings/documents" },
  { label: "Operátorok", icon: Headphones, path: "/dashboard/settings/operators" },
  { label: "Országok", icon: Globe, path: "/dashboard/settings/countries" },
  { label: "Összes eset", icon: FileText, path: "/dashboard/cases/closed" },
  { label: "Pszichoszociális kockázatfelmérés", icon: Brain, path: "/dashboard/digital/psychosocial-risk-assessment" },
  { label: "Riportok", icon: BarChart3, path: "/dashboard/reports" },
  { label: "Szakértő keresés", icon: Search, path: "/dashboard/affiliate-search" },
  { label: "Szakértők", icon: Users, path: "/dashboard/settings/experts" },
  { label: "Számlák", icon: FileSpreadsheet, path: "/dashboard/invoices" },
  { label: "TODO", icon: ClipboardList, path: "/dashboard", badge: 5, badgeColor: "bg-green-500" },
  { label: "Training Dashboard", icon: GraduationCap, path: "/dashboard/settings/training" },
  { label: "Ügyfeleim", icon: Calendar, path: "/dashboard/my-clients" },
  { label: "Városok", icon: MapPin, path: "/dashboard/settings/cities" },
  { label: "WS/CI/O", icon: Users, path: "/dashboard/outsources" },
];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSmartboardMenuOpen, setIsSmartboardMenuOpen] = useState(false);
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const smartboardMenuRef = useRef<HTMLDivElement>(null);
  
  // Mock unread chat count - in production this would come from real-time data
  const unreadChatCount = 2;

  // Guard: if not authenticated, redirect to login
  useEffect(() => {
    if (!currentUser) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  // Filter menu items based on user permissions
  const menuItems = useMemo(() => {
    return filterMenuItems(allMenuItems, currentUser);
  }, [currentUser]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

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

    // Check for user edit route pattern
    const editMatch = path.match(/^\/dashboard\/users\/([^/]+)\/edit$/);
    if (editMatch) {
      return [
        { label: "Felhasználók", path: "/dashboard/users" },
        { label: "Szerkesztés", path: path },
      ];
    }

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
    // Skip admin smartboard as it has a catch-all path
    for (const smartboard of SMARTBOARDS) {
      if (smartboard.id === "admin") continue; // Skip admin, it matches everything
      
      const menuItem = smartboard.menuItems.find(item => {
        // Exact match or path starts with menu item path followed by /
        return path === item.path || path.startsWith(item.path + "/") || 
               (item.path.includes("?") && path === item.path.split("?")[0]);
      });
      if (menuItem) {
        breadcrumbs.push({ label: menuItem.label, path: menuItem.path.split("?")[0] });
        
        // Check for sub-routes (like /new, /edit, etc.)
        const basePath = menuItem.path.split("?")[0];
        if (path !== basePath) {
          const subPath = path.replace(basePath, "");
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

  if (!currentUser) return null;

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

            {/* Mobile Menu Buttons - stacked layout */}
            <div className="lg:hidden flex flex-col items-end gap-1">
              <button 
                onClick={() => {
                  toggleMenu();
                  setIsSearchFilterOpen(false);
                  setIsChatOpen(false);
                }}
                className="bg-cgp-teal-light text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                MENÜ
              </button>
              <button 
                onClick={() => {
                  setIsSearchFilterOpen(!isSearchFilterOpen);
                  setIsMenuOpen(false);
                  setIsChatOpen(false);
                }}
                className={`text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm ${
                  isSearchFilterOpen ? "bg-cgp-teal/80" : "bg-cgp-teal"
                }`}
              >
                <Filter className="w-4 h-4" />
                KERESÉS
              </button>
              <button 
                onClick={() => {
                  setIsChatOpen(!isChatOpen);
                  setIsMenuOpen(false);
                  setIsSearchFilterOpen(false);
                }}
                className={`text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm relative ${
                  isChatOpen ? "bg-cgp-teal/80" : "bg-cgp-teal"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                CHAT
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            </div>
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
            {/* Kijelentkezés - always visible */}
            <div className="border-t mt-2 pt-2">
              {currentUser && (
                <div className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback className="bg-cgp-teal/20 text-cgp-teal text-xs">
                      {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{currentUser.name}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Kijelentkezés</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Buttons - Stacked vertically */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 lg:px-8 mt-4">
        <div className="flex flex-col items-end gap-2">
          {/* MENÜ Button + Panel */}
          <div className="relative">
            <button 
              onClick={() => {
                toggleMenu();
                setIsSearchFilterOpen(false);
                setIsChatOpen(false);
              }}
              className={`w-48 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-calibri-bold uppercase transition-colors ${
                isMenuOpen ? "bg-cgp-teal/80" : "bg-cgp-teal hover:bg-cgp-teal/90"
              }`}
            >
              <Menu className="w-5 h-5" />
              MENÜ
            </button>
            
            {/* Desktop Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-background shadow-lg rounded-xl z-50 border">
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
                  {/* Kijelentkezés - always visible */}
                  <div className="border-t mt-2">
                    {currentUser && (
                      <div className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                          <AvatarFallback className="bg-cgp-teal/20 text-cgp-teal text-xs">
                            {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{currentUser.name}</span>
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Kijelentkezés</span>
                    </button>
                  </div>
                </nav>
              </div>
            )}
          </div>
          
          {/* Keresés/Szűrés Button + Panel */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsSearchFilterOpen(!isSearchFilterOpen);
                setIsMenuOpen(false);
                setIsChatOpen(false);
              }}
              className={`w-48 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-calibri-bold uppercase transition-colors ${
                isSearchFilterOpen ? "bg-cgp-teal-light/80" : "bg-cgp-teal-light hover:bg-cgp-teal-light/90"
              }`}
            >
              <Filter className="w-5 h-5" />
              KERESÉS
            </button>
            
            {/* Desktop Search/Filter Dropdown Panel */}
            {isSearchFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-[700px] z-50">
                <SearchFilterPanel onClose={() => setIsSearchFilterOpen(false)} />
              </div>
            )}
          </div>
          
          {/* Chat Button + Panel */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                setIsMenuOpen(false);
                setIsSearchFilterOpen(false);
              }}
              className={`w-48 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-calibri-bold uppercase transition-colors ${
                isChatOpen ? "bg-cgp-teal-light/80" : "bg-cgp-teal-light hover:bg-cgp-teal-light/90"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              CHAT
              {unreadChatCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {unreadChatCount}
                </span>
              )}
            </button>
            
            {/* Desktop Chat Dropdown Panel */}
            {isChatOpen && (
              <div className="absolute top-full right-0 mt-2 z-50">
                <ChatPanel onClose={() => setIsChatOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SmartBoard Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4" ref={smartboardMenuRef}>
        <div className="flex items-center gap-1 text-sm">
          {/* SmartBoard root - clickable, navigates to user's default SmartBoard */}
          <button 
            onClick={() => {
              // Find user's default smartboard and navigate to its first menu item
              const defaultPermission = currentUser?.smartboardPermissions?.find(p => p.isDefault);
              if (defaultPermission) {
                const smartboard = SMARTBOARDS.find(sb => sb.id === defaultPermission.smartboardId);
                if (smartboard && smartboard.menuItems.length > 0) {
                  navigate(smartboard.menuItems[0].path);
                  return;
                }
              }
              // Fallback to TODO dashboard
              navigate("/dashboard");
            }}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <span>...</span>
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium hover:underline">SmartBoard</span>
          </button>

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

      {/* Mobile Search/Filter Panel */}
      {isSearchFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="absolute top-20 left-4 right-4">
            <SearchFilterPanel onClose={() => setIsSearchFilterOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile Chat Panel */}
      {isChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="absolute top-20 left-4 right-4">
            <ChatPanel onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
