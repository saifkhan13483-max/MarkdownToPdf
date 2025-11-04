import type { VercelRequest, VercelResponse } from '@vercel/node';

// This would need to be replaced with a real database or Redis in production
// For serverless, consider using Vercel KV or another persistent storage
const pdfStorage = new Map<string, { pdf: Buffer; filename: string }>();

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

    const stored = pdfStorage.get(id);

    if (!stored) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${stored.filename}"`);
    return res.status(200).send(stored.pdf);
  } catch (error) {
    console.error('PDF retrieval error:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve PDF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
