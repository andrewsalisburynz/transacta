/**
 * Database Migration Runner
 * 
 * Runs database migrations to update schema.
 */

import path from 'path';
import { getDatabase, initializeDatabase, closeDatabase } from './connection';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Run migration to add transfer category type
 */
async function runMigration(): Promise<void> {
  const db = getDatabase();
  const migrationPath = path.join(__dirname, 'migrations', 'add-transfer-category-type.sql');
  
  logger.info('Running migration: add-transfer-category-type...');
  
  try {
    await db.executeScript(migrationPath);
    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed', { error });
    throw error;
  }
}

/**
 * Main migration function
 */
async function main(): Promise<void> {
  try {
    logger.info('Starting database migration...');
    
    // Initialize database connection
    await initializeDatabase();
    
    // Run migration
    await runMigration();
    
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Database migration failed', { error });
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runMigration };
