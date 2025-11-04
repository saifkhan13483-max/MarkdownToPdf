# Vercel Deployment Guide

This guide will help you deploy your Markdown-to-PDF converter to Vercel with optimized serverless configuration.

## Overview

The application has been optimized for Vercel deployment with:

- ✅ Serverless API routes in `/api` folder
- ✅ Puppeteer-core with @sparticuz/chromium for PDF generation
- ✅ Optimized function configuration (10s timeout, 1024MB memory)
- ✅ Static frontend served from Vite build
- ✅ Environment variable support

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli) installed (optional, for local testing)
3. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Your Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables** (Optional)
   - Click "Environment Variables"
   - Add the following variables if needed:

   | Variable Name | Value | Description |
   |--------------|-------|-------------|
   | `NODE_ENV` | `production` | Sets production environment |
   | `MAX_CONTENT_SIZE` | `2097152` | Max content size in bytes (2MB) |
   | `MAX_FILE_SIZE` | `2097152` | Max file upload size (2MB) |
   | `ADMIN_API_KEY` | `your-secret-key` | Admin key for feedback endpoint |
   | `VITE_PLAUSIBLE_ENABLED` | `true` | Enable analytics (optional) |
   | `VITE_PLAUSIBLE_DOMAIN` | `yourdomain.com` | Analytics domain (optional) |

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (2-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NODE_ENV
   # Enter: production
   
   vercel env add MAX_CONTENT_SIZE
   # Enter: 2097152
   
   vercel env add ADMIN_API_KEY
   # Enter: your-secret-admin-key
   ```

## Configuration Files

### vercel.json

The `vercel.json` file is already configured with:

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
  }
}
```

**Key Configuration:**
- `maxDuration: 10` - Allows PDF generation to take up to 10 seconds
- `memory: 1024` - Allocates 1GB RAM for Chromium browser
- `framework: "vite"` - Uses Vite build system

### API Routes

Serverless functions are located in the `/api` directory:

- `api/convert.ts` - Main PDF conversion endpoint
- `api/upload-md.ts` - Markdown file upload handler
- `api/feedback.ts` - User feedback submission
- `api/pdf/[id].ts` - Shared PDF retrieval

## Serverless PDF Generation

### How It Works

The app uses **@sparticuz/chromium** for serverless PDF generation:

```typescript
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Launch browser in serverless environment
const browser = await puppeteerCore.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: true,
});
```

### Why This Approach?

1. **Serverless Compatible** - Works in Vercel's Lambda environment
2. **Lightweight** - Uses optimized Chromium binary
3. **No Local Installation** - Downloads Chromium on-demand
4. **Fast Cold Starts** - Optimized for quick function execution

## Troubleshooting

### PDF Generation Times Out

**Problem:** Functions timeout after 10 seconds

**Solutions:**
- Reduce markdown content size
- Simplify PDF templates
- Upgrade to Vercel Pro for 60s timeout

### Out of Memory Errors

**Problem:** Browser crashes with memory errors

**Solutions:**
- Increase memory allocation in `vercel.json`:
  ```json
  "memory": 2048
  ```
- Reduce concurrent PDF generations
- Upgrade to Vercel Pro for more resources

### Build Failures

**Problem:** Build fails on Vercel

**Solutions:**
1. Check Node.js version compatibility
   ```json
   // Add to package.json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

2. Clear build cache:
   - Go to Project Settings → General
   - Click "Clear Build Cache"

3. Check build logs for specific errors

### API Routes Not Working

**Problem:** API endpoints return 404

**Solutions:**
1. Verify file structure:
   ```
   /api
     convert.ts
     upload-md.ts
     feedback.ts
     /pdf
       [id].ts
   ```

2. Check vercel.json rewrites configuration

3. Ensure TypeScript compilation succeeds

## Performance Optimization

### Caching Strategy

For better performance, consider:

1. **Browser Instance Reuse** (Already implemented)
   - Reuses browser across invocations when possible

2. **Template Caching** (Already implemented)
   - Templates loaded once and cached

3. **Edge Functions** (Advanced)
   - Consider Vercel Edge Functions for faster response times
   - Note: Chromium not available in Edge runtime

### Monitoring

Track your deployment:

1. **Vercel Analytics**
   - Automatic performance monitoring
   - Real-time logs in dashboard

2. **Error Tracking**
   - Check function logs for errors
   - Set up Sentry integration (optional)

## Custom Domain

To use a custom domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

## Cost Considerations

### Vercel Free Tier Limits

- 100 GB bandwidth/month
- 100 hours function execution/month
- 10s max function duration
- 1GB function memory

### Estimated Usage

PDF conversions are resource-intensive:
- ~2-5 seconds per conversion
- ~200-500MB memory per function
- Approximately **1,200-3,000 conversions/month** on free tier

**Recommendation:** Monitor usage and upgrade to Pro if needed.

## Security Best Practices

1. **Rate Limiting**
   - Already configured in Express routes
   - Consider Vercel's rate limiting features

2. **Content Sanitization**
   - DOMPurify sanitization enabled
   - XSS protection in place

3. **Environment Variables**
   - Never commit secrets to Git
   - Use Vercel's encrypted environment variables

4. **CORS Configuration**
   - Configure allowed origins if needed
   - Set appropriate security headers

## Next Steps

After deployment:

1. ✅ Test all features on production URL
2. ✅ Set up custom domain (optional)
3. ✅ Configure environment variables
4. ✅ Enable analytics
5. ✅ Monitor performance and errors
6. ✅ Set up automatic deployments from Git

## Support

For issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [@sparticuz/chromium Issues](https://github.com/Sparticuz/chromium/issues)

---

**Ready to deploy?** Push your code to Git and import it to Vercel! 🚀
