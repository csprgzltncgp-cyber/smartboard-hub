import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, Trash2, Crop as CropIcon, Image } from "lucide-react";
import { toast } from "sonner";

interface EapOnlineImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  maxSizeKB?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const EapOnlineImageUpload = ({
  value,
  onChange,
  maxSizeKB = 500,
}: EapOnlineImageUploadProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > maxSizeKB * 2) { // Allow larger initial size since we'll crop
        toast.error(`A fájl mérete túl nagy. Maximum ${maxSizeKB * 2} KB engedélyezett.`);
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
        setDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio
  }, []);

  const getCroppedImage = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!imgRef.current || !completedCrop) {
        reject(new Error("No image or crop data"));
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No canvas context"));
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas size to desired output size (max 300x300)
      const outputSize = Math.min(300, completedCrop.width * scaleX, completedCrop.height * scaleY);
      canvas.width = outputSize;
      canvas.height = outputSize;

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        outputSize,
        outputSize
      );

      // Convert to base64 with quality adjustment for size
      let quality = 0.9;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      
      // Reduce quality until file size is acceptable
      while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) { // 1.37 is base64 overhead factor
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      if (dataUrl.length > maxSizeKB * 1024 * 1.37) {
        reject(new Error("Cannot compress image enough"));
        return;
      }

      resolve(dataUrl);
    });
  }, [completedCrop, maxSizeKB]);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImage();
      onChange(croppedImage);
      setDialogOpen(false);
      setImageSrc("");
      toast.success("Kép sikeresen mentve");
    } catch {
      toast.error("Hiba a kép feldolgozásakor. Próbálj kisebb képet választani.");
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Profilkép</span>
      </div>

      {value ? (
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={value}
              alt="EAP Online profile"
              className="w-24 h-24 rounded-lg object-cover border"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
            >
              <CropIcon className="w-4 h-4 mr-2" />
              Új kép választása
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Törlés
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          className="w-full h-24 border-dashed"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Kép feltöltése (max {maxSizeKB} KB)</span>
          </div>
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Négyzet alakú profilkép. A kép automatikusan méretezésre kerül.
      </p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CropIcon className="w-5 h-5" />
              Kép vágása
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop={false}
                className="max-h-96"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-96"
                />
              </ReactCrop>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleSave} disabled={!completedCrop}>
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
