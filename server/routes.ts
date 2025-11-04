import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { convertMarkdownSchema } from "@shared/schema";
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
    try {
      const validation = convertMarkdownSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.errors 
        });
      }

      const { markdown, filename } = validation.data;

      // Convert markdown to HTML
      const html = md.render(markdown);

      // Create full HTML document with styling
      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
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
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; color: #666; }
    p { margin-bottom: 16px; }
    code {
      background-color: #f6f8fa;
      border-radius: 3px;
      padding: 0.2em 0.4em;
      font-family: 'Courier New', Courier, monospace;
      font-size: 85%;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin-left: 0;
      color: #666;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    table th {
      background-color: #f6f8fa;
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
      color: #0366d6;
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
      border-top: 1px solid #eee;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
`;

      // Use cached browser instance for better performance
      const browser = await getBrowser();
      const page = await browser.newPage();
      
      try {
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
          },
        });

        await page.close();

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
      console.error('PDF conversion error:', error);
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
