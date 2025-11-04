/**
 * Structured logging utility with optional Sentry integration
 * 
 * Usage:
 * - Set SENTRY_DSN environment variable to enable Sentry error tracking
 * - Set LOG_LEVEL to control log verbosity (debug, info, warn, error)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private logLevel: LogLevel;
  private sentryEnabled: boolean;
  private sentry: any = null;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.sentryEnabled = !!process.env.SENTRY_DSN;

    if (this.sentryEnabled) {
      this.initializeSentry();
    }
  }

  private async initializeSentry() {
    try {
      const Sentry = await import('@sentry/node');
      
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
        beforeSend(event: any) {
          // Don't send events in test environment
          if (process.env.NODE_ENV === 'test') {
            return null;
          }
          return event;
        },
      });

      this.sentry = Sentry;
      this.info('Sentry initialized successfully');
    } catch (error) {
      // Sentry is optional - if not installed or fails to initialize, just log to console
      console.info('Sentry not available - using console logging only');
      this.sentryEnabled = false;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }

    if (this.sentryEnabled && this.sentry) {
      this.sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.shouldLog('error')) {
      const errorStr = error instanceof Error ? error.stack || error.message : String(error);
      console.error(this.formatMessage('error', message, { ...context, error: errorStr }));
    }

    if (this.sentryEnabled && this.sentry) {
      if (error instanceof Error) {
        this.sentry.captureException(error, {
          extra: { message, ...context },
        });
      } else {
        this.sentry.captureMessage(message, {
          level: 'error',
          extra: { ...context, error },
        });
      }
    }
  }

  /**
   * Create a child logger with additional context
   * Reuses the parent instance to avoid re-initializing Sentry
   */
  child(defaultContext: LogContext): ChildLogger {
    return {
      debug: (message: string, context?: LogContext) => {
        this.debug(message, { ...defaultContext, ...context });
      },
      info: (message: string, context?: LogContext) => {
        this.info(message, { ...defaultContext, ...context });
      },
      warn: (message: string, context?: LogContext) => {
        this.warn(message, { ...defaultContext, ...context });
      },
      error: (message: string, error?: Error | unknown, context?: LogContext) => {
        this.error(message, error, { ...defaultContext, ...context });
      },
    };
  }

  /**
   * Flush any pending logs to Sentry (useful before shutdown)
   */
  async flush(timeout = 2000): Promise<boolean> {
    if (this.sentryEnabled && this.sentry) {
      try {
        await this.sentry.close(timeout);
        return true;
      } catch (error) {
        console.error('Error flushing Sentry logs:', error);
        return false;
      }
    }
    return true;
  }
}

// Child logger interface
interface ChildLogger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: Error | unknown, context?: LogContext) => void;
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogContext, ChildLogger };
