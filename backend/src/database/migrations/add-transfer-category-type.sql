-- Migration: Add TRANSFER category type
-- Date: 2026-02-27
-- Description: Adds 'transfer' as a valid category type for transactions between accounts

-- Note: SQLite doesn't support ALTER TABLE to modify CHECK constraints
-- We need to recreate the table with the new constraint

-- Step 1: Create new categories table with updated constraint
CREATE TABLE IF NOT EXISTS categories_new (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Category Fields
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category_type TEXT NOT NULL DEFAULT 'expense',
  color TEXT,
  
  -- Statistics (denormalized for performance)
  transaction_count INTEGER DEFAULT 0,
  total_amount REAL DEFAULT 0.0,
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Check Constraints (UPDATED)
  CHECK (category_type IN ('expense', 'income', 'transfer')),
  CHECK (transaction_count >= 0),
  CHECK (length(name) > 0 AND length(name) <= 100)
);

-- Step 2: Copy data from old table to new table
INSERT INTO categories_new 
SELECT * FROM categories;

-- Step 3: Drop old table
DROP TABLE categories;

-- Step 4: Rename new table to original name
ALTER TABLE categories_new RENAME TO categories;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(category_type);

-- Step 6: Recreate triggers
CREATE TRIGGER IF NOT EXISTS update_categories_timestamp 
AFTER UPDATE ON categories
BEGIN
  UPDATE categories SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Step 7: Insert default Transfer category if it doesn't exist
INSERT OR IGNORE INTO categories (name, description, category_type, color)
VALUES ('Transfer', 'Money transfers between accounts', 'transfer', '#607D8B');
