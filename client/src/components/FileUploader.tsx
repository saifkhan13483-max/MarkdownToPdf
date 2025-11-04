import { Upload, File, X } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileUploaderProps {
  onFileSelect: (content: string, filename: string) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".md")) {
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelect(content, file.name);
      console.log("File loaded:", file.name);
    };
    reader.readAsText(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileSelect("", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    console.log("File removed");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div>
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            hover-elevate active-elevate-2 transition-colors
            ${isDragging ? "border-primary bg-primary/5" : "border-border"}
          `}
          onClick={() => fileInputRef.current?.click()}
          data-testid="dropzone-file-upload"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" data-testid="icon-upload" />
          <p className="text-base font-medium mb-2" data-testid="text-upload-title">
            Drop your Markdown file here
          </p>
          <p className="text-sm text-muted-foreground" data-testid="text-upload-subtitle">
            or click to browse (.md files only)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            onChange={handleFileInput}
            className="hidden"
            data-testid="input-file"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-6 flex items-center gap-4" data-testid="card-file-selected">
          <File className="w-10 h-10 text-primary" data-testid="icon-file" />
          <div className="flex-1">
            <p className="font-medium" data-testid="text-filename">
              {selectedFile.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" data-testid="badge-filetype">
                Markdown
              </Badge>
              <span className="text-sm text-muted-foreground" data-testid="text-filesize">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRemove}
            data-testid="button-remove-file"
            aria-label="Remove file"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
