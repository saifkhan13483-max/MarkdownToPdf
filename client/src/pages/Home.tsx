import { useState } from "react";
import Header from "@/components/Header";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import ActionBar from "@/components/ActionBar";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [markdown, setMarkdown] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [options, setOptions] = useState({
    pageSize: "A4",
    orientation: "portrait",
    margins: "medium",
    theme: "light",
  });
  const { toast } = useToast();

  const handleFileSelect = (content: string, file: File) => {
    setMarkdown(content);
    setUploadedFile({ name: file.name, size: file.size });
    toast({
      title: "File loaded",
      description: `${file.name} has been loaded successfully.`,
    });
  };

  const handleConvert = async () => {
    if (!markdown) return;
    
    setIsConverting(true);
    
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown,
          filename: uploadedFile?.name.replace(/\.md$/, "") || "document",
          options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Conversion failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (uploadedFile?.name.replace(/\.md$/, "") || "document") + ".pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Generated",
        description: "Your PDF has been downloaded successfully.",
      });
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

  const handleDownloadHTML = () => {
    if (!markdown) return;
    
    const MarkdownIt = require("markdown-it");
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    const html = md.render(markdown);
    
    const blob = new Blob([html], { type: "text/html" });
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
      <Header />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-7xl w-full mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Convert Markdown to PDF</h2>
            <p className="text-muted-foreground">
              Transform your Markdown documents into beautiful, professional PDFs instantly
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto px-6 pb-6">
            <div className="grid lg:grid-cols-2 gap-6 h-full">
              <div className="border rounded-lg flex flex-col overflow-hidden">
                <MarkdownEditor 
                  value={markdown} 
                  onChange={setMarkdown}
                  onFileSelect={handleFileSelect}
                  uploadedFile={uploadedFile}
                />
              </div>
              <div className="border rounded-lg flex flex-col overflow-hidden">
                <MarkdownPreview markdown={markdown} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActionBar
        onConvert={handleConvert}
        onClear={handleClear}
        onDownloadSample={handleDownloadSample}
        onDownloadHTML={handleDownloadHTML}
        isConverting={isConverting}
        hasContent={!!markdown}
        options={options}
        onOptionsChange={setOptions}
      />
    </div>
  );
}
