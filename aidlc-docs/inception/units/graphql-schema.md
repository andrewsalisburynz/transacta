# GraphQL Schema Specification - Household Spending Tracker

## Overview
Complete GraphQL schema definition for the Household Spending Tracker API. This schema provides all queries and mutations needed for the frontend application.

---

## Schema Definition Language (SDL)

### Scalar Types

```graphql
"""
ISO 8601 date string (YYYY-MM-DD)
"""
scalar Date

"""
ISO 8601 datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
"""
scalar DateTime

"""
JSON object for flexible data structures
"""
scalar JSON
```

---

## Type Definitions

### Transaction Type

```graphql
"""
Represents a bank transaction imported from CSV
"""
type Transaction {
  """Unique transaction identifier"""
  id: ID!
  
  """Transaction date (YYYY-MM-DD)"""
  date: Date!
  
  """Transaction amount (negative for expenses, positive for income)"""
  amount: Float!
  
  """Merchant or payee name"""
  payee: String!
  
  """Additional transaction details"""
  particulars: String
  
  """Bank code"""
  code: String
  
  """Transaction reference"""
  reference: String
  
  """Transaction type (POS, FT, AP, etc.)"""
  tranType: String
  
  """User's account number"""
  thisPartyAccount: String
  
  """Other party's account number"""
  otherPartyAccount: String
  
  """Transaction serial number"""
  serial: String
  
  """Bank transaction code"""
  transactionCode: String
  
  """Batch number"""
  batchNumber: String
  
  """Originating bank or branch"""
  originatingBankBranch: String
  
  """Date transaction was processed"""
  processedDate: Date
  
  """Assigned category (null if unclassified)"""
  category: Category
  
  """Classification status"""
  classificationStatus: ClassificationStatus!
  
  """ML confidence score (0.0 to 1.0)"""
  confidenceScore: Float
  
  """Whether classification was auto-approved"""
  isAutoApproved: Boolean!
  
  """Suggested category from ML (if available)"""
  suggestedCategory: Category
  
  """Classification history for this transaction"""
  classificationHistory: [ClassificationHistoryEntry!]!
  
  """Record creation timestamp"""
  createdAt: DateTime!
  
  """Record update timestamp"""
  updatedAt: DateTime!
}
```

---

### Category Type

```graphql
"""
Represents a spending or income category
"""
type Category {
  """Unique category identifier"""
  id: ID!
  
  """Category name"""
  name: String!
  
  """Optional category description"""
  description: String
  
  """Category type (expense or income)"""
  categoryType: CategoryType!
  
  """Optional color code for UI display (hex format)"""
  color: String
  
  """Number of transactions in this category"""
  transactionCount: Int!
  
  """Total amount for this category"""
  totalAmount: Float!
  
  """Record creation timestamp"""
  createdAt: DateTime!
  
  """Record update timestamp"""
  updatedAt: DateTime!
}
```

---

### ClassificationHistoryEntry Type

```graphql
"""
Represents a historical classification decision
"""
type ClassificationHistoryEntry {
  """Unique history entry identifier"""
  id: ID!
  
  """Transaction that was classified"""
  transaction: Transaction!
  
  """Category assigned"""
  category: Category!
  
  """Payee at time of classification"""
  payee: String!
  
  """Particulars at time of classification"""
  particulars: String
  
  """Transaction type at time of classification"""
  tranType: String
  
  """Amount at time of classification"""
  amount: Float!
  
  """Classification method used"""
  classificationMethod: ClassificationMethod!
  
  """ML confidence score (if ML classification)"""
  confidenceScore: Float
  
  """Whether user corrected ML suggestion"""
  wasCorrected: Boolean!
  
  """Previous category (if reclassified)"""
  previousCategory: Category
  
  """Timestamp when classification occurred"""
  classifiedAt: DateTime!
}
```

---

### ClassificationResult Type

```graphql
"""
Result of ML classification operation
"""
type ClassificationResult {
  """Transaction that was classified"""
  transaction: Transaction!
  
  """Suggested category"""
  suggestedCategory: Category!
  
  """Confidence score (0.0 to 1.0)"""
  confidenceScore: Float!
  
  """Whether classification should be auto-approved"""
  shouldAutoApprove: Boolean!
  
  """Explanation of classification decision"""
  explanation: String
}
```

---

### Report Type

```graphql
"""
Monthly spending report
"""
type Report {
  """Report month (YYYY-MM)"""
  month: String!
  
  """Report start date"""
  startDate: Date!
  
  """Report end date"""
  endDate: Date!
  
  """Category summaries"""
  categorySummaries: [CategorySummary!]!
  
  """Total expenses for the month"""
  totalExpenses: Float!
  
  """Total income for the month"""
  totalIncome: Float!
  
  """Net amount (income - expenses)"""
  netAmount: Float!
  
  """Total number of transactions"""
  transactionCount: Int!
}
```

---

### CategorySummary Type

```graphql
"""
Summary of spending for a category in a report
"""
type CategorySummary {
  """Category"""
  category: Category!
  
  """Total amount for this category"""
  totalAmount: Float!
  
  """Number of transactions"""
  transactionCount: Int!
  
  """Percentage of total spending"""
  percentage: Float!
  
  """Transactions in this category (optional, for drill-down)"""
  transactions: [Transaction!]
}
```

---

### DashboardStats Type

```graphql
"""
Dashboard statistics
"""
type DashboardStats {
  """Total number of transactions"""
  totalTransactions: Int!
  
  """Number of unclassified transactions"""
  unclassifiedCount: Int!
  
  """Number of pending transactions"""
  pendingCount: Int!
  
  """Number of approved transactions"""
  approvedCount: Int!
  
  """Total number of categories"""
  categoryCount: Int!
  
  """Current month spending"""
  currentMonthSpending: Float!
  
  """Previous month spending"""
  previousMonthSpending: Float!
  
  """Spending change percentage"""
  spendingChangePercentage: Float!
  
  """Recent transactions (last 10)"""
  recentTransactions: [Transaction!]!
  
  """Top spending categories (top 5)"""
  topCategories: [CategorySummary!]!
}
```

---

### CSVImportResult Type

```graphql
"""
Result of CSV import operation
"""
type CSVImportResult {
  """Number of transactions imported"""
  importedCount: Int!
  
  """Number of duplicate transactions skipped"""
  duplicateCount: Int!
  
  """Number of transactions with errors"""
  errorCount: Int!
  
  """Imported transactions"""
  transactions: [Transaction!]!
  
  """Duplicate transactions found"""
  duplicates: [Transaction!]!
  
  """Import errors"""
  errors: [ImportError!]!
  
  """Whether import was successful"""
  success: Boolean!
  
  """Import message"""
  message: String!
}
```

---

### ImportError Type

```graphql
"""
Error encountered during CSV import
"""
type ImportError {
  """Row number in CSV"""
  row: Int!
  
  """Error message"""
  message: String!
  
  """Field that caused the error"""
  field: String
  
  """Raw row data"""
  rawData: String
}
```

---

### MLModelMetadata Type

```graphql
"""
ML model metadata and training information
"""
type MLModelMetadata {
  """Unique model identifier"""
  id: ID!
  
  """Model version"""
  modelVersion: String!
  
  """Path to model file"""
  modelFilePath: String!
  
  """Model type"""
  modelType: String!
  
  """Number of training samples"""
  trainingSamplesCount: Int!
  
  """Training accuracy (0.0 to 1.0)"""
  trainingAccuracy: Float
  
  """Validation accuracy (0.0 to 1.0)"""
  validationAccuracy: Float
  
  """Last training timestamp"""
  lastTrainedAt: DateTime
  
  """Confidence threshold for auto-approval"""
  confidenceThreshold: Float!
  
  """Feature extraction method"""
  featureExtractionMethod: String
  
  """Model parameters (JSON)"""
  modelParameters: JSON
  
  """Whether this model is active"""
  isActive: Boolean!
  
  """Record creation timestamp"""
  createdAt: DateTime!
  
  """Record update timestamp"""
  updatedAt: DateTime!
}
```

---

## Enum Types

### ClassificationStatus

```graphql
"""
Transaction classification status
"""
enum ClassificationStatus {
  """Transaction has not been classified"""
  UNCLASSIFIED
  
  """Transaction classification is pending review"""
  PENDING
  
  """Transaction classification has been approved"""
  APPROVED
}
```

