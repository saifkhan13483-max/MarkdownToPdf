import MarkdownIt from "markdown-it";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (markdown) {
      setHtml(md.render(markdown));
    } else {
      setHtml("");
    }
  }, [markdown]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-6 py-4 border-b">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground" data-testid="text-preview-title">
          Preview
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {html ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
              data-testid="content-preview"
            />
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
