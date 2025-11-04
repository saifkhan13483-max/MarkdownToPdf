import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Code, Loader2 } from "lucide-react";
import { renderMarkdown, type MarkdownRenderResult } from "@/lib/markdown";

interface MarkdownPreviewProps {
  markdown: string;
}

export default function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const [rendered, setRendered] = useState<MarkdownRenderResult>({ html: "", sanitizedHtml: "" });
  const [showRawHTML, setShowRawHTML] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (markdown) {
      setIsRendering(true);
      
      const timeoutId = setTimeout(() => {
        const result = renderMarkdown(markdown);
        setRendered(result);
        setIsRendering(false);
      }, markdown.length > 5000 ? 100 : 0);

      return () => clearTimeout(timeoutId);
    } else {
      setRendered({ html: "", sanitizedHtml: "" });
      setIsRendering(false);
    }
  }, [markdown]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground" data-testid="text-preview-title">
          Preview
        </h2>
        <div className="flex items-center gap-2">
          {isRendering && (
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          )}
          {rendered.html && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRawHTML(!showRawHTML)}
              className="gap-2"
              aria-label={showRawHTML ? "Show rendered preview" : "Show raw HTML code"}
              data-testid="button-toggle-view"
            >
              {showRawHTML ? (
                <>
                  <Eye className="w-3 h-3" />
                  Show Rendered
                </>
              ) : (
                <>
                  <Code className="w-3 h-3" />
                  Show Raw HTML
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {isRendering ? (
            <div className="space-y-4" data-testid="skeleton-loading">
              <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
              <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
              <div className="h-24 bg-muted rounded animate-pulse mt-4" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          ) : rendered.sanitizedHtml ? (
            showRawHTML ? (
              <pre className="text-xs font-mono bg-muted p-4 rounded overflow-x-auto">
                <code>{rendered.html}</code>
              </pre>
            ) : (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: rendered.sanitizedHtml }}
                data-testid="content-preview"
                role="article"
                aria-label="Rendered markdown preview"
              />
            )
          ) : (
            <p className="text-muted-foreground text-center py-12" data-testid="text-preview-empty">
              Your preview will appear here
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
