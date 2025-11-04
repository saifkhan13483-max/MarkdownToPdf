# Setting Up Persistent Storage for Vercel

## ⚠️ Critical Requirement for Production

The PDF sharing feature requires **persistent storage** because serverless functions are stateless. The current implementation uses in-memory storage which will **NOT work reliably** in production.

## Why In-Memory Storage Doesn't Work

In serverless environments like Vercel:
- Each function invocation may run in a different instance
- Memory is not shared between function instances
- Functions terminate after execution, losing all in-memory data
- Cold starts create entirely new instances with empty memory

**Result:** Shared PDFs will be lost immediately or become inaccessible.

## Production Storage Options

### Option 1: Vercel KV (Recommended) ⭐

Vercel KV is a Redis-based key-value store, perfect for temporary PDF storage.

#### Benefits
- Built-in to Vercel
- Fast read/write operations
- Automatic TTL (time-to-live) support
- Simple API
- Free tier: 256 MB storage

#### Setup

1. **Enable Vercel KV**
   ```bash
   npm install @vercel/kv
   ```

2. **Create KV Store**
   - Go to your Vercel project dashboard
   - Navigate to Storage tab
   - Click "Create Database"
   - Select "KV"
   - Name it "pdf-storage"

3. **Update `api/lib/storage.ts`**

```typescript
import { kv } from '@vercel/kv';

interface StoredPDF {
  pdf: string; // Base64 encoded
  filename: string;
  createdAt: number;
}

export const pdfStorage = {
  async set(id: string, pdf: Buffer, filename: string): Promise<void> {
    const data: StoredPDF = {
      pdf: pdf.toString('base64'),
      filename,
      createdAt: Date.now(),
    };
    
    // Store with 1 hour TTL
    await kv.set(`pdf:${id}`, data, { ex: 3600 });
    console.log(`[STORAGE] Stored PDF ${id} in Vercel KV`);
  },

  async get(id: string): Promise<{ pdf: Buffer; filename: string } | null> {
    const data = await kv.get<StoredPDF>(`pdf:${id}`);
    
    if (!data) {
      return null;
    }
    
    return {
      pdf: Buffer.from(data.pdf, 'base64'),
      filename: data.filename,
    };
  },

  async delete(id: string): Promise<void> {
    await kv.del(`pdf:${id}`);
  },
};
```

4. **Environment Variables**
   - Vercel automatically sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   - No manual configuration needed!

#### Cost
- Free tier: 256 MB, 30,000 commands/month
- Pro: $1/GB/month, unlimited commands
- Typical PDF: 100KB-2MB → 128-2,560 PDFs in free tier

---

### Option 2: Vercel Blob

Vercel Blob is object storage, ideal for larger files like PDFs.

#### Benefits
- Designed for large files
- Built-in CDN
- Public URL support
- Simple API
- Free tier: 500 MB storage

#### Setup

1. **Install Vercel Blob**
   ```bash
   npm install @vercel/blob
   ```

2. **Create Blob Store**
   - Go to your Vercel project dashboard
   - Navigate to Storage tab
   - Click "Create Database"
   - Select "Blob"

3. **Update `api/lib/storage.ts`**

```typescript
import { put, del, head } from '@vercel/blob';

export const pdfStorage = {
  async set(id: string, pdf: Buffer, filename: string): Promise<void> {
    const blob = await put(`pdfs/${id}.pdf`, pdf, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/pdf',
    });
    
    console.log(`[STORAGE] Stored PDF at ${blob.url}`);
  },

  async get(id: string): Promise<{ pdf: Buffer; filename: string } | null> {
    try {
      const metadata = await head(`pdfs/${id}.pdf`);
      
      if (!metadata) {
        return null;
      }
      
      // Fetch the PDF
      const response = await fetch(metadata.url);
      const arrayBuffer = await response.arrayBuffer();
      
      return {
        pdf: Buffer.from(arrayBuffer),
        filename: `${id}.pdf`,
      };
    } catch (error) {
      return null;
    }
  },

  async delete(id: string): Promise<void> {
    await del(`pdfs/${id}.pdf`);
  },
};
```

4. **Environment Variables**
   - Vercel automatically sets `BLOB_READ_WRITE_TOKEN`

#### Cost
- Free tier: 500 MB storage
- Pro: $0.15/GB/month
- Typical PDF: 100KB-2MB → 256-5,120 PDFs in free tier

---

### Option 3: Upstash Redis (Alternative)

If you prefer an external service or need more control.

#### Setup

