# Logical Components - Household Spending Tracker

## Purpose
This document defines the logical infrastructure components, their configurations, and relationships needed to implement the Household Spending Tracker application according to the NFR requirements.

---

## 1. Component Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Vue 3 Frontend                         │  │
│  │  - UI Components                                          │  │
│  │  - Apollo Client (GraphQL)                                │  │
│  │  - Virtual Scroller                                       │  │
│  │  - Client-side Validation                                 │  │
│  └───────────────────┬───────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │ HTTP/GraphQL (Port 4000)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js Backend Server                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Express + Apollo Server                      │  │
│  │  - GraphQL API                                            │  │
│  │  - File Upload Handler                                    │  │
│  │  - Error Handling Middleware                              │  │
│  └───────────────────┬───────────────────────────────────────┘  │
│                      │                                           │
│  ┌──────────────────┴────────────────────────────────────────┐  │
│  │                  Service Layer                            │  │
│  │  - CSV Import Service                                     │  │
│  │  - Transaction Service                                    │  │
│  │  - Category Service                                       │  │
│  │  - ML Classification Service                              │  │
│  │  - Report Service                                         │  │
│  └───────────────────┬───────────────────────────────────────┘  │
│                      │                                           │
│  ┌──────────────────┴────────────────────────────────────────┐  │
│  │              Repository Layer                             │  │
│  │  - Transaction Repository                                 │  │
│  │  - Category Repository                                    │  │
│  │  - Classification History Repository                      │  │
│  │  - ML Model Repository                                    │  │
│  └───────────────────┬───────────────────────────────────────┘  │
│                      │                                           │
│  ┌──────────────────┴────────────────────────────────────────┐  │
│  │              Cross-Cutting Concerns                       │  │
│  │  - Logger (Winston)                                       │  │
│  │  - Error Handler                                          │  │
│  │  - Validator                                              │  │
│  │  - Cache Manager                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SQLite Database                             │
│  - transactions table                                            │
│  - categories table                                              │
│  - classification_history table                                  │
│  - ml_model_metadata table                                       │
│  File: ./data/household-spending.db                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    TensorFlow.js ML Model                        │
│  - Neural network model                                          │
│  - Stored in database as BLOB                                    │
│  - Loaded in memory on startup                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      File System                                 │
│  - logs/ (application logs)                                      │
│  - temp/ (temporary CSV uploads)                                 │
│  - data/ (SQLite database file)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Components

### 2.1 Vue 3 Application

**Purpose**: User interface and client-side logic

**Technology**: Vue 3 with Composition API, TypeScript, Vite

**Configuration**:
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

**Key Features**:
- Component-based UI
- Reactive state management
- Client-side routing (Vue Router)
- Form validation
- Loading indicators
- Error display

**Dependencies**:
- vue: ^3.3.4
- vue-router: ^4.2.4
- @apollo/client: ^3.8.1
- vue-virtual-scroller: ^2.0.0

---

### 2.2 Apollo Client (GraphQL Client)

**Purpose**: GraphQL API communication

**Configuration**:
```typescript
// frontend/src/apollo/client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql'
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only'  // Always fetch fresh data
    }
  }
})
```

**Key Features**:
- Type-safe GraphQL queries
- Automatic request/response handling
- Error handling
- No caching (network-only fetch policy)

---

### 2.3 Virtual Scroller

**Purpose**: Efficient rendering of large lists

**Configuration**:
```typescript
// Install vue-virtual-scroller
// npm install vue-virtual-scroller

// main.ts
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

app.component('RecycleScroller', RecycleScroller)
```

**Usage**:
- Transaction list (1,000+ items)
- Category selection dropdown (50+ items)
- Classification review queue

---

## 3. Backend Components

### 3.1 Express Server

**Purpose**: HTTP server and middleware

**Technology**: Express 4.x with TypeScript

**Configuration**:
```typescript
// backend/src/server.ts
import express from 'express'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (frontend build)
app.use(express.static('../frontend/dist'))

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

export { app, PORT }
```

**Key Features**:
- CORS enabled for development
- JSON body parsing
- Static file serving (production)
- Error handling middleware
- Request logging

**Dependencies**:
- express: ^4.18.0
- cors: ^2.8.5

---

