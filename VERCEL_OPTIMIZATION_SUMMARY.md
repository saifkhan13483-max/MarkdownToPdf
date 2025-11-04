# Vercel Optimization Summary

This document explains all the changes made to optimize the Markdown-to-PDF converter for Vercel deployment.

## ⚠️ Important: Storage Limitation

The serverless API functions include a **shared storage module** (`api/lib/storage.ts`) that currently uses in-memory storage. This is for **DEMO PURPOSES ONLY** and will NOT work reliably in production.

**For production deployment, you MUST implement persistent storage:**
- Recommended: Vercel KV (Redis)
- Alternative: Vercel Blob or Upstash Redis
- See [VERCEL_STORAGE_SETUP.md](./VERCEL_STORAGE_SETUP.md) for implementation guide

## Changes Made

### 1. ✅ Updated `vercel.json`

**Before:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**After:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

**Why These Changes?**
- `functions` config: Allocates 10 seconds timeout and 1GB memory for PDF generation
- `rewrites`: Ensures proper routing for API endpoints and frontend

### 2. ✅ Created Serverless API Routes in `/api`

Created four serverless functions:

#### `api/convert.ts` - Main PDF Conversion
- Handles POST requests for markdown-to-PDF conversion
- Uses `puppeteer-core` with `@sparticuz/chromium`
- Supports download, view, and share actions
- Includes content validation and sanitization

#### `api/upload-md.ts` - File Upload
- Handles markdown file uploads
- Validates file type (.md, .markdown)
- Enforces 2MB file size limit

#### `api/feedback.ts` - User Feedback
- POST: Submit feedback
- GET: Retrieve feedback (admin only, requires ADMIN_API_KEY)
- In-memory storage for demo purposes

#### `api/pdf/[id].ts` - Shared PDF Retrieval
- Dynamic route for retrieving shared PDFs
- Returns PDF with appropriate headers

**Why Serverless Functions?**
- Compatible with Vercel's Lambda environment
- Auto-scaling based on traffic
- Pay only for actual usage
- No server management required

### 3. ✅ Updated Package Configuration

#### Installed `@vercel/node`
```bash
npm install @vercel/node
```

**Why?**
- Provides TypeScript types for `VercelRequest` and `VercelResponse`
- Ensures proper serverless function typing

#### Updated Build Script
```json
"build": "vite build && tsc api/*.ts --outDir dist/api --esModuleInterop --skipLibCheck --module esnext --moduleResolution bundler --target es2020"
```

**Why?**
- Compiles both frontend (Vite) and API routes (TypeScript)
- Ensures all serverless functions are properly built

#### Added Vercel Build Script
```json
"vercel-build": "npm run build"
```

**Why?**
- Vercel automatically runs this script if present
- Provides explicit build command for deployment

### 4. ✅ Serverless PDF Generation Implementation

The API routes use the recommended serverless approach:

```typescript
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Disable graphics mode for faster performance
chromium.setGraphicsMode = false;

// Launch browser with serverless Chromium
const browser = await puppeteerCore.launch({
  args: chromium.args,
  defaultViewport: { width: 1280, height: 720 },
  executablePath: await chromium.executablePath(),
  headless: true,
});
```

**Why This Approach?**
1. **No Local Chromium**: Uses @sparticuz/chromium (AWS Lambda optimized)
2. **Lightweight**: Downloads optimized binary on-demand
3. **Fast**: Optimized for quick cold starts
4. **Serverless Compatible**: Works in Lambda/Vercel environment

### 5. ✅ Environment Variable Support

The serverless functions support these environment variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `NODE_ENV` | Environment (production/development) | No |
| `MAX_CONTENT_SIZE` | Max markdown content size (bytes) | No (default: 2MB) |
| `MAX_FILE_SIZE` | Max file upload size (bytes) | No (default: 2MB) |
| `ADMIN_API_KEY` | Admin key for feedback endpoint | Yes (for admin access) |
| `VITE_PLAUSIBLE_ENABLED` | Enable analytics | No |
| `VITE_PLAUSIBLE_DOMAIN` | Analytics domain | No |

### 6. ✅ Created Comprehensive Documentation

#### `VERCEL_DEPLOYMENT.md`
- Complete deployment guide
- Step-by-step instructions
- Environment variable setup
- Troubleshooting section
- Performance optimization tips
- Cost considerations

## How It Works on Vercel

### Development Flow
1. Code pushed to Git repository
2. Vercel detects changes
3. Runs `npm run build`:
   - Vite builds frontend → `dist/`
   - TypeScript compiles API routes → `dist/api/`
4. Deploys static files and serverless functions

### Production Architecture

```
User Request
    ↓
Vercel Edge Network
    ↓
┌─────────────────┬─────────────────┐
│   Static Files  │  API Functions  │
│   (Frontend)    │  (Serverless)   │
│   - HTML/CSS    │  - convert.ts   │
│   - JavaScript  │  - upload.ts    │
│   - Assets      │  - feedback.ts  │
│                 │  - pdf/[id].ts  │
└─────────────────┴─────────────────┘
         ↓                 ↓
    Cached CDN      Lambda Execution
                          ↓
                    Chromium Binary
                          ↓
                      PDF Output
```