---

### CategoryType

```graphql
"""
Category type (expense or income)
"""
enum CategoryType {
  """Expense category"""
  EXPENSE
  
  """Income category"""
  INCOME
}
```

---

### ClassificationMethod

```graphql
"""
Method used for classification
"""
enum ClassificationMethod {
  """Manual classification by user"""
  MANUAL
  
  """Automatic ML classification"""
  ML_AUTO
  
  """ML suggestion accepted by user"""
  ML_ACCEPTED
}
```

---

## Input Types

### TransactionFilterInput

```graphql
"""
Filter criteria for transaction queries
"""
input TransactionFilterInput {
  """Filter by classification status"""
  classificationStatus: ClassificationStatus
  
  """Filter by category ID"""
  categoryId: ID
  
  """Filter by date range (start)"""
  startDate: Date
  
  """Filter by date range (end)"""
  endDate: Date
  
  """Filter by minimum amount"""
  minAmount: Float
  
  """Filter by maximum amount"""
  maxAmount: Float
  
  """Filter by payee (partial match)"""
  payee: String
  
  """Filter by transaction type"""
  tranType: String
  
  """Filter by auto-approved status"""
  isAutoApproved: Boolean
}
```

---

### TransactionSortInput

```graphql
"""
Sort criteria for transaction queries
"""
input TransactionSortInput {
  """Field to sort by"""
  field: TransactionSortField!
  
  """Sort direction"""
  direction: SortDirection!
}

"""
Fields that can be used for sorting transactions
"""
enum TransactionSortField {
  DATE
  AMOUNT
  PAYEE
  CREATED_AT
  CONFIDENCE_SCORE
}

"""
Sort direction
"""
enum SortDirection {
  ASC
  DESC
}
```

---

### CreateCategoryInput

```graphql
"""
Input for creating a new category
"""
input CreateCategoryInput {
  """Category name (required, unique)"""
  name: String!
  
  """Optional category description"""
  description: String
  
  """Category type (default: EXPENSE)"""
  categoryType: CategoryType
  
  """Optional color code (hex format)"""
  color: String
}
```

---

### UpdateCategoryInput

```graphql
"""
Input for updating an existing category
"""
input UpdateCategoryInput {
  """Category ID"""
  id: ID!
  
  """New category name (optional)"""
  name: String
  
  """New category description (optional)"""
  description: String
  
  """New category type (optional)"""
  categoryType: CategoryType
  
  """New color code (optional)"""
  color: String
}
```

---

### ClassifyTransactionInput

```graphql
"""
Input for classifying a transaction
"""
input ClassifyTransactionInput {
  """Transaction ID"""
  transactionId: ID!
  
  """Category ID to assign"""
  categoryId: ID!
  
  """Classification method"""
  classificationMethod: ClassificationMethod!
  
  """Confidence score (if ML classification)"""
  confidenceScore: Float
}
```

---

### BulkClassifyInput

```graphql
"""
Input for bulk classification of transactions
"""
input BulkClassifyInput {
  """Transaction IDs to classify"""
  transactionIds: [ID!]!
  
  """Category ID to assign"""
  categoryId: ID!
  
  """Classification method"""
  classificationMethod: ClassificationMethod!
}
```

---

### CSVUploadInput

```graphql
"""
Input for CSV file upload
"""
input CSVUploadInput {
  """Base64 encoded CSV file content"""
  fileContent: String!
  
  """Original filename"""
  filename: String!
  
  """Whether to skip duplicate transactions"""
  skipDuplicates: Boolean
}
```

---

## Query Definitions

