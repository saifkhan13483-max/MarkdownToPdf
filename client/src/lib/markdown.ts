import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import hljs from "highlight.js";

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code class="language-${lang}">${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`;
      } catch (error) {
        console.error("Syntax highlighting error:", error);
      }
    }
    return `<pre class="hljs"><code>${escapeHtmlBasic(str)}</code></pre>`;
  },
});

function escapeHtmlBasic(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface MarkdownRenderResult {
  html: string;
  sanitizedHtml: string;
}

export function renderMarkdown(markdown: string): MarkdownRenderResult {
  if (!markdown) {
    return { html: "", sanitizedHtml: "" };
  }

  const html = md.render(markdown);
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "em", "u", "s", "code",
      "pre", "blockquote",
      "ul", "ol", "li",
      "table", "thead", "tbody", "tr", "th", "td",
      "a", "img",
      "span", "div",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title",
      "class", "id",
    ],
  });

  return { html, sanitizedHtml };
}

export function escapeHtml(unsafe: string): string {
  return md.utils.escapeHtml(unsafe);
}
