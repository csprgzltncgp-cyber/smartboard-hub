import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Check, Star, StarOff } from "lucide-react";
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
import { getUserById, updateUserSmartboardPermissions } from "@/stores/userStore";
import { SMARTBOARDS, SmartboardConfig } from "@/config/smartboards";
import { User, UserSmartboardPermission } from "@/types/user";
import { toast } from "sonner";

const UserPermissions = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserSmartboardPermission[]>([]);

  // Get always-enabled smartboards (like search)
  const alwaysEnabledSmartboards = SMARTBOARDS.filter(sb => sb.alwaysEnabled);

  useEffect(() => {
    if (userId) {
      const foundUser = getUserById(userId);
      if (foundUser) {
        setUser(foundUser);
        // Merge user permissions with always-enabled smartboards
        const userPerms = [...foundUser.smartboardPermissions];
        alwaysEnabledSmartboards.forEach(sb => {
          if (!userPerms.some(p => p.smartboardId === sb.id)) {
            userPerms.push({
              smartboardId: sb.id,
              isDefault: false,
              enabledMenuItems: sb.menuItems.map(m => m.id),
            });
          }
        });
        setPermissions(userPerms);
      } else {
        toast.error("Felhasználó nem található");
        navigate("/dashboard/users");
      }
    }
  }, [userId, navigate]);

  const isSmartboardEnabled = (smartboardId: string): boolean => {
    return permissions.some(p => p.smartboardId === smartboardId);
  };

  const isDefaultSmartboard = (smartboardId: string): boolean => {
    return permissions.some(p => p.smartboardId === smartboardId && p.isDefault);
  };

  const getEnabledMenuItems = (smartboardId: string): string[] => {
    const permission = permissions.find(p => p.smartboardId === smartboardId);
    return permission?.enabledMenuItems || [];
  };

  const toggleSmartboard = (smartboard: SmartboardConfig) => {
    const existing = permissions.find(p => p.smartboardId === smartboard.id);
    
    if (existing) {
      // Remove smartboard
      const newPermissions = permissions.filter(p => p.smartboardId !== smartboard.id);
      // If this was the default, set another one as default
      if (existing.isDefault && newPermissions.length > 0) {
        newPermissions[0].isDefault = true;
      }
      setPermissions(newPermissions);
    } else {
      // Add smartboard with all menu items enabled
      const newPermission: UserSmartboardPermission = {
        smartboardId: smartboard.id,
        isDefault: permissions.length === 0, // First one becomes default
        enabledMenuItems: smartboard.menuItems.map(m => m.id),
      };
      setPermissions([...permissions, newPermission]);
    }
  };

  const setAsDefault = (smartboardId: string) => {
    setPermissions(permissions.map(p => ({
      ...p,
      isDefault: p.smartboardId === smartboardId,
    })));
  };

  const toggleMenuItem = (smartboardId: string, menuItemId: string) => {
    setPermissions(permissions.map(p => {
      if (p.smartboardId !== smartboardId) return p;
      
      const currentItems = p.enabledMenuItems;
      const isEnabled = currentItems.includes(menuItemId);
      
      return {
        ...p,
        enabledMenuItems: isEnabled
          ? currentItems.filter(id => id !== menuItemId)
          : [...currentItems, menuItemId],
      };
    }));
  };

  const toggleAllMenuItems = (smartboard: SmartboardConfig, enable: boolean) => {
    setPermissions(permissions.map(p => {
      if (p.smartboardId !== smartboard.id) return p;
      return {
        ...p,
        enabledMenuItems: enable ? smartboard.menuItems.map(m => m.id) : [],
      };
    }));
  };

  const handleSave = () => {
    if (userId) {
      updateUserSmartboardPermissions(userId, permissions);
      toast.success("Jogosultságok mentve");
      navigate("/dashboard/users");
    }
  };

  if (!user) {
    return <div>Betöltés...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/users")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-calibri-bold">Felhasználó jogosultságok</h1>
          <p className="text-muted-foreground">{user.name} ({user.email})</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Útmutató:</strong> Válaszd ki, mely SmartBoard-okhoz férhet hozzá a felhasználó. 
          Minden SmartBoard-nál egyenként ki/be kapcsolhatod a menüpontokat. 
          A csillaggal jelölt SmartBoard lesz a nyitóoldal bejelentkezés után.
        </p>
      </div>

      {/* SmartBoards */}
      <div className="space-y-4 mb-6">
        <Accordion type="multiple" className="space-y-2">
          {SMARTBOARDS.filter(sb => sb.id !== "client" && sb.id !== "expert").map((smartboard) => {
            const enabled = isSmartboardEnabled(smartboard.id);
            const isDefault = isDefaultSmartboard(smartboard.id);
            const enabledItems = getEnabledMenuItems(smartboard.id);
            
            return (
              <AccordionItem 
                key={smartboard.id} 
                value={smartboard.id}
                className={`bg-white border rounded-xl overflow-hidden ${
                  enabled ? "border-primary/50" : ""
                }`}
              >
                <div className="flex items-center gap-4 px-4 py-2">
                  {/* Enable/Disable Checkbox - disabled for always-enabled smartboards */}
                  <Checkbox
                    id={`sb-${smartboard.id}`}
                    checked={enabled}
                    onCheckedChange={() => toggleSmartboard(smartboard)}
                    disabled={smartboard.alwaysEnabled}
                  />
                  
                  {/* Default Star */}
                  {enabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setAsDefault(smartboard.id);
                      }}
                      title={isDefault ? "Ez a nyitóoldal" : "Beállítás nyitóoldalnak"}
                    >
                      {isDefault ? (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                  
                  <AccordionTrigger className="flex-1 hover:no-underline py-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{smartboard.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {smartboard.description}
                      </span>
                      {enabled && (
                        <Badge variant="secondary" className="ml-2">
                          {enabledItems.length} / {smartboard.menuItems.length} menüpont
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                </div>
                
                <AccordionContent className="px-4 pb-4">
                  {enabled ? (
                    <div className="pt-2 border-t">
                      {/* Quick actions */}
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllMenuItems(smartboard, true)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Mind bekapcsol
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllMenuItems(smartboard, false)}
                        >
                          Mind kikapcsol
                        </Button>
                      </div>
                      
                      {/* Menu items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {smartboard.menuItems.map((menuItem) => {
                          const isMenuEnabled = enabledItems.includes(menuItem.id);
                          return (
                            <div
                              key={menuItem.id}
                              className={`flex items-center gap-3 p-2 rounded-lg border ${
                                isMenuEnabled ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                              }`}
                            >
                              <Checkbox
                                id={`menu-${menuItem.id}`}
                                checked={isMenuEnabled}
                                onCheckedChange={() => toggleMenuItem(smartboard.id, menuItem.id)}
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
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      Kapcsold be a SmartBoard-ot a menüpontok beállításához.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Summary */}
      {permissions.length > 0 && (
        <div className="bg-white rounded-xl border p-4 mb-6">
          <h3 className="font-semibold mb-2">Összegzés</h3>
          <div className="flex flex-wrap gap-2">
            {permissions.map(p => {
              const sb = SMARTBOARDS.find(s => s.id === p.smartboardId);
              return (
                <Badge 
                  key={p.smartboardId}
                  variant={p.isDefault ? "default" : "secondary"}
                  className={p.isDefault ? "bg-primary" : ""}
                >
                  {sb?.name}
                  {p.isDefault && " (nyitóoldal)"}
                  {" - "}
                  {p.enabledMenuItems.length} menüpont
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Mentés
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/users")}
        >
          Mégse
        </Button>
      </div>
    </div>
  );
};

export default UserPermissions;
