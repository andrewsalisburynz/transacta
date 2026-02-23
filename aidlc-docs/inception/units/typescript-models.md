# TypeScript Models Specification - Household Spending Tracker

## Overview
Complete TypeScript type definitions and interfaces for the Household Spending Tracker application. These models are shared across frontend and backend layers.

---

## Core Domain Models

### Transaction Model

```typescript
/**
 * Represents a bank transaction imported from CSV
 * 
 * @remarks
 * Transactions are imported from bank CSV files and classified into categories.
 * Each transaction contains all original CSV fields plus classification metadata.
 * 
 * @example
 * ```typescript
 * const transaction: Transaction = {
 *   id: 1,
 *   date: '2024-01-15',
 *   amount: -45.50,
 *   payee: 'COUNTDOWN SUPERMARKET',
 *   particulars: 'Weekly groceries',
 *   tranType: 'POS',
 *   categoryId: 1,
 *   classificationStatus: 'approved',
 *   confidenceScore: 0.95,
 *   isAutoApproved: true,
 *   createdAt: new Date('2024-01-15T10:00:00Z'),
 *   updatedAt: new Date('2024-01-15T10:00:00Z')
 * };
 * ```
 */
export interface Transaction {
  /** Unique transaction identifier */
  id: number;
  
  // CSV Import Fields
  /** Transaction date (ISO 8601: YYYY-MM-DD) */
  date: string;
  
  /** Transaction amount (negative for expenses, positive for income) */
  amount: number;
  
  /** Merchant or payee name */
  payee: string;
  
  /** Additional transaction details */
  particulars?: string | null;
  
  /** Bank code */
  code?: string | null;
  
  /** Transaction reference */
  reference?: string | null;
  
  /** Transaction type (POS, FT, AP, etc.) */
  tranType?: string | null;
  
  /** User's account number */
  thisPartyAccount?: string | null;
  
  /** Other party's account number */
  otherPartyAccount?: string | null;
  
  /** Transaction serial number */
  serial?: string | null;
  
  /** Bank transaction code */
  transactionCode?: string | null;
  
  /** Batch number */
  batchNumber?: string | null;
  
  /** Originating bank or branch */
  originatingBankBranch?: string | null;
  
  /** Date transaction was processed (ISO 8601: YYYY-MM-DD) */
  processedDate?: string | null;
  
  // Classification Fields
  /** Foreign key to categories table */
  categoryId?: number | null;
  
  /** Classification status */
  classificationStatus: ClassificationStatus;
  
  /** ML confidence score (0.0 to 1.0) */
  confidenceScore?: number | null;
  
  /** Whether classification was auto-approved */
  isAutoApproved: boolean;
  
  // Metadata
  /** Record creation timestamp */
  createdAt: Date;
  
  /** Record update timestamp */
  updatedAt: Date;
  
  // Computed/Joined Fields (not in database)
  /** Assigned category (populated via join) */
  category?: Category | null;
  
  /** Suggested category from ML (computed) */
  suggestedCategory?: Category | null;
  
  /** Classification history (populated via join) */
  classificationHistory?: ClassificationHistoryEntry[];
}

/**
 * Transaction classification status enum
 */
export enum ClassificationStatus {
  /** Transaction has not been classified */
  UNCLASSIFIED = 'unclassified',
  
  /** Transaction classification is pending review */
  PENDING = 'pending',
  
  /** Transaction classification has been approved */
  APPROVED = 'approved'
}

/**
 * Validation rules for Transaction
 */
export const TransactionValidation = {
  payee: {
    minLength: 1,
    maxLength: 255,
    required: true
  },
  particulars: {
    maxLength: 500
  },
  amount: {
    required: true
  },
  date: {
    required: true,
    format: /^\d{4}-\d{2}-\d{2}$/
  },
  confidenceScore: {
    min: 0.0,
    max: 1.0
  }
} as const;
```

---

### Category Model

