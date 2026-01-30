import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface MigrateBasicDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countries: Country[];
  hasBasicData: boolean;
  hasInvoicingData: boolean;
  onConfirm: (basicDataCountryId: string | null, invoicingCountryId: string | null) => void;
  onCancel: () => void;
}

export const MigrateBasicDataDialog = ({
  open,
  onOpenChange,
  countries,
  hasBasicData,
  hasInvoicingData,
  onConfirm,
  onCancel,
}: MigrateBasicDataDialogProps) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");

  // Reset selection when dialog opens or countries change
  useEffect(() => {
    if (open && countries.length > 0) {
      setSelectedCountryId(countries[0].id);
    }
  }, [open, countries]);

  const handleConfirm = () => {
    if (!selectedCountryId) {
      console.error("No country selected for migration");
      return;
    }
    // Mindkét adat (alapadatok és számlázás) ugyanabba az országba kerül
    onConfirm(
      hasBasicData ? selectedCountryId : null,
      hasInvoicingData ? selectedCountryId : null
    );
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  // Neither has data - shouldn't show dialog but handle gracefully
  if (!hasBasicData && !hasInvoicingData) {
    return null;
  }

  // No countries available
  if (countries.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Meglévő adatok migrálása
          </DialogTitle>
          <DialogDescription>
            Az "Alapadatok országonként különbözőek" opció bekapcsolásával a számlázás is 
            országonként különböző lesz. Válaszd ki, melyik országhoz kerüljenek a már 
            meglévő adatok.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Melyik ország alá kerüljenek a meglévő adatok?</Label>
            <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
              <SelectTrigger>
                <SelectValue placeholder="Válasszon országot..." />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground space-y-1">
              {hasBasicData && (
                <p>• A cégnév, szerződési adatok és minden alapadat ehhez az országhoz lesz rendelve.</p>
              )}
              {hasInvoicingData && (
                <p>• A számlázási sablonok és beállítások szintén ehhez az országhoz lesznek rendelve.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Mégse
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedCountryId}>
            Megerősítés és folytatás
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};