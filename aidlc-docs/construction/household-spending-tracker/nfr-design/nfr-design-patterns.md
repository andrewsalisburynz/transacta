# NFR Design Patterns - Household Spending Tracker

## Purpose
This document defines design patterns and implementation strategies for meeting the non-functional requirements (NFRs) of the Household Spending Tracker application. Each pattern addresses specific NFR categories and provides concrete implementation guidance.

---

## 1. Performance Optimization Patterns

### 1.1 Caching Strategy - Categories List Only (Q1: A)

**Pattern**: Simple In-Memory Cache

**NFR Addressed**: Performance (reduce database queries)

**Implementation**:
```typescript
// Simple JavaScript object cache - no dedicated cache library
class CategoryCache {
  private categories: Category[] | null = null
  private lastUpdated: Date | null = null
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  async getCategories(): Promise<Category[]> {
    if (this.isValid()) {
      return this.categories!
    }
    
    // Cache miss - fetch from database
    this.categories = await categoryRepository.findAll()
    this.lastUpdated = new Date()
    return this.categories
  }

  invalidate(): void {
    this.categories = null
    this.lastUpdated = null
  }

  private isValid(): boolean {
    if (!this.categories || !this.lastUpdated) return false
    const age = Date.now() - this.lastUpdated.getTime()
    return age < this.TTL
  }
}
```

**Usage**:
- Cache categories on application startup
- Invalidate cache when categories are created/updated/deleted
- No cache for transactions (always fetch fresh data)

**Trade-offs**:
- ✅ Simple implementation, no external dependencies
- ✅ Reduces database queries for frequently accessed data
- ❌ Manual cache invalidation required
- ❌ No distributed cache (single instance only)

---

### 1.2 Virtual Scrolling - Vue Library (Q2: A)

**Pattern**: Virtual Scrolling with vue-virtual-scroller

**NFR Addressed**: Performance (UI responsiveness with large lists)

**Implementation**:
```typescript
// Install: npm install vue-virtual-scroller
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

// TransactionList.vue
<template>
  <RecycleScroller
    :items="transactions"
    :item-size="60"
    key-field="id"
    v-slot="{ item }"
  >
    <TransactionRow :transaction="item" />
  </RecycleScroller>
</template>
```

**Usage**:
- Use for transaction lists (potentially 1,000+ items)
- Use for category selection dropdowns (50+ categories)
- Not needed for reports (already aggregated data)

**Trade-offs**:
- ✅ Handles large lists efficiently (only renders visible items)
- ✅ Mature library with good Vue 3 support
- ❌ Adds external dependency
- ❌ Slightly more complex than standard v-for

---

### 1.3 Data Loading Strategy - Eager Loading (Q3: A)

**Pattern**: Eager Loading with Loading Indicators

**NFR Addressed**: Performance (perceived performance)

**Implementation**:
```typescript
// Load all data upfront when view is mounted
async function loadTransactionView() {
  showLoadingIndicator()
  
  try {
    // Load all data in parallel
    const [transactions, categories, stats] = await Promise.all([
      transactionService.getAll(),
      categoryService.getAll(),
      dashboardService.getStats()
    ])
    
    // Update UI
    state.transactions = transactions
    state.categories = categories
    state.stats = stats
  } finally {
    hideLoadingIndicator()
  }
}
```

**Usage**:
- Load all transactions when opening transaction list
- Load all categories when opening category management
- Show loading spinner during data fetch
- No pagination or lazy loading

**Trade-offs**:
- ✅ Simple implementation
- ✅ All data available immediately after load
- ✅ No complex pagination logic
- ❌ Initial load time for large datasets
- ❌ Not scalable beyond 5,000 transactions

---

### 1.4 ML Model Loading - Application Startup (Q4: A)

**Pattern**: Preload ML Model on Startup

**NFR Addressed**: Performance (ML classification speed)

**Implementation**:
```typescript
// backend/src/server.ts
async function startServer() {
  console.log('Loading ML model...')
  await mlService.loadModel()
  console.log('ML model loaded successfully')
  
  // Start Express server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

// backend/src/services/MLService.ts
class MLService {
  private model: tf.LayersModel | null = null
  
  async loadModel(): Promise<void> {
    const modelPath = await this.getModelPath()
    
    if (modelPath) {
      this.model = await tf.loadLayersModel(modelPath)
    } else {
      // No model yet - will be created on first training
      this.model = this.createNewModel()
    }
  }
  
  async classify(transaction: Transaction): Promise<ClassificationResult> {
    if (!this.model) {
      throw new Error('Model not loaded')
    }
    // Classification logic...
  }
}
```

