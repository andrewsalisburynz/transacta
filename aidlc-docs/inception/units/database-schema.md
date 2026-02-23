# Database Schema Specification - Household Spending Tracker

## Overview
Complete SQL DDL specification for the SQLite database. This schema supports transaction storage, category management, ML classification history, and model metadata.

---

## Database Technology
- **Database**: SQLite 3
- **File Location**: `./data/household-spending.db`
- **Character Encoding**: UTF-8
- **Foreign Keys**: Enabled

---

## Tables

### 1. transactions

Stores all imported bank transactions with classification information.

#### Table Definition

```sql
CREATE TABLE transactions (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- CSV Import Fields (14 columns from bank CSV)
  date TEXT NOT NULL,                    -- Transaction date (YYYY-MM-DD format)
  amount REAL NOT NULL,                  -- Transaction amount (negative for expenses, positive for income)
  payee TEXT NOT NULL,                   -- Merchant/payee name
  particulars TEXT,                      -- Additional transaction details
  code TEXT,                             -- Bank code
  reference TEXT,                        -- Transaction reference
  tran_type TEXT,                        -- Transaction type (POS, FT, etc.)
  this_party_account TEXT,               -- User's account number
  other_party_account TEXT,              -- Other party's account number
  serial TEXT,                           -- Transaction serial number
  transaction_code TEXT,                 -- Bank transaction code
  batch_number TEXT,                     -- Batch number
  originating_bank_branch TEXT,          -- Originating bank/branch
  processed_date TEXT,                   -- Date transaction was processed
  
  -- Classification Fields
  category_id INTEGER,                   -- Foreign key to categories table
  classification_status TEXT NOT NULL DEFAULT 'unclassified',  -- Status: unclassified, pending, approved
  confidence_score REAL,                 -- ML confidence score (0.0 to 1.0)
  is_auto_approved BOOLEAN DEFAULT 0,    -- Whether classification was auto-approved
  
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
```

#### Indexes

```sql
-- Index for date range queries (reports)
CREATE INDEX idx_transactions_date ON transactions(date);

-- Index for category queries
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- Index for classification status queries (review queue)
CREATE INDEX idx_transactions_status ON transactions(classification_status);

-- Index for duplicate detection
CREATE INDEX idx_transactions_duplicate ON transactions(date, amount, payee, reference);

-- Composite index for monthly reports
CREATE INDEX idx_transactions_date_category ON transactions(date, category_id);

-- Index for payee searches (ML training)
CREATE INDEX idx_transactions_payee ON transactions(payee);
```

#### Column Details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary key |
| date | TEXT | NO | - | Transaction date (ISO 8601: YYYY-MM-DD) |
| amount | REAL | NO | - | Amount (negative = expense, positive = income) |
| payee | TEXT | NO | - | Merchant/payee name (max 255 chars) |
| particulars | TEXT | YES | NULL | Additional details (max 500 chars) |
| code | TEXT | YES | NULL | Bank code |
| reference | TEXT | YES | NULL | Transaction reference |
| tran_type | TEXT | YES | NULL | Transaction type (POS, FT, AP, etc.) |
| this_party_account | TEXT | YES | NULL | User's account number |
| other_party_account | TEXT | YES | NULL | Other party's account |
| serial | TEXT | YES | NULL | Serial number |
| transaction_code | TEXT | YES | NULL | Bank transaction code |
| batch_number | TEXT | YES | NULL | Batch number |
| originating_bank_branch | TEXT | YES | NULL | Originating bank/branch |
| processed_date | TEXT | YES | NULL | Processing date (ISO 8601) |
| category_id | INTEGER | YES | NULL | Foreign key to categories |
| classification_status | TEXT | NO | 'unclassified' | Status enum |
| confidence_score | REAL | YES | NULL | ML confidence (0.0-1.0) |
| is_auto_approved | BOOLEAN | NO | 0 | Auto-approval flag |
| created_at | TEXT | NO | NOW | Record creation timestamp |
| updated_at | TEXT | NO | NOW | Record update timestamp |

