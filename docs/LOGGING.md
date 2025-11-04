# Logging and Monitoring

This application uses structured logging with optional Sentry integration for error tracking and monitoring.

## Console Logging

By default, all logs are written to stdout/stderr with structured formatting:

```
[2025-11-04T10:57:16.000Z] [INFO] Server started {"port": 5000}
[2025-11-04T10:57:17.000Z] [INFO] Incoming request {"method": "GET", "url": "/", "ip": "::1"}
[2025-11-04T10:57:17.123Z] [INFO] Request completed {"method": "GET", "url": "/", "statusCode": 200, "duration": 123}
```

## Log Levels

Set the `LOG_LEVEL` environment variable to control verbosity:

- `debug` - All logs (most verbose)
- `info` - Info, warnings, and errors (default)
- `warn` - Warnings and errors
- `error` - Errors only

Example:
```bash
LOG_LEVEL=debug npm run dev
```

## Sentry Integration (Optional)

To enable Sentry error tracking, set the following environment variables:

```bash
# Required
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional
SENTRY_TRACES_SAMPLE_RATE=0.1  # Sample rate for performance monitoring (0.0 to 1.0)
```

When enabled, Sentry will:
- Capture all errors and exceptions
- Track warning-level messages
- Provide performance monitoring
- Include contextual information (request details, user info, etc.)

## Usage in Code

```typescript
import { logger } from './server/lib/logger';

// Basic logging
logger.info('User logged in', { userId: 123 });
logger.warn('Rate limit approaching', { ip: '127.0.0.1', requests: 95 });
logger.error('Database connection failed', error, { operation: 'connect' });

// Create child logger with default context
const requestLogger = logger.child({ requestId: req.id });
requestLogger.info('Processing request');
requestLogger.error('Failed to process', error);
```

## Request Logging

All HTTP requests are automatically logged with:
- Method and URL
- IP address and user agent
- Response status code
- Response time in milliseconds

## Error Tracking

Errors are automatically tracked with:
- Full stack traces
- Request context (method, URL, headers)
- Custom context data
- User information (when available)

## Best Practices

1. **Use appropriate log levels**
   - `debug`: Detailed debugging information
   - `info`: Normal operational messages
   - `warn`: Warning conditions that should be reviewed
   - `error`: Error conditions that need attention

2. **Include context**
   ```typescript
   // Good
   logger.info('PDF generated', { filename: 'doc.pdf', pageCount: 5 });
   
   // Bad
   logger.info('PDF generated');
   ```

3. **Don't log sensitive data**
   ```typescript
   // Bad
   logger.info('User authenticated', { password: '...' });
   
   // Good
   logger.info('User authenticated', { userId: 123 });
   ```

4. **Use child loggers for scoped context**
   ```typescript
   const pdfLogger = logger.child({ module: 'pdf-generator' });
   pdfLogger.info('Starting conversion');
   ```

## Production Deployment

For production deployments:

1. Set `LOG_LEVEL=info` or `LOG_LEVEL=warn`
2. Configure Sentry DSN for error tracking
3. Use log aggregation service (CloudWatch, Datadog, etc.) to collect logs
4. Set up alerts based on error rates and patterns
