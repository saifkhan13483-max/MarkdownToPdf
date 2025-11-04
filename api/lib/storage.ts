// Shared PDF Storage for Vercel Serverless
// 
// This module provides persistent storage for shared PDFs.
// To enable the share feature, set up Vercel KV in your dashboard:
// https://vercel.com/docs/storage/vercel-kv
//
// Alternative storage options:
// - Vercel Blob: https://vercel.com/docs/storage/vercel-blob
// - Upstash Redis: https://upstash.com/
// - Any S3-compatible storage

interface StoredPDF {
  pdf: string; // Base64 encoded
  filename: string;
  createdAt: number;
}

// Check if Vercel KV is available
const hasVercelKV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Lazy-load Vercel KV only if credentials are present
let kv: any = null;
if (hasVercelKV) {
  try {
    // Dynamically import @vercel/kv if available
    const kvModule = await import('@vercel/kv').catch(() => null);
    if (kvModule) {
      kv = kvModule.kv;
      console.log('[STORAGE] Vercel KV initialized');
    }
  } catch (error) {
    console.warn('[STORAGE] Vercel KV not available:', error);
  }
}

export const pdfStorage = {
  async set(id: string, pdf: Buffer, filename: string): Promise<void> {
    if (!kv) {
      throw new Error(
        'Storage not configured. To enable PDF sharing, set up Vercel KV in your dashboard. ' +
        'See VERCEL_STORAGE_SETUP.md for instructions.'
      );
    }
    
    const data: StoredPDF = {
      pdf: pdf.toString('base64'),
      filename,
      createdAt: Date.now(),
    };
    
    // Store with 1 hour TTL
    await kv.set(`pdf:${id}`, JSON.stringify(data), { ex: 3600 });
    console.log(`[STORAGE] Stored PDF ${id} in Vercel KV (expires in 1 hour)`);
  },

  async get(id: string): Promise<{ pdf: Buffer; filename: string } | null> {
    if (!kv) {
      throw new Error(
        'Storage not configured. To enable PDF sharing, set up Vercel KV in your dashboard. ' +
        'See VERCEL_STORAGE_SETUP.md for instructions.'
      );
    }
    
    const dataStr = await kv.get(`pdf:${id}`) as string | null;
    
    if (!dataStr) {
      return null;
    }
    
    const data: StoredPDF = JSON.parse(dataStr);
    
    return {
      pdf: Buffer.from(data.pdf, 'base64'),
      filename: data.filename,
    };
  },

  async delete(id: string): Promise<void> {
    if (!kv) {
      return; // Silently skip if storage not configured
    }
    
    await kv.del(`pdf:${id}`);
    console.log(`[STORAGE] Deleted PDF ${id}`);
  },

  // Check if storage is available
  isAvailable(): boolean {
    return kv !== null;
  },
};
