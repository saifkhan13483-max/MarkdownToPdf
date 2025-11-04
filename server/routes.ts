import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { convertMarkdownSchema, type PdfOptions } from "@shared/schema";
import MarkdownIt from "markdown-it";
import puppeteer, { type Browser } from "puppeteer";
import multer from "multer";
import path from "path";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.md' || ext === '.markdown') {
      cb(null, true);
    } else {
      cb(new Error('Only .md or .markdown files are allowed'));
    }
  },
});

// Cache browser instance for better performance
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

function getThemeStyles(theme: PdfOptions['theme']): string {
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
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; }
    p { margin-bottom: 16px; }
    code {
      border-radius: 3px;
      padding: 0.2em 0.4em;
      font-family: 'Courier New', Courier, monospace;
      font-size: 85%;
    }
    pre {
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid;
      padding-left: 16px;
      margin-left: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }
    table th, table td {
      border: 1px solid;
      padding: 8px 12px;
      text-align: left;
    }
    table th {
      font-weight: 600;
    }
    ul, ol {
      margin-bottom: 16px;
      padding-left: 2em;
    }
    li {
      margin-bottom: 4px;
    }
    a {
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    hr {
      border: none;
      margin: 24px 0;
    }
  `;

  switch (theme) {
    case 'dark':
      return baseStyles + `
        body { background-color: #1a1a1a; color: #e0e0e0; }
        h1, h2 { border-bottom: 1px solid #404040; }
        h6 { color: #a0a0a0; }
        code { background-color: #2d2d2d; color: #e0e0e0; }
        pre { background-color: #2d2d2d; }
        blockquote { border-left-color: #404040; color: #a0a0a0; }
        table th { background-color: #2d2d2d; }
        table th, table td { border-color: #404040; }
        a { color: #58a6ff; }
        hr { border-top: 1px solid #404040; }
      `;
    
    case 'print':
      return baseStyles + `
        body { background-color: #ffffff; color: #000000; }
        h1, h2 { border-bottom: 1px solid #000000; }
        h6 { color: #333333; }
        code { background-color: #f0f0f0; color: #000000; }
        pre { background-color: #f0f0f0; border: 1px solid #cccccc; }
        blockquote { border-left-color: #000000; color: #333333; }
        table th { background-color: #f0f0f0; }
        table th, table td { border-color: #000000; }
        a { color: #0000ee; }
        hr { border-top: 1px solid #000000; }
      `;
    
    case 'light':
    default:
      return baseStyles + `
        body { background-color: #ffffff; color: #333333; }
        h1, h2 { border-bottom: 1px solid #eeeeee; }
        h6 { color: #666666; }
        code { background-color: #f6f8fa; color: #333333; }
        pre { background-color: #f6f8fa; }
        blockquote { border-left-color: #dddddd; color: #666666; }
        table th { background-color: #f6f8fa; }
        table th, table td { border-color: #dddddd; }
        a { color: #0366d6; }
        hr { border-top: 1px solid #eeeeee; }
      `;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload endpoint
  app.post("/api/upload-md", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filename = req.file.originalname;
      const text = req.file.buffer.toString('utf-8');

      res.json({
        filename,
        text,
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ 
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PDF conversion endpoint with size limit (10MB)
  app.post("/api/convert", async (req, res) => {
    const startTime = Date.now();
    
    try {
      const validation = convertMarkdownSchema.safeParse(req.body);
      
      if (!validation.success) {
        console.error('PDF validation error:', validation.error.errors);
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.errors 
        });
      }

      const { markdown, filename, options } = validation.data;
      const pageSize = options?.pageSize ?? 'A4';
      const orientation = options?.orientation ?? 'portrait';
      const margin = options?.margin ?? 20;
      const theme = options?.theme ?? 'light';

      console.log(`[PDF] Starting conversion - File: ${filename}, Theme: ${theme}, Size: ${pageSize}, Orientation: ${orientation}`);

      // Convert markdown to HTML
      const markdownStartTime = Date.now();
      const html = md.render(markdown);
      console.log(`[PDF] Markdown rendering took ${Date.now() - markdownStartTime}ms`);

      // Create full HTML document with styling
      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: ${margin}mm;
      size: ${pageSize} ${orientation};
    }
    ${getThemeStyles(theme)}
  </style>
</head>
<body>
  ${html}
</body>
</html>
`;

      // Use cached browser instance for better performance
      const browserStartTime = Date.now();
      const browser = await getBrowser();
      console.log(`[PDF] Browser acquisition took ${Date.now() - browserStartTime}ms`);
      
      const page = await browser.newPage();
      
      try {
        const contentStartTime = Date.now();
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        console.log(`[PDF] Content loading took ${Date.now() - contentStartTime}ms`);

        const pdfStartTime = Date.now();
        const pdf = await page.pdf({
          format: pageSize,
          landscape: orientation === 'landscape',
          printBackground: true,
          margin: {
            top: `${margin}mm`,
            right: `${margin}mm`,
            bottom: `${margin}mm`,
            left: `${margin}mm`,
          },
        });
        console.log(`[PDF] PDF generation took ${Date.now() - pdfStartTime}ms`);

        await page.close();

        const totalTime = Date.now() - startTime;
        console.log(`[PDF] Total conversion time: ${totalTime}ms`);

        // Send PDF as download
        const safeFilename = filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.pdf"`);
        res.send(pdf);
      } catch (pageError) {
        await page.close();
        throw pageError;
      }

    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`[PDF] Conversion failed after ${totalTime}ms:`, error);
      res.status(500).json({ 
        error: 'Failed to convert to PDF',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  // Graceful shutdown: close browser on process exit
  process.on('SIGTERM', async () => {
    if (browserInstance) {
      await browserInstance.close();
      browserInstance = null;
    }
  });

  process.on('SIGINT', async () => {
    if (browserInstance) {
      await browserInstance.close();
      browserInstance = null;
    }
  });

  return httpServer;
}
