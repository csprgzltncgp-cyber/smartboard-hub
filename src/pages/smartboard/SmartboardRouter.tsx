import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import SalesSmartboard from "./SalesSmartboard";
import AccountSmartboard from "./AccountSmartboard";
import OperativeSmartboard from "./OperativeSmartboard";
import AdminSmartboard from "./AdminSmartboard";

/**
 * Dinamikusan választja ki a megfelelő SmartBoard-ot a felhasználó 
 * alapértelmezett SmartBoard beállítása alapján.
 * 
 * Saját SmartBoard oldallal rendelkező interfészek:
 * - Account ✓
 * - Sales ✓
 * - Operatív ✓
 * - Admin ✓
 * - Pénzügyi (elkészítendő)
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
      return <OperativeSmartboard />;
    case "admin":
      return <AdminSmartboard />;
    case "financial":
      // Pénzügyi SmartBoard - saját oldal elkészítendő
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
