# Security Features

This application implements multiple layers of security to protect against abuse and attacks.

## Rate Limiting

### PDF Conversion Rate Limit
- **Default**: 10 conversions per IP address per minute
- **Configurable via**: `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` environment variables
- **Applies to**: `/api/convert` endpoint
- **Response**: HTTP 429 (Too Many Requests) when limit exceeded

### General API Rate Limit
- **Default**: 100 requests per IP address per minute
- **Configurable via**: `GENERAL_RATE_LIMIT_WINDOW_MS` and `GENERAL_RATE_LIMIT_MAX_REQUESTS` environment variables
- **Applies to**: All `/api/*` endpoints
- **Response**: HTTP 429 (Too Many Requests) when limit exceeded

### API Key Bypass (Optional)
If you set the `ADMIN_API_KEY` environment variable, requests with the matching `X-API-Key` header will bypass rate limiting. This is useful for trusted clients or internal services.

Example:
```bash
curl -X POST http://localhost:5000/api/convert \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d '{...}'
```

## File Size Limits

### Request Body Size
- **Default**: 2MB
- **Configurable via**: `MAX_BODY_SIZE` environment variable
- **Applies to**: All JSON and URL-encoded request bodies
- **Purpose**: Prevents DoS attacks through large payloads

### File Upload Size
- **Default**: 2MB (2,097,152 bytes)
- **Configurable via**: `MAX_FILE_SIZE` environment variable
- **Applies to**: Markdown file uploads via `/api/upload-md`
- **Purpose**: Prevents DoS attacks through large file uploads

### Content Size
- **Default**: 2MB (2,097,152 bytes)
- **Configurable via**: `MAX_CONTENT_SIZE` environment variable
- **Applies to**: Markdown content in conversion requests
- **Response**: HTTP 413 (Payload Too Large) when limit exceeded
- **Purpose**: Prevents DoS attacks and ensures reasonable processing times

## HTML Sanitization

The application sanitizes all HTML content before rendering it in PDFs using DOMPurify. This prevents XSS (Cross-Site Scripting) attacks.

### What is Allowed
- Common HTML tags: headings, paragraphs, lists, links, images, tables
- Code blocks and inline code
- Text formatting: bold, italic, underline, strikethrough
- Blockquotes and horizontal rules

### What is Blocked
- `<script>` tags
- `<iframe>`, `<embed>`, `<object>` tags
- `<style>` tags
- `<form>`, `<input>`, `<button>` tags
- Event handlers: `onclick`, `onerror`, `onload`, etc.
- Dangerous protocols: `javascript:`, `data:`, `vbscript:`
- Any other potentially dangerous elements or attributes

### Testing
Run the sanitization tests to verify security:
```bash
tsx server/test/sanitization.test.ts
```

## Filename Sanitization

All filenames are sanitized to prevent directory traversal attacks:
- Path separators (`/`, `\`) are removed
- Parent directory references (`..`) are removed
- Null bytes are removed
- Invalid filename characters are removed
- Length is limited to 255 characters

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```bash
# Body size limits
MAX_BODY_SIZE=2mb
MAX_FILE_SIZE=2097152  # 2MB in bytes
MAX_CONTENT_SIZE=2097152  # 2MB in bytes

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=10  # 10 conversions per window

GENERAL_RATE_LIMIT_WINDOW_MS=60000  # 1 minute
GENERAL_RATE_LIMIT_MAX_REQUESTS=100  # 100 requests per window

# Optional: API key for bypassing rate limits
# ADMIN_API_KEY=your-secret-api-key-here
```

## Testing Rate Limiting

Run the rate limit test to verify it's working:
```bash
tsx server/test/rate-limit.test.ts
```

This will send 15 rapid requests to the conversion endpoint. You should see approximately 10 successful requests and 5 rate-limited requests.

## Production Deployment

When deploying to production, consider:

1. **Set appropriate rate limits** based on your expected traffic
2. **Use environment variables** for all configuration
3. **Monitor rate limit hits** to detect potential abuse
4. **Add reCAPTCHA** for public-facing deployments (see below)
5. **Use HTTPS** to encrypt data in transit
6. **Keep dependencies updated** to patch security vulnerabilities

## Optional: reCAPTCHA Integration

For public deployments with high traffic, you may want to add Google reCAPTCHA v3 to prevent automated abuse. 

To add reCAPTCHA:
1. Get API keys from https://www.google.com/recaptcha/admin
2. Add the reCAPTCHA widget to the frontend form
3. Verify the reCAPTCHA token on the backend before processing conversions
4. Store keys in environment variables: `RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`

## Security Headers

The application is configured to run behind a reverse proxy (like Replit's infrastructure). The `trust proxy` setting is enabled to correctly identify client IP addresses for rate limiting.

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainer instead of creating a public issue.
