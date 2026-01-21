import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, AlertTriangle } from "lucide-react";
import cgpLogo from "@/assets/cgp_logo_green.svg";
import whiteLogo from "@/assets/white_logo.svg";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // TODO: Implement actual authentication
    // For now, simulate a login attempt
    setTimeout(() => {
      setIsLoading(false);
      // Demo: show error for empty credentials
      if (!username || !password) {
        setError("Hibás felhasználónév vagy jelszó.");
        return;
      }
      // Navigate to dashboard on success
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-center pt-4">
        <div className="flex items-start gap-2">
          <img 
            src={cgpLogo} 
            alt="Chestnut Global Partners" 
            className="w-20 h-20"
          />
          <p className="text-primary uppercase text-lg font-calibri-light -mt-1">
            Admin Dashboard
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Error Message */}
        {error && (
          <div className="bg-destructive text-destructive-foreground px-5 py-5 mb-4 flex items-center gap-2 font-calibri-bold max-w-[458px] w-full">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form 
          onSubmit={handleSubmit}
          className="bg-[hsl(var(--cgp-form-bg))] px-10 pt-20 pb-16 w-full max-w-[458px]"
        >
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full h-11 px-4 mb-3 border-0 outline-none font-calibri-light text-sm placeholder:text-[hsl(var(--cgp-input-placeholder))]"
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full h-11 px-4 border-0 outline-none font-calibri-light text-sm placeholder:text-[hsl(var(--cgp-input-placeholder))]"
          />
          
          <div className="flex justify-center mt-16">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground font-calibri-bold text-base uppercase px-8 h-11 rounded-[10px] flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </button>
          </div>
        </form>

        {/* Footer Branding */}
        <div className="flex items-center gap-2 mt-5 max-w-[458px] w-full">
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
  );
};

export default Login;
