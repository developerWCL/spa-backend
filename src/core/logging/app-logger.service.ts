import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

/**
 * Metadata that can be passed to log methods.
 */
export interface LogMeta {
  /** Spa ID for filtering logs by spa */
  spaId?: string;
  /** Request ID for tracing requests across services */
  requestId?: string;
  /** HTTP method (GET, POST, etc.) */
  method?: string;
  /** Request path */
  path?: string;
  /** HTTP status code */
  statusCode?: number;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Any additional metadata */
  [key: string]: any;
}

/**
 * Centralized logging service using Winston.
 * All logs go to files only - no database persistence.
 *
 * **Output destinations:**
 * - Console: All logs (colorized in development)
 * - File: All logs to `logs/app-YYYY-MM-DD.log` (configurable retention)
 * - File: Errors only to `logs/error-YYYY-MM-DD.log`
 *
 * **Environment variables:**
 * - LOG_DIR: Directory for log files (default: 'logs')
 * - LOG_LEVEL: Minimum log level (default: 'info')
 * - LOG_RETENTION_DAYS: Days to keep local logs (default: '30d')
 *
 * @example
 * this.logger.log('Processing request');
 * this.logger.log('Reservation created', { spaId, reservationId });
 * this.logger.error('Payment failed', error.stack, { spaId });
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private winston: winston.Logger;
  private context: string = 'Application';

  constructor() {
    const logDir = process.env.LOG_DIR || 'logs';
    const retentionDays = process.env.LOG_RETENTION_DAYS || '30d';

    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        // Console transport (always enabled)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ level, message, timestamp, context, ...meta }) => {
                const ctx = context || this.context;
                const metaStr = Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : '';
                return `${timestamp} [${ctx}] ${level}: ${message}${metaStr}`;
              },
            ),
          ),
        }),
        // Rotating file transport
        new winston.transports.DailyRotateFile({
          filename: `${logDir}/app-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: retentionDays,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        // Error-only rotating file
        new winston.transports.DailyRotateFile({
          filename: `${logDir}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: retentionDays,
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });
  }

  /**
   * Set the context (usually the class name) for this logger instance.
   * Call this in the constructor of your service/controller.
   */
  setContext(context: string) {
    this.context = context;
    return this;
  }

  /**
   * Log an info message.
   */
  log(message: string, meta?: LogMeta) {
    this.winston.info(message, { context: this.context, ...meta });
  }

  /**
   * Log an error message.
   */
  error(message: string, trace?: string, meta?: LogMeta) {
    this.winston.error(message, {
      context: this.context,
      stack: trace,
      ...meta,
    });
  }

  /**
   * Log a warning message.
   */
  warn(message: string, meta?: LogMeta) {
    this.winston.warn(message, { context: this.context, ...meta });
  }

  /**
   * Log a debug message.
   */
  debug(message: string, meta?: LogMeta) {
    this.winston.debug(message, { context: this.context, ...meta });
  }

  /**
   * Log a verbose message.
   */
  verbose(message: string, meta?: LogMeta) {
    this.winston.verbose(message, { context: this.context, ...meta });
  }
}
