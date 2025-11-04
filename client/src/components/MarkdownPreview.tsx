import MarkdownIt from "markdown-it";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Code } from "lucide-react";

interface MarkdownPreviewProps {
  markdown: string;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export default function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const [html, setHtml] = useState("");
  const [showRawHTML, setShowRawHTML] = useState(false);

  useEffect(() => {
    if (markdown) {
      setHtml(md.render(markdown));
    } else {
      setHtml("");
    }
  }, [markdown]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground" data-testid="text-preview-title">
          Preview
        </h2>
        {html && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRawHTML(!showRawHTML)}
            className="gap-2"
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
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {html ? (
            showRawHTML ? (
              <pre className="text-xs font-mono bg-muted p-4 rounded overflow-x-auto">
                <code>{html}</code>
              </pre>
            ) : (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
                data-testid="content-preview"
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
