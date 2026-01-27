import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface EapOnlineTextFieldsProps {
  shortDescription: string;
  longDescription: string;
  onShortDescriptionChange: (value: string) => void;
  onLongDescriptionChange: (value: string) => void;
  maxShortLength?: number;
  maxLongLength?: number;
}

export const EapOnlineTextFields = ({
  shortDescription,
  longDescription,
  onShortDescriptionChange,
  onLongDescriptionChange,
  maxShortLength = 150,
  maxLongLength = 1000,
}: EapOnlineTextFieldsProps) => {
  const shortRemaining = maxShortLength - (shortDescription?.length || 0);
  const longRemaining = maxLongLength - (longDescription?.length || 0);

  return (
    <div className="space-y-4">
      {/* Rövid bemutatkozás */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Rövid bemutatkozás
        </Label>
        <Input
          value={shortDescription || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= maxShortLength) {
              onShortDescriptionChange(value);
            }
          }}
          placeholder="Rövid, egy-két mondatos bemutatkozás..."
          maxLength={maxShortLength}
        />
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            Ez jelenik meg a szakértő kártyáján
          </span>
          <span className={shortRemaining < 20 ? "text-orange-500" : "text-muted-foreground"}>
            {shortDescription?.length || 0} / {maxShortLength}
          </span>
        </div>
      </div>

      {/* Részletes bemutatkozás */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Részletes bemutatkozás
        </Label>
        <Textarea
          value={longDescription || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= maxLongLength) {
              onLongDescriptionChange(value);
            }
          }}
          placeholder="Részletes bemutatkozó szöveg a szakértő profiljához..."
          rows={5}
          maxLength={maxLongLength}
          className="resize-none"
        />
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            Ez a szöveg jelenik meg a részletes profil oldalon
          </span>
          <span className={longRemaining < 100 ? "text-orange-500" : "text-muted-foreground"}>
            {longDescription?.length || 0} / {maxLongLength}
          </span>
        </div>
      </div>
    </div>
  );
};