```typescript
/**
 * Represents a spending or income category
 * 
 * @remarks
 * Categories are user-defined and used to classify transactions.
 * Each category has a type (expense or income) and optional color for UI display.
 * 
 * @example
 * ```typescript
 * const category: Category = {
 *   id: 1,
 *   name: 'Groceries',
 *   description: 'Food and household supplies',
 *   categoryType: CategoryType.EXPENSE,
 *   color: '#4CAF50',
 *   transactionCount: 25,
 *   totalAmount: -1250.75,
 *   createdAt: new Date('2024-01-01T00:00:00Z'),
 *   updatedAt: new Date('2024-01-15T10:00:00Z')
 * };
 * ```
 */
export interface Category {
  /** Unique category identifier */
  id: number;
  
  /** Category name (unique) */
  name: string;
  
  /** Optional category description */
  description?: string | null;
  
  /** Category type (expense or income) */
  categoryType: CategoryType;
  
  /** Optional color code for UI display (hex format: #RRGGBB) */
  color?: string | null;
  
  /** Number of transactions in this category (denormalized) */
  transactionCount: number;
  
  /** Total amount for this category (denormalized) */
  totalAmount: number;
  
  /** Record creation timestamp */
  createdAt: Date;
  
  /** Record update timestamp */
  updatedAt: Date;
}

/**
 * Category type enum
 */
export enum CategoryType {
  /** Expense category (negative amounts) */
  EXPENSE = 'expense',
  
  /** Income category (positive amounts) */
  INCOME = 'income'
}

/**
 * Validation rules for Category
 */
export const CategoryValidation = {
  name: {
    minLength: 1,
    maxLength: 100,
    required: true,
    unique: true
  },
  description: {
    maxLength: 500
  },
  color: {
    format: /^#[0-9A-Fa-f]{6}$/
  }
} as const;
```

---

### ClassificationHistoryEntry Model

```typescript
/**
 * Represents a historical classification decision
 * 
 * @remarks
 * Classification history is used for ML training and audit purposes.
 * Each entry records a classification decision with context.
 * 
 * @example
 * ```typescript
 * const historyEntry: ClassificationHistoryEntry = {
 *   id: 1,
 *   transactionId: 123,
 *   categoryId: 1,
 *   payee: 'COUNTDOWN SUPERMARKET',
 *   amount: -45.50,
 *   classificationMethod: ClassificationMethod.ML_AUTO,
 *   confidenceScore: 0.95,
 *   wasCorrected: false,
 *   classifiedAt: new Date('2024-01-15T10:00:00Z')
 * };
 * ```
 */
export interface ClassificationHistoryEntry {
  /** Unique history entry identifier */
  id: number;
  
  /** Foreign key to transactions table */
  transactionId: number;
  
  /** Foreign key to categories table */
  categoryId: number;
  
  /** Payee at time of classification (snapshot) */
  payee: string;
  
  /** Particulars at time of classification (snapshot) */
  particulars?: string | null;
  
  /** Transaction type at time of classification (snapshot) */
  tranType?: string | null;
  
  /** Amount at time of classification (snapshot) */
  amount: number;
  
  /** Classification method used */
  classificationMethod: ClassificationMethod;
  
  /** ML confidence score (if ML classification) */
  confidenceScore?: number | null;
  
  /** Whether user corrected ML suggestion */
  wasCorrected: boolean;
  
  /** Previous category ID (if reclassified) */
  previousCategoryId?: number | null;
  
  /** Timestamp when classification occurred */
  classifiedAt: Date;
  
  // Computed/Joined Fields
  /** Transaction (populated via join) */
  transaction?: Transaction;
  
  /** Category (populated via join) */
  category?: Category;
  
  /** Previous category (populated via join) */
  previousCategory?: Category | null;
}

/**
 * Classification method enum
 */
export enum ClassificationMethod {
  /** Manual classification by user */
  MANUAL = 'manual',
  
  /** Automatic ML classification */
  ML_AUTO = 'ml_auto',
  
  /** ML suggestion accepted by user */
  ML_ACCEPTED = 'ml_accepted'
}
```

---

### ClassificationResult Model

```typescript
/**
 * Result of ML classification operation
 * 
 * @remarks
 * Returned by ML classification engine with suggested category and confidence.
 * 
 * @example
 * ```typescript
 * const result: ClassificationResult = {
 *   transactionId: 123,
 *   suggestedCategoryId: 1,
 *   confidenceScore: 0.95,
 *   shouldAutoApprove: true,
 *   explanation: 'Matched similar payee "COUNTDOWN" with 95% confidence',
 *   features: {
 *     payeeTokens: ['countdown', 'supermarket'],
 *     tranType: 'POS',
 *     amountRange: 'medium'
 *   }
 * };
 * ```
 */
export interface ClassificationResult {
  /** Transaction ID that was classified */
  transactionId: number;
  
  /** Suggested category ID */
  suggestedCategoryId: number;
  
  /** Confidence score (0.0 to 1.0) */
  confidenceScore: number;
  
  /** Whether classification should be auto-approved */
  shouldAutoApprove: boolean;
  
  /** Explanation of classification decision */
  explanation?: string;
  
  /** Extracted features used for classification */
  features?: Record<string, any>;
  
  // Computed/Joined Fields
  /** Transaction (populated) */
  transaction?: Transaction;
  
  /** Suggested category (populated) */
  suggestedCategory?: Category;
}
```

