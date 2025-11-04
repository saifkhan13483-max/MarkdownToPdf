import MarkdownEditor from "../MarkdownEditor";
import { useState } from "react";

export default function MarkdownEditorExample() {
  const [markdown, setMarkdown] = useState("# Hello World\n\nThis is **markdown**!");

  return (
    <div className="h-96">
      <MarkdownEditor value={markdown} onChange={setMarkdown} />
    </div>
  );
}
