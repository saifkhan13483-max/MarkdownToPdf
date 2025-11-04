import { Textarea } from "@/components/ui/textarea";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground" data-testid="text-editor-title">
          Markdown Input
        </h2>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span data-testid="text-word-count">{wordCount} words</span>
          <span data-testid="text-char-count">{charCount} characters</span>
        </div>
      </div>
      <div className="flex-1 p-6">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Start typing your markdown here..."
          className="h-full resize-none font-mono text-sm border-0 focus-visible:ring-0 p-0"
          data-testid="textarea-markdown"
        />
      </div>
    </div>
  );
}