### 3.2 Apollo Server (GraphQL)

**Purpose**: GraphQL API server

**Technology**: Apollo Server 4.x

**Configuration**:
```typescript
// backend/src/api/apollo-server.ts
import { ApolloServer } from 'apollo-server-express'
import { readFileSync } from 'fs'
import { resolvers } from './resolvers'

const typeDefs = readFileSync('./src/api/schema/schema.graphql', 'utf-8')

export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    // Add context here (e.g., user info, services)
    logger,
    services: {
      transactionService,
      categoryService,
      mlService,
      reportService
    }
  }),
  formatError: (error) => {
    // Log error
    logger.error('GraphQL error', { 
      message: error.message,
      path: error.path,
      extensions: error.extensions
    })
    
    // Return user-friendly error
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
    }
  }
})
```

**Key Features**:
- Schema-first GraphQL API
- Type validation
- Error formatting
- Context injection
- Introspection enabled (development)

**Dependencies**:
- apollo-server-express: ^3.12.0
- graphql: ^16.6.0

---

### 3.3 File Upload Handler

**Purpose**: Handle CSV file uploads

**Technology**: Multer

**Configuration**:
```typescript
// backend/src/middleware/upload.ts
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './temp/uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/csv' ||
        path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'))
    }
  }
})
```

**Key Features**:
- Temporary file storage
- File size limit (10MB)
- File type validation
- Unique filename generation

**Dependencies**:
- multer: ^1.4.5-lts.1

---

## 4. Service Layer Components

### 4.1 CSV Import Service

**Purpose**: Parse and import CSV files

**Responsibilities**:
- Parse CSV structure
- Validate CSV data (interactive)
- Detect duplicates
- Transform to transactions
- Import to database
- Trigger ML classification

**Key Methods**:
```typescript
class CSVImportService {
  async import(file: Express.Multer.File): Promise<ImportResult>
  async parseCSV(filePath: string): Promise<CSVRow[]>
  async validateRow(row: CSVRow): Promise<ValidationResult>
  async detectDuplicates(rows: CSVRow[]): Promise<DuplicateResult>
  async importTransactions(rows: CSVRow[]): Promise<Transaction[]>
}
```

**Dependencies**:
- csv-parse: ^5.5.0

---

### 4.2 Transaction Service

**Purpose**: Manage transaction operations

**Responsibilities**:
- CRUD operations for transactions
- Update classification status
- Get transactions for review
- Filter and search transactions

**Key Methods**:
```typescript
class TransactionService {
  async getAll(filter?: TransactionFilter): Promise<Transaction[]>
  async getById(id: string): Promise<Transaction | null>
  async create(transaction: CreateTransactionInput): Promise<Transaction>
  async update(id: string, data: UpdateTransactionInput): Promise<Transaction>
  async delete(id: string): Promise<void>
  async getForReview(): Promise<Transaction[]>
  async updateClassification(id: string, result: ClassificationResult): Promise<void>
}
```

---

### 4.3 Category Service

**Purpose**: Manage category operations

**Responsibilities**:
- CRUD operations for categories
- Validate category names
- Handle category deletion with reassignment
- Cache category list

**Key Methods**:
```typescript
class CategoryService {
  async getAll(): Promise<Category[]>
  async getById(id: string): Promise<Category | null>
  async create(input: CreateCategoryInput): Promise<Category>
  async update(id: string, data: UpdateCategoryInput): Promise<Category>
  async delete(id: string, replacementId?: string): Promise<void>
  async validateName(name: string): Promise<ValidationResult>
}
```

---

### 4.4 ML Classification Service

**Purpose**: Machine learning classification

**Responsibilities**:
- Load ML model on startup
- Extract features from transactions
- Predict category
- Calculate confidence score
- Handle new merchants
- Train model with new data

**Key Methods**:
```typescript
class MLClassificationService {
  async loadModel(): Promise<void>
  async classify(transaction: Transaction): Promise<ClassificationResult>
  async classifyBatch(transactions: Transaction[]): Promise<ClassificationResult[]>
  async train(trainingData: ClassificationHistory[]): Promise<void>
  extractFeatures(transaction: Transaction): Features
  calculateConfidence(prediction: Prediction, features: Features): number
}
```

