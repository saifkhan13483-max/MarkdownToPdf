import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for feedback (for demo)
const feedbackStore: Array<{ message: string; timestamp: string }> = [];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid feedback message' });
      }

      if (message.length > 1000) {
        return res.status(400).json({ error: 'Feedback message too long (max 1000 characters)' });
      }

      const feedback = {
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      feedbackStore.push(feedback);

      return res.status(200).json({ 
        success: true,
        message: 'Feedback submitted successfully' 
      });
    } catch (error) {
      console.error('Feedback submission error:', error);
      return res.status(500).json({ 
        error: 'Failed to submit feedback',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'GET') {
    // Admin endpoint to retrieve feedback
    const adminKey = req.query.key;
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey) {
      return res.status(401).json({ error: 'Admin access not configured' });
    }

    if (adminKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ 
      feedback: feedbackStore,
      count: feedbackStore.length 
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
