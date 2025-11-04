import { Button } from "@/components/ui/button";
import { Download, Trash2, FileDown, Loader2, FileCode } from "lucide-react";
import OptionsPanel from "./OptionsPanel";

interface ActionBarProps {
  onConvert: () => void;
  onClear: () => void;
  onDownloadSample: () => void;
  onDownloadHTML: () => void;
  isConverting: boolean;
  hasContent: boolean;
  options: {
    pageSize: string;
    orientation: string;
    margins: string;
    theme: string;
    template: string;
  };
  onOptionsChange: (options: any) => void;
}

export default function ActionBar({
  onConvert,
  onClear,
  onDownloadSample,
  onDownloadHTML,
  isConverting,
  hasContent,
  options,
  onOptionsChange,
}: ActionBarProps) {
  return (
    <div className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <OptionsPanel options={options} onOptionsChange={onOptionsChange} />
      </div>
      <div className="border-t">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-6 py-4">
          <Button
            onClick={onConvert}
            disabled={!hasContent || isConverting}
            size="lg"
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
            onClick={onDownloadHTML}
            disabled={!hasContent}
            className="gap-2"
          >
            <FileCode className="w-4 h-4" />
            Download HTML
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
      </div>
    </div>
  );
}