---

### Report Model

```typescript
/**
 * Monthly spending report
 * 
 * @remarks
 * Aggregates transaction data by category for a specific time period.
 * 
 * @example
 * ```typescript
 * const report: Report = {
 *   month: '2024-01',
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   categorySummaries: [...],
 *   totalExpenses: -2500.00,
 *   totalIncome: 3500.00,
 *   netAmount: 1000.00,
 *   transactionCount: 45
 * };
 * ```
 */
export interface Report {
  /** Report month (YYYY-MM format) */
  month: string;
  
  /** Report start date (ISO 8601: YYYY-MM-DD) */
  startDate: string;
  
  /** Report end date (ISO 8601: YYYY-MM-DD) */
  endDate: string;
  
  /** Category summaries */
  categorySummaries: CategorySummary[];
  
  /** Total expenses for the period (negative) */
  totalExpenses: number;
  
  /** Total income for the period (positive) */
  totalIncome: number;
  
  /** Net amount (income - expenses) */
  netAmount: number;
  
  /** Total number of transactions */
  transactionCount: number;
}

/**
 * Summary of spending for a category in a report
 */
export interface CategorySummary {
  /** Category ID */
  categoryId: number;
  
  /** Total amount for this category */
  totalAmount: number;
  
  /** Number of transactions */
  transactionCount: number;
  
  /** Percentage of total spending */
  percentage: number;
  
  // Computed/Joined Fields
  /** Category (populated) */
  category?: Category;
  
  /** Transactions in this category (optional, for drill-down) */
  transactions?: Transaction[];
}
```

---

### CSVRow Model

```typescript
/**
 * Represents a single row from the bank CSV file
 * 
 * @remarks
 * Maps directly to the 14-column CSV format from the bank.
 * Used during CSV parsing and validation.
 * 
 * @example
 * ```typescript
 * const csvRow: CSVRow = {
 *   Date: '15/01/2024',
 *   Amount: '-45.50',
 *   Payee: 'COUNTDOWN SUPERMARKET',
 *   Particulars: 'Weekly groceries',
 *   Code: '',
 *   Reference: 'REF123',
 *   'Tran Type': 'POS',
 *   'This Party Account': '12-3456-7890123-00',
 *   'Other Party Account': '',
 *   Serial: '001',
 *   'Transaction Code': 'POS',
 *   'Batch Number': 'B001',
 *   'Originating Bank/Branch': '12-3456',
 *   'Processed Date': '15/01/2024'
 * };
 * ```
 */
export interface CSVRow {
  /** Transaction date (DD/MM/YYYY format from CSV) */
  Date: string;
  
  /** Transaction amount (string with optional negative sign) */
  Amount: string;
  
  /** Merchant or payee name */
  Payee: string;
  
  /** Additional transaction details */
  Particulars: string;
  
  /** Bank code */
  Code: string;
  
  /** Transaction reference */
  Reference: string;
  
  /** Transaction type */
  'Tran Type': string;
  
  /** User's account number */
  'This Party Account': string;
  
  /** Other party's account number */
  'Other Party Account': string;
  
  /** Transaction serial number */
  Serial: string;
  
  /** Bank transaction code */
  'Transaction Code': string;
  
  /** Batch number */
  'Batch Number': string;
  
  /** Originating bank or branch */
  'Originating Bank/Branch': string;
  
  /** Date transaction was processed (DD/MM/YYYY format) */
  'Processed Date': string;
}

/**
 * Expected CSV column names
 */
export const CSV_COLUMNS = [
  'Date',
  'Amount',
  'Payee',
  'Particulars',
  'Code',
  'Reference',
  'Tran Type',
  'This Party Account',
  'Other Party Account',
  'Serial',
  'Transaction Code',
  'Batch Number',
  'Originating Bank/Branch',
  'Processed Date'
] as const;

/**
 * Required CSV columns (must be present and non-empty)
 */
export const REQUIRED_CSV_COLUMNS = [
  'Date',
  'Amount',
  'Payee'
] as const;
```

---

### MLModelMetadata Model