**Usage**:
- Load model when backend starts
- Model stays in memory for entire application lifetime
- No lazy loading or on-demand loading

**Trade-offs**:
- ✅ Fast classification (model already in memory)
- ✅ Simple implementation
- ❌ Slower application startup
- ❌ Model stays in memory even when not used

---

## 2. Resilience and Error Handling Patterns

### 2.1 Retry Pattern - Database Operations Only (Q5: A)

**Pattern**: Simple Retry with Exponential Backoff

**NFR Addressed**: Reliability (handle transient database errors)

**Implementation**:
```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Only retry on transient errors
      if (!isTransientError(error)) {
        throw error
      }
      
      // Wait before retry (exponential backoff)
      const delay = baseDelay * Math.pow(2, attempt)
      await sleep(delay)
    }
  }
  
  throw lastError!
}

function isTransientError(error: any): boolean {
  // SQLite transient errors
  return error.code === 'SQLITE_BUSY' || 
         error.code === 'SQLITE_LOCKED'
}

// Usage
async function saveTransaction(transaction: Transaction): Promise<void> {
  await withRetry(() => transactionRepository.save(transaction))
}
```

**Usage**:
- Retry database operations only (not API calls, not file operations)
- Max 3 retries with exponential backoff
- Only retry transient errors (SQLITE_BUSY, SQLITE_LOCKED)

**Trade-offs**:
- ✅ Handles SQLite lock contention
- ✅ Simple implementation
- ❌ Adds latency on retries
- ❌ Doesn't handle all error types

---

### 2.2 Input Validation - Interactive Validation (Q6: C)

**Pattern**: Interactive Validation with User Feedback

**NFR Addressed**: Security (prevent invalid data), Usability (user-friendly errors)

**Implementation**:
```typescript
// CSV Import - Interactive validation
async function validateAndImportCSV(file: File): Promise<ImportResult> {
  const rows = await parseCSV(file)
  const validRows: Transaction[] = []
  
  for (const [index, row] of rows.entries()) {
    const validation = validateRow(row)
    
    if (!validation.valid) {
      // Pause import and show error dialog
      const action = await showValidationDialog({
        rowNumber: index + 1,
        row: row,
        errors: validation.errors
      })
      
      if (action === 'skip') {
        continue // Skip this row
      } else if (action === 'edit') {
        const correctedRow = await getUserCorrectedData(row)
        validRows.push(correctedRow)
      } else if (action === 'cancel') {
        throw new Error('Import cancelled by user')
      }
    } else {
      validRows.push(row)
    }
  }
  
  return importTransactions(validRows)
}

// Form validation - Real-time feedback
function validateCategoryName(name: string): ValidationResult {
  const errors: string[] = []
  
  if (!name || name.trim().length === 0) {
    errors.push('Category name is required')
  }
  
  if (name.trim().length > 50) {
    errors.push('Category name must be 50 characters or less')
  }
  
  return { valid: errors.length === 0, errors }
}
```

**Usage**:
- Interactive validation for CSV import (pause on errors)
- Real-time validation for forms (show errors as user types)
- Server-side validation for all inputs
- Use parameterized queries to prevent SQL injection

**Trade-offs**:
- ✅ User-friendly error handling
- ✅ Prevents invalid data from entering system
- ✅ Good user experience
- ❌ More complex than batch validation

---

### 2.3 ML Classification Fallback - Mark as Unclassified (Q7: A)

**Pattern**: Graceful Degradation

**NFR Addressed**: Reliability (handle ML failures)

**Implementation**:
```typescript
async function classifyTransaction(transaction: Transaction): Promise<ClassificationResult> {
  try {
    // Attempt ML classification
    const result = await mlService.predict(transaction)
    return result
  } catch (error) {
    // Log error for debugging
    logger.error('ML classification failed', { 
      transactionId: transaction.id, 
      error 
    })
    
    // Graceful fallback - mark as unclassified
    return {
      transactionId: transaction.id,
      suggestedCategoryId: null,
      confidenceScore: 0,
      status: 'unclassified',
      reason: 'Classification failed - manual review required'
    }
  }
}
```

