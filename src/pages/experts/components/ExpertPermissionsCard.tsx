import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Permission } from "@/types/expert";

interface ExpertPermissionsCardProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onPermissionsChange: (ids: string[]) => void;
}

export const ExpertPermissionsCard = ({
  permissions,
  selectedPermissions,
  onPermissionsChange,
}: ExpertPermissionsCardProps) => {
  const handleToggle = (id: string) => {
    if (selectedPermissions.includes(id)) {
      onPermissionsChange(selectedPermissions.filter((p) => p !== id));
    } else {
      onPermissionsChange([...selectedPermissions, id]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-cgp-teal">Jogosultságok:</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {permissions.map((permission) => (
            <div
              key={permission.id}
              className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-muted"
              onClick={() => handleToggle(permission.id)}
            >
              <Checkbox checked={selectedPermissions.includes(permission.id)} />
              <span>{permission.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
