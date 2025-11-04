import { Button } from "@/components/ui/button";
import { Download, Trash2, FileDown, Loader2, FileCode, ExternalLink, Share2 } from "lucide-react";
import OptionsPanel from "./OptionsPanel";

interface ActionBarProps {
  onDownloadPdf: () => void;
  onOpenPdf: () => void;
  onSharePdf: () => void;
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
  onDownloadPdf,
  onOpenPdf,
  onSharePdf,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <OptionsPanel options={options} onOptionsChange={onOptionsChange} />
      </div>
      <div className="border-t">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 sm:gap-4 px-4 sm:px-6 py-4">
          <Button
            onClick={onDownloadPdf}
            disabled={!hasContent || isConverting}
            size="default"
            className="gap-2 flex-1 sm:flex-initial"
            data-testid="button-download-pdf"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" data-testid="icon-loading" />
                <span className="hidden sm:inline">Converting...</span>
                <span className="sm:hidden">Converting</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" data-testid="icon-download" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </>
            )}
          </Button>
          <Button
            onClick={onOpenPdf}
            disabled={!hasContent || isConverting}
            variant="outline"
            size="default"
            className="gap-2"
            data-testid="button-open-pdf"
            aria-label="Open PDF in new tab"
          >
            <ExternalLink className="w-4 h-4" data-testid="icon-open" />
            <span className="hidden lg:inline">Open in New Tab</span>
            <span className="lg:hidden">Open</span>
          </Button>
          <Button
            onClick={onSharePdf}
            disabled={!hasContent || isConverting}
            variant="outline"
            size="default"
            className="gap-2"
            data-testid="button-share-pdf"
            aria-label="Get shareable link to PDF"
          >
            <Share2 className="w-4 h-4" data-testid="icon-share" />
            <span className="hidden lg:inline">Get Shareable Link</span>
            <span className="lg:hidden">Share</span>
          </Button>
          <Button
            variant="outline"
            onClick={onDownloadHTML}
            disabled={!hasContent}
            size="default"
            className="gap-2"
            aria-label="Download as HTML file"
            data-testid="button-download-html"
          >
            <FileCode className="w-4 h-4" />
            <span className="hidden md:inline">Download HTML</span>
            <span className="md:hidden">HTML</span>
          </Button>
          <Button
            variant="outline"
            onClick={onClear}
            disabled={!hasContent}
            size="default"
            className="gap-2"
            data-testid="button-clear"
            aria-label="Clear all content"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
          <Button
            variant="ghost"
            onClick={onDownloadSample}
            size="default"
            className="gap-2 sm:ml-auto"
            data-testid="button-sample"
            aria-label="Load sample markdown content"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden md:inline">Load Sample</span>
            <span className="md:hidden">Sample</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