**Usage**:
- If ML model fails to load, mark transactions as unclassified
- If prediction fails, mark as unclassified
- User can manually classify later
- Log all ML failures for debugging

**Trade-offs**:
- ✅ Application continues to work even if ML fails
- ✅ Simple fallback strategy
- ❌ User must manually classify more transactions
- ❌ No automatic retry of failed classifications

---

## 3. Observability Patterns

### 3.1 Logging Strategy - File Logging with Metrics (Q8: A, Q9: B, Q10: A)

**Pattern**: Structured Logging with Winston

**NFR Addressed**: Maintainability (debugging), Operations (monitoring)

**Implementation**:
```typescript
// backend/src/utils/logger.ts
import winston from 'winston'
import path from 'path'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Error log
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 7,
      tailable: true
    }),
    // Combined log
    new winston.transports.File({ 
      filename: path.join('logs', 'application.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 7,
      tailable: true
    }),
    // Console output in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// Metrics logging
function logMetric(operation: string, duration: number, metadata?: object) {
  logger.info('Performance metric', {
    operation,
    duration,
    ...metadata
  })
}

export { logger, logMetric }
```

**Usage**:
- Log all errors with stack traces (ERROR level)
- Log important operations (INFO level): CSV import, ML classification, report generation
- Log performance metrics: operation duration, record counts
- Daily rotation, keep 7 days of logs
- No real-time monitoring dashboard

**Log Levels**:
- ERROR: Exceptions, failures, critical issues
- WARN: Validation failures, deprecated features
- INFO: Major operations, performance metrics
- DEBUG: Detailed debugging information (disabled in production)

**Trade-offs**:
- ✅ Structured logs easy to parse
- ✅ Automatic log rotation
- ✅ Good for debugging and troubleshooting
- ❌ No real-time monitoring
- ❌ Manual log analysis required

---

## 4. Security Patterns

### 4.1 API Security - Backend GraphQL Schema Validation (Q11: D)

**Pattern**: Schema-First GraphQL with Type Validation

**NFR Addressed**: Security (input validation), Reliability (type safety)

**Implementation**:
```typescript
// backend/src/api/schema/schema.graphql
type Query {
  transactions(filter: TransactionFilter): [Transaction!]!
  categories: [Category!]!
  report(month: Int!, year: Int!): Report!
}

type Mutation {
  importCSV(file: Upload!): ImportResult!
  createCategory(input: CreateCategoryInput!): Category!
  classifyTransaction(id: ID!, categoryId: ID!): Transaction!
}

input CreateCategoryInput {
  name: String! @constraint(maxLength: 50, pattern: "^\\S.*\\S$")
  description: String @constraint(maxLength: 500)
  categoryType: CategoryType!
}

enum CategoryType {
  EXPENSE
  INCOME
}

# GraphQL automatically validates:
# - Required fields (!)
# - Type correctness (String, Int, ID, etc.)
# - Enum values
# - Custom constraints (via directives)
```

**Usage**:
- Define all API operations in GraphQL schema
- GraphQL validates all inputs automatically
- Use custom directives for additional validation (length, pattern)
- No manual validation needed for type correctness

**Trade-offs**:
- ✅ Automatic type validation
- ✅ Self-documenting API
- ✅ Type safety from frontend to backend
- ❌ More complex than REST
- ❌ Learning curve for GraphQL

---

### 4.2 SQL Injection Prevention - Parameterized Queries Only (Q12: A)

**Pattern**: Parameterized Queries with Type-Safe Repository

**NFR Addressed**: Security (prevent SQL injection)

**Implementation**:
```typescript
// backend/src/repositories/TransactionRepository.ts
class TransactionRepository {
  async findById(id: string): Promise<Transaction | null> {
    // ✅ GOOD: Parameterized query
    const query = 'SELECT * FROM transactions WHERE id = ?'
    const result = await db.get(query, [id])
    return result ? this.mapToEntity(result) : null
  }
  
  async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    // ✅ GOOD: Multiple parameters
    const query = `
      SELECT * FROM transactions 
      WHERE date >= ? AND date <= ?
      ORDER BY date DESC
    `
    const results = await db.all(query, [startDate, endDate])
    return results.map(r => this.mapToEntity(r))
  }
  
  async save(transaction: Transaction): Promise<void> {
    // ✅ GOOD: Parameterized insert
    const query = `
      INSERT INTO transactions (id, date, amount, payee, categoryId, ...)
      VALUES (?, ?, ?, ?, ?, ...)
    `
    await db.run(query, [
      transaction.id,
      transaction.date,
      transaction.amount,
      transaction.payee,
      transaction.categoryId,
      // ... other fields
    ])
  }
  
  // ❌ BAD: Never do this!
  // async findByPayee(payee: string): Promise<Transaction[]> {
  //   const query = `SELECT * FROM transactions WHERE payee = '${payee}'`
  //   return await db.all(query)
  // }
}
```

