import { Button } from "@/components/ui/button";
import { Download, Trash2, FileDown, Loader2 } from "lucide-react";

interface ActionBarProps {
  onConvert: () => void;
  onClear: () => void;
  onDownloadSample: () => void;
  isConverting: boolean;
  hasContent: boolean;
}

export default function ActionBar({
  onConvert,
  onClear,
  onDownloadSample,
  isConverting,
  hasContent,
}: ActionBarProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-t bg-card">
      <Button
        onClick={onConvert}
        disabled={!hasContent || isConverting}
        className="gap-2"
        data-testid="button-convert"
      >
        {isConverting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" data-testid="icon-loading" />
            Converting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" data-testid="icon-download" />
            Convert to PDF
          </>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={onClear}
        disabled={!hasContent}
        className="gap-2"
        data-testid="button-clear"
      >
        <Trash2 className="w-4 h-4" />
        Clear
      </Button>
      <Button
        variant="ghost"
        onClick={onDownloadSample}
        className="gap-2 ml-auto"
        data-testid="button-sample"
      >
        <FileDown className="w-4 h-4" />
        Load Sample
      </Button>
    </div>
  );
}
