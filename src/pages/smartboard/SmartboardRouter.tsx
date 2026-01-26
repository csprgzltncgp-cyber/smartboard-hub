import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import SalesSmartboard from "./SalesSmartboard";
import AccountSmartboard from "./AccountSmartboard";

/**
 * Dinamikusan választja ki a megfelelő SmartBoard-ot a felhasználó 
 * alapértelmezett SmartBoard beállítása alapján.
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
    case "admin":
      // Admin felhasználók a TODO (Dashboard) oldalra kerülnek
      // vagy később Admin SmartBoard-ra
      return <Dashboard />;
    case "operative":
      // TODO: Operatív SmartBoard - megadott panelek alapján elkészítendő
      return <Dashboard />;
    case "financial":
      // Pénzügyi SmartBoard - egyelőre TODO
      return <Dashboard />;
    case "digital":
      // Digital SmartBoard - egyelőre TODO
      return <Dashboard />;
    default:
      // Alapértelmezett: TODO oldal
      return <Dashboard />;
  }
};

export default SmartboardRouter;
