import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface SelectEntityCountriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countries: Country[];
  selectedCountryIds: string[];
  entityCountryIds: string[];
  onConfirm: (countryIds: string[]) => void;
}

export const SelectEntityCountriesDialog = ({
  open,
  onOpenChange,
  countries,
  selectedCountryIds,
  entityCountryIds,
  onConfirm,
}: SelectEntityCountriesDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(entityCountryIds);

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedIds(entityCountryIds);
    }
  }, [open, entityCountryIds]);

  // Filter to only show countries that are selected for this company
  const availableCountries = countries.filter((c) => selectedCountryIds.includes(c.id));

  const handleToggle = (countryId: string) => {
    setSelectedIds((prev) =>
      prev.includes(countryId)
        ? prev.filter((id) => id !== countryId)
        : [...prev, countryId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Több entitás országonként
          </DialogTitle>
          <DialogDescription>
            Válaszd ki, mely országokban szeretnél több szerződött entitást kezelni.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {availableCountries.map((country) => (
            <div
              key={country.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => handleToggle(country.id)}
            >
              <Checkbox
                id={`country-${country.id}`}
                checked={selectedIds.includes(country.id)}
                onCheckedChange={() => handleToggle(country.id)}
              />
              <Label
                htmlFor={`country-${country.id}`}
                className="flex-1 cursor-pointer font-medium"
              >
                {country.name}
              </Label>
            </div>
          ))}

          {availableCountries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nincs kiválasztott ország. Először válassz országokat a cég profiljához.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Mégse
          </Button>
          <Button onClick={handleConfirm} disabled={availableCountries.length === 0}>
            Mentés
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
