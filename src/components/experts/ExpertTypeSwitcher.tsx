import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Building2, User } from "lucide-react";

interface ExpertTypeSwitcherProps {
  value: "individual" | "company";
  onChange: (value: "individual" | "company") => void;
  disabled?: boolean;
}

export const ExpertTypeSwitcher = ({ value, onChange, disabled }: ExpertTypeSwitcherProps) => {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">Profil típusa</h2>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as "individual" | "company")}
        className="grid grid-cols-2 gap-4"
        disabled={disabled}
      >
        <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
          value === "individual" ? "border-cgp-teal bg-cgp-teal/5" : "border-muted hover:border-muted-foreground/30"
        }`}>
          <RadioGroupItem value="individual" id="individual" />
          <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer flex-1">
            <User className="w-5 h-5 text-cgp-teal" />
            <div>
              <span className="font-medium block">Egyéni szakértő</span>
              <span className="text-sm text-muted-foreground">Személyes profil</span>
            </div>
          </Label>
        </div>
        <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
          value === "company" ? "border-cgp-teal bg-cgp-teal/5" : "border-muted hover:border-muted-foreground/30"
        }`}>
          <RadioGroupItem value="company" id="company" />
          <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer flex-1">
            <Building2 className="w-5 h-5 text-cgp-teal" />
            <div>
              <span className="font-medium block">Cég</span>
              <span className="text-sm text-muted-foreground">Céges profil csapattagokkal</span>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
