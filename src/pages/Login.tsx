import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, AlertTriangle } from "lucide-react";
import cgpLogo from "@/assets/cgp_logo_green.svg";
import whiteLogo from "@/assets/white_logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { SMARTBOARDS } from "@/config/smartboards";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      // Check password
      if (password !== "smartboard") {
        setError("Hibás felhasználónév vagy jelszó.");
        return;
      }
      
      // Try to login with username
      const user = login(username);
      if (!user) {
        setError("Hibás felhasználónév vagy jelszó.");
        return;
      }
      
      // Navigate to user's default SmartBoard on success
      const defaultPermission = user.smartboardPermissions?.find(p => p.isDefault);
      if (defaultPermission) {
        const smartboard = SMARTBOARDS.find(sb => sb.id === defaultPermission.smartboardId);
        if (smartboard && smartboard.menuItems.length > 0) {
          navigate(smartboard.menuItems[0].path);
          return;
        }
      }
      // Fallback to TODO dashboard
      navigate("/dashboard");
    }, 500);
  };

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
            <p className="font-calibri-bold mb-2">Demo felhasználók:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li><strong>tompa.anita</strong> - Account + Operatív</li>
              <li><strong>kiss.barbara</strong> - Sales (CRM)</li>
              <li><strong>janky.peter</strong> - Pénzügyi + Account</li>
              <li><strong>kovacs.anna</strong> - Operátor</li>
              <li><strong>admin</strong> - Admin (teljes hozzáférés)</li>
            </ul>
            <p className="mt-2 text-xs">Jelszó: <strong>smartboard</strong></p>
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