```typescript
/**
 * ML model metadata and training information
 * 
 * @remarks
 * Stores information about trained ML models including performance metrics.
 * 
 * @example
 * ```typescript
 * const modelMetadata: MLModelMetadata = {
 *   id: 1,
 *   modelVersion: '1.0.0',
 *   modelFilePath: './models/classifier_v1.json',
 *   modelType: 'neural_network',
 *   trainingSamplesCount: 150,
 *   trainingAccuracy: 0.85,
 *   validationAccuracy: 0.82,
 *   lastTrainedAt: new Date('2024-01-15T10:00:00Z'),
 *   confidenceThreshold: 0.8,
 *   featureExtractionMethod: 'tfidf',
 *   modelParameters: { layers: [64, 32], activation: 'relu' },
 *   isActive: true,
 *   createdAt: new Date('2024-01-01T00:00:00Z'),
 *   updatedAt: new Date('2024-01-15T10:00:00Z')
 * };
 * ```
 */
export interface MLModelMetadata {
  /** Unique model identifier */
  id: number;
  
  /** Model version (semantic versioning) */
  modelVersion: string;
  
  /** Path to model file (relative to project root) */
  modelFilePath: string;
  
  /** Model type (e.g., 'neural_network', 'naive_bayes') */
  modelType: string;
  
  /** Number of training samples used */
  trainingSamplesCount: number;
  
  /** Training accuracy (0.0 to 1.0) */
  trainingAccuracy?: number | null;
  
  /** Validation accuracy (0.0 to 1.0) */
  validationAccuracy?: number | null;
  
  /** Last training timestamp */
  lastTrainedAt?: Date | null;
  
  /** Confidence threshold for auto-approval (0.0 to 1.0) */
  confidenceThreshold: number;
  
  /** Feature extraction method used */
  featureExtractionMethod?: string | null;
  
  /** Model parameters (JSON object) */
  modelParameters?: Record<string, any> | null;
  
  /** Whether this model is active */
  isActive: boolean;
  
  /** Record creation timestamp */
  createdAt: Date;
  
  /** Record update timestamp */
  updatedAt: Date;
}

/**
 * Validation rules for MLModelMetadata
 */
export const MLModelMetadataValidation = {
  modelVersion: {
    required: true,
    format: /^\d+\.\d+\.\d+$/  // Semantic versioning
  },
  trainingAccuracy: {
    min: 0.0,
    max: 1.0
  },
  validationAccuracy: {
    min: 0.0,
    max: 1.0
  },
  confidenceThreshold: {
    min: 0.0,
    max: 1.0,
    default: 0.8
  }
} as const;
```

---

## Input/Output Models

### CSVImportResult Model

```typescript
/**
 * Result of CSV import operation
 * 
 * @remarks
 * Contains statistics and details about CSV import process.
 */
export interface CSVImportResult {
  /** Number of transactions successfully imported */
  importedCount: number;
  
  /** Number of duplicate transactions skipped */
  duplicateCount: number;
  
  /** Number of transactions with errors */
  errorCount: number;
  
  /** Imported transactions */
  transactions: Transaction[];
  
  /** Duplicate transactions found */
  duplicates: Transaction[];
  
  /** Import errors */
  errors: ImportError[];
  
  /** Whether import was successful */
  success: boolean;
  
  /** Import message */
  message: string;
}

/**
 * Error encountered during CSV import
 */
export interface ImportError {
  /** Row number in CSV (1-indexed) */
  row: number;
  
  /** Error message */
  message: string;
  
  /** Field that caused the error */
  field?: string;
  
  /** Raw row data */
  rawData?: string;
}
```

---

### DashboardStats Model

```typescript
/**
 * Dashboard statistics
 * 
 * @remarks
 * Aggregated statistics for dashboard display.
 */
export interface DashboardStats {
  /** Total number of transactions */
  totalTransactions: number;
  
  /** Number of unclassified transactions */
  unclassifiedCount: number;
  
  /** Number of pending transactions */
  pendingCount: number;
  
  /** Number of approved transactions */
  approvedCount: number;
  
  /** Total number of categories */
  categoryCount: number;
  
  /** Current month spending (negative) */
  currentMonthSpending: number;
  
  /** Previous month spending (negative) */
  previousMonthSpending: number;
  
  /** Spending change percentage */
  spendingChangePercentage: number;
  
  /** Recent transactions (last 10) */
  recentTransactions: Transaction[];
  
  /** Top spending categories (top 5) */
  topCategories: CategorySummary[];
}
```

---

## Filter and Sort Models

### TransactionFilter Model

