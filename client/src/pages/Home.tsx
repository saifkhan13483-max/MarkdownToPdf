import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import ActionBar from "@/components/ActionBar";
import ProgressModal from "@/components/ProgressModal";
import { useToast } from "@/hooks/use-toast";
import { renderMarkdown } from "@/lib/markdown";

export default function Home() {
  const [markdown, setMarkdown] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [options, setOptions] = useState({
    pageSize: "A4",
    orientation: "portrait",
    margins: "medium",
    theme: "light",
    template: "minimal",
  });
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount: abort any in-flight requests and prevent state updates
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const handleFileSelect = (content: string, file: File) => {
    setMarkdown(content);
    setUploadedFile({ name: file.name, size: file.size });
    toast({
      title: "File loaded",
      description: `${file.name} has been loaded successfully.`,
    });
  };

  const convertToPdf = async (action: "download" | "view" | "share") => {
    if (!markdown) {
      toast({
        title: "No Content",
        description: "Please enter some markdown content before converting.",
        variant: "destructive",
      });
      return;
    }
    
    abortControllerRef.current = new AbortController();
    setIsConverting(true);
    
    try {
      const marginMap: { [key: string]: number } = {
        small: 10,
        medium: 20,
        large: 30,
      };
      
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown,
          filename: uploadedFile?.name.replace(/\.md$/, "") || "document",
          options: {
            pageSize: options.pageSize,
            orientation: options.orientation,
            margin: marginMap[options.margins] || 20,
            theme: options.theme === "print-friendly" ? "print" : options.theme,
            template: options.template,
          },
          action,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to convert to PDF";
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.message || error.error || errorMessage;
          } catch {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      if (action === "share") {
        const data = await response.json();
        if (isMountedRef.current) {
          try {
            await navigator.clipboard.writeText(data.url);
            toast({
              title: "Shareable Link Created",
              description: `Link copied to clipboard! It will expire in 1 hour.`,
            });
          } catch (clipboardError) {
            // Fallback: show the URL in a toast if clipboard access fails
            toast({
              title: "Shareable Link Created",
              description: data.url,
              duration: 10000,
            });
          }
        }
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        if (action === "download") {
          const a = document.createElement("a");
          a.href = url;
          a.download = (uploadedFile?.name.replace(/\.md$/, "") || "document") + ".pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          if (isMountedRef.current) {
            toast({
              title: "PDF Downloaded",
              description: "Your PDF has been downloaded to your device.",
            });
          }
        } else if (action === "view") {
          window.open(url, "_blank");
          
          if (isMountedRef.current) {
            toast({
              title: "PDF Opened",
              description: "Your PDF has been opened in a new tab.",
            });
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        if (isMountedRef.current) {
          toast({
            title: "Conversion Cancelled",
            description: "PDF generation was cancelled.",
          });
        }
      } else {
        console.error("Conversion error:", error);
        
        let errorMessage = "An unexpected error occurred while converting to PDF.";
        
        if (error instanceof Error) {
          if (error.message.includes("Failed to fetch")) {
            errorMessage = "Unable to reach the server. Please check your internet connection.";
          } else if (error.message.includes("NetworkError")) {
            errorMessage = "Network error occurred. Please try again.";
          } else if (error.message.includes("timeout")) {
            errorMessage = "The conversion is taking too long. Please try with a smaller document.";
          } else {
            errorMessage = error.message;
          }
        }
        
        if (isMountedRef.current) {
          toast({
            title: "Conversion Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsConverting(false);
      }
      abortControllerRef.current = null;
    }
  };

  const handleDownloadPdf = () => convertToPdf("download");
  const handleOpenPdf = () => convertToPdf("view");
  const handleSharePdf = () => convertToPdf("share");

  const handleCancelConversion = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsConverting(false);
    }
  };

  const handleDownloadHTML = () => {
    if (!markdown) return;
    
    const { sanitizedHtml } = renderMarkdown(markdown);
    
    const blob = new Blob([sanitizedHtml], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (uploadedFile?.name.replace(/\.md$/, "") || "document") + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "HTML Downloaded",
      description: "Your HTML file has been downloaded successfully.",
    });
  };

  const handleClear = () => {
    setMarkdown("");
    setUploadedFile(null);
    toast({
      title: "Content cleared",
      description: "All content has been removed.",
    });
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
    setUploadedFile(null);
    toast({
      title: "Sample loaded",
      description: "Sample markdown content has been loaded.",
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Skip to main content link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      
      <Header />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Convert Markdown to PDF</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Transform your Markdown documents into beautiful, professional PDFs instantly
            </p>
          </div>
        </div>

        <main id="main-content" className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 pb-6">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 h-full">
              <div className="border rounded-lg flex flex-col overflow-hidden min-h-[300px] md:min-h-0">
                <MarkdownEditor 
                  value={markdown} 
                  onChange={setMarkdown}
                  onFileSelect={handleFileSelect}
                  uploadedFile={uploadedFile}
                />
              </div>
              <div className="border rounded-lg flex flex-col overflow-hidden min-h-[300px] md:min-h-0">
                <MarkdownPreview markdown={markdown} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <ActionBar
        onDownloadPdf={handleDownloadPdf}
        onOpenPdf={handleOpenPdf}
        onSharePdf={handleSharePdf}
        onClear={handleClear}
        onDownloadSample={handleDownloadSample}
        onDownloadHTML={handleDownloadHTML}
        isConverting={isConverting}
        hasContent={!!markdown}
        options={options}
        onOptionsChange={setOptions}
      />

      <ProgressModal
        open={isConverting}
        onCancel={handleCancelConversion}
      />
    </div>
  );
}
