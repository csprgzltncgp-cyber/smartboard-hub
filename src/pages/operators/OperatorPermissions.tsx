import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getOperatorById, updateOperatorSmartboardPermissions } from "@/stores/operatorStore";
import { getSmartboardById, SMARTBOARDS } from "@/config/smartboards";
import { User, UserSmartboardPermission } from "@/types/user";
import { toast } from "sonner";

const OperatorPermissions = () => {
  const navigate = useNavigate();
  const { operatorId } = useParams<{ operatorId: string }>();
  const [operator, setOperator] = useState<User | null>(null);
  const [enabledMenuItems, setEnabledMenuItems] = useState<string[]>([]);

  // Get operator smartboard config
  const operatorSmartboard = getSmartboardById("operator");

  useEffect(() => {
    if (operatorId) {
      const foundOperator = getOperatorById(operatorId);
      if (foundOperator) {
        setOperator(foundOperator);
        // Get current enabled menu items for operator interface
        const operatorPermission = foundOperator.smartboardPermissions.find(
          p => p.smartboardId === "operator"
        );
        setEnabledMenuItems(operatorPermission?.enabledMenuItems || []);
      } else {
        toast.error("Operátor nem található");
        navigate("/dashboard/settings/operators");
      }
    }
  }, [operatorId, navigate]);

  const toggleMenuItem = (menuItemId: string) => {
    setEnabledMenuItems(prev => {
      if (prev.includes(menuItemId)) {
        return prev.filter(id => id !== menuItemId);
      } else {
        return [...prev, menuItemId];
      }
    });
  };

  const toggleAllMenuItems = (enable: boolean) => {
    if (operatorSmartboard) {
      setEnabledMenuItems(
        enable ? operatorSmartboard.menuItems.map(m => m.id) : []
      );
    }
  };

  const handleSave = () => {
    if (operatorId) {
      const permissions: UserSmartboardPermission[] = [
        {
          smartboardId: "operator",
          isDefault: true,
          enabledMenuItems: enabledMenuItems,
        },
      ];
      updateOperatorSmartboardPermissions(operatorId, permissions);
      toast.success("Jogosultságok mentve");
      navigate("/dashboard/settings/operators");
    }
  };

  if (!operator || !operatorSmartboard) {
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
          <strong>Útmutató:</strong> Az operátor automatikusan az Operátor interfészhez van rendelve. 
          Itt beállíthatod, mely menüpontokhoz férhet hozzá az interfészen belül.
        </p>
      </div>

      {/* Operator Interface Card */}
      <div className="bg-white border rounded-xl overflow-hidden mb-6">
        <div className="flex items-center gap-4 px-4 py-3 bg-primary/10 border-b">
          <Badge variant="default" className="bg-primary">
            Operátor interfész
          </Badge>
          <span className="text-sm text-muted-foreground">
            {operatorSmartboard.description}
          </span>
          <Badge variant="secondary" className="ml-auto">
            {enabledMenuItems.length} / {operatorSmartboard.menuItems.length} menüpont
          </Badge>
        </div>
        
        <div className="p-4">
          {/* Quick actions */}
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllMenuItems(true)}
            >
              <Check className="w-3 h-3 mr-1" />
              Mind bekapcsol
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllMenuItems(false)}
            >
              Mind kikapcsol
            </Button>
          </div>
          
          {/* Menu items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {operatorSmartboard.menuItems.map((menuItem) => {
              const isMenuEnabled = enabledMenuItems.includes(menuItem.id);
              return (
                <div
                  key={menuItem.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isMenuEnabled ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                  }`}
                >
                  <Checkbox
                    id={`menu-${menuItem.id}`}
                    checked={isMenuEnabled}
                    onCheckedChange={() => toggleMenuItem(menuItem.id)}
                  />
                  <Label
                    htmlFor={`menu-${menuItem.id}`}
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
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <h3 className="font-semibold mb-2">Összegzés</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="bg-primary">
            Operátor interfész (nyitóoldal) - {enabledMenuItems.length} menüpont
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