**Usage**:
- Always use parameterized queries (? placeholders)
- Never concatenate user input into SQL strings
- Use repository pattern to encapsulate database access
- TypeScript types provide additional safety

**Trade-offs**:
- ✅ Prevents SQL injection attacks
- ✅ Standard practice, well-supported
- ✅ No performance overhead
- ❌ Slightly more verbose than string concatenation

---

### 4.3 File Upload Security - Multi-Layer Validation (Q13: C)

**Pattern**: Defense in Depth for File Uploads

**NFR Addressed**: Security (prevent malicious file uploads)

**Implementation**:
```typescript
async function validateUploadedFile(file: Express.Multer.File): Promise<ValidationResult> {
  const errors: string[] = []
  
  // Layer 1: File extension validation
  const allowedExtensions = ['.csv']
  const ext = path.extname(file.originalname).toLowerCase()
  if (!allowedExtensions.includes(ext)) {
    errors.push(`Invalid file extension. Only CSV files are allowed.`)
  }
  
  // Layer 2: MIME type validation
  const allowedMimeTypes = ['text/csv', 'application/csv', 'text/plain']
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push(`Invalid file type. Expected CSV, got ${file.mimetype}`)
  }
  
  // Layer 3: Content validation (magic bytes)
  const content = await fs.readFile(file.path, 'utf-8')
  if (!looksLikeCSV(content)) {
    errors.push('File content does not appear to be valid CSV')
  }
  
  // Layer 4: File size validation
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size is 10MB`)
  }
  
  return { valid: errors.length === 0, errors }
}

function looksLikeCSV(content: string): boolean {
  // Check for CSV characteristics
  const lines = content.split('\n')
  if (lines.length < 2) return false // Need header + at least 1 row
  
  const header = lines[0]
  const expectedColumns = 14
  const columnCount = header.split(',').length
  
  return columnCount === expectedColumns
}
```

**Usage**:
- Validate file extension (.csv only)
- Validate MIME type (text/csv, application/csv)
- Validate file content (looks like CSV)
- Validate file size (max 10MB)
- All layers must pass

**Trade-offs**:
- ✅ Multiple layers of defense
- ✅ Prevents common attack vectors
- ✅ Good balance of security and usability
- ❌ More complex than single validation
- ❌ May reject some valid files

---

## 5. Database Optimization Patterns

### 5.1 Database Indexing - Minimal Indexes (Q14: A)

**Pattern**: Primary Key Indexes Only

**NFR Addressed**: Performance (query speed), Simplicity (no index maintenance)

**Implementation**:
```sql
-- transactions table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,  -- Automatic index on primary key
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  payee TEXT NOT NULL,
  categoryId TEXT,
  classificationStatus TEXT NOT NULL,
  -- ... other fields
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,  -- Automatic index on primary key
  name TEXT NOT NULL UNIQUE,  -- Automatic index on UNIQUE constraint
  categoryType TEXT NOT NULL,
  -- ... other fields
);

-- classification_history table
CREATE TABLE classification_history (
  id TEXT PRIMARY KEY,  -- Automatic index on primary key
  transactionId TEXT NOT NULL,
  categoryId TEXT NOT NULL,
  -- ... other fields
  FOREIGN KEY (transactionId) REFERENCES transactions(id),
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- No additional indexes created
-- Rely on primary key indexes and sequential scans for queries
```

**Usage**:
- Only primary key indexes (automatic)
- UNIQUE constraint on category name (automatic index)
- No indexes on foreign keys
- No indexes on date, amount, or other query fields
- Accept sequential scans for queries (acceptable for < 5,000 records)

**Trade-offs**:
- ✅ Simple database schema
- ✅ No index maintenance overhead
- ✅ Faster writes (no index updates)
- ❌ Slower queries on non-indexed fields
- ❌ Not scalable beyond 5,000 records

---

### 5.2 Connection Pooling - No Pooling (Q15: A)

**Pattern**: Single Database Connection

**NFR Addressed**: Simplicity (no connection management)

**Implementation**:
```typescript
// backend/src/database/connection.ts
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await open({
      filename: './data/household-spending.db',
      driver: sqlite3.Database
    })
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON')
  }
  
  return db
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close()
    db = null
  }
}

