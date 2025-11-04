import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 * This removes potentially dangerous elements and attributes before rendering with Puppeteer
 * 
 * Configuration allows:
 * - Safe HTML tags (p, div, span, headers, etc.)
 * - Safe attributes (class, id, style, etc.)
 * - Links and images
 * - Code blocks and pre-formatted text
 * 
 * Blocks:
 * - Script tags
 * - Event handlers (onclick, onerror, etc.)
 * - Dangerous protocols (javascript:, data:, etc.)
 * - Iframes and embeds
 */
export function sanitizeHtml(html: string): string {
  // Configure DOMPurify with strict settings
  const clean = DOMPurify.sanitize(html, {
    // Allow common HTML tags needed for markdown rendering
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'b', 'i', 'u', 's', 'code', 'pre',
      'ul', 'ol', 'li',
      'blockquote',
      'a',
      'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'del', 'ins',
      'sup', 'sub',
    ],
    // Allow safe attributes
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src',
      'class', 'id',
      'width', 'height',
      'align', 'valign',
      'colspan', 'rowspan',
    ],
    // Allow safe URI schemes for links and images
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Forbid dangerous tags
    FORBID_TAGS: ['script', 'iframe', 'embed', 'object', 'style', 'form', 'input', 'button'],
    // Forbid dangerous attributes
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    // Keep safe HTML entities
    KEEP_CONTENT: true,
    // Return as string
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    // Additional security options
    SAFE_FOR_TEMPLATES: true,
    // Allow data attributes for styling/formatting
    ALLOW_DATA_ATTR: false,
  });

  return clean;
}

/**
 * Validate and sanitize markdown content size
 * Prevents DoS attacks by limiting input size
 */
export function validateContentSize(content: string, maxSizeBytes: number = 2 * 1024 * 1024): { valid: boolean; error?: string } {
  const sizeInBytes = Buffer.byteLength(content, 'utf8');
  
  if (sizeInBytes > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
    const actualSizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Content size (${actualSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent directory traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\]/g, '')  // Remove path separators
    .replace(/\.\./g, '')     // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/\0/g, '')        // Remove null bytes
    .trim()
    .substring(0, 255);        // Limit length
}
