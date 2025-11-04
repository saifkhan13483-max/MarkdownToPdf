# Markdown to PDF Converter

Transform your Markdown documents into beautiful, professional PDFs instantly with customizable themes, templates, and page settings.

## Features

- **Live Preview**: See your rendered Markdown in real-time
- **Multiple Templates**: Choose from Minimal, Modern, or Professional layouts
- **Theme Options**: Light, Dark, or Print-optimized themes
- **Customizable Settings**: Adjust page size, orientation, and margins
- **File Upload**: Drag and drop `.md` files or upload directly
- **Share PDFs**: Generate shareable links for your converted PDFs
- **Download Options**: Save as PDF or open in a new tab
- **Syntax Highlighting**: Code blocks with automatic highlighting
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + Node.js
- **PDF Generation**: Puppeteer (local) / Puppeteer-core + @sparticuz/chromium (serverless)
- **Markdown Processing**: markdown-it
- **Security**: DOMPurify for XSS protection, rate limiting, content size validation

## Local Development

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd markdown-to-pdf
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:5000\` (or the port specified in your environment).

### Environment Variables

Create a \`.env\` file in the root directory (optional):

\`\`\`env
# Maximum file upload size in bytes (default: 2MB)
MAX_FILE_SIZE=2097152

# Maximum content size for markdown conversion (default: 2MB)
MAX_CONTENT_SIZE=2097152

# Rate limiting: max requests per window
RATE_LIMIT_MAX=10

# Rate limiting: window duration in minutes
RATE_LIMIT_WINDOW_MINUTES=15
\`\`\`

## Deployment

This application supports deployment to both **Vercel** (recommended for serverless) and **Replit**.

### Deploy to Vercel (Recommended)

Vercel provides excellent serverless support with the required resources for Puppeteer/Chromium.

#### Prerequisites

- Vercel account (free tier supported)
- Vercel CLI (optional): \`npm i -g vercel\`

#### Step 1: Build the Project

\`\`\`bash
npm run build
\`\`\`

This creates optimized production files in the \`dist/\` directory.

#### Step 2: Deploy via Vercel CLI

\`\`\`bash
vercel
\`\`\`

Or deploy via GitHub integration:
1. Push your code to GitHub
2. Import the repository in Vercel dashboard
3. Vercel will automatically detect the configuration from \`vercel.json\`

#### Step 3: Configure Environment Variables (Optional)

In your Vercel project settings, add environment variables if needed:

**For detailed Vercel deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

- \`MAX_FILE_SIZE\`: Maximum upload size (default: 2097152 bytes / 2MB)
- \`MAX_CONTENT_SIZE\`: Maximum markdown content size (default: 2097152 bytes / 2MB)
- \`RATE_LIMIT_MAX\`: Maximum requests per window (default: 10)
- \`RATE_LIMIT_WINDOW_MINUTES\`: Rate limit window in minutes (default: 15)

#### Vercel Configuration

The included \`vercel.json\` provides:
- **250MB function bundle size** for Chromium binary
- **60 second timeout** for PDF generation
- **3008MB memory** allocation for optimal performance
- Routes configured for both API and static assets

#### Serverless Chromium

In production (Vercel), the application automatically uses:
- \`puppeteer-core\` (lightweight, no bundled Chromium)
- \`@sparticuz/chromium\` (optimized Chromium binary for serverless)

This ensures the PDF conversion works reliably in serverless environments.

### Deploy to Replit

Replit provides a managed Node.js environment with full Chromium support.

#### Prerequisites

- Replit account
- Project imported to Replit

#### Step 1: Configure for Deployment

The deployment configuration is already set up:
- **Build**: \`npm run build\`
- **Run**: \`npm start\`
- **Deployment Target**: Autoscale (recommended for web apps)

#### Step 2: Deploy

1. Click the **"Deploy"** button in your Replit workspace
2. Choose **"Autoscale Deployment"** for best performance
3. Configure environment variables in the Secrets tab (if needed)
4. Deploy!

#### Environment Variables on Replit

Set these in the "Secrets" section of your Repl:

- \`MAX_FILE_SIZE\` (optional)
- \`MAX_CONTENT_SIZE\` (optional)
- \`RATE_LIMIT_MAX\` (optional)
- \`RATE_LIMIT_WINDOW_MINUTES\` (optional)

#### Replit Deployment Notes

- The application detects Replit deployment via \`REPLIT_DEPLOYMENT=1\` environment variable
- Automatically uses \`@sparticuz/chromium\` in deployed mode
- Full Chromium/Puppeteer support available
- Autoscale deployment recommended for handling traffic spikes

## Production Checklist

Before deploying to production, ensure:

- [ ] Build completes successfully: \`npm run build\`
- [ ] All tests pass (if applicable): \`npm test\`
- [ ] Environment variables are configured
- [ ] Rate limiting is properly set for your expected traffic
- [ ] File size limits are appropriate for your use case
- [ ] Test PDF conversion in production after deployment
- [ ] Monitor function logs for any Puppeteer/Chromium errors

## Testing Deployment

After deploying, test the following:

1. **Upload a Markdown file** - Verify file upload works
2. **Convert to PDF** - Test PDF generation and download
3. **Generate shareable link** - Create and access a shared PDF
4. **Try different templates** - Minimal, Modern, Professional
5. **Test different themes** - Light, Dark, Print
6. **Adjust page settings** - Different sizes, orientations, margins
7. **Check on mobile** - Ensure responsive design works

## Common Deployment Issues

### Vercel: "Function execution timed out"

- Increase \`maxDuration\` in \`vercel.json\` (max 60s on Pro, 10s on Hobby)
- Reduce markdown content size
- Simplify page template/styling

### Vercel: "Function size exceeds the maximum"

- Already configured for 250MB in \`vercel.json\`
- If still an issue, consider Vercel Pro plan or use external service like Browserless

### Vercel: Slow cold starts (4-8 seconds)

- Expected behavior for serverless Chromium
- Consider Vercel Pro for better performance
- Implement caching strategies for repeated conversions

### Replit: Deployment fails

- Check build logs in deployment tab
- Ensure all dependencies are installed
- Verify \`npm run build\` works locally
- Check for memory/resource constraints

## Performance Optimization

### Browser Instance Reuse

The application caches the browser instance for improved performance:
- Reduces cold start time for subsequent requests
- Automatically handles reconnection if browser disconnects
- Graceful shutdown on process termination

### Memory Management

- Upload size limited to 2MB by default (configurable)
- Content size validation prevents oversized conversions
- Rate limiting prevents abuse and resource exhaustion

### Production Recommendations

- **Vercel**: Use Pro plan for better cold start performance
- **Replit**: Use Autoscale deployment for traffic handling
- **Alternative**: Consider dedicated PDF service (Browserless.io) for high volume

## Security Features

- **XSS Protection**: All HTML is sanitized with DOMPurify before rendering
- **File Type Validation**: Only \`.md\` and \`.markdown\` files accepted
- **Filename Sanitization**: Prevents directory traversal attacks
- **Content Size Limits**: Prevents DoS via oversized content
- **Rate Limiting**: 10 requests per 15 minutes by default
- **Input Validation**: Zod schema validation for all API requests

## API Endpoints

### \`POST /api/upload-md\`

Upload a Markdown file.

**Request**: \`multipart/form-data\` with \`file\` field

**Response**:
\`\`\`json
{
  "filename": "example.md",
  "text": "# Markdown content..."
}
\`\`\`

### \`POST /api/convert\`

Convert Markdown to PDF.

**Request Body**:
\`\`\`json
{
  "markdown": "# Your markdown here",
  "filename": "document",
  "action": "download",
  "options": {
    "pageSize": "A4",
    "orientation": "portrait",
    "margin": 20,
    "theme": "light",
    "template": "minimal"
  }
}
\`\`\`

**Actions**:
- \`download\`: Returns PDF file for download
- \`view\`: Returns PDF for inline viewing
- \`share\`: Stores PDF and returns shareable URL

**Response** (for \`share\` action):
\`\`\`json
{
  "success": true,
  "url": "https://your-domain.com/api/pdf/abc123",
  "id": "abc123",
  "expiresAt": "2024-01-01T00:00:00.000Z"
}
\`\`\`

### \`GET /api/pdf/:id\`

Retrieve a shared PDF by ID.

**Response**: PDF file (inline)

## Development Commands

\`\`\`bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run check

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
\`\`\`

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test locally and in a deployment environment
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review deployment troubleshooting section above

## Acknowledgments

- [Puppeteer](https://pptr.dev/) for headless Chrome automation
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium) for serverless Chromium
- [markdown-it](https://github.com/markdown-it/markdown-it) for Markdown parsing
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Vercel](https://vercel.com/) and [Replit](https://replit.com/) for hosting solutions