// Usage in repositories
class TransactionRepository {
  async findAll(): Promise<Transaction[]> {
    const db = await getDatabase()
    const results = await db.all('SELECT * FROM transactions')
    return results.map(r => this.mapToEntity(r))
  }
}
```

**Usage**:
- Single database connection for entire application
- Connection opened on first use
- Connection stays open until application shutdown
- No connection pool, no connection limits

**Trade-offs**:
- ✅ Simple implementation
- ✅ No connection pool overhead
- ✅ Sufficient for single-user local application
- ❌ No concurrent query support
- ❌ Not suitable for multi-user applications

---

### 5.3 Transaction Management - Multi-Step Operations Only (Q16: B)

**Pattern**: Selective Transaction Usage

**NFR Addressed**: Data Integrity (ACID for critical operations)

**Implementation**:
```typescript
// Use transactions for multi-step operations
async function importTransactions(transactions: Transaction[]): Promise<void> {
  const db = await getDatabase()
  
  await db.exec('BEGIN TRANSACTION')
  
  try {
    // Insert all transactions
    for (const txn of transactions) {
      await db.run(
        'INSERT INTO transactions (...) VALUES (...)',
        [/* parameters */]
      )
    }
    
    // Update category statistics
    await db.run('UPDATE categories SET transactionCount = ...')
    
    await db.exec('COMMIT')
  } catch (error) {
    await db.exec('ROLLBACK')
    throw error
  }
}

// No transaction for single operations
async function updateTransaction(id: string, data: Partial<Transaction>): Promise<void> {
  const db = await getDatabase()
  
  // Single UPDATE - no transaction needed
  await db.run(
    'UPDATE transactions SET categoryId = ?, updatedAt = ? WHERE id = ?',
    [data.categoryId, new Date().toISOString(), id]
  )
}

// Use transaction for category deletion with reassignment
async function deleteCategoryWithReassignment(
  categoryId: string, 
  replacementCategoryId: string
): Promise<void> {
  const db = await getDatabase()
  
  await db.exec('BEGIN TRANSACTION')
  
  try {
    // Reassign all transactions
    await db.run(
      'UPDATE transactions SET categoryId = ? WHERE categoryId = ?',
      [replacementCategoryId, categoryId]
    )
    
    // Update classification history
    await db.run(
      'UPDATE classification_history SET categoryId = ? WHERE categoryId = ?',
      [replacementCategoryId, categoryId]
    )
    
    // Delete category
    await db.run('DELETE FROM categories WHERE id = ?', [categoryId])
    
    await db.exec('COMMIT')
  } catch (error) {
    await db.exec('ROLLBACK')
    throw error
  }
}
```

**Usage**:
- Use transactions for:
  - CSV import (multiple inserts)
  - Category deletion with reassignment (update + delete)
  - Batch operations
- No transactions for:
  - Single INSERT/UPDATE/DELETE
  - Read operations (SELECT)

**Trade-offs**:
- ✅ Data integrity for critical operations
- ✅ Simple approach (no transaction for everything)
- ✅ Good performance (no unnecessary transaction overhead)
- ❌ Manual decision for each operation

---

## 6. Data Management Patterns

### 6.1 Cache Strategy - No Dedicated Cache (Q17: C)

**Pattern**: Simple JavaScript Objects for Caching

**NFR Addressed**: Performance (reduce redundant operations)

**Implementation**:
```typescript
// Simple in-memory cache using JavaScript objects
class SimpleCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map()
  private readonly ttl: number

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Usage
const categoryCache = new SimpleCache<Category[]>(5)