**Dependencies**:
- @tensorflow/tfjs-node: ^4.10.0

---

### 4.5 Report Service

**Purpose**: Generate spending reports

**Responsibilities**:
- Generate monthly reports
- Calculate category totals
- Calculate overall totals
- Format report data

**Key Methods**:
```typescript
class ReportService {
  async generateMonthly(month: number, year: number): Promise<Report>
  async getCategoryBreakdown(startDate: Date, endDate: Date): Promise<CategoryReport[]>
  async calculateTotals(transactions: Transaction[]): Promise<ReportTotals>
}
```

---

## 5. Repository Layer Components

### 5.1 Transaction Repository

**Purpose**: Data access for transactions

**Responsibilities**:
- CRUD operations
- Query by filters (date range, status, category)
- Duplicate detection queries

**Key Methods**:
```typescript
class TransactionRepository {
  async findAll(filter?: TransactionFilter): Promise<Transaction[]>
  async findById(id: string): Promise<Transaction | null>
  async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]>
  async findByStatus(status: ClassificationStatus): Promise<Transaction[]>
  async findDuplicates(transaction: Transaction): Promise<Transaction[]>
  async save(transaction: Transaction): Promise<void>
  async update(id: string, data: Partial<Transaction>): Promise<void>
  async delete(id: string): Promise<void>
  async count(): Promise<number>
}
```

**Database Queries**:
```sql
-- Find all transactions
SELECT * FROM transactions ORDER BY date DESC

-- Find by date range
SELECT * FROM transactions 
WHERE date >= ? AND date <= ?
ORDER BY date DESC

-- Find by status
SELECT * FROM transactions 
WHERE classificationStatus = ?
ORDER BY date ASC

-- Find duplicates
SELECT * FROM transactions
WHERE date = ? AND amount = ? AND payee = ? AND reference = ?

-- Count transactions
SELECT COUNT(*) as count FROM transactions
```

---

### 5.2 Category Repository

**Purpose**: Data access for categories

**Responsibilities**:
- CRUD operations
- Find by name (case-insensitive)
- Update statistics (transaction count, total amount)

**Key Methods**:
```typescript
class CategoryRepository {
  async findAll(): Promise<Category[]>
  async findById(id: string): Promise<Category | null>
  async findByName(name: string): Promise<Category | null>
  async save(category: Category): Promise<void>
  async update(id: string, data: Partial<Category>): Promise<void>
  async delete(id: string): Promise<void>
  async updateStatistics(categoryId: string): Promise<void>
}
```

**Database Queries**:
```sql
-- Find all categories
SELECT * FROM categories ORDER BY name ASC

-- Find by name (case-insensitive)
SELECT * FROM categories WHERE LOWER(name) = LOWER(?)

-- Update statistics
UPDATE categories 
SET transactionCount = (
  SELECT COUNT(*) FROM transactions WHERE categoryId = ?
),
totalAmount = (
  SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE categoryId = ?
)
WHERE id = ?
```

---

### 5.3 Classification History Repository

**Purpose**: Data access for classification history

**Responsibilities**:
- Save classification records
- Get training data
- Query by transaction or category

**Key Methods**:
```typescript
class ClassificationHistoryRepository {
  async save(history: ClassificationHistory): Promise<void>
  async findByTransaction(transactionId: string): Promise<ClassificationHistory[]>
  async findByCategory(categoryId: string): Promise<ClassificationHistory[]>
  async getTrainingData(): Promise<ClassificationHistory[]>
  async count(): Promise<number>
}
```

**Database Queries**:
```sql
-- Save classification history
INSERT INTO classification_history (
  id, transactionId, categoryId, payee, particulars, 
  tranType, amount, classificationMethod, confidenceScore,
  wasCorrected, previousCategoryId, classifiedAt
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

-- Get all training data
SELECT * FROM classification_history ORDER BY classifiedAt DESC

-- Count training samples
SELECT COUNT(*) as count FROM classification_history
```

---

### 5.4 ML Model Repository

**Purpose**: Data access for ML model metadata

**Responsibilities**:
- Save/load model metadata
- Get active model
- Update training statistics

