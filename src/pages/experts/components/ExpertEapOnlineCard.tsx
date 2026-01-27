import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface ExpertEapOnlineCardProps {
  eapOnlineData: {
    description: string;
    image: File | null;
    imagePreview: string;
  };
  onChange: (data: Partial<ExpertEapOnlineCardProps["eapOnlineData"]>) => void;
}

export const ExpertEapOnlineCard = ({ eapOnlineData, onChange }: ExpertEapOnlineCardProps) => {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleRemovePhoto = () => {
    onChange({
      image: null,
      imagePreview: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-cgp-teal">EAP Online beállítások:</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo upload */}
        <div className="space-y-2">
          <Label>Profilkép:</Label>
          <div className="flex items-start gap-4">
            {eapOnlineData.imagePreview ? (
              <div className="relative">
                <img
                  src={eapOnlineData.imagePreview}
                  alt="Profilkép"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6"
                  onClick={handleRemovePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-cgp-teal rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm text-center px-2">
                  Nincs kép
                </span>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              className="border-cgp-teal text-cgp-teal"
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Kép feltöltése
            </Button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Leírás (max. 180 karakter):</Label>
          <Textarea
            value={eapOnlineData.description}
            onChange={(e) => {
              const value = e.target.value.slice(0, 180);
              onChange({ description: value });
            }}
            maxLength={180}
            rows={3}
            className="border-cgp-teal resize-none"
            placeholder="Rövid bemutatkozás..."
          />
          <p className="text-sm text-muted-foreground text-right">
            {eapOnlineData.description.length}/180 karakter
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
