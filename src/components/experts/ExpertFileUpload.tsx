import { useState, useRef } from "react";
import { Upload, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExpertFile {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
}

interface ExpertFileUploadProps {
  label: string;
  expertId: string;
  fileType: "contract" | "certificate";
  files: ExpertFile[];
  onFilesChange: (files: ExpertFile[]) => void;
}

export const ExpertFileUpload = ({
  label,
  expertId,
  fileType,
  files,
  onFilesChange,
}: ExpertFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(selectedFiles)) {
        // Upload to storage
        const filePath = `${expertId}/${fileType}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("expert-documents")
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Hiba a fájl feltöltésekor: ${file.name}`);
          continue;
        }

        // Save to database
        const { data: newFile, error: dbError } = await supabase
          .from("expert_files")
          .insert({
            expert_id: expertId,
            filename: file.name,
            file_path: filePath,
            file_type: fileType,
          })
          .select()
          .single();

        if (dbError) {
          toast.error(`Hiba az adatbázisba mentéskor: ${file.name}`);
          // Rollback storage upload
          await supabase.storage.from("expert-documents").remove([filePath]);
          continue;
        }

        onFilesChange([...files, newFile]);
        toast.success(`${file.name} sikeresen feltöltve`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Hiba a feltöltés során");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = async (file: ExpertFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("expert-documents")
        .download(file.file_path);

      if (error) {
        toast.error("Hiba a letöltés során");
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Hiba a letöltés során");
    }
  };

  const handleDelete = async (file: ExpertFile) => {
    try {
      // Delete from storage
      await supabase.storage.from("expert-documents").remove([file.file_path]);

      // Delete from database
      await supabase.from("expert_files").delete().eq("id", file.id);

      onFilesChange(files.filter((f) => f.id !== file.id));
      toast.success("Fájl sikeresen törölve");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Hiba a törlés során");
    }
  };

  return (
    <div className="space-y-3">
      {/* Label and Upload button */}
      <div className="flex items-center justify-between gap-4 p-3 border-2 border-cgp-teal rounded-lg bg-white">
        <span className="text-cgp-teal font-medium">{label}</span>
        <Button
          type="button"
          variant="default"
          className="bg-cgp-teal hover:bg-cgp-teal/90 text-white"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Feltöltés..." : "Feltöltés"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          multiple
        />
      </div>

      {/* File list */}
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
        >
          <span className="text-cgp-teal text-sm truncate flex-1">
            {file.filename}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="bg-cgp-teal hover:bg-cgp-teal/90 text-white"
              onClick={() => handleDownload(file)}
            >
              <Download className="w-4 h-4 mr-1" />
              Letöltés
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(file)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Törlés
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
