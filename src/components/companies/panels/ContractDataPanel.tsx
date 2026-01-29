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
import { Upload, FileText, X } from "lucide-react";
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
  // Consultation options
  consultationTypes: string[];
  setConsultationTypes: (types: string[]) => void;
  consultationDurations: string[];
  setConsultationDurations: (durations: string[]) => void;
  consultationFormats: string[];
  setConsultationFormats: (formats: string[]) => void;
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
  consultationTypes,
  setConsultationTypes,
  consultationDurations,
  setConsultationDurations,
  consultationFormats,
  setConsultationFormats,
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
      // For now, we'll just simulate it
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

      {/* Consultation Types, Durations, Formats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MultiSelectField
          label="Tanácsadás típusa"
          options={CONSULTATION_TYPES}
          selectedIds={consultationTypes}
          onChange={setConsultationTypes}
          placeholder="Válassz..."
          badgeColor="teal"
        />
        <MultiSelectField
          label="Tanácsadás időtartama"
          options={CONSULTATION_DURATIONS}
          selectedIds={consultationDurations}
          onChange={setConsultationDurations}
          placeholder="Válassz..."
          badgeColor="teal"
        />
        <MultiSelectField
          label="Tanácsadás formája"
          options={CONSULTATION_FORMATS}
          selectedIds={consultationFormats}
          onChange={setConsultationFormats}
          placeholder="Válassz..."
          badgeColor="teal"
        />
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