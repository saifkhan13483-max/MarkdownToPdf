import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../../client/src/lib/markdown';

describe('Markdown to HTML Conversion', () => {
  it('should convert simple markdown to HTML', () => {
    const markdown = '# Hello World';
    const result = renderMarkdown(markdown);
    
    expect(result.html).toContain('<h1>Hello World</h1>');
    expect(result.sanitizedHtml).toContain('<h1>Hello World</h1>');
  });

  it('should handle empty markdown', () => {
    const markdown = '';
    const result = renderMarkdown(markdown);
    
    expect(result.html).toBe('');
    expect(result.sanitizedHtml).toBe('');
  });

  it('should convert headings correctly', () => {
    const markdown = `# H1
## H2
### H3`;
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<h1>H1</h1>');
    expect(result.sanitizedHtml).toContain('<h2>H2</h2>');
    expect(result.sanitizedHtml).toContain('<h3>H3</h3>');
  });

  it('should convert bold text correctly', () => {
    const markdown = '**bold text**';
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<strong>bold text</strong>');
  });

  it('should convert italic text correctly', () => {
    const markdown = '*italic text*';
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<em>italic text</em>');
  });

  it('should convert code blocks with syntax highlighting', () => {
    const markdown = '```javascript\nconst x = 5;\n```';
    const result = renderMarkdown(markdown);
    
    expect(result.html).toContain('<pre class="hljs">');
    expect(result.html).toContain('const x = 5;');
  });

  it('should convert inline code correctly', () => {
    const markdown = 'This is `inline code`';
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<code>inline code</code>');
  });

  it('should convert links correctly', () => {
    const markdown = '[OpenAI](https://openai.com)';
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<a href="https://openai.com">OpenAI</a>');
  });

  it('should convert unordered lists correctly', () => {
    const markdown = `- Item 1
- Item 2
- Item 3`;
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<ul>');
    expect(result.sanitizedHtml).toContain('<li>Item 1</li>');
    expect(result.sanitizedHtml).toContain('<li>Item 2</li>');
  });

  it('should convert ordered lists correctly', () => {
    const markdown = `1. First
2. Second
3. Third`;
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<ol>');
    expect(result.sanitizedHtml).toContain('<li>First</li>');
    expect(result.sanitizedHtml).toContain('<li>Second</li>');
  });

  it('should convert blockquotes correctly', () => {
    const markdown = '> This is a quote';
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<blockquote>');
    expect(result.sanitizedHtml).toContain('This is a quote');
  });

  it('should convert tables correctly', () => {
    const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<table>');
    expect(result.sanitizedHtml).toContain('<th>Header 1</th>');
    expect(result.sanitizedHtml).toContain('<td>Cell 1</td>');
  });

  it('should sanitize potentially dangerous HTML', () => {
    const markdown = '<script>alert("XSS")</script>';
    const result = renderMarkdown(markdown);
    
    // DOMPurify should strip out script tags
    expect(result.sanitizedHtml).not.toContain('<script>');
    expect(result.sanitizedHtml).not.toContain('alert');
  });

  it('should handle complex markdown with multiple elements', () => {
    const markdown = `# Title

This is a paragraph with **bold** and *italic* text.

## Section

- List item 1
- List item 2

\`\`\`python
def hello():
    print("Hello")
\`\`\`

> A blockquote`;

    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<h1>Title</h1>');
    expect(result.sanitizedHtml).toContain('<strong>bold</strong>');
    expect(result.sanitizedHtml).toContain('<em>italic</em>');
    expect(result.sanitizedHtml).toContain('<ul>');
    expect(result.sanitizedHtml).toContain('<blockquote>');
  });

  it('should handle special characters in markdown', () => {
    const markdown = 'Text with & < > " characters';
    const result = renderMarkdown(markdown);
    
    // These should be properly escaped in HTML
    expect(result.sanitizedHtml).toBeTruthy();
    expect(result.sanitizedHtml.length).toBeGreaterThan(0);
  });

  it('should convert horizontal rules correctly', () => {
    const markdown = '---';
    const result = renderMarkdown(markdown);
    
    expect(result.sanitizedHtml).toContain('<hr>');
  });
});
