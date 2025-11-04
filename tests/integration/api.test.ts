import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { registerRoutes } from '../../server/routes';

describe('API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    registerRoutes(app);
  });

  describe('POST /api/convert', () => {
    it('should convert markdown to PDF and return PDF headers for download action', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown: '# Test Document\n\nThis is a test.',
          filename: 'test',
          action: 'download',
          options: {
            pageSize: 'A4',
            orientation: 'portrait',
            margin: 20,
            theme: 'light',
            template: 'minimal',
          },
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('test.pdf');
      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return shareable link for share action', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown: '# Shareable Document',
          filename: 'shareable',
          action: 'share',
          options: {
            pageSize: 'A4',
            orientation: 'portrait',
            margin: 20,
            theme: 'light',
            template: 'minimal',
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('id');
      expect(response.body.url).toContain('/api/pdf/');
    });

    it('should return PDF for view action', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown: '# View Document',
          filename: 'view',
          action: 'view',
          options: {
            pageSize: 'A4',
            orientation: 'portrait',
            margin: 20,
            theme: 'light',
            template: 'minimal',
          },
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('inline');
    });

    it('should reject request with missing markdown', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          filename: 'test',
          action: 'download',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with invalid action', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown: '# Test',
          action: 'invalid-action',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle different page sizes', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown: '# Letter Size',
          action: 'download',
          options: {
            pageSize: 'Letter',
            orientation: 'portrait',
            margin: 20,
            theme: 'light',
            template: 'minimal',
          },
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('should handle landscape orientation', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown: '# Landscape',
          action: 'download',
          options: {
            pageSize: 'A4',
            orientation: 'landscape',
            margin: 20,
            theme: 'light',
            template: 'minimal',
          },
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('should handle different themes', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown: '# Dark Theme',
          action: 'download',
          options: {
            pageSize: 'A4',
            orientation: 'portrait',
            margin: 20,
            theme: 'dark',
            template: 'minimal',
          },
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('should handle professional template', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown: '# Professional Template',
          filename: 'professional-doc',
          action: 'download',
          options: {
            pageSize: 'A4',
            orientation: 'portrait',
            margin: 20,
            theme: 'light',
            template: 'professional',
          },
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('should reject content that is too large', async () => {
      const largeMarkdown = 'a'.repeat(3 * 1024 * 1024); // 3MB
      
      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown: largeMarkdown,
          action: 'download',
        });

      // Expecting either 413 (Payload Too Large) or 400 (validation error)
      expect([400, 413]).toContain(response.status);
      // Body might be empty or have error depending on middleware
      if (response.body && Object.keys(response.body).length > 0) {
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should convert markdown with code blocks', async () => {
      const markdown = `# Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\``;

      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown,
          filename: 'code-example',
          action: 'download',
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('should convert markdown with lists and tables', async () => {
      const markdown = `# Data

## List
- Item 1
- Item 2
- Item 3

## Table
| Name | Value |
|------|-------|
| A    | 1     |
| B    | 2     |`;

      const response = await request(app)
        .post('/api/convert')
        .send({
          markdown,
          filename: 'structured-content',
          action: 'download',
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    });
  });

  describe('GET /api/pdf/:id', () => {
    it('should retrieve a shared PDF by ID', async () => {
      // First create a shared PDF
      const createResponse = await request(app)
        .post('/api/convert')
        .send({
          markdown: '# Shared PDF Test',
          filename: 'shared-test',
          action: 'share',
        })
        .expect(200);

      expect(createResponse.body).toHaveProperty('url');
      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.url).toBeTruthy();
      
      const pdfId = createResponse.body.id;

      // Now retrieve it
      const response = await request(app)
        .get(`/api/pdf/${pdfId}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('inline');
    });

    it('should return 404 for non-existent PDF', async () => {
      const response = await request(app)
        .get('/api/pdf/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('PDF not found');
    });
  });

  describe('POST /api/upload-md', () => {
    it('should handle markdown file upload', async () => {
      const response = await request(app)
        .post('/api/upload-md')
        .attach('file', Buffer.from('# Uploaded Content'), 'test.md')
        .expect(200);

      expect(response.body).toHaveProperty('filename');
      expect(response.body).toHaveProperty('text');
      expect(response.body.text).toContain('# Uploaded Content');
    });

    it('should reject upload with no file', async () => {
      const response = await request(app)
        .post('/api/upload-md')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No file uploaded');
    });
  });
});
