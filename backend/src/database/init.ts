/**
 * Database Initialization Script
 * 
 * Initializes the database schema and seeds default categories.
 */

import path from 'path';
import { getDatabase, initializeDatabase, closeDatabase } from './connection';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Default categories to seed
 */
const DEFAULT_CATEGORIES = [
  {
    name: 'Groceries',
    description: 'Food and household supplies',
    category_type: 'expense',
    color: '#4CAF50',
  },
  {
    name: 'Utilities',
    description: 'Electricity, water, internet, phone',
    category_type: 'expense',
    color: '#2196F3',
  },
  {
    name: 'Entertainment',
    description: 'Movies, dining out, hobbies, subscriptions',
    category_type: 'expense',
    color: '#FF9800',
  },
  {
    name: 'Transportation',
    description: 'Gas, public transport, parking, vehicle maintenance',
    category_type: 'expense',
    color: '#9C27B0',
  },
  {
    name: 'Healthcare',
    description: 'Medical expenses, pharmacy, insurance',
    category_type: 'expense',
    color: '#F44336',
  },
  {
    name: 'Shopping',
    description: 'Clothing, electronics, household items',
    category_type: 'expense',
    color: '#E91E63',
  },
  {
    name: 'Housing',
    description: 'Rent, mortgage, property maintenance',
    category_type: 'expense',
    color: '#795548',
  },
  {
    name: 'Salary',
    description: 'Monthly salary and wages',
    category_type: 'income',
    color: '#8BC34A',
  },
  {
    name: 'Savings',
    description: 'Transfers to savings accounts',
    category_type: 'expense',
    color: '#00BCD4',
  },
  {
    name: 'Other',
    description: 'Miscellaneous expenses',
    category_type: 'expense',
    color: '#9E9E9E',
  },
];

/**
 * Initialize database schema
 */
async function initializeSchema(): Promise<void> {
  const db = getDatabase();
  const schemaPath = path.join(__dirname, 'schema.sql');
  
  logger.info('Initializing database schema...');
  await db.executeScript(schemaPath);
  logger.info('Database schema initialized successfully');
}

/**
 * Seed default categories
 */
async function seedCategories(): Promise<void> {
  const db = getDatabase();
  
  logger.info('Seeding default categories...');
  
  for (const category of DEFAULT_CATEGORIES) {
    try {
      // Check if category already exists
      const existing = await db.get(
        'SELECT id FROM categories WHERE name = ?',
        [category.name]
      );
      
      if (!existing) {
        await db.run(
          `INSERT INTO categories (name, description, category_type, color)
           VALUES (?, ?, ?, ?)`,
          [category.name, category.description, category.category_type, category.color]
        );
        logger.info(`Seeded category: ${category.name}`);
      } else {
        logger.info(`Category already exists: ${category.name}`);
      }
    } catch (error) {
      logger.error(`Failed to seed category: ${category.name}`, { error });
    }
  }
  
  logger.info('Default categories seeded successfully');
}

/**
 * Main initialization function
 */
async function main(): Promise<void> {
  try {
    logger.info('Starting database initialization...');
    
    // Initialize database connection
    await initializeDatabase();
    
    // Initialize schema
    await initializeSchema();
    
    // Seed default categories
    await seedCategories();
    
    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed', { error });
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('Database initialized successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeSchema, seedCategories };