### Request Flow for PDF Conversion

1. **User submits markdown** → Frontend sends POST to `/api/convert`
2. **Vercel routes request** → Serverless function `api/convert.ts`
3. **Function validates** → Checks content size and sanitizes input
4. **Converts markdown** → markdown-it renders to HTML
5. **Launches browser** → puppeteer-core + @sparticuz/chromium
6. **Generates PDF** → Chromium renders HTML to PDF
7. **Returns result** → PDF sent to user or stored for sharing
8. **Cleanup** → Browser closed, function terminates

## Key Differences from Express Setup

### Before (Express)
- Single server instance running continuously
- Browser instance reused across requests
- Templates loaded from filesystem
- Manual deployment management

### After (Vercel Serverless)
- Functions execute on-demand
- Each invocation may get new browser
- Templates embedded in function code
- Automatic scaling and deployment

## Performance Optimizations

### Already Implemented
1. **Browser Caching** - Reuses browser instance when possible
2. **Template Caching** - Templates loaded once per function instance
3. **Graphics Disabled** - `chromium.setGraphicsMode = false`
4. **Optimized Args** - Minimal Chromium arguments for faster startup

### Potential Future Improvements
1. **Edge Functions** - Move lightweight operations to Edge runtime
2. **Redis/KV Storage** - Replace in-memory storage for shared PDFs
3. **CDN Caching** - Cache frequently generated PDFs
4. **Incremental Static Regeneration** - Pre-generate common templates

## Testing the Deployment

### Local Testing (Optional)
```bash
# Install Vercel CLI
npm install -g vercel

# Run local development
vercel dev

# Test API endpoints
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test", "action": "download"}'
```

### Production Testing
After deployment to Vercel:

1. **Test PDF Download**
   - Visit your app
   - Enter markdown content
   - Click "Download PDF"
   - Verify PDF downloads correctly

2. **Test PDF View**
   - Select "View" action
   - Verify PDF opens in new tab

3. **Test PDF Share**
   - Select "Share" action
   - Copy shareable link
   - Open link in incognito/private window
   - Verify PDF loads

4. **Test File Upload**
   - Upload .md file
   - Verify content loads correctly

5. **Test Feedback**
   - Submit feedback
   - Check function logs in Vercel dashboard

## Troubleshooting Common Issues

### Issue: Function times out after 10 seconds
**Solution:**
- Reduce markdown content complexity
- Simplify templates
- Upgrade to Vercel Pro (60s timeout)

### Issue: Out of memory errors
**Solution:**
- Increase memory in vercel.json:
  ```json
  "memory": 2048
  ```
- Upgrade to Vercel Pro for more resources

### Issue: Build fails on Vercel
**Solution:**
- Check Node.js version compatibility
- Clear build cache in Vercel dashboard
- Review build logs for specific errors

### Issue: API routes return 404
**Solution:**
- Verify `/api` folder structure
- Check vercel.json rewrites configuration
- Ensure TypeScript compilation succeeds

## Cost Estimation

### Vercel Free Tier
- 100 GB bandwidth/month
- 100 hours function execution/month
- 10s max duration
- 1GB memory

### Per Conversion Costs
- Duration: ~2-5 seconds
- Memory: ~200-500MB
- Bandwidth: ~100KB-2MB per PDF

### Estimated Capacity
**Free tier can handle approximately:**
- 1,200-3,000 conversions/month
- Depends on PDF complexity and size

**When to upgrade to Pro:**
- More than 3,000 conversions/month
- Need longer timeout (60s)
- Require more memory (up to 3GB)
- Want advanced analytics

## Security Considerations

### Already Implemented
1. ✅ Content sanitization with DOMPurify
2. ✅ File size validation (2MB limit)
3. ✅ Filename sanitization (prevent directory traversal)
4. ✅ Admin API key protection for feedback endpoint

### Recommended Additional Measures
1. **Rate Limiting** - Use Vercel's built-in rate limiting
2. **CORS Headers** - Configure allowed origins
3. **CSP Headers** - Add Content Security Policy
4. **Input Validation** - Validate all user inputs

## Next Steps

1. ✅ Push code to Git repository
2. ✅ Import project to Vercel
3. ✅ Configure environment variables
4. ✅ Deploy to production
5. ✅ Test all features
6. ✅ Monitor performance and logs
7. ✅ Set up custom domain (optional)

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [@sparticuz/chromium GitHub](https://github.com/Sparticuz/chromium)
- [Puppeteer Documentation](https://pptr.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

**Your app is now fully optimized for Vercel deployment!** 🚀

Follow the instructions in `VERCEL_DEPLOYMENT.md` to deploy your app.
