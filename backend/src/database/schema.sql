-- Household Spending Tracker Database Schema
-- SQLite 3 Database
-- Character Encoding: UTF-8

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Set encoding
PRAGMA encoding = 'UTF-8';

-- ============================================================================
-- TABLE: transactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- CSV Import Fields (14 columns from bank CSV)
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  payee TEXT NOT NULL,
  particulars TEXT,
  code TEXT,
  reference TEXT,
  tran_type TEXT,
  this_party_account TEXT,
  other_party_account TEXT,
  serial TEXT,
  transaction_code TEXT,
  batch_number TEXT,
  originating_bank_branch TEXT,
  processed_date TEXT,
  
  -- Classification Fields
  category_id INTEGER,
  classification_status TEXT NOT NULL DEFAULT 'unclassified',
  confidence_score REAL,
  is_auto_approved BOOLEAN DEFAULT 0,
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Foreign Key Constraints
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Check Constraints
  CHECK (classification_status IN ('unclassified', 'pending', 'approved')),
  CHECK (confidence_score IS NULL OR (confidence_score >= 0.0 AND confidence_score <= 1.0)),
  CHECK (is_auto_approved IN (0, 1))
);

-- Indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(classification_status);
CREATE INDEX IF NOT EXISTS idx_transactions_duplicate ON transactions(date, amount, payee, reference);
CREATE INDEX IF NOT EXISTS idx_transactions_date_category ON transactions(date, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payee ON transactions(payee);

-- ============================================================================
-- TABLE: categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
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
  
  -- Check Constraints
  CHECK (category_type IN ('expense', 'income')),
  CHECK (transaction_count >= 0),
  CHECK (length(name) > 0 AND length(name) <= 100)
);

-- Indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(category_type);

-- ============================================================================
-- TABLE: classification_history
-- ============================================================================

CREATE TABLE IF NOT EXISTS classification_history (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Transaction Reference
  transaction_id INTEGER NOT NULL,
  
  -- Classification Data
  category_id INTEGER NOT NULL,
  payee TEXT NOT NULL,
  particulars TEXT,
  tran_type TEXT,
  amount REAL NOT NULL,
  
  -- Classification Metadata
  classification_method TEXT NOT NULL,
  confidence_score REAL,
  was_corrected BOOLEAN DEFAULT 0,
  previous_category_id INTEGER,
  
  -- Metadata
  classified_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Foreign Key Constraints
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (previous_category_id) REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Check Constraints
  CHECK (classification_method IN ('manual', 'ml_auto', 'ml_accepted')),
  CHECK (confidence_score IS NULL OR (confidence_score >= 0.0 AND confidence_score <= 1.0)),
  CHECK (was_corrected IN (0, 1))
);

-- Indexes for classification_history table
CREATE INDEX IF NOT EXISTS idx_classification_history_transaction ON classification_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_classification_history_category ON classification_history(category_id);
CREATE INDEX IF NOT EXISTS idx_classification_history_payee ON classification_history(payee);
CREATE INDEX IF NOT EXISTS idx_classification_history_training ON classification_history(payee, category_id);
CREATE INDEX IF NOT EXISTS idx_classification_history_date ON classification_history(classified_at);

-- ============================================================================
-- TABLE: ml_model_metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS ml_model_metadata (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Model Information
  model_version TEXT NOT NULL,
  model_file_path TEXT NOT NULL,
  model_type TEXT NOT NULL,
  
  -- Training Information
  training_samples_count INTEGER DEFAULT 0,
  training_accuracy REAL,
  validation_accuracy REAL,
  last_trained_at TEXT,
  
  -- Model Configuration
  confidence_threshold REAL DEFAULT 0.8,
  feature_extraction_method TEXT,
  model_parameters TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Check Constraints
  CHECK (training_accuracy IS NULL OR (training_accuracy >= 0.0 AND training_accuracy <= 1.0)),
  CHECK (validation_accuracy IS NULL OR (validation_accuracy >= 0.0 AND validation_accuracy <= 1.0)),
  CHECK (confidence_threshold >= 0.0 AND confidence_threshold <= 1.0),
  CHECK (is_active IN (0, 1)),
  CHECK (training_samples_count >= 0)
);

-- Indexes for ml_model_metadata table
CREATE INDEX IF NOT EXISTS idx_ml_model_metadata_active ON ml_model_metadata(is_active);
CREATE INDEX IF NOT EXISTS idx_ml_model_metadata_version ON ml_model_metadata(model_version);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp on transactions
CREATE TRIGGER IF NOT EXISTS update_transactions_timestamp 
AFTER UPDATE ON transactions
BEGIN
  UPDATE transactions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on categories
CREATE TRIGGER IF NOT EXISTS update_categories_timestamp 
AFTER UPDATE ON categories
BEGIN
  UPDATE categories SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on ml_model_metadata
CREATE TRIGGER IF NOT EXISTS update_ml_model_metadata_timestamp 
AFTER UPDATE ON ml_model_metadata
BEGIN
  UPDATE ml_model_metadata SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger to update category statistics on transaction insert
CREATE TRIGGER IF NOT EXISTS update_category_stats_on_insert
AFTER INSERT ON transactions
WHEN NEW.category_id IS NOT NULL AND NEW.classification_status = 'approved'
BEGIN
  UPDATE categories 
  SET 
    transaction_count = transaction_count + 1,
    total_amount = total_amount + NEW.amount
  WHERE id = NEW.category_id;
END;

-- Trigger to update category statistics on transaction update
CREATE TRIGGER IF NOT EXISTS update_category_stats_on_update
AFTER UPDATE ON transactions
WHEN NEW.category_id IS NOT NULL AND NEW.classification_status = 'approved'
BEGIN
  -- Decrement old category (if exists and was approved)
  UPDATE categories 
  SET 
    transaction_count = transaction_count - 1,
    total_amount = total_amount - OLD.amount
  WHERE id = OLD.category_id 
    AND OLD.category_id IS NOT NULL 
    AND OLD.classification_status = 'approved';
  
  -- Increment new category
  UPDATE categories 
  SET 
    transaction_count = transaction_count + 1,
    total_amount = total_amount + NEW.amount
  WHERE id = NEW.category_id;
END;

-- Trigger to update category statistics on transaction delete
CREATE TRIGGER IF NOT EXISTS update_category_stats_on_delete
AFTER DELETE ON transactions
WHEN OLD.category_id IS NOT NULL AND OLD.classification_status = 'approved'
BEGIN
  UPDATE categories 
  SET 
    transaction_count = transaction_count - 1,
    total_amount = total_amount - OLD.amount
  WHERE id = OLD.category_id;
END;
