import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ExpertBasicInfoCardProps {
  formData: {
    name: string;
    is_cgp_employee: boolean;
    is_eap_online_expert: boolean;
  };
  onChange: (data: Partial<ExpertBasicInfoCardProps["formData"]>) => void;
}

export const ExpertBasicInfoCard = ({ formData, onChange }: ExpertBasicInfoCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Név:</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="border-cgp-teal"
          />
        </div>

        <div className="flex items-center justify-between p-4 border-2 border-cgp-teal rounded-lg">
          <span className="text-cgp-teal">CGP munkatárs</span>
          <Checkbox
            id="is_cgp_employee"
            checked={formData.is_cgp_employee}
            onCheckedChange={(checked) => onChange({ is_cgp_employee: !!checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border-2 border-cgp-teal rounded-lg">
          <span className="text-cgp-teal">EAP online szakértő</span>
          <Checkbox
            id="is_eap_online_expert"
            checked={formData.is_eap_online_expert}
            onCheckedChange={(checked) => onChange({ is_eap_online_expert: !!checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
