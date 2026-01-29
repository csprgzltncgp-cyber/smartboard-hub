import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, X, Plus, Trash2 } from "lucide-react";
import { DifferentPerCountryToggle } from "../DifferentPerCountryToggle";
import { CURRENCIES, INDUSTRIES, ContractHolder, CountryDifferentiate } from "@/types/company";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { MultiSelectField } from "@/components/experts/MultiSelectField";

// Price type options
const PRICE_TYPES = [
  { id: "pepm", name: "PEPM" },
  { id: "package", name: "Csomagár" },
];

// Consultation type options
const CONSULTATION_TYPES = [
  { id: "psychology", label: "Pszichológia" },
  { id: "legal", label: "Jog" },
  { id: "finance", label: "Pénzügy" },
  { id: "health_coaching", label: "Health Coaching" },
  { id: "other", label: "Egyéb" },
];

// Consultation duration options
const CONSULTATION_DURATIONS = [
  { id: "30", label: "30 perc" },
  { id: "50", label: "50 perc" },
];

// Consultation format options
const CONSULTATION_FORMATS = [
  { id: "personal", label: "Személyes" },
  { id: "video", label: "Videó" },
  { id: "phone", label: "Telefonos" },
  { id: "chat", label: "Szöveges üzenet (Chat)" },
];

// Consultation row type
export interface ConsultationRow {
  id: string;
  type: string | null;
  durations: string[];
  formats: string[];
}

interface ContractDataPanelProps {
  contractHolderId: string | null;
  setContractHolderId: (id: string | null) => void;
  contractHolders: ContractHolder[];
  countryDifferentiates: CountryDifferentiate;
  onUpdateDifferentiate: (key: keyof CountryDifferentiate, value: boolean) => void;
  // Contract file
  contractFileUrl: string | null;
  setContractFileUrl: (url: string | null) => void;
  // Contract price
  contractPrice: number | null;
  setContractPrice: (price: number | null) => void;
  contractPriceType: string | null;
  setContractPriceType: (type: string | null) => void;
  // Contract currency
  contractCurrency: string | null;
  setContractCurrency: (currency: string | null) => void;
  // Pillar/Session
  pillarCount: number | null;
  setPillarCount: (count: number | null) => void;
  sessionCount: number | null;
  setSessionCount: (count: number | null) => void;
  // Consultation rows (new structure)
  consultationRows: ConsultationRow[];
  setConsultationRows: (rows: ConsultationRow[]) => void;
  // Industry
  industry: string | null;
  setIndustry: (industry: string | null) => void;
  // Show different per country toggle (only for multi-country companies)
  showDifferentPerCountry?: boolean;
}