**Key Methods**:
```typescript
class MLModelRepository {
  async getActiveModel(): Promise<MLModel | null>
  async save(model: MLModel): Promise<void>
  async update(id: string, data: Partial<MLModel>): Promise<void>
  async updateTrainingStats(id: string, stats: TrainingStats): Promise<void>
}
```

**Database Queries**:
```sql
-- Get active model
SELECT * FROM ml_model_metadata WHERE isActive = 1 LIMIT 1

-- Update training stats
UPDATE ml_model_metadata
SET trainingSamplesCount = ?,
    trainingAccuracy = ?,
    lastTrainedAt = ?,
    updatedAt = ?
WHERE id = ?
```

---

## 6. Cross-Cutting Components

### 6.1 Logger (Winston)

**Purpose**: Structured logging

**Configuration**:
```typescript
// backend/src/utils/logger.ts
import winston from 'winston'
import path from 'path'

const logDir = './logs'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Error log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 7,
      tailable: true
    }),
    // Combined log
    new winston.transports.File({
      filename: path.join(logDir, 'application.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 7,
      tailable: true
    }),
    // Console (development only)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      silent: process.env.NODE_ENV === 'production'
    })
  ]
})

// Metrics logging helper
export function logMetric(
  operation: string, 
  duration: number, 
  metadata?: Record<string, any>
) {
  logger.info('Performance metric', {
    operation,
    duration,
    ...metadata
  })
}
```

**Log Levels**:
- ERROR: Exceptions, failures
- WARN: Validation failures, deprecated features
- INFO: Major operations, performance metrics
- DEBUG: Detailed debugging (disabled in production)

**Log Rotation**:
- Daily rotation
- Keep 7 days of logs
- Max 10MB per file

**Dependencies**:
- winston: ^3.10.0

---

### 6.2 Error Handler

**Purpose**: Centralized error handling

**Configuration**:
```typescript
// backend/src/utils/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DATABASE_ERROR', 500, originalError)
    this.name = 'DatabaseError'
  }
}

export function handleError(error: Error, context: string): ErrorResponse {
  logger.error(`Error in ${context}`, {
    error: error.message,
    stack: error.stack,
    type: error.name
  })
  
  if (error instanceof ValidationError) {
    return {
      userMessage: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      canRetry: true
    }
  }
  
  if (error instanceof DatabaseError) {
    return {
      userMessage: 'A database error occurred. Please try again.',
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      canRetry: true
    }
  }
  
  // Unknown error
  return {
    userMessage: 'An unexpected error occurred. Please try again.',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
    details: error.message,
    canRetry: true
  }
}
```

---

### 6.3 Validator

**Purpose**: Input validation utilities

**Configuration**:
```typescript
// backend/src/utils/validator.ts
export class Validator {
  static validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(`${fieldName} is required`)
    }
  }
  
  static validateLength(value: string, maxLength: number, fieldName: string): void {
    if (value.length > maxLength) {
      throw new ValidationError(
        `${fieldName} must be ${maxLength} characters or less`
      )
    }
  }
  
  static validateDate(value: string, fieldName: string): Date {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      throw new ValidationError(`${fieldName} is not a valid date`)
    }
    return date
  }
  
  static validateNumber(value: any, fieldName: string): number {
    const num = Number(value)
    if (isNaN(num)) {
      throw new ValidationError(`${fieldName} must be a number`)
    }
    return num
  }
  
  static validateEnum<T>(
    value: any, 
    enumValues: T[], 
    fieldName: string
  ): T {
    if (!enumValues.includes(value)) {
      throw new ValidationError(
        `${fieldName} must be one of: ${enumValues.join(', ')}`
      )
    }
    return value
  }
}
```

---

### 6.4 Cache Manager

**Purpose**: Simple in-memory caching

**Configuration**:
```typescript
// backend/src/utils/cache.ts
export class CacheManager<T> {
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

// Global cache instances
export const categoryCache = new CacheManager<Category[]>(5)
```

---

## 7. Data Storage Components

### 7.1 SQLite Database

**Purpose**: Persistent data storage

**Technology**: SQLite 3.x

