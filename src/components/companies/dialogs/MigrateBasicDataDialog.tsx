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
import { useState } from "react";
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
  const [basicDataCountryId, setBasicDataCountryId] = useState<string>(
    countries[0]?.id || ""
  );
  const [invoicingCountryId, setInvoicingCountryId] = useState<string>(
    countries[0]?.id || ""
  );

  const handleConfirm = () => {
    onConfirm(
      hasBasicData ? basicDataCountryId : null,
      hasInvoicingData ? invoicingCountryId : null
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Meglévő adatok migrálása
          </DialogTitle>
          <DialogDescription>
            Az "Alapadatok országonként különbözőek" opció bekapcsolásához meg kell határozni,
            hogy a már meglévő adatok melyik országhoz kerüljenek.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasBasicData && (
            <div className="space-y-2">
              <Label>Melyik ország alá kerüljön a meglévő Alapadatok?</Label>
              <Select value={basicDataCountryId} onValueChange={setBasicDataCountryId}>
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
              <p className="text-xs text-muted-foreground">
                A szerződési adatok (ár, szerződéshordozó, stb.) ehhez az országhoz lesznek rendelve.
              </p>
            </div>
          )}

          {hasInvoicingData && (
            <div className="space-y-2">
              <Label>Melyik ország alá kerüljön a meglévő Számlázási adat?</Label>
              <Select value={invoicingCountryId} onValueChange={setInvoicingCountryId}>
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
              <p className="text-xs text-muted-foreground">
                A számlázási sablonok és beállítások ehhez az országhoz lesznek rendelve.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Mégse
          </Button>
          <Button onClick={handleConfirm}>
            Megerősítés és folytatás
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
