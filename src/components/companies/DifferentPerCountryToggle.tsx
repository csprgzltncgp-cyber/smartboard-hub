import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DifferentPerCountryToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const DifferentPerCountryToggle = ({
  label = "Országonként különböző",
  checked,
  onChange,
  disabled = false,
}: DifferentPerCountryToggleProps) => {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "flex items-center justify-between cursor-pointer border-2 border-primary rounded-lg px-3 py-2 min-w-[200px] transition-colors",
        checked && "bg-cgp-teal-light/20",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className="text-sm text-primary">{label}</span>
      <div className={cn(
        "w-10 h-10 flex items-center justify-center border-l-2 border-primary -mr-3 -my-2 cursor-pointer transition-colors",
        checked && "bg-cgp-teal-light/30"
      )}>
        {checked ? (
          <Check className="h-5 w-5 text-cgp-teal" />
        ) : (
          <X className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};