async function getCategories(): Promise<Category[]> {
  const cached = categoryCache.get('all')
  if (cached) return cached
  
  const categories = await categoryRepository.findAll()
  categoryCache.set('all', categories)
  return categories
}
```

**Usage**:
- Cache categories list (changes infrequently)
- Cache ML model in memory (loaded on startup)
- No cache for transactions (changes frequently)
- No distributed cache (single instance)

**Trade-offs**:
- ✅ No external dependencies
- ✅ Simple implementation
- ✅ Sufficient for local application
- ❌ No persistence (lost on restart)
- ❌ No distributed cache support

---

### 6.2 CSV File Handling - Process and Discard (Q18: A)

**Pattern**: Transient File Processing

**NFR Addressed**: Security (no file retention), Simplicity (no file management)

**Implementation**:
```typescript
import multer from 'multer'
import fs from 'fs/promises'

// Configure multer for temporary file storage
const upload = multer({
  dest: './temp/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

async function handleCSVUpload(file: Express.Multer.File): Promise<ImportResult> {
  try {
    // Validate file
    await validateUploadedFile(file)
    
    // Read and parse CSV
    const content = await fs.readFile(file.path, 'utf-8')
    const rows = parseCSV(content)
    
    // Process rows
    const result = await importTransactions(rows)
    
    return result
  } finally {
    // Always delete file after processing
    try {
      await fs.unlink(file.path)
    } catch (error) {
      logger.warn('Failed to delete temporary file', { path: file.path, error })
    }
  }
}
```

**Usage**:
- Save uploaded file to temp directory
- Process CSV immediately
- Delete file after processing (success or failure)
- No permanent storage of CSV files

**Trade-offs**:
- ✅ No file storage management
- ✅ No disk space concerns
- ✅ Better security (no sensitive files retained)
- ❌ Cannot re-import same file without re-upload
- ❌ No audit trail of imports

---

### 6.3 Background Processing - Async/Await Only (Q19: D)

**Pattern**: Asynchronous Processing without Job Queue

**NFR Addressed**: Performance (non-blocking operations)

**Implementation**:
```typescript
// CSV Import - Async processing
async function importCSV(file: File): Promise<ImportResult> {
  // Parse and validate (fast)
  const rows = await parseCSV(file)
  const validRows = await validateRows(rows)
  
  // Import to database (async)
  const transactions = await importTransactions(validRows)
  
  // Trigger ML classification (async, don't wait)
  classifyTransactionsAsync(transactions).catch(error => {
    logger.error('Background classification failed', { error })
  })
  
  // Return immediately
  return {
    imported: transactions.length,
    status: 'success'
  }
}

// ML Classification - Fire and forget
async function classifyTransactionsAsync(transactions: Transaction[]): Promise<void> {
  for (const txn of transactions) {
    try {
      const result = await mlService.classify(txn)
      await transactionService.updateClassification(txn.id, result)
    } catch (error) {
      logger.error('Classification failed', { transactionId: txn.id, error })
    }
  }
}

// Report Generation - Synchronous (user waits)
async function generateReport(month: number, year: number): Promise<Report> {
  // User waits for report - no background processing
  const report = await reportService.generate(month, year)
  return report
}
```

**Usage**:
- Use async/await for all I/O operations
- Fire-and-forget for ML classification (don't block import)
- Synchronous for user-facing operations (reports)
- No job queue, no worker processes

**Trade-offs**:
- ✅ Simple implementation
- ✅ No job queue infrastructure
- ✅ Sufficient for small data volumes
- ❌ No job retry mechanism
- ❌ No job status tracking
- ❌ Classification failures are silent (logged only)

---

## 7. Operational Patterns

### 7.1 Health Monitoring - No Health Check Endpoint (Q20: C)

**Pattern**: Implicit Health Monitoring

**NFR Addressed**: Operations (application health)

**Implementation**:
```typescript
// No dedicated health check endpoint
// Application health is implicit:
// - If server responds to requests, it's healthy
// - If server doesn't respond, it's unhealthy

// Startup logging
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase()
    logger.info('Database initialized')
    
    // Load ML model
    await mlService.loadModel()
    logger.info('ML model loaded')
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`)
      console.log(`✓ Application ready at http://localhost:${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server', { error })
    process.exit(1)
  }
}

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request failed', { 
    method: req.method,
    path: req.path,
    error: error.message,
    stack: error.stack
  })
  
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  })
})
```

**Usage**:
- No /health or /status endpoint
- Application health determined by ability to serve requests
- Log startup success/failure
- Log all errors for debugging

**Trade-offs**:
- ✅ Simplest approach
- ✅ No additional code needed
- ✅ Sufficient for local application
- ❌ No programmatic health check
- ❌ Cannot check health without making real request

---

## 8. Code Quality Patterns

### 8.1 Error Handling Pattern

**Pattern**: Consistent Error Handling with User-Friendly Messages

**NFR Addressed**: Reliability (graceful error handling), Usability (clear error messages)

**Implementation**:
```typescript
// Custom error types
class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Error handler utility
function handleError(error: Error, context: string): ErrorResponse {
  logger.error(`Error in ${context}`, {
    error: error.message,
    stack: error.stack,
    type: error.name
  })
  
  if (error instanceof ValidationError) {
    return {
      userMessage: error.message,
      technicalDetails: error.details,
      canRetry: true
    }
  }
  
  if (error instanceof DatabaseError) {
    return {
      userMessage: 'A database error occurred. Please try again.',
      technicalDetails: error.originalError?.message,
      canRetry: true
    }
  }
  
  // Unknown error
  return {
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalDetails: error.message,
    canRetry: true
  }
}

