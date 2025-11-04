import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

/**
 * Request logging middleware
 * Logs all incoming requests with method, URL, and response time
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, url, ip } = req;

  // Log request
  logger.info('Incoming request', {
    method,
    url,
    ip,
    userAgent: req.get('user-agent'),
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    if (logLevel === 'error') {
      logger.error('Request completed with error', undefined, {
        method,
        url,
        statusCode,
        duration,
        ip,
      });
    } else if (logLevel === 'warn') {
      logger.warn('Request completed with client error', {
        method,
        url,
        statusCode,
        duration,
        ip,
      });
    } else {
      logger.info('Request completed', {
        method,
        url,
        statusCode,
        duration,
        ip,
      });
    }
  });

  next();
}

/**
 * Error logging middleware
 * Logs any unhandled errors that occur during request processing
 */
export function errorLogger(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Unhandled error in request', err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  next(err);
}
