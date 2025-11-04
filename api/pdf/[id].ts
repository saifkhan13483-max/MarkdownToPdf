import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pdfStorage } from '../lib/storage';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid PDF ID' });
    }

    // Check if storage is configured
    if (!pdfStorage.isAvailable()) {
      return res.status(503).json({
        error: 'PDF sharing is not configured',
        message: 'To enable PDF sharing, set up Vercel KV storage. See VERCEL_STORAGE_SETUP.md for instructions.',
      });
    }

    try {
      const stored = await pdfStorage.get(id);

      if (!stored) {
        return res.status(404).json({ error: 'PDF not found or expired' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${stored.filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return res.status(200).send(stored.pdf);
    } catch (storageError) {
      console.error('[PDF] Storage error:', storageError);
      return res.status(503).json({
        error: 'Failed to retrieve PDF',
        message: storageError instanceof Error ? storageError.message : 'Storage unavailable',
      });
    }
  } catch (error) {
    console.error('PDF retrieval error:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve PDF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
