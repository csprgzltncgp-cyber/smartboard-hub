import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import SalesSmartboard from "./SalesSmartboard";
import AccountSmartboard from "./AccountSmartboard";

/**
 * Dinamikusan választja ki a megfelelő SmartBoard-ot a felhasználó 
 * alapértelmezett SmartBoard beállítása alapján.
 * 
 * Saját SmartBoard oldallal rendelkező interfészek:
 * - Account ✓
 * - Sales ✓
 * - Operatív (elkészítendő)
 * - Pénzügyi (elkészítendő)
 * - Admin (TODO oldalra megy)
 * - Digital (TODO oldalra megy)
 */
const SmartboardRouter = () => {
  const { currentUser } = useAuth();
  
  // Keressük meg az alapértelmezett SmartBoard-ot
  const defaultSmartboard = currentUser?.smartboardPermissions?.find(
    p => p.isDefault
  )?.smartboardId;
  
  // SmartBoard alapján döntünk
  switch (defaultSmartboard) {
    case "account":
      return <AccountSmartboard />;
    case "sales":
      return <SalesSmartboard />;
    case "operative":
      // Operatív SmartBoard - saját oldal elkészítendő
      return <Dashboard />;
    case "financial":
      // Pénzügyi SmartBoard - saját oldal elkészítendő
      return <Dashboard />;
    case "admin":
      // Admin felhasználók a TODO oldalra kerülnek
      return <Dashboard />;
    case "digital":
      // Digital SmartBoard - TODO oldalra megy
      return <Dashboard />;
    default:
      // Alapértelmezett: TODO oldal
      return <Dashboard />;
  }
};

export default SmartboardRouter;
