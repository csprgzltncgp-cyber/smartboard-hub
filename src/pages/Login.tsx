import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, AlertTriangle } from "lucide-react";
import cgpLogo from "@/assets/cgp_logo_green.svg";
import whiteLogo from "@/assets/white_logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { SMARTBOARDS } from "@/config/smartboards";
import { useAppUsersDb } from "@/hooks/useAppUsersDb";
import { useAppOperatorsDb } from "@/hooks/useAppOperatorsDb";
import { User } from "@/types/user";

// List of implemented routes (pages that actually exist)
const IMPLEMENTED_ROUTES = [
  "/dashboard",
  "/dashboard/users",
  "/dashboard/settings/operators",
  "/dashboard/inputs",
  "/dashboard/crm",
  "/dashboard/smartboard/sales",
  "/dashboard/case-dispatch",
  "/dashboard/my-clients",
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { users, loading: usersLoading } = useAppUsersDb();
  const { operators, loading: operatorsLoading } = useAppOperatorsDb();

  const summarizeSmartboards = (user: User): string => {
    const ids = (user.smartboardPermissions || [])
      .filter(p => p.smartboardId !== "search")
      .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
      .map(p => p.smartboardId);

    if (ids.length === 0) return "(nincs SmartBoard beállítva)";

    const names = ids.map(id => SMARTBOARDS.find(sb => sb.id === id)?.name || id);
    return names.join(" + ");
  };

  const demoAccounts: Array<{ username: string; label: string }> = (() => {
    const accounts: Array<{ username: string; label: string }> = [];
    users.forEach(u => accounts.push({ username: u.username, label: summarizeSmartboards(u) }));
    operators.forEach(o => accounts.push({ username: o.username, label: summarizeSmartboards(o) }));
    return accounts.sort((a, b) => a.username.localeCompare(b.username, "hu"));
  })();

  // Find first implemented route from user's smartboard permissions
  const findFirstImplementedRoute = (user: User): string => {
    const defaultPermission = user.smartboardPermissions?.find(p => p.isDefault);
    
    if (defaultPermission) {
      const smartboard = SMARTBOARDS.find(sb => sb.id === defaultPermission.smartboardId);
      if (smartboard) {
        // Check each menu item's path to see if it's implemented
        for (const menuItem of smartboard.menuItems) {
          if (IMPLEMENTED_ROUTES.includes(menuItem.path)) {
            return menuItem.path;
          }
        }
      }
    }
    
    // Check all other permissions for any implemented route
    for (const perm of user.smartboardPermissions || []) {
      const smartboard = SMARTBOARDS.find(sb => sb.id === perm.smartboardId);
      if (smartboard) {
        for (const menuItem of smartboard.menuItems) {
          if (IMPLEMENTED_ROUTES.includes(menuItem.path)) {
            return menuItem.path;
          }
        }
      }
    }
    
    // Fallback to TODO dashboard
    return "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Check password
      if (password !== "smartboard") {
        setError("Hibás felhasználónév vagy jelszó.");
        setIsLoading(false);
        return;
      }
      
      // Try to login with username
      const user = await login(username);
      if (!user) {
        setError("Hibás felhasználónév vagy jelszó.");
        setIsLoading(false);
        return;
      }
      
      // Navigate to first implemented route
      const targetRoute = findFirstImplementedRoute(user);
      navigate(targetRoute);
    } catch (err) {
      setError("Hiba történt a bejelentkezés során.");
    } finally {
      setIsLoading(false);
    }
  };

  const isDataLoading = usersLoading || operatorsLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Content Container - keeps everything aligned */}
      <div className="w-full max-w-[458px] px-4 flex flex-col">
        {/* Logo - directly above form */}
        <header className="mb-5">
          <img 
            src={cgpLogo} 
            alt="Chestnut Global Partners" 
            className="w-20 h-20"
          />
        </header>

        {/* Main Content */}
        <main className="flex flex-col">
          {/* Error Message */}
          {error && (
            <div className="bg-destructive text-destructive-foreground px-5 py-5 mb-4 flex items-center gap-2 font-calibri-bold w-full">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form 
            onSubmit={handleSubmit}
            className="bg-[#f2f2f2] px-10 pt-12 pb-10 w-full shadow-sm"
          >
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full h-11 px-4 mb-3 bg-white border-b border-[#e0e0e0] outline-none font-calibri-light text-sm placeholder:text-[#c0bfbf]"
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full h-11 px-4 bg-white border-b border-[#e0e0e0] outline-none font-calibri-light text-sm placeholder:text-[#c0bfbf]"
            />
            
            <div className="flex justify-center mt-10">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#00575f] text-white font-calibri-bold text-base uppercase px-8 h-11 rounded-[10px] flex items-center gap-2 hover:bg-[#004a52] transition-colors disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
            </div>
          </form>

          {/* Demo users hint */}
          <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
            <p className="font-calibri-bold mb-2">Jelenlegi hozzáférések (Felhasználó jogosultságok alapján):</p>
            {isDataLoading ? (
              <p className="text-muted-foreground">Betöltés...</p>
            ) : (
              <ul className="space-y-1 text-muted-foreground">
                {demoAccounts.map(acc => (
                  <li key={acc.username}>
                    <strong>{acc.username}</strong> - {acc.label}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs">Jelszó: <strong>smartboard</strong></p>
            <p className="mt-1 text-xs text-muted-foreground">
              Megjegyzés: az adatok az adatbázisban tárolódnak.
            </p>
          </div>

          {/* Footer Branding */}
          <div className="flex items-center gap-2 mt-5 w-full">
            <img 
              src={whiteLogo} 
              alt="Environment Friendly" 
              className="h-14"
            />
            <p className="text-primary uppercase font-calibri-light text-[10px] leading-tight mt-2">
              Az Ön programszolgáltatója, a Chestnut Global Partners Kft. CO2 Mentes. 
              Nyilvántartjuk és ellensúlyozzuk az ÜHG kibocsátást.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
