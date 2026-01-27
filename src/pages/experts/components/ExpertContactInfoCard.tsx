import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PHONE_PREFIXES = [
  { value: "+36", label: "HU +36" },
  { value: "+420", label: "CZ +420" },
  { value: "+421", label: "SK +421" },
  { value: "+48", label: "PL +48" },
  { value: "+40", label: "RO +40" },
  { value: "+43", label: "AT +43" },
  { value: "+49", label: "DE +49" },
];

interface ExpertContactInfoCardProps {
  formData: {
    email: string;
    phone_prefix: string;
    phone_number: string;
  };
  onChange: (data: Partial<ExpertContactInfoCardProps["formData"]>) => void;
}

export const ExpertContactInfoCard = ({ formData, onChange }: ExpertContactInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-cgp-teal">Kapcsolati információk:</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email:</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="border-cgp-teal"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Telefonszám</Label>
            <Input disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Országhívó:</Label>
            <Select
              value={formData.phone_prefix}
              onValueChange={(value) => onChange({ phone_prefix: value })}
            >
              <SelectTrigger className="border-cgp-teal">
                <SelectValue placeholder="Válassz" />
              </SelectTrigger>
              <SelectContent>
                {PHONE_PREFIXES.map((prefix) => (
                  <SelectItem key={prefix.value} value={prefix.value}>
                    {prefix.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Input
              type="text"
              value={formData.phone_number}
              onChange={(e) => onChange({ phone_number: e.target.value })}
              className="border-cgp-teal"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