**Configuration**:
```typescript
// backend/src/database/connection.ts
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (!db) {
    const dbPath = path.join('./data', 'household-spending.db')
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON')
    
    // Set synchronous mode (balance safety and performance)
    await db.exec('PRAGMA synchronous = NORMAL')
    
    // Set journal mode
    await db.exec('PRAGMA journal_mode = DELETE')
    
    logger.info('Database connection established', { path: dbPath })
  }
  
  return db
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close()
    db = null
    logger.info('Database connection closed')
  }
}

export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase()
  
  // Run migrations
  await runMigrations(db)
  
  logger.info('Database initialized')
}
```

**Database Schema**:
```sql
-- transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  payee TEXT NOT NULL,
  particulars TEXT,
  code TEXT,
  reference TEXT,
  tranType TEXT,
  thisPartyAccount TEXT,
  otherPartyAccount TEXT,
  serial TEXT,
  transactionCode TEXT,
  batchNumber TEXT,
  originatingBankBranch TEXT,
  processedDate TEXT,
  categoryId TEXT,
  classificationStatus TEXT NOT NULL DEFAULT 'unclassified',
  confidenceScore REAL,
  isAutoApproved INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  description TEXT,
  categoryType TEXT NOT NULL DEFAULT 'expense',
  color TEXT,
  transactionCount INTEGER NOT NULL DEFAULT 0,
  totalAmount REAL NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- classification_history table
CREATE TABLE IF NOT EXISTS classification_history (
  id TEXT PRIMARY KEY,
  transactionId TEXT NOT NULL,
  categoryId TEXT NOT NULL,
  payee TEXT NOT NULL,
  particulars TEXT,
  tranType TEXT,
  amount REAL NOT NULL,
  classificationMethod TEXT NOT NULL,
  confidenceScore REAL,
  wasCorrected INTEGER NOT NULL DEFAULT 0,
  previousCategoryId TEXT,
  classifiedAt TEXT NOT NULL,
  FOREIGN KEY (transactionId) REFERENCES transactions(id),
  FOREIGN KEY (categoryId) REFERENCES categories(id),
  FOREIGN KEY (previousCategoryId) REFERENCES categories(id)
);

-- ml_model_metadata table
CREATE TABLE IF NOT EXISTS ml_model_metadata (
  id TEXT PRIMARY KEY,
  modelVersion TEXT NOT NULL,
  modelData BLOB,
  modelType TEXT NOT NULL,
  trainingSamplesCount INTEGER NOT NULL DEFAULT 0,
  trainingAccuracy REAL,
  validationAccuracy REAL,
  lastTrainedAt TEXT,
  confidenceThreshold REAL NOT NULL DEFAULT 0.8,
  featureExtractionMethod TEXT,
  modelParameters TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

**Database Location**: `./data/household-spending.db`

**Backup Strategy**: Manual (user copies database file)

**Dependencies**:
- sqlite3: ^5.1.6
- sqlite: ^4.2.1

---

### 7.2 File System Storage

**Purpose**: Temporary file storage and logs

**Directory Structure**:
```
project-root/
├── data/
│   └── household-spending.db    # SQLite database
├── logs/
│   ├── application.log          # Combined logs
│   └── error.log                # Error logs only
├── temp/
│   └── uploads/                 # Temporary CSV uploads (auto-deleted)
└── frontend/
    └── dist/                    # Built frontend (production)
```

**Configuration**:
```typescript
// backend/src/utils/file-system.ts
import fs from 'fs/promises'
import path from 'path'

export async function ensureDirectories(): Promise<void> {
  const dirs = [
    './data',
    './logs',
    './temp/uploads'
  ]
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true })
      logger.info('Directory created', { path: dir })
    } catch (error) {
      logger.error('Failed to create directory', { path: dir, error })
    }
  }
}

export async function cleanupTempFiles(): Promise<void> {
  const tempDir = './temp/uploads'
  
  try {
    const files = await fs.readdir(tempDir)
    
    for (const file of files) {
      const filePath = path.join(tempDir, file)
      const stats = await fs.stat(filePath)
      
      // Delete files older than 1 hour
      const age = Date.now() - stats.mtimeMs
      if (age > 60 * 60 * 1000) {
        await fs.unlink(filePath)
        logger.info('Deleted old temp file', { path: filePath })
      }
    }
  } catch (error) {
    logger.error('Failed to cleanup temp files', { error })
  }
}
```

---

## 8. ML Model Component

### 8.1 TensorFlow.js Model

**Purpose**: Neural network for transaction classification

**Technology**: TensorFlow.js (Node.js backend)

**Model Architecture**:
```typescript
// backend/src/ml/model.ts
import * as tf from '@tensorflow/tfjs-node'

