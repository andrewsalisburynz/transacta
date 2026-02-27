/**
 * Database Connection Module
 * 
 * Manages SQLite database connection with connection pooling and error handling.
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

/**
 * Database connection wrapper with promisified methods
 */
export class Database {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  /**
   * Open database connection
   */
  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Ensure data directory exists
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Failed to open database', { error: err.message, path: this.dbPath });
          reject(err);
        } else {
          logger.info('Database connection opened', { path: this.dbPath });
          resolve();
        }
      });
    });
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          logger.error('Failed to close database', { error: err.message });
          reject(err);
        } else {
          logger.info('Database connection closed');
          this.db = null;
          resolve();
        }
      });
    });
  }

  /**
   * Enable foreign keys and set pragmas
   */
  async configure(): Promise<void> {
    await this.run('PRAGMA foreign_keys = ON');
    await this.run('PRAGMA encoding = "UTF-8"');
    await this.run('PRAGMA journal_mode = WAL'); // Write-Ahead Logging for better concurrency
    logger.info('Database configured with foreign keys and WAL mode');
  }

  /**
   * Execute a SQL query that doesn't return rows (INSERT, UPDATE, DELETE)
   * 
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Result with lastID and changes
   */
  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function (err) {
        if (err) {
          logger.error('Database run error', { error: err.message, sql });
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Execute a SQL query that returns a single row
   * 
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Single row or undefined
   */
  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error', { error: err.message, sql });
          reject(err);
        } else {
          resolve(row as T | undefined);
        }
      });
    });
  }

  /**
   * Execute a SQL query that returns multiple rows
   * 
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Array of rows
   */
  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database all error', { error: err.message, sql });
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  /**
   * Execute multiple SQL statements in a transaction
   * 
   * @param callback - Function that executes queries
   * @returns Result of the callback
   */
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      await this.run('BEGIN TRANSACTION');
      const result = await callback();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Execute a SQL script file
   * 
   * @param scriptPath - Path to SQL script file
   */
  async executeScript(scriptPath: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const script = fs.readFileSync(scriptPath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      this.db!.exec(script, (err) => {
        if (err) {
          logger.error('Failed to execute script', { error: err.message, script: scriptPath });
          reject(err);
        } else {
          logger.info('Script executed successfully', { script: scriptPath });
          resolve();
        }
      });
    });
  }
}

/**
 * Singleton database instance
 */
let dbInstance: Database | null = null;

/**
 * Get database instance
 * 
 * @returns Database instance
 */
export function getDatabase(): Database {
  if (!dbInstance) {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'household-spending.db');
    dbInstance = new Database(dbPath);
  }
  return dbInstance;
}

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<Database> {
  const db = getDatabase();
  await db.open();
  await db.configure();
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}
