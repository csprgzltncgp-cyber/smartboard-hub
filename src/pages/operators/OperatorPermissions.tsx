import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getOperatorById, updateOperatorSmartboardPermissions } from "@/stores/operatorStore";
import { getSmartboardById } from "@/config/smartboards";
import { User, UserSmartboardPermission } from "@/types/user";
import { toast } from "sonner";

const OperatorPermissions = () => {
  const navigate = useNavigate();
  const { operatorId } = useParams<{ operatorId: string }>();
  const [operator, setOperator] = useState<User | null>(null);
  const [operatorMenuItems, setOperatorMenuItems] = useState<string[]>([]);
  const [searchMenuItems, setSearchMenuItems] = useState<string[]>([]);

  // Get smartboard configs
  const operatorSmartboard = getSmartboardById("operator");
  const searchSmartboard = getSmartboardById("search");

  useEffect(() => {
    if (operatorId) {
      const foundOperator = getOperatorById(operatorId);
      if (foundOperator) {
        setOperator(foundOperator);
        // Get current enabled menu items for operator interface
        const operatorPermission = foundOperator.smartboardPermissions.find(
          p => p.smartboardId === "operator"
        );
        setOperatorMenuItems(operatorPermission?.enabledMenuItems || []);
        
        // Get current enabled menu items for search interface
        const searchPermission = foundOperator.smartboardPermissions.find(
          p => p.smartboardId === "search"
        );
        setSearchMenuItems(searchPermission?.enabledMenuItems || (searchSmartboard?.menuItems.map(m => m.id) || []));
      } else {
        toast.error("Operátor nem található");
        navigate("/dashboard/settings/operators");
      }
    }
  }, [operatorId, navigate]);

  const toggleOperatorMenuItem = (menuItemId: string) => {
    setOperatorMenuItems(prev => {
      if (prev.includes(menuItemId)) {
        return prev.filter(id => id !== menuItemId);
      } else {
        return [...prev, menuItemId];
      }
    });
  };

  const toggleSearchMenuItem = (menuItemId: string) => {
    setSearchMenuItems(prev => {
      if (prev.includes(menuItemId)) {
        return prev.filter(id => id !== menuItemId);
      } else {
        return [...prev, menuItemId];
      }
    });
  };

  const toggleAllOperatorMenuItems = (enable: boolean) => {
    if (operatorSmartboard) {
      setOperatorMenuItems(
        enable ? operatorSmartboard.menuItems.map(m => m.id) : []
      );
    }
  };

  const toggleAllSearchMenuItems = (enable: boolean) => {
    if (searchSmartboard) {
      setSearchMenuItems(
        enable ? searchSmartboard.menuItems.map(m => m.id) : []
      );
    }
  };

  const handleSave = () => {
    if (operatorId) {
      const permissions: UserSmartboardPermission[] = [
        {
          smartboardId: "operator",
          isDefault: true,
          enabledMenuItems: operatorMenuItems,
        },
        {
          smartboardId: "search",
          isDefault: false,
          enabledMenuItems: searchMenuItems,
        },
      ];
      updateOperatorSmartboardPermissions(operatorId, permissions);
      toast.success("Jogosultságok mentve");
      navigate("/dashboard/settings/operators");
    }
  };

  if (!operator || !operatorSmartboard || !searchSmartboard) {
    return <div>Betöltés...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/settings/operators")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-calibri-bold">Operátor jogosultságok</h1>
          <p className="text-muted-foreground">{operator.name} ({operator.email})</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Útmutató:</strong> Az operátor automatikusan az Operátor és Keresés/Szűrés interfészekhez van rendelve. 
          Itt beállíthatod, mely menüpontokhoz férhet hozzá az interfészeken belül.
        </p>
      </div>

      {/* SmartBoard Interfaces */}
      <Accordion type="multiple" defaultValue={["operator", "search"]} className="space-y-4 mb-6">
        {/* Operator Interface Card */}
        <AccordionItem value="operator" className="bg-white border rounded-xl overflow-hidden border-primary/50">
          <div className="flex items-center gap-4 px-4 py-2">
            <Checkbox checked disabled className="opacity-50" />
            <AccordionTrigger className="flex-1 hover:no-underline py-2">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-primary">
                  Operátor interfész (nyitóoldal)
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {operatorSmartboard.description}
                </span>
                <Badge variant="secondary" className="ml-2">
                  {operatorMenuItems.length} / {operatorSmartboard.menuItems.length} menüpont
                </Badge>
              </div>
            </AccordionTrigger>
          </div>
          
          <AccordionContent className="px-4 pb-4">
            <div className="pt-2 border-t">
              {/* Quick actions */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllOperatorMenuItems(true)}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mind bekapcsol
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllOperatorMenuItems(false)}
                >
                  Mind kikapcsol
                </Button>
              </div>
              
              {/* Menu items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {operatorSmartboard.menuItems.map((menuItem) => {
                  const isMenuEnabled = operatorMenuItems.includes(menuItem.id);
                  return (
                    <div
                      key={menuItem.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isMenuEnabled ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                      }`}
                    >
                      <Checkbox
                        id={`opr-menu-${menuItem.id}`}
                        checked={isMenuEnabled}
                        onCheckedChange={() => toggleOperatorMenuItem(menuItem.id)}
                      />
                      <Label
                        htmlFor={`opr-menu-${menuItem.id}`}
                        className={`cursor-pointer flex-1 ${
                          !isMenuEnabled ? "text-muted-foreground" : ""
                        }`}
                      >
                        {menuItem.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Search/Filter Interface Card */}
        <AccordionItem value="search" className="bg-white border rounded-xl overflow-hidden border-primary/50">
          <div className="flex items-center gap-4 px-4 py-2">
            <Checkbox checked disabled className="opacity-50" />
            <AccordionTrigger className="flex-1 hover:no-underline py-2">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  Keresés/Szűrés interfész
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {searchSmartboard.description}
                </span>
                <Badge variant="secondary" className="ml-2">
                  {searchMenuItems.length} / {searchSmartboard.menuItems.length} menüpont
                </Badge>
              </div>
            </AccordionTrigger>
          </div>
          
          <AccordionContent className="px-4 pb-4">
            <div className="pt-2 border-t">
              {/* Quick actions */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllSearchMenuItems(true)}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mind bekapcsol
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllSearchMenuItems(false)}
                >
                  Mind kikapcsol
                </Button>
              </div>
              
              {/* Menu items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {searchSmartboard.menuItems.map((menuItem) => {
                  const isMenuEnabled = searchMenuItems.includes(menuItem.id);
                  return (
                    <div
                      key={menuItem.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isMenuEnabled ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                      }`}
                    >
                      <Checkbox
                        id={`search-menu-${menuItem.id}`}
                        checked={isMenuEnabled}
                        onCheckedChange={() => toggleSearchMenuItem(menuItem.id)}
                      />
                      <Label
                        htmlFor={`search-menu-${menuItem.id}`}
                        className={`cursor-pointer flex-1 ${
                          !isMenuEnabled ? "text-muted-foreground" : ""
                        }`}
                      >
                        {menuItem.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Summary */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <h3 className="font-semibold mb-2">Összegzés</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="bg-primary">
            Operátor interfész (nyitóoldal) - {operatorMenuItems.length} menüpont
          </Badge>
          <Badge variant="secondary">
            Keresés/Szűrés - {searchMenuItems.length} menüpont
          </Badge>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Mentés
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/settings/operators")}
        >
          Mégse
        </Button>
      </div>
    </div>
  );
};

export default OperatorPermissions;
