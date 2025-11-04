import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For file uploads, use multipart/form-data
    // In serverless, you'd typically use a library like 'formidable' or handle it differently
    // For simplicity, we'll accept JSON with file content
    
    const { filename, text } = req.body;

    if (!filename || !text) {
      return res.status(400).json({ error: 'Missing filename or text' });
    }

    // Validate file extension
    const ext = filename.toLowerCase();
    if (!ext.endsWith('.md') && !ext.endsWith('.markdown')) {
      return res.status(400).json({ error: 'Only .md or .markdown files are allowed' });
    }

    // Validate file size (2MB max)
    const maxSize = 2097152; // 2MB
    if (text.length > maxSize) {
      return res.status(413).json({ error: 'File too large (max 2MB)' });
    }

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
}