```graphql
type Query {
  """
  Get a single transaction by ID
  """
  transaction(id: ID!): Transaction
  
  """
  Get all transactions with optional filtering and sorting
  """
  transactions(
    filter: TransactionFilterInput
    sort: TransactionSortInput
    limit: Int
    offset: Int
  ): TransactionConnection!
  
  """
  Get transactions requiring review (unclassified or pending)
  """
  transactionsRequiringReview(
    limit: Int
    offset: Int
  ): TransactionConnection!
  
  """
  Get a single category by ID
  """
  category(id: ID!): Category
  
  """
  Get all categories
  """
  categories(
    categoryType: CategoryType
  ): [Category!]!
  
  """
  Get monthly spending report
  """
  monthlyReport(
    month: String!
  ): Report!
  
  """
  Get spending report for date range
  """
  dateRangeReport(
    startDate: Date!
    endDate: Date!
  ): Report!
  
  """
  Compare spending across multiple months
  """
  compareMonths(
    months: [String!]!
  ): [Report!]!
  
  """
  Get dashboard statistics
  """
  dashboardStats: DashboardStats!
  
  """
  Get classification history for a transaction
  """
  classificationHistory(
    transactionId: ID!
  ): [ClassificationHistoryEntry!]!
  
  """
  Get active ML model metadata
  """
  activeMLModel: MLModelMetadata
  
  """
  Get all ML model metadata
  """
  mlModels: [MLModelMetadata!]!
  
  """
  Search transactions by payee
  """
  searchTransactionsByPayee(
    payee: String!
    limit: Int
  ): [Transaction!]!
}

"""
Paginated transaction results
"""
type TransactionConnection {
  """List of transactions"""
  nodes: [Transaction!]!
  
  """Total count of transactions matching filter"""
  totalCount: Int!
  
  """Whether there are more results"""
  hasMore: Boolean!
  
  """Pagination info"""
  pageInfo: PageInfo!
}

"""
Pagination information
"""
type PageInfo {
  """Whether there is a next page"""
  hasNextPage: Boolean!
  
  """Whether there is a previous page"""
  hasPreviousPage: Boolean!
  
  """Cursor for next page"""
  endCursor: String
  
  """Cursor for previous page"""
  startCursor: String
}
```

---

## Mutation Definitions

```graphql
type Mutation {
  """
  Upload and import CSV file
  """
  uploadCSV(input: CSVUploadInput!): CSVImportResult!
  
  """
  Classify a single transaction
  """
  classifyTransaction(input: ClassifyTransactionInput!): Transaction!
  
  """
  Bulk classify multiple transactions
  """
  bulkClassifyTransactions(input: BulkClassifyInput!): [Transaction!]!
  
  """
  Reclassify a transaction (change category)
  """
  reclassifyTransaction(
    transactionId: ID!
    newCategoryId: ID!
  ): Transaction!
  
  """
  Delete a transaction
  """
  deleteTransaction(id: ID!): Boolean!
  
  """
  Create a new category
  """
  createCategory(input: CreateCategoryInput!): Category!
  
  """
  Update an existing category
  """
  updateCategory(input: UpdateCategoryInput!): Category!
  
  """
  Delete a category
  """
  deleteCategory(
    id: ID!
    reassignToCategoryId: ID
  ): Boolean!
  
  """
  Trigger ML model training
  """
  trainMLModel: MLModelMetadata!
  
  """
  Get ML classification suggestion for a transaction
  """
  getClassificationSuggestion(
    transactionId: ID!
  ): ClassificationResult!
  
  """
  Batch classify all unclassified transactions using ML
  """
  autoClassifyAll: [ClassificationResult!]!
}
```

---

## Example Queries

### Get Unclassified Transactions

```graphql
query GetUnclassifiedTransactions {
  transactionsRequiringReview(limit: 20) {
    nodes {
      id
      date
      payee
      amount
      particulars
      classificationStatus
      suggestedCategory {
        id
        name
      }
      confidenceScore
    }
    totalCount
    hasMore
  }
}
```

---

### Get Monthly Report

```graphql
query GetMonthlyReport($month: String!) {
  monthlyReport(month: $month) {
    month
    startDate
    endDate
    totalExpenses
    totalIncome
    netAmount
    transactionCount
    categorySummaries {
      category {
        id
        name
        color
      }
      totalAmount
      transactionCount
      percentage
    }
  }
}
```

---

### Get Dashboard Stats

```graphql
query GetDashboardStats {
  dashboardStats {
    totalTransactions
    unclassifiedCount
    pendingCount
    approvedCount
    categoryCount
    currentMonthSpending
    previousMonthSpending
    spendingChangePercentage
    recentTransactions {
      id
      date
      payee
      amount
      category {
        name
        color
      }
    }
    topCategories {
      category {
        name
        color
      }
      totalAmount
      transactionCount
      percentage
    }
  }
}
```