1. **Create Upstash Account**
   - Go to [upstash.com](https://upstash.com)
   - Create a free Redis database

2. **Install Upstash SDK**
   ```bash
   npm install @upstash/redis
   ```

3. **Update `api/lib/storage.ts`**

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const pdfStorage = {
  async set(id: string, pdf: Buffer, filename: string): Promise<void> {
    await redis.setex(
      `pdf:${id}`,
      3600, // 1 hour TTL
      JSON.stringify({
        pdf: pdf.toString('base64'),
        filename,
        createdAt: Date.now(),
      })
    );
  },

  async get(id: string): Promise<{ pdf: Buffer; filename: string } | null> {
    const data = await redis.get<string>(`pdf:${id}`);
    
    if (!data) {
      return null;
    }
    
    const parsed = JSON.parse(data);
    return {
      pdf: Buffer.from(parsed.pdf, 'base64'),
      filename: parsed.filename,
    };
  },

  async delete(id: string): Promise<void> {
    await redis.del(`pdf:${id}`);
  },
};
```

4. **Environment Variables** (in Vercel)
   - `UPSTASH_REDIS_REST_URL`: Your Upstash Redis URL
   - `UPSTASH_REDIS_REST_TOKEN`: Your Upstash token

#### Cost
- Free tier: 10,000 commands/day
- Pay-as-you-go: $0.20 per 100k commands

---

## Comparison Table

| Storage Option | Best For | Free Tier | Setup Difficulty | Speed |
|---------------|----------|-----------|------------------|-------|
| Vercel KV | Small-medium PDFs | 256 MB | Easy (native) | Very Fast |
| Vercel Blob | Large PDFs | 500 MB | Easy (native) | Fast |
| Upstash Redis | External control | 10k cmds/day | Medium | Very Fast |

## Recommended Approach

For this Markdown-to-PDF app, **Vercel KV** is recommended because:

1. ✅ Native Vercel integration (no external accounts)
2. ✅ Automatic TTL (shared PDFs expire after 1 hour)
3. ✅ Very fast read/write operations
4. ✅ Simple API
5. ✅ Free tier sufficient for most use cases

## Step-by-Step Implementation (Vercel KV)

### 1. Install Package
```bash
npm install @vercel/kv
```

### 2. Enable KV in Vercel Dashboard
- Go to your project → Storage
- Create a KV database named "pdf-storage"
- Vercel will automatically inject environment variables

### 3. Replace `api/lib/storage.ts`

Use the Vercel KV implementation shown above in Option 1.

### 4. Test Locally (Optional)

```bash
# Create .env file
echo "KV_REST_API_URL=your_kv_url" > .env
echo "KV_REST_API_TOKEN=your_kv_token" >> .env

# Run dev server
npm run dev

# Test share functionality
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Test",
    "action": "share"
  }'
```

### 5. Deploy
```bash
vercel --prod
```

### 6. Verify
- Generate a PDF with "share" action
- Copy the share URL
- Open in a new browser/incognito
- PDF should load successfully

## Troubleshooting

### Issue: "Cannot connect to KV"
**Solution:**
- Check environment variables are set in Vercel dashboard
- Ensure KV database is created
- Redeploy after adding KV

### Issue: "PDFs not found after sharing"
**Solution:**
- Verify you're using the updated `api/lib/storage.ts`
- Check Vercel KV dashboard for stored keys
- Ensure both `api/convert.ts` and `api/pdf/[id].ts` import the same storage module

### Issue: "Out of storage quota"
**Solution:**
- Reduce PDF TTL (e.g., 30 minutes instead of 1 hour)
- Upgrade to Vercel Pro for more storage
- Implement automatic cleanup of old PDFs

## Monitoring Storage Usage

### Vercel KV Dashboard
- View total storage used
- See number of keys
- Monitor command usage
- Check performance metrics

### Logging
Add logging to track storage operations:

```typescript
console.log(`[STORAGE] Set PDF ${id}, size: ${pdf.length} bytes`);
console.log(`[STORAGE] Retrieved PDF ${id}`);
console.log(`[STORAGE] Deleted PDF ${id}`);
```

## Security Considerations

1. **PDF Expiration**: Use TTL to automatically delete old PDFs
2. **Access Control**: Share URLs are public but hard to guess (random IDs)
3. **Size Limits**: Validate PDF size before storage
4. **Rate Limiting**: Prevent storage abuse

## Next Steps

1. ✅ Choose storage option (recommend Vercel KV)
2. ✅ Install required package
3. ✅ Create storage in Vercel dashboard
4. ✅ Update `api/lib/storage.ts`
5. ✅ Test locally
6. ✅ Deploy to Vercel
7. ✅ Verify share functionality works

---

**Without persistent storage, the share feature will not work in production!**

Choose a storage option and implement it before deploying to Vercel.
