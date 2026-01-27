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

const LANGUAGES = [
  { value: "hu", label: "Magyar" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "cz", label: "Čeština" },
  { value: "sk", label: "Slovenčina" },
  { value: "pl", label: "Polski" },
  { value: "ro", label: "Română" },
];

interface ExpertDashboardCardProps {
  formData: {
    username: string;
    language: string;
  };
  onChange: (data: Partial<ExpertDashboardCardProps["formData"]>) => void;
}

export const ExpertDashboardCard = ({ formData, onChange }: ExpertDashboardCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-cgp-teal">Expert Dashboard információk:</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Felhasználónév:</Label>
          <Input
            value={formData.username}
            onChange={(e) => onChange({ username: e.target.value })}
            className="border-cgp-teal"
          />
        </div>

        <div className="space-y-2">
          <Label>Nyelv:</Label>
          <Select
            value={formData.language}
            onValueChange={(value) => onChange({ language: value })}
          >
            <SelectTrigger className="border-cgp-teal">
              <SelectValue placeholder="Válassz nyelvet" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
