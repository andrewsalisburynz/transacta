/**
 * Logger Utility
 * 
 * Provides structured logging with Winston.
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console log format (human-readable)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

/**
 * Winston logger instance
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
});

/**
 * Log an error with context
 * 
 * @param message - Error message
 * @param meta - Additional context
 */
export function logError(message: string, meta?: Record<string, any>): void {
  logger.error(message, meta);
}

/**
 * Log a warning with context
 * 
 * @param message - Warning message
 * @param meta - Additional context
 */
export function logWarn(message: string, meta?: Record<string, any>): void {
  logger.warn(message, meta);
}

/**
 * Log an info message with context
 * 
 * @param message - Info message
 * @param meta - Additional context
 */
export function logInfo(message: string, meta?: Record<string, any>): void {
  logger.info(message, meta);
}

/**
 * Log a debug message with context
 * 
 * @param message - Debug message
 * @param meta - Additional context
 */
export function logDebug(message: string, meta?: Record<string, any>): void {
  logger.debug(message, meta);
}

/**
 * Create a child logger with default metadata
 * 
 * @param defaultMeta - Default metadata to include in all logs
 * @returns Child logger
 */
export function createChildLogger(defaultMeta: Record<string, any>): winston.Logger {
  return logger.child(defaultMeta);
}
