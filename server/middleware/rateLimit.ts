import rateLimit from 'express-rate-limit';

// Rate limiter for PDF conversion API
// Prevents abuse by limiting requests per IP address
export const conversionLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10), // 10 requests per window default
  message: {
    error: 'Too many conversion requests',
    message: 'You have exceeded the maximum number of PDF conversions allowed. Please try again later.',
    retryAfter: 'Please wait before making another request.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use default IP-based key generator (handles IPv6 correctly)
  // Skip rate limiting for certain conditions (optional)
  skip: (req) => {
    // Skip rate limiting if API key is provided and valid (future enhancement)
    const apiKey = req.headers['x-api-key'];
    if (apiKey && process.env.ADMIN_API_KEY && apiKey === process.env.ADMIN_API_KEY) {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    console.warn(`[Rate Limit] IP ${req.ip} exceeded conversion rate limit`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the maximum number of PDF conversions allowed. Please try again in a minute.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10) / 1000),
    });
  },
});

// General API rate limiter (more lenient)
export const generalApiLimiter = rateLimit({
  windowMs: parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
  max: parseInt(process.env.GENERAL_RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'Please slow down and try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default IP-based key generator (handles IPv6 correctly)
  skip: (req) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && process.env.ADMIN_API_KEY && apiKey === process.env.ADMIN_API_KEY) {
      return true;
    }
    return false;
  },
});
