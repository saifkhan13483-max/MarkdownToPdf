import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { useRef, useState } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFileSelect: (content: string, file: File) => void;
  uploadedFile: { name: string; size: number } | null;
}

export default function MarkdownEditor({ value, onChange, onFileSelect, uploadedFile }: MarkdownEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;

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
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileSelect(content, file);
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileSelect(content, file);
      };
      reader.readAsText(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground" data-testid="text-editor-title">
          Markdown Input
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
          {uploadedFile && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span className="truncate max-w-[120px] sm:max-w-none">{uploadedFile.name}</span>
              <span className="hidden sm:inline">({formatFileSize(uploadedFile.size)})</span>
            </div>
          )}
          <div id="editor-stats" className="flex gap-2 sm:gap-4 text-xs text-muted-foreground" aria-live="polite">
            <span data-testid="text-word-count" aria-label={`${wordCount} words`}>{wordCount} words</span>
            <span data-testid="text-char-count" aria-label={`${charCount} characters`} className="hidden sm:inline">{charCount} characters</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
            aria-label="Upload markdown file"
            data-testid="button-upload-file"
          >
            <Upload className="w-3 h-3" />
            Upload .md
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="File input for markdown documents"
          />
        </div>
      </div>
      <div
        className={`flex-1 p-6 relative ${isDragging ? 'bg-accent/50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-accent/80 z-10 pointer-events-none">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Drop your .md file here</p>
            </div>
          </div>
        )}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Start typing your markdown here...

Or drag and drop a .md file, or click 'Upload .md' above"
          className="h-full resize-none font-mono text-sm border-0 focus-visible:ring-0 p-0"
          data-testid="textarea-markdown"
          aria-label="Markdown editor input"
          aria-describedby="editor-stats"
        />
      </div>
    </div>
  );
}