export function createModel(
  vocabularySize: number,
  numCategories: number
): tf.LayersModel {
  const model = tf.sequential()
  
  // Embedding layer for text features
  model.add(tf.layers.embedding({
    inputDim: vocabularySize,
    outputDim: 32,
    inputLength: 20  // Max tokens per transaction
  }))
  
  // Flatten
  model.add(tf.layers.flatten())
  
  // Dense layers
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu'
  }))
  
  model.add(tf.layers.dropout({ rate: 0.3 }))
  
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu'
  }))
  
  // Output layer
  model.add(tf.layers.dense({
    units: numCategories,
    activation: 'softmax'
  }))
  
  // Compile model
  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  })
  
  return model
}
```

**Model Storage**:
- Model weights stored as BLOB in database
- Model metadata in ml_model_metadata table
- Model loaded into memory on startup
- Model updated after training sessions

**Training Configuration**:
```typescript
const trainingConfig = {
  epochs: 50,
  batchSize: 32,
  validationSplit: 0.2,
  callbacks: [
    tf.callbacks.earlyStopping({
      monitor: 'val_loss',
      patience: 5
    })
  ]
}
```

**Dependencies**:
- @tensorflow/tfjs-node: ^4.10.0

---

## 9. Component Dependencies

### 9.1 Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "apollo-server-express": "^3.12.0",
    "graphql": "^16.6.0",
    "sqlite3": "^5.1.6",
    "sqlite": "^4.2.1",
    "@tensorflow/tfjs-node": "^4.10.0",
    "winston": "^3.10.0",
    "csv-parse": "^5.5.0",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/node": "^20.5.0",
    "@types/express": "^4.17.17",
    "@types/multer": "^1.4.7",
    "eslint": "^8.48.0",
    "@typescript-eslint/eslint-plugin": "^6.5.0",
    "@typescript-eslint/parser": "^6.5.0",
    "prettier": "^3.0.3",
    "jest": "^29.6.4",
    "@types/jest": "^29.5.4",
    "supertest": "^6.3.3",
    "ts-node": "^10.9.1"
  }
}
```

---

### 9.2 Frontend Dependencies

```json
{
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.4",
    "@apollo/client": "^3.8.1",
    "graphql": "^16.8.0",
    "vue-virtual-scroller": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "vite": "^4.4.9",
    "@vitejs/plugin-vue": "^4.3.4",
    "@vue/tsconfig": "^0.4.0",
    "eslint": "^8.48.0",
    "eslint-plugin-vue": "^9.17.0",
    "prettier": "^3.0.3"
  }
}
```

---

## 10. Component Interaction Flows

### 10.1 CSV Import Flow

```
User uploads CSV file
    ↓
Frontend: File validation (size, type)
    ↓
Frontend: GraphQL mutation (importCSV)
    ↓
Backend: Apollo Server receives request
    ↓
Backend: Multer saves file to temp/uploads/
    ↓
Backend: CSVImportService.import()
    ├─> Parse CSV (csv-parse)
    ├─> Validate rows (interactive)
    ├─> Detect duplicates (TransactionRepository)
    ├─> Transform to transactions
    └─> Import to database (TransactionRepository)
    ↓
Backend: Trigger ML classification (async)
    ├─> MLClassificationService.classifyBatch()
    ├─> Extract features
    ├─> Predict categories
    ├─> Calculate confidence
    └─> Update transactions (TransactionRepository)
    ↓
Backend: Delete temp file
    ↓
Backend: Return import result
    ↓
Frontend: Display success message
    ↓
Frontend: Refresh transaction list
```

---

### 10.2 ML Classification Flow

```
Transaction needs classification
    ↓
MLClassificationService.classify()
    ├─> Extract features (payee, particulars, amount, etc.)
    ├─> Check if merchant exists in training data
    │   ├─> YES: Use ML model prediction
    │   └─> NO: Try fuzzy match or keyword match
    ├─> Calculate confidence score (multi-factor)
    └─> Determine status (auto-approve or pending review)
    ↓
IF confidence >= threshold:
    ├─> Auto-approve classification
    ├─> Update transaction status to "approved"
    └─> Add to training data
ELSE:
    ├─> Mark as "pending_review"
    └─> Store suggested category
    ↓
Return classification result
```