---

### Get All Categories

```graphql
query GetAllCategories {
  categories {
    id
    name
    description
    categoryType
    color
    transactionCount
    totalAmount
  }
}
```

---

### Search Transactions

```graphql
query SearchTransactions($filter: TransactionFilterInput!, $sort: TransactionSortInput) {
  transactions(filter: $filter, sort: $sort, limit: 50) {
    nodes {
      id
      date
      payee
      amount
      category {
        name
      }
      classificationStatus
    }
    totalCount
  }
}
```

---

## Example Mutations

### Upload CSV

```graphql
mutation UploadCSV($input: CSVUploadInput!) {
  uploadCSV(input: $input) {
    success
    message
    importedCount
    duplicateCount
    errorCount
    transactions {
      id
      date
      payee
      amount
    }
    errors {
      row
      message
      field
    }
  }
}
```

---

### Classify Transaction

```graphql
mutation ClassifyTransaction($input: ClassifyTransactionInput!) {
  classifyTransaction(input: $input) {
    id
    classificationStatus
    category {
      id
      name
    }
    confidenceScore
  }
}
```

---

### Create Category

```graphql
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) {
    id
    name
    description
    categoryType
    color
  }
}
```

---

### Update Category

```graphql
mutation UpdateCategory($input: UpdateCategoryInput!) {
  updateCategory(input: $input) {
    id
    name
    description
    color
    updatedAt
  }
}
```

---

### Delete Category

```graphql
mutation DeleteCategory($id: ID!, $reassignToCategoryId: ID) {
  deleteCategory(id: $id, reassignToCategoryId: $reassignToCategoryId)
}
```

---

### Bulk Classify Transactions

```graphql
mutation BulkClassify($input: BulkClassifyInput!) {
  bulkClassifyTransactions(input: $input) {
    id
    classificationStatus
    category {
      name
    }
  }
}
```

---

### Train ML Model

```graphql
mutation TrainMLModel {
  trainMLModel {
    id
    modelVersion
    trainingSamplesCount
    trainingAccuracy
    validationAccuracy
    lastTrainedAt
  }
}
```

---

### Get Classification Suggestion

```graphql
mutation GetSuggestion($transactionId: ID!) {
  getClassificationSuggestion(transactionId: $transactionId) {
    transaction {
      id
      payee
    }
    suggestedCategory {
      id
      name
    }
    confidenceScore
    shouldAutoApprove
    explanation
  }
}
```

---

## Error Handling

### Error Types

```graphql
"""
Standard error interface
"""
interface Error {
  """Error message"""
  message: String!
  
  """Error code"""
  code: String!
  
  """Additional error details"""
  details: JSON
}

"""
Validation error
"""
type ValidationError implements Error {
  message: String!
  code: String!
  details: JSON
  
  """Field that failed validation"""
  field: String!
  
  """Validation rule that failed"""
  rule: String!
}

"""
Not found error
"""
type NotFoundError implements Error {
  message: String!
  code: String!
  details: JSON
  
  """Resource type"""
  resourceType: String!
  
  """Resource ID"""
  resourceId: ID!
}

"""
Business logic error
"""
type BusinessLogicError implements Error {
  message: String!
  code: String!
  details: JSON
}
```

### Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| NOT_FOUND | Resource not found |
| DUPLICATE_ENTRY | Duplicate entry (e.g., category name) |
| INVALID_CSV_FORMAT | CSV format is invalid |
| CATEGORY_HAS_TRANSACTIONS | Cannot delete category with transactions |
| ML_MODEL_NOT_READY | ML model not trained yet |
| INSUFFICIENT_TRAINING_DATA | Not enough data to train ML model |
| DATABASE_ERROR | Database operation failed |

---

## Notes

- **Field Naming**: Use camelCase for field names (GraphQL convention)
- **Nullability**: Use `!` to indicate non-null fields
- **Descriptions**: All types and fields have descriptions for documentation
- **Pagination**: Use connection pattern for large result sets
- **Filtering**: Provide flexible filtering options for queries
- **Sorting**: Support sorting on common fields
- **Bulk Operations**: Support bulk operations for efficiency
- **Error Handling**: Use union types or error interfaces for structured errors
