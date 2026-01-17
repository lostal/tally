/**
 * Logger System - Tally
 *
 * Centralized logging with environment-aware output.
 * Replaces direct console.log calls for better production control.
 *
 * @example
 * import { logger } from '@/lib/logger';
 *
 * logger.debug('User logged in', { userId: '123' });
 * logger.error('Payment failed', error);
 * logger.warn('Low stock', { productId: 'abc' });
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/** Logger levels */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Log metadata */
interface LogMetadata {
  [key: string]: unknown;
}

/**
 * Format log message with optional metadata
 */
function formatLog(level: LogLevel, message: string, meta?: LogMetadata): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (meta && Object.keys(meta).length > 0) {
    return `${prefix} ${message} ${JSON.stringify(meta)}`;
  }

  return `${prefix} ${message}`;
}

/**
 * Centralized logger
 *
 * - `debug`: Development-only logs (disabled in production)
 * - `info`: Informational messages (all environments)
 * - `warn`: Warnings (all environments)
 * - `error`: Errors (all environments)
 */
export const logger = {
  /**
   * Debug logs - Only in development
   * Use for verbose logging during development.
   */
  debug: (message: string, meta?: LogMetadata) => {
    if (isDevelopment && !isTest) {
      console.log(formatLog('debug', message, meta));
    }
  },

  /**
   * Info logs - All environments
   * Use for general information.
   */
  info: (message: string, meta?: LogMetadata) => {
    if (!isTest) {
      console.info(formatLog('info', message, meta));
    }
  },

  /**
   * Warning logs - All environments
   * Use for non-critical issues.
   */
  warn: (message: string, meta?: LogMetadata) => {
    if (!isTest) {
      console.warn(formatLog('warn', message, meta));
    }
  },

  /**
   * Error logs - All environments
   * Use for errors and exceptions.
   */
  error: (message: string, error?: Error | unknown, meta?: LogMetadata) => {
    if (!isTest) {
      const errorMeta =
        error instanceof Error
          ? { ...meta, error: error.message, stack: error.stack }
          : { ...meta, error };

      console.error(formatLog('error', message, errorMeta));
    }
  },
};

/**
 * Performance logging helper
 * Measures execution time of async operations.
 *
 * @example
 * const endTimer = logger.time('fetchOrders');
 * await fetchOrders();
 * endTimer(); // Logs: "[DEBUG] fetchOrders took 245ms"
 */
export function time(label: string): () => void {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;
    logger.debug(`${label} took ${duration.toFixed(2)}ms`);
  };
}

/**
 * Log HTTP request details
 * Useful for API route logging.
 */
export function logRequest(method: string, url: string, meta?: LogMetadata): void {
  logger.info(`${method} ${url}`, meta);
}

/**
 * Log HTTP response details
 */
export function logResponse(method: string, url: string, status: number, duration?: number): void {
  const meta: LogMetadata = { status };
  if (duration) {
    meta.duration = `${duration.toFixed(2)}ms`;
  }

  logger.info(`${method} ${url} → ${status}`, meta);
}