// Usage in resolvers
const resolvers = {
  Mutation: {
    async importCSV(parent, { file }, context) {
      try {
        return await csvImportService.import(file)
      } catch (error) {
        const errorResponse = handleError(error as Error, 'importCSV')
        throw new Error(errorResponse.userMessage)
      }
    }
  }
}
```

**Usage**:
- Define custom error types for different error categories
- Log all errors with context and stack traces
- Return user-friendly error messages
- Include technical details for debugging
- Indicate whether operation can be retried

---

### 8.2 Logging Pattern

**Pattern**: Structured Logging with Context

**NFR Addressed**: Maintainability (debugging), Operations (troubleshooting)

**Implementation**:
```typescript
// Log with context
logger.info('CSV import started', {
  fileName: file.originalname,
  fileSize: file.size,
  userId: context.userId
})

// Log performance metrics
const startTime = Date.now()
const result = await operation()
const duration = Date.now() - startTime

logger.info('Operation completed', {
  operation: 'csvImport',
  duration,
  recordCount: result.count,
  success: true
})

// Log errors with full context
try {
  await riskyOperation()
} catch (error) {
  logger.error('Operation failed', {
    operation: 'riskyOperation',
    error: error.message,
    stack: error.stack,
    context: { /* relevant context */ }
  })
  throw error
}
```

**Usage**:
- Always log with structured data (objects, not strings)
- Include relevant context (IDs, counts, durations)
- Log performance metrics for key operations
- Log errors with full stack traces

---

## 9. Pattern Summary Table

| Pattern | NFR Category | Complexity | Trade-off |
|---------|--------------|------------|-----------|
| Simple In-Memory Cache | Performance | Low | Simple but no persistence |
| Virtual Scrolling | Performance | Medium | Good UX, adds dependency |
| Eager Loading | Performance | Low | Simple but slower initial load |
| Preload ML Model | Performance | Low | Fast classification, slower startup |
| Retry with Backoff | Reliability | Low | Handles transient errors only |
| Interactive Validation | Security/Usability | Medium | Great UX, more complex |
| Graceful Degradation | Reliability | Low | Simple fallback |
| Structured Logging | Maintainability | Low | Good debugging, manual analysis |
| GraphQL Validation | Security | Medium | Automatic validation, learning curve |
| Parameterized Queries | Security | Low | Standard practice, prevents SQL injection |
| Multi-Layer File Validation | Security | Medium | Defense in depth |
| Minimal Indexes | Performance | Low | Simple but not scalable |
| Single Connection | Simplicity | Low | Simple but no concurrency |
| Selective Transactions | Data Integrity | Low | Good balance |
| Simple Cache Objects | Performance | Low | No dependencies |
| Process and Discard Files | Security | Low | No file management |
| Async/Await Only | Performance | Low | Simple but no job queue |
| No Health Check | Operations | Low | Simplest approach |

---

## Notes

- All patterns prioritize simplicity over enterprise features
- Patterns are designed for local, single-user application
- Trade-offs favor ease of development and maintenance
- Patterns are sufficient for < 5,000 transactions
- No distributed systems patterns needed
- Focus on reliability and user experience over scalability