---

### 10.3 Report Generation Flow

```
User requests monthly report
    ↓
Frontend: GraphQL query (report)
    ↓
Backend: Apollo Server receives request
    ↓
Backend: ReportService.generateMonthly()
    ├─> Calculate date range (first/last day of month)
    ├─> Get approved transactions (TransactionRepository)
    ├─> Group by category
    ├─> Calculate category totals
    ├─> Calculate overall totals (income, expenses, net)
    ├─> Add categories with $0 spending
    └─> Sort categories alphabetically
    ↓
Backend: Return report data
    ↓
Frontend: Display report
    ├─> Category breakdown table
    ├─> Total income/expenses
    └─> Net amount
```

---

### 10.4 Manual Classification Flow

```
User reviews pending transaction
    ↓
User selects category
    ↓
Frontend: GraphQL mutation (classifyTransaction)
    ↓
Backend: Apollo Server receives request
    ↓
Backend: TransactionService.updateClassification()
    ├─> Update transaction
    │   ├─> Set categoryId
    │   ├─> Set status to "approved"
    │   └─> Set confidenceScore to 1.0
    ├─> Save to classification history
    └─> Add to session training queue
    ↓
Backend: Return updated transaction
    ↓
Frontend: Update UI
    ├─> Remove from review queue
    └─> Show success message
    ↓
On session end:
    └─> Retrain ML model with new classifications
```

---

## 11. Configuration Management

### 11.1 Environment Variables

```bash
# Backend (.env)
NODE_ENV=development          # development | production
PORT=4000                     # Server port
LOG_LEVEL=info               # error | warn | info | debug
DATABASE_PATH=./data/household-spending.db
TEMP_UPLOAD_DIR=./temp/uploads
LOG_DIR=./logs

# Frontend (.env)
VITE_API_URL=http://localhost:4000
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

---

### 11.2 TypeScript Configuration

**Backend (tsconfig.json)**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Frontend (tsconfig.json)**:
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 11.3 ESLint Configuration

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "max-lines-per-function": ["warn", 50],
    "max-lines": ["warn", 500],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

---

### 11.4 Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 12. Deployment Configuration

### 12.1 Build Scripts

**package.json (root)**:
```json
{
  "scripts": {
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "start": "cd backend && npm start",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "cd backend && npm run lint",
    "lint:frontend": "cd frontend && npm run lint",
    "test": "cd backend && npm test"
  }
}
```

---

### 12.2 Production Startup

```bash
# 1. Install dependencies
npm run install:all

# 2. Build frontend and backend
npm run build

# 3. Start production server
npm start

# Server will:
# - Initialize database
# - Load ML model
# - Start Express server on port 4000
# - Serve frontend from backend/dist
# - Application available at http://localhost:4000
```

---

## 13. Component Summary Table

| Component | Technology | Purpose | Dependencies |
|-----------|-----------|---------|--------------|
| Frontend App | Vue 3 + TypeScript | User interface | vue, vue-router, @apollo/client |
| Virtual Scroller | vue-virtual-scroller | Large list rendering | vue-virtual-scroller |
| Backend Server | Express + TypeScript | HTTP server | express, cors |
| GraphQL API | Apollo Server | API layer | apollo-server-express, graphql |
| File Upload | Multer | CSV upload handling | multer |
| CSV Parser | csv-parse | Parse CSV files | csv-parse |
| Database | SQLite | Data persistence | sqlite3, sqlite |
| ML Model | TensorFlow.js | Classification | @tensorflow/tfjs-node |
| Logger | Winston | Structured logging | winston |
| Cache | JavaScript Map | In-memory cache | None (built-in) |

---

## Notes

- All components designed for local, single-user application
- No distributed systems components (no Redis, no message queues)
- No authentication/authorization components (single-user)
- No containerization (Docker) required
- Simple deployment (npm scripts)
- All data stored locally (database, logs, temp files)
- No cloud services or external APIs
- Focus on simplicity and ease of maintenance

