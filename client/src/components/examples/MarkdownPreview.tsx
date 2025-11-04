import MarkdownPreview from "../MarkdownPreview";

export default function MarkdownPreviewExample() {
  const sampleMarkdown = `# Sample Document

This is a **preview** of how your markdown will look.

## Features

- Clean typography
- Code highlighting
- Tables and lists

\`\`\`javascript
console.log("Hello World");
\`\`\`
`;

  return (
    <div className="h-96 border rounded-lg">
      <MarkdownPreview markdown={sampleMarkdown} />
    </div>
  );
}
