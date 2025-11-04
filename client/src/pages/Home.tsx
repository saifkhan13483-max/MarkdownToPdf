import { useState } from "react";
import Header from "@/components/Header";
import FileUploader from "@/components/FileUploader";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import ActionBar from "@/components/ActionBar";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [markdown, setMarkdown] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (content: string, filename: string) => {
    setMarkdown(content);
    if (content) {
      toast({
        title: "File loaded",
        description: `${filename} has been loaded successfully.`,
      });
    }
  };

  const handleConvert = async () => {
    setIsConverting(true);
    console.log("Converting to PDF...");
    
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown,
          filename: "document",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Conversion failed");
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Generated",
        description: "Your PDF has been downloaded successfully.",
      });
      console.log("Conversion complete");
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to convert to PDF",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleClear = () => {
    setMarkdown("");
    toast({
      title: "Content cleared",
      description: "All content has been removed.",
    });
    console.log("Content cleared");
  };

  const handleDownloadSample = () => {
    const sampleMarkdown = `# Sample Markdown Document

Welcome to the Markdown to PDF converter!

## Features

This tool allows you to:

- Write or upload Markdown files
- Preview your content in real-time
- Convert to professional PDF documents

## Formatting Examples

You can use **bold**, *italic*, and \`code\` formatting.

### Code Blocks

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

### Blockquotes

> "Markdown makes writing for the web easy."

## Tables

| Feature | Status |
|---------|--------|
| Markdown Support | ✓ |
| PDF Export | ✓ |
| Dark Mode | ✓ |

---

**Ready to convert?** Click the "Convert to PDF" button below!
`;
    setMarkdown(sampleMarkdown);
    toast({
      title: "Sample loaded",
      description: "Sample markdown content has been loaded.",
    });
    console.log("Sample loaded");
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 py-6">
          {!markdown ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-2xl">
                <FileUploader onFileSelect={handleFileSelect} />
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Or start typing directly in the editor
                  </p>
                  <button
                    onClick={handleDownloadSample}
                    className="text-sm text-primary hover:underline mt-2"
                    data-testid="link-load-sample"
                  >
                    Load a sample document
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6 h-full">
              <div className="border rounded-lg flex flex-col overflow-hidden">
                <MarkdownEditor value={markdown} onChange={setMarkdown} />
              </div>
              <div className="border rounded-lg flex flex-col overflow-hidden">
                <MarkdownPreview markdown={markdown} />
              </div>
            </div>
          )}
        </div>
      </div>

      <ActionBar
        onConvert={handleConvert}
        onClear={handleClear}
        onDownloadSample={handleDownloadSample}
        isConverting={isConverting}
        hasContent={!!markdown}
      />
    </div>
  );
}