```typescript
/**
 * Filter criteria for transaction queries
 */
export interface TransactionFilter {
  /** Filter by classification status */
  classificationStatus?: ClassificationStatus;
  
  /** Filter by category ID */
  categoryId?: number;
  
  /** Filter by date range (start) */
  startDate?: string;
  
  /** Filter by date range (end) */
  endDate?: string;
  
  /** Filter by minimum amount */
  minAmount?: number;
  
  /** Filter by maximum amount */
  maxAmount?: number;
  
  /** Filter by payee (partial match) */
  payee?: string;
  
  /** Filter by transaction type */
  tranType?: string;
  
  /** Filter by auto-approved status */
  isAutoApproved?: boolean;
}

/**
 * Sort criteria for transaction queries
 */
export interface TransactionSort {
  /** Field to sort by */
  field: TransactionSortField;
  
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Fields that can be used for sorting transactions
 */
export enum TransactionSortField {
  DATE = 'date',
  AMOUNT = 'amount',
  PAYEE = 'payee',
  CREATED_AT = 'createdAt',
  CONFIDENCE_SCORE = 'confidenceScore'
}

/**
 * Sort direction
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}
```

---

## Pagination Models

```typescript
/**
 * Paginated results
 */
export interface PaginatedResult<T> {
  /** List of items */
  items: T[];
  
  /** Total count of items matching filter */
  totalCount: number;
  
  /** Whether there are more results */
  hasMore: boolean;
  
  /** Pagination info */
  pageInfo: PageInfo;
}

/**
 * Pagination information
 */
export interface PageInfo {
  /** Whether there is a next page */
  hasNextPage: boolean;
  
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  
  /** Current page number (1-indexed) */
  currentPage: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Items per page */
  pageSize: number;
}
```

---

## Utility Types

### Type Guards

```typescript
/**
 * Type guard to check if a value is a valid Transaction
 */
export function isTransaction(value: any): value is Transaction {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'number' &&
    typeof value.date === 'string' &&
    typeof value.amount === 'number' &&
    typeof value.payee === 'string' &&
    typeof value.classificationStatus === 'string' &&
    typeof value.isAutoApproved === 'boolean'
  );
}

/**
 * Type guard to check if a value is a valid Category
 */
export function isCategory(value: any): value is Category {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.categoryType === 'string' &&
    typeof value.transactionCount === 'number' &&
    typeof value.totalAmount === 'number'
  );
}
```

---

### Partial Types

```typescript
/**
 * Partial transaction for creation (omits auto-generated fields)
 */
export type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'category' | 'suggestedCategory' | 'classificationHistory'>;

/**
 * Partial transaction for updates (all fields optional except id)
 */
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>> & { id: number };

/**
 * Partial category for creation
 */
export type CreateCategoryInput = Omit<Category, 'id' | 'transactionCount' | 'totalAmount' | 'createdAt' | 'updatedAt'>;

/**
 * Partial category for updates
 */
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'transactionCount' | 'totalAmount' | 'createdAt' | 'updatedAt'>> & { id: number };
```

---

## Constants

```typescript
/**
 * Application constants
 */
export const CONSTANTS = {
  /** Default confidence threshold for auto-approval */
  DEFAULT_CONFIDENCE_THRESHOLD: 0.8,
  
  /** Minimum confidence score for ML suggestions */
  MIN_CONFIDENCE_SCORE: 0.0,
  
  /** Maximum confidence score */
  MAX_CONFIDENCE_SCORE: 1.0,
  
  /** Default page size for pagination */
  DEFAULT_PAGE_SIZE: 20,
  
  /** Maximum page size for pagination */
  MAX_PAGE_SIZE: 100,
  
  /** Date format for display */
  DATE_FORMAT: 'YYYY-MM-DD',
  
  /** Currency symbol */
  CURRENCY_SYMBOL: '$',
  
  /** Minimum training samples for ML model */
  MIN_TRAINING_SAMPLES: 10,
  
  /** Maximum CSV file size (10MB) */
  MAX_CSV_FILE_SIZE: 10 * 1024 * 1024
} as const;
```

---

## Notes

- **Naming Convention**: Use PascalCase for types/interfaces, camelCase for properties
- **Nullability**: Use `| null` for nullable fields, `?` for optional fields
- **Enums**: Use string enums for better debugging and serialization
- **JSDoc Comments**: All types and properties have JSDoc comments
- **Validation**: Validation rules defined as constants for reuse
- **Type Guards**: Provide type guards for runtime type checking
- **Partial Types**: Use utility types for create/update operations
- **Constants**: Define application constants for consistency