---

### 2. categories

Stores user-defined spending categories.

#### Table Definition

```sql
CREATE TABLE categories (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Category Fields
  name TEXT NOT NULL UNIQUE,             -- Category name (unique)
  description TEXT,                      -- Optional description
  category_type TEXT NOT NULL DEFAULT 'expense',  -- Type: expense or income
  color TEXT,                            -- Optional color code for UI (hex format)
  
  -- Statistics (denormalized for performance)
  transaction_count INTEGER DEFAULT 0,  -- Count of transactions in this category
  total_amount REAL DEFAULT 0.0,        -- Total amount for this category
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Check Constraints
  CHECK (category_type IN ('expense', 'income')),
  CHECK (transaction_count >= 0),
  CHECK (length(name) > 0 AND length(name) <= 100)
);
```

#### Indexes

```sql
-- Index for name searches
CREATE INDEX idx_categories_name ON categories(name);

-- Index for type filtering
CREATE INDEX idx_categories_type ON categories(category_type);
```

#### Column Details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary key |
| name | TEXT | NO | - | Category name (unique, 1-100 chars) |
| description | TEXT | YES | NULL | Optional description (max 500 chars) |
| category_type | TEXT | NO | 'expense' | Type: expense or income |
| color | TEXT | YES | NULL | Hex color code (e.g., #FF5733) |
| transaction_count | INTEGER | NO | 0 | Cached transaction count |
| total_amount | REAL | NO | 0.0 | Cached total amount |
| created_at | TEXT | NO | NOW | Record creation timestamp |
| updated_at | TEXT | NO | NOW | Record update timestamp |

---

### 3. classification_history

Stores historical classification decisions for ML training.

#### Table Definition

```sql
CREATE TABLE classification_history (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Transaction Reference
  transaction_id INTEGER NOT NULL,       -- Foreign key to transactions table
  
  -- Classification Data
  category_id INTEGER NOT NULL,          -- Foreign key to categories table
  payee TEXT NOT NULL,                   -- Payee at time of classification
  particulars TEXT,                      -- Particulars at time of classification
  tran_type TEXT,                        -- Transaction type at time of classification
  amount REAL NOT NULL,                  -- Amount at time of classification
  
  -- Classification Metadata
  classification_method TEXT NOT NULL,   -- Method: manual, ml_auto, ml_accepted
  confidence_score REAL,                 -- ML confidence score (if ML classification)
  was_corrected BOOLEAN DEFAULT 0,       -- Whether user corrected ML suggestion
  previous_category_id INTEGER,          -- Previous category (if reclassified)
  
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
```

#### Indexes

```sql
-- Index for transaction history lookup
CREATE INDEX idx_classification_history_transaction ON classification_history(transaction_id);

-- Index for category-based training data queries
CREATE INDEX idx_classification_history_category ON classification_history(category_id);

-- Index for payee-based training data queries
CREATE INDEX idx_classification_history_payee ON classification_history(payee);

-- Composite index for ML training queries
CREATE INDEX idx_classification_history_training ON classification_history(payee, category_id);

-- Index for date-based queries
CREATE INDEX idx_classification_history_date ON classification_history(classified_at);
```

#### Column Details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary key |
| transaction_id | INTEGER | NO | - | Foreign key to transactions |
| category_id | INTEGER | NO | - | Foreign key to categories |
| payee | TEXT | NO | - | Payee name (snapshot) |
| particulars | TEXT | YES | NULL | Particulars (snapshot) |
| tran_type | TEXT | YES | NULL | Transaction type (snapshot) |
| amount | REAL | NO | - | Amount (snapshot) |
| classification_method | TEXT | NO | - | Method enum |
| confidence_score | REAL | YES | NULL | ML confidence (0.0-1.0) |
| was_corrected | BOOLEAN | NO | 0 | Correction flag |
| previous_category_id | INTEGER | YES | NULL | Previous category (if reclassified) |
| classified_at | TEXT | NO | NOW | Classification timestamp |

---

### 4. ml_model_metadata

Stores ML model metadata and training information.

#### Table Definition

```sql
CREATE TABLE ml_model_metadata (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Model Information
  model_version TEXT NOT NULL,           -- Model version (e.g., "1.0.0")
  model_file_path TEXT NOT NULL,         -- Path to model file
  model_type TEXT NOT NULL,              -- Model type (e.g., "neural_network", "naive_bayes")
  
  -- Training Information
  training_samples_count INTEGER DEFAULT 0,  -- Number of training samples
  training_accuracy REAL,                -- Training accuracy (0.0-1.0)
  validation_accuracy REAL,              -- Validation accuracy (0.0-1.0)
  last_trained_at TEXT,                  -- Last training timestamp
  
  -- Model Configuration
  confidence_threshold REAL DEFAULT 0.8, -- Auto-approval threshold
  feature_extraction_method TEXT,        -- Feature extraction method
  model_parameters TEXT,                 -- JSON string of model parameters
  
  -- Status
  is_active BOOLEAN DEFAULT 1,           -- Whether this model is active
  
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
```

#### Indexes

```sql
-- Index for active model lookup
CREATE INDEX idx_ml_model_metadata_active ON ml_model_metadata(is_active);

-- Index for version lookup
CREATE INDEX idx_ml_model_metadata_version ON ml_model_metadata(model_version);
```

#### Column Details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary key |
| model_version | TEXT | NO | - | Semantic version (e.g., "1.0.0") |
| model_file_path | TEXT | NO | - | Relative path to model file |
| model_type | TEXT | NO | - | Model type identifier |
| training_samples_count | INTEGER | NO | 0 | Number of training samples |
| training_accuracy | REAL | YES | NULL | Training accuracy (0.0-1.0) |
| validation_accuracy | REAL | YES | NULL | Validation accuracy (0.0-1.0) |
| last_trained_at | TEXT | YES | NULL | Last training timestamp |
| confidence_threshold | REAL | NO | 0.8 | Auto-approval threshold |
| feature_extraction_method | TEXT | YES | NULL | Feature extraction method |
| model_parameters | TEXT | YES | NULL | JSON parameters |
| is_active | BOOLEAN | NO | 1 | Active flag |
| created_at | TEXT | NO | NOW | Record creation timestamp |
| updated_at | TEXT | NO | NOW | Record update timestamp |

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│   categories    │
│─────────────────│
│ id (PK)         │
│ name            │
│ category_type   │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────┴────────────────┐
│    transactions         │
│─────────────────────────│
│ id (PK)                 │
│ category_id (FK)        │
│ date, amount, payee     │
│ classification_status   │
└────────┬────────────────┘
         │
         │ 1:N
         │
┌────────┴─────────────────────┐
│  classification_history      │
│──────────────────────────────│
│ id (PK)                      │
│ transaction_id (FK)          │
│ category_id (FK)             │
│ classification_method        │
└──────────────────────────────┘

┌──────────────────────────┐
│  ml_model_metadata       │
│──────────────────────────│
│ id (PK)                  │
│ model_version            │
│ is_active                │
└──────────────────────────┘
```

### Relationship Details

1. **categories → transactions** (1:N)
   - One category can have many transactions
   - Transaction can have zero or one category (NULL if unclassified)
   - ON DELETE SET NULL: If category deleted, transactions set to NULL

2. **transactions → classification_history** (1:N)
   - One transaction can have multiple classification history entries
   - Each history entry belongs to one transaction
   - ON DELETE CASCADE: If transaction deleted, history entries deleted

3. **categories → classification_history** (1:N)
   - One category can appear in many history entries
   - Each history entry references one category
   - ON DELETE CASCADE: If category deleted, history entries deleted

---

## Sample Data

### Sample Categories

```sql
INSERT INTO categories (name, description, category_type, color) VALUES
  ('Groceries', 'Food and household supplies', 'expense', '#4CAF50'),
  ('Utilities', 'Electricity, water, internet', 'expense', '#2196F3'),
  ('Entertainment', 'Movies, dining out, hobbies', 'expense', '#FF9800'),
  ('Transportation', 'Gas, public transport, parking', 'expense', '#9C27B0'),
  ('Healthcare', 'Medical expenses, pharmacy', 'expense', '#F44336'),
  ('Salary', 'Monthly salary income', 'income', '#8BC34A'),
  ('Savings', 'Transfers to savings account', 'expense', '#00BCD4');
```

### Sample Transactions

```sql
INSERT INTO transactions (
  date, amount, payee, particulars, tran_type, 
  category_id, classification_status, confidence_score
) VALUES
  ('2024-01-15', -45.50, 'COUNTDOWN SUPERMARKET', 'Weekly groceries', 'POS', 1, 'approved', 0.95),
  ('2024-01-16', -120.00, 'CONTACT ENERGY', 'Monthly electricity', 'AP', 2, 'approved', 0.88),
  ('2024-01-17', -35.00, 'NETFLIX', 'Subscription', 'POS', 3, 'approved', 0.92),
  ('2024-01-20', 3500.00, 'EMPLOYER LTD', 'Salary payment', 'FT', 6, 'approved', 0.99),
  ('2024-01-22', -25.00, 'UNKNOWN MERCHANT', 'Purchase', 'POS', NULL, 'unclassified', NULL);
```

### Sample Classification History

```sql
INSERT INTO classification_history (
  transaction_id, category_id, payee, amount, 
  classification_method, confidence_score, was_corrected
) VALUES
  (1, 1, 'COUNTDOWN SUPERMARKET', -45.50, 'ml_auto', 0.95, 0),
  (2, 2, 'CONTACT ENERGY', -120.00, 'ml_accepted', 0.88, 0),
  (3, 3, 'NETFLIX', -35.00, 'manual', NULL, 0),
  (4, 6, 'EMPLOYER LTD', 3500.00, 'ml_auto', 0.99, 0);
```

### Sample ML Model Metadata

```sql
INSERT INTO ml_model_metadata (
  model_version, model_file_path, model_type,
  training_samples_count, training_accuracy, confidence_threshold, is_active
) VALUES
  ('1.0.0', './models/classifier_v1.json', 'neural_network', 150, 0.85, 0.8, 1);
```

---

## Database Initialization Script

```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Set encoding
PRAGMA encoding = 'UTF-8';

-- Create tables
-- (Include all CREATE TABLE statements from above)

-- Create indexes
-- (Include all CREATE INDEX statements from above)

-- Insert default categories (optional)
-- (Include sample categories if desired)

-- Create triggers for updated_at
CREATE TRIGGER update_transactions_timestamp 
AFTER UPDATE ON transactions
BEGIN
  UPDATE transactions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_categories_timestamp 
AFTER UPDATE ON categories
BEGIN
  UPDATE categories SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_ml_model_metadata_timestamp 
AFTER UPDATE ON ml_model_metadata
BEGIN
  UPDATE ml_model_metadata SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Create trigger to update category statistics
CREATE TRIGGER update_category_stats_on_insert
AFTER INSERT ON transactions
WHEN NEW.category_id IS NOT NULL AND NEW.classification_status = 'approved'
BEGIN
  UPDATE categories 
  SET 
    transaction_count = transaction_count + 1,
    total_amount = total_amount + NEW.amount
  WHERE id = NEW.category_id;
END;

CREATE TRIGGER update_category_stats_on_update
AFTER UPDATE ON transactions
WHEN NEW.category_id IS NOT NULL AND NEW.classification_status = 'approved'
BEGIN
  -- Decrement old category
  UPDATE categories 
  SET 
    transaction_count = transaction_count - 1,
    total_amount = total_amount - OLD.amount
  WHERE id = OLD.category_id AND OLD.category_id IS NOT NULL;
  
  -- Increment new category
  UPDATE categories 
  SET 
    transaction_count = transaction_count + 1,
    total_amount = total_amount + NEW.amount
  WHERE id = NEW.category_id;
END;

CREATE TRIGGER update_category_stats_on_delete
AFTER DELETE ON transactions
WHEN OLD.category_id IS NOT NULL AND OLD.classification_status = 'approved'
BEGIN
  UPDATE categories 
  SET 
    transaction_count = transaction_count - 1,
    total_amount = total_amount - OLD.amount
  WHERE id = OLD.category_id;
END;
```

---

## Query Examples

### Get Unclassified Transactions
```sql
SELECT id, date, payee, amount, particulars
FROM transactions
WHERE classification_status = 'unclassified'
ORDER BY date DESC;
```

### Get Monthly Report
```sql
SELECT 
  c.name AS category,
  COUNT(t.id) AS transaction_count,
  SUM(t.amount) AS total_amount
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.date >= '2024-01-01' 
  AND t.date < '2024-02-01'
  AND t.classification_status = 'approved'
GROUP BY c.id, c.name
ORDER BY total_amount ASC;
```

### Find Duplicate Transactions
```sql
SELECT date, amount, payee, reference, COUNT(*) as count
FROM transactions
GROUP BY date, amount, payee, reference
HAVING COUNT(*) > 1;
```

### Get Classification Training Data
```sql
SELECT 
  ch.payee,
  ch.particulars,
  ch.tran_type,
  c.name AS category
FROM classification_history ch
JOIN categories c ON ch.category_id = c.id
WHERE ch.classification_method IN ('manual', 'ml_accepted')
ORDER BY ch.classified_at DESC;
```

### Get Active ML Model
```sql
SELECT *
FROM ml_model_metadata
WHERE is_active = 1
ORDER BY created_at DESC
LIMIT 1;
```

---

## Performance Considerations

### Indexing Strategy
- All foreign keys are indexed
- Date columns indexed for range queries
- Payee indexed for text searches
- Composite indexes for common query patterns

### Denormalization
- Category statistics (transaction_count, total_amount) denormalized for performance
- Updated via triggers to maintain consistency

### Query Optimization
- Use EXPLAIN QUERY PLAN to analyze slow queries
- Consider adding covering indexes for frequently accessed columns
- Use prepared statements to improve query performance

---

## Backup and Maintenance

### Backup Strategy
```bash
# Backup database
sqlite3 household-spending.db ".backup household-spending-backup.db"

# Export to SQL
sqlite3 household-spending.db .dump > household-spending-backup.sql
```

### Maintenance Tasks
```sql
-- Vacuum database (reclaim space)
VACUUM;

-- Analyze database (update statistics)
ANALYZE;

-- Check integrity
PRAGMA integrity_check;
```

---

## Migration Strategy

### Version Control
- Store schema version in database
- Use migration scripts for schema changes
- Test migrations on backup before applying to production

### Example Migration Script
```sql
-- Migration: Add color column to categories
-- Version: 1.1.0
-- Date: 2024-02-01

BEGIN TRANSACTION;

-- Add new column
ALTER TABLE categories ADD COLUMN color TEXT;

-- Update schema version (if version table exists)
-- UPDATE schema_version SET version = '1.1.0';

COMMIT;
```

---

## Notes

- **SQLite Limitations**: No native ENUM type (use TEXT with CHECK constraints)
- **Date Storage**: Store dates as TEXT in ISO 8601 format (YYYY-MM-DD)
- **Boolean Storage**: Use INTEGER (0 = false, 1 = true)
- **Foreign Keys**: Must be explicitly enabled with `PRAGMA foreign_keys = ON`
- **Triggers**: Used to maintain denormalized data and timestamps
- **Performance**: Indexes created for all common query patterns