export const ContractDataPanel = ({
  contractHolderId,
  setContractHolderId,
  contractHolders,
  countryDifferentiates,
  onUpdateDifferentiate,
  contractFileUrl,
  setContractFileUrl,
  contractPrice,
  setContractPrice,
  contractPriceType,
  setContractPriceType,
  contractCurrency,
  setContractCurrency,
  pillarCount,
  setPillarCount,
  sessionCount,
  setSessionCount,
  consultationRows,
  setConsultationRows,
  industry,
  setIndustry,
  showDifferentPerCountry = false,
}: ContractDataPanelProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate PDF
    if (file.type !== "application/pdf") {
      toast.error("Csak PDF fájl tölthető fel!");
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A fájl mérete maximum 10MB lehet!");
      return;
    }

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload to Supabase Storage
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const fakeUrl = `contracts/${Date.now()}_${file.name}`;
      setContractFileUrl(fakeUrl);
      toast.success("Szerződés sikeresen feltöltve!");
    } catch (error) {
      toast.error("Hiba a feltöltés során!");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setContractFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Consultation row handlers
  const addConsultationRow = () => {
    const newRow: ConsultationRow = {
      id: crypto.randomUUID(),
      type: null,
      durations: [],
      formats: [],
    };
    setConsultationRows([...consultationRows, newRow]);
  };

  const removeConsultationRow = (rowId: string) => {
    setConsultationRows(consultationRows.filter((row) => row.id !== rowId));
  };

  const updateConsultationRow = (rowId: string, field: keyof ConsultationRow, value: any) => {
    setConsultationRows(
      consultationRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  // Get available consultation types (exclude already selected ones)
  const getAvailableTypes = (currentRowId: string) => {
    const usedTypes = consultationRows
      .filter((row) => row.id !== currentRowId && row.type)
      .map((row) => row.type);
    return CONSULTATION_TYPES.filter((t) => !usedTypes.includes(t.id));
  };

  return (
    <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
      <h4 className="text-sm font-medium text-primary">Szerződés adatai</h4>

      {/* Contract PDF Upload */}
      <div className="space-y-2">
        <Label>Szerződés (PDF)</Label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          {contractFileUrl ? (
            <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 flex-1">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm truncate flex-1">
                {contractFileUrl.split("/").pop()}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Feltöltés..." : "PDF feltöltése"}
            </Button>
          )}
        </div>
      </div>

      {/* Contract Holder + Different per country toggle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label>Szerződéshordozó</Label>
          <Select
            value={contractHolderId || ""}
            onValueChange={(val) => setContractHolderId(val || null)}
            disabled={countryDifferentiates.contract_holder}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              {contractHolders.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {showDifferentPerCountry && (
          <DifferentPerCountryToggle
            checked={countryDifferentiates.contract_holder}
            onChange={(checked) => onUpdateDifferentiate("contract_holder", checked)}
          />
        )}
      </div>

      {/* Contract Price + Type + Currency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label>Szerződéses ár</Label>
          <Input
            type="number"
            value={contractPrice ?? ""}
            onChange={(e) => setContractPrice(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0"
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label>Ár típusa</Label>
          <Select
            value={contractPriceType || "none"}
            onValueChange={(val) => setContractPriceType(val === "none" ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Válasszon...</SelectItem>
              {PRICE_TYPES.map((pt) => (
                <SelectItem key={pt.id} value={pt.id}>
                  {pt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Szerződéses ár devizanem</Label>
          <Select
            value={contractCurrency || "none"}
            onValueChange={(val) => setContractCurrency(val === "none" ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Válasszon...</SelectItem>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.id} value={curr.id}>
                  {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pillar/Session */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label>Pillér</Label>
          <Input
            type="number"
            value={pillarCount ?? ""}
            onChange={(e) => setPillarCount(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="0"
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label>Alkalom</Label>
          <Input
            type="number"
            value={sessionCount ?? ""}
            onChange={(e) => setSessionCount(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      {/* Consultation Rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Tanácsadás beállítások</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addConsultationRow}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Új sor
          </Button>
        </div>

        {consultationRows.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            Nincs tanácsadás beállítás. Kattints az "Új sor" gombra a hozzáadáshoz.
          </div>
        ) : (
          <div className="space-y-3">
            {consultationRows.map((row, index) => (
              <div
                key={row.id}
                className="bg-background border rounded-lg p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {index + 1}. tanácsadás típus
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConsultationRow(row.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Type selector */}
                  <div className="space-y-1">
                    <Label className="text-xs">Típus</Label>
                    <Select
                      value={row.type || "none"}
                      onValueChange={(val) =>
                        updateConsultationRow(row.id, "type", val === "none" ? null : val)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Válassz típust..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Válassz típust...</SelectItem>
                        {getAvailableTypes(row.id).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label}
                          </SelectItem>
                        ))}
                        {/* Also show the currently selected type if any */}
                        {row.type && !getAvailableTypes(row.id).find((t) => t.id === row.type) && (
                          <SelectItem value={row.type}>
                            {CONSULTATION_TYPES.find((t) => t.id === row.type)?.label}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration multi-select */}
                  <MultiSelectField
                    label="Időtartam"
                    options={CONSULTATION_DURATIONS}
                    selectedIds={row.durations}
                    onChange={(durations) => updateConsultationRow(row.id, "durations", durations)}
                    placeholder="Válassz..."
                    badgeColor="teal"
                  />

                  {/* Format multi-select */}
                  <MultiSelectField
                    label="Forma"
                    options={CONSULTATION_FORMATS}
                    selectedIds={row.formats}
                    onChange={(formats) => updateConsultationRow(row.id, "formats", formats)}
                    placeholder="Válassz..."
                    badgeColor="teal"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label>Iparág</Label>
          <Select
            value={industry || "none"}
            onValueChange={(val) => setIndustry(val === "none" ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válasszon..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Válasszon...</SelectItem>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.id} value={ind.id}>
                  {ind.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
