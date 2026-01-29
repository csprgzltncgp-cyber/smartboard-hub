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

interface ContractDataPanelProps {
  contractHolderId: string | null;
  setContractHolderId: (id: string | null) => void;
  contractHolders: ContractHolder[];
  countryDifferentiates: CountryDifferentiate;
  onUpdateDifferentiate: (key: keyof CountryDifferentiate, value: boolean) => void;
  // Contract file
  contractFileUrl: string | null;
  setContractFileUrl: (url: string | null) => void;
  // Contract currency
  contractCurrency: string | null;
  setContractCurrency: (currency: string | null) => void;
  // Pillar/Session
  pillarCount: number | null;
  setPillarCount: (count: number | null) => void;
  sessionCount: number | null;
  setSessionCount: (count: number | null) => void;
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
  contractCurrency,
  setContractCurrency,
  pillarCount,
  setPillarCount,
  sessionCount,
  setSessionCount,
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

      {/* Contract Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
