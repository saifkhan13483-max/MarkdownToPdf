import type { VercelRequest, VercelResponse } from '@vercel/node';
import MarkdownIt from 'markdown-it';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { sanitizeHtml, validateContentSize, sanitizeFilename } from '../server/middleware/sanitize';
import { pdfStorage } from './lib/storage';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

function getThemeStyles(theme: string): string {
  const baseStyles = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(175, 184, 193, 0.2);
      border-radius: 6px;
    }
    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
    }
  `;

  if (theme === 'dark') {
    return baseStyles + `
      body { background: #1a1a1a; color: #e0e0e0; }
      code { background-color: rgba(110, 118, 129, 0.4); }
      pre { background-color: #2d2d2d; color: #e0e0e0; }
    `;
  } else if (theme === 'print') {
    return baseStyles + `
      body { background: white; color: black; }
    `;
  }
  
  return baseStyles + `
    body { background: white; color: #24292e; }
  `;
}

function getTemplate(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{TITLE}}</title>
  <style>{{THEME_STYLES}}</style>
  <style>
    @page {
      margin: {{MARGIN}}mm;
      size: {{PAGE_SIZE}} {{ORIENTATION}};
    }
  </style>
</head>
<body>
  <div class="pdf-content">{{CONTENT}}</div>
</body>
</html>`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  
  try {
    const { markdown, filename, options, action } = req.body;

    if (!markdown) {
      return res.status(400).json({ error: 'Missing markdown content' });
    }

    // Validate content size (2MB default)
    const maxContentSize = parseInt(process.env.MAX_CONTENT_SIZE || '2097152', 10);
    const sizeValidation = validateContentSize(markdown, maxContentSize);
    if (!sizeValidation.valid) {
      console.warn(`[PDF] Content size validation failed: ${sizeValidation.error}`);
      return res.status(413).json({
        error: 'Content too large',
        message: sizeValidation.error,
      });
    }

    // Sanitize filename to prevent directory traversal
    const safeFilename = sanitizeFilename(filename || 'document');
    const pageSize = options?.pageSize ?? 'A4';
    const orientation = options?.orientation ?? 'portrait';
    const margin = options?.margin ?? 20;
    const theme = options?.theme ?? 'light';

    console.log(`[PDF] Starting conversion - File: ${safeFilename}, Action: ${action}, Theme: ${theme}`);

    // Convert markdown to HTML
    const rawHtml = md.render(markdown);
    const html = sanitizeHtml(rawHtml);

    // Build full HTML
    const templateHtml = getTemplate();
    const themeStyles = getThemeStyles(theme);
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const fullHtml = templateHtml
      .replace(/\{\{TITLE\}\}/g, safeFilename)
      .replace(/\{\{CONTENT\}\}/g, html)
      .replace(/\{\{THEME_STYLES\}\}/g, themeStyles)
      .replace(/\{\{PAGE_SIZE\}\}/g, pageSize)
      .replace(/\{\{ORIENTATION\}\}/g, orientation)
      .replace(/\{\{MARGIN\}\}/g, margin.toString());

    // Launch browser with serverless Chromium
    console.log('[PDF] Launching serverless Chromium');
    chromium.setGraphicsMode = false;
    
    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    
    const page = await browser.newPage();
    
    try {
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: pageSize,
        landscape: orientation === 'landscape',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: `${margin}mm`,
          right: `${margin}mm`,
          bottom: `${margin}mm`,
          left: `${margin}mm`,
        },
      });

      await page.close();
      await browser.close();

      const totalTime = Date.now() - startTime;
      console.log(`[PDF] Total conversion time: ${totalTime}ms`);

      // Handle different actions
      if (action === 'share') {
        // Check if storage is configured
        if (!pdfStorage.isAvailable()) {
          return res.status(503).json({
            error: 'PDF sharing is not configured',
            message: 'To enable PDF sharing, set up Vercel KV storage. See VERCEL_STORAGE_SETUP.md for instructions.',
            documentation: 'https://vercel.com/docs/storage/vercel-kv'
          });
        }
        
        try {
          // Generate a unique ID for sharing
          const id = Math.random().toString(36).substring(2, 15);
          await pdfStorage.set(id, Buffer.from(pdf), `${safeFilename}.pdf`);
          
          const shareUrl = `/api/pdf/${id}`;
          return res.status(200).json({
            success: true,
            url: shareUrl,
            id,
          });
        } catch (storageError) {
          console.error('[PDF] Storage error:', storageError);
          return res.status(503).json({
            error: 'Failed to store PDF for sharing',
            message: storageError instanceof Error ? storageError.message : 'Storage unavailable',
          });
        }
      } else if (action === 'view') {
        // Return PDF for viewing in browser
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${safeFilename}.pdf"`);
        return res.status(200).send(Buffer.from(pdf));
      } else {
        // Default: download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.pdf"`);
        return res.status(200).send(Buffer.from(pdf));
      }
    } finally {
      if (page) await page.close().catch(console.error);
      if (browser) await browser.close().catch(console.error);
    }
  } catch (error) {
    console.error('[PDF] Conversion error:', error);
    return res.status(500).json({ 
      error: 'PDF conversion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
