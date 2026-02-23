# Component Methods - Household Spending Tracker

## Purpose
This document defines method signatures for all components in the Household Spending Tracker application. Detailed business logic and implementation details will be defined in the Functional Design phase (CONSTRUCTION).

**Note**: This document focuses on method signatures, input/output types, and high-level purposes. Detailed business rules, algorithms, and implementation logic are deferred to Functional Design.

---

## 1. Frontend Components

### 1.1 Upload Component

```typescript
interface UploadComponent {
  // Handle file selection from file picker
  onFileSelect(file: File): void;
  
  // Handle file drop from drag-and-drop
  onFileDrop(event: DragEvent): void;
  
  // Validate file before upload (client-side)
  validateFile(file: File): ValidationResult;
  
  // Upload CSV file to backend
  uploadCSV(file: File): Promise<UploadResult>;
  
  // Display upload progress
  updateProgress(progress: number): void;
  
  // Handle upload success
  onUploadSuccess(result: UploadResult): void;
  
  // Handle upload error
  onUploadError(error: Error): void;
  
  // Navigate to next step after successful upload
  navigateToReview(): void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface UploadResult {
  success: boolean;
  transactionCount: number;
  duplicateCount: number;
  errorCount: number;
  message: string;
}
```

---

### 1.2 Transaction Review Component

```typescript
interface TransactionReviewComponent {
  // Fetch transactions requiring review
  fetchTransactionsForReview(): Promise<Transaction[]>;
  
  // Display transaction in virtual scroll list
  renderTransaction(transaction: Transaction): VNode;
  
  // Handle accept suggested classification
  acceptSuggestion(transactionId: string): Promise<void>;
  
  // Handle manual category selection
  selectCategory(transactionId: string, categoryId: string): Promise<void>;
  
  // Update transaction in UI after classification
  updateTransactionUI(transactionId: string): void;
  
  // Remove transaction from review queue
  removeFromQueue(transactionId: string): void;
  
  // Fetch categories for dropdown
  fetchCategories(): Promise<Category[]>;
  
  // Filter transactions by date range
  filterByDateRange(startDate: Date, endDate: Date): void;
  
  // Get count of remaining transactions
  getRemainingCount(): number;
}

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  payee: string;
  particulars: string;
  tranType: string;
  suggestedCategory?: Category;
  confidenceScore?: number;
  status: TransactionStatus;
}

enum TransactionStatus {
  UNCLASSIFIED = 'unclassified',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved'
}
```

---

### 1.3 Report Component

```typescript
interface ReportComponent {
  // Fetch report data for selected month
  fetchReport(month: number, year: number): Promise<Report>;
  
  // Display report in table format
  renderReport(report: Report): VNode;
  
  // Handle month/year selection
  onMonthYearChange(month: number, year: number): void;
  
  // Sort categories by spending amount
  sortByAmount(report: Report): Report;
  
  // Handle empty data scenario
  renderEmptyState(): VNode;
  
  // Format currency for display
  formatCurrency(amount: number): string;
  
  // Print report (future)
  printReport(): void;
}

interface Report {
  month: number;
  year: number;
  categories: CategoryReport[];
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

interface CategoryReport {
  category: Category;
  totalAmount: number;
  transactionCount: number;
  isIncome: boolean;
}
```

---

### 1.4 Category Management Component

```typescript
interface CategoryManagementComponent {
  // Fetch all categories
  fetchCategories(): Promise<Category[]>;
  
  // Create new category
  createCategory(name: string): Promise<Category>;
  
  // Update category name
  updateCategory(categoryId: string, newName: string): Promise<Category>;
  
  // Delete category
  deleteCategory(categoryId: string): Promise<void>;
  
  // Validate category name (client-side)
  validateCategoryName(name: string): ValidationResult;
  
  // Search/filter categories
  filterCategories(searchTerm: string): Category[];
  
  // Sort categories alphabetically
  sortCategories(categories: Category[]): Category[];
  
  // Display category usage statistics
  displayCategoryStats(category: Category): VNode;
}

interface Category {
  id: string;
  name: string;
  transactionCount?: number;
  totalAmount?: number;
  createdAt: Date;
}
```

---

### 1.5 Dashboard Component

```typescript
interface DashboardComponent {
  // Fetch dashboard statistics
  fetchDashboardStats(): Promise<DashboardStats>;
  
  // Display overview
  renderOverview(stats: DashboardStats): VNode;
  
  // Display welcome message for first-time users
  renderWelcomeMessage(): VNode;
  
  // Navigate to feature
  navigateTo(feature: string): void;
  
  // Check if first-time user
  isFirstTimeUser(): boolean;
}

interface DashboardStats {
  totalTransactions: number;
  totalCategories: number;
  pendingReviews: number;
  lastImportDate?: Date;
  totalSpendingThisMonth: number;
}
```

---

## 2. API Components

### 2.1 GraphQL Schema

```graphql
# Types
type Transaction {
  id: ID!
  date: String!
  amount: Float!
  payee: String!
  particulars: String
  tranType: String
  code: String
  reference: String
  thisPartyAccount: String
  otherPartyAccount: String
  serial: String
  transactionCode: String
  batchNumber: String
  originatingBankBranch: String
  processedDate: String
  category: Category
  suggestedCategory: Category
  confidenceScore: Float
  status: TransactionStatus!
  createdAt: String!
  updatedAt: String!
}

type Category {
  id: ID!
  name: String!
  transactionCount: Int
  totalAmount: Float
  createdAt: String!
}

type Report {
  month: Int!
  year: Int!
  categories: [CategoryReport!]!
  totalIncome: Float!
  totalExpenses: Float!
  netAmount: Float!
}

type CategoryReport {
  category: Category!
  totalAmount: Float!
  transactionCount: Int!
  isIncome: Boolean!
}

type UploadResult {
  success: Boolean!
  transactionCount: Int!
  duplicateCount: Int!
  errorCount: Int!
  message: String!
}

type DashboardStats {
  totalTransactions: Int!
  totalCategories: Int!
  pendingReviews: Int!
  lastImportDate: String
  totalSpendingThisMonth: Float!
}

enum TransactionStatus {
  UNCLASSIFIED
  PENDING_REVIEW
  APPROVED
}

# Queries
type Query {
  # Get transactions for review (unclassified or low-confidence)
  getTransactionsForReview: [Transaction!]!
  
  # Get all transactions
  getTransactions(
    startDate: String
    endDate: String
    categoryId: ID
    status: TransactionStatus
  ): [Transaction!]!
  
  # Get transaction by ID
  getTransaction(id: ID!): Transaction
  
  # Get all categories
  getCategories: [Category!]!
  
  # Get category by ID
  getCategory(id: ID!): Category
  
  # Get report for specified month/year
  getReport(month: Int!, year: Int!): Report!
  
  # Get dashboard statistics
  getDashboardStats: DashboardStats!
}

# Mutations
type Mutation {
  # Upload CSV file
  uploadCSV(file: Upload!): UploadResult!
  
  # Classify transaction (accept suggestion or manual selection)
  classifyTransaction(
    transactionId: ID!
    categoryId: ID!
  ): Transaction!
  
  # Create category
  createCategory(name: String!): Category!
  
  # Update category
  updateCategory(id: ID!, name: String!): Category!
  
  # Delete category
  deleteCategory(id: ID!): Boolean!
}
```

---

### 2.2 GraphQL Resolvers

```typescript
interface GraphQLResolvers {
  Query: {
    getTransactionsForReview(parent: any, args: {}, context: Context): Promise<Transaction[]>;
    getTransactions(parent: any, args: GetTransactionsArgs, context: Context): Promise<Transaction[]>;
    getTransaction(parent: any, args: { id: string }, context: Context): Promise<Transaction | null>;
    getCategories(parent: any, args: {}, context: Context): Promise<Category[]>;
    getCategory(parent: any, args: { id: string }, context: Context): Promise<Category | null>;
    getReport(parent: any, args: { month: number; year: number }, context: Context): Promise<Report>;
    getDashboardStats(parent: any, args: {}, context: Context): Promise<DashboardStats>;
  };
  
  Mutation: {
    uploadCSV(parent: any, args: { file: FileUpload }, context: Context): Promise<UploadResult>;
    classifyTransaction(parent: any, args: ClassifyTransactionArgs, context: Context): Promise<Transaction>;
    createCategory(parent: any, args: { name: string }, context: Context): Promise<Category>;
    updateCategory(parent: any, args: { id: string; name: string }, context: Context): Promise<Category>;
    deleteCategory(parent: any, args: { id: string }, context: Context): Promise<boolean>;
  };
}

interface GetTransactionsArgs {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  status?: TransactionStatus;
}

interface ClassifyTransactionArgs {
  transactionId: string;
  categoryId: string;
}

interface Context {
  services: {
    importService: ImportService;
    classificationService: ClassificationService;
    reportingService: ReportingService;
    categoryService: CategoryService;
  };
}
```

---

## 3. Service Components

### 3.1 Import Service

```typescript
interface ImportService {
  // Handle CSV upload and orchestrate import workflow
  handleCSVUpload(file: Buffer, filename: string): Promise<UploadResult>;
  
  // Validate CSV file
  validateCSVFile(file: Buffer): ValidationResult;
  
  // Coordinate parsing, validation, and transaction creation
  processCSV(parsedData: ParsedTransaction[]): Promise<Transaction[]>;
  
  // Handle import errors
  handleImportError(error: Error): UploadResult;
  
  // Emit import completed event
  emitImportCompleted(transactions: Transaction[]): void;
}

interface ParsedTransaction {
  date: string;
  amount: number;
  payee: string;
  particulars: string;
  code: string;
  reference: string;
  tranType: string;
  thisPartyAccount: string;
  otherPartyAccount: string;
  serial: string;
  transactionCode: string;
  batchNumber: string;
  originatingBankBranch: string;
  processedDate: string;
}
```

---

### 3.2 Classification Service

```typescript
interface ClassificationService {
  // Handle transaction classification workflow
  classifyTransactions(transactions: Transaction[]): Promise<ClassificationResult[]>;
  
  // Handle single transaction classification
  classifyTransaction(transaction: Transaction): Promise<ClassificationResult>;
  
  // Handle manual classification
  handleManualClassification(transactionId: string, categoryId: string): Promise<Transaction>;
  
  // Coordinate approval process
  processApprovals(classifications: ClassificationResult[]): Promise<void>;
  
  // Subscribe to TransactionsCreated event
  onTransactionsCreated(transactions: Transaction[]): Promise<void>;
  
  // Emit ClassificationsReady event
  emitClassificationsReady(classifications: ClassificationResult[]): void;
}

interface ClassificationResult {
  transactionId: string;
  suggestedCategoryId: string;
  confidenceScore: number;
  status: TransactionStatus;
}
```

---

### 3.3 Reporting Service

```typescript
interface ReportingService {
  // Generate report for specified month/year
  generateReport(month: number, year: number): Promise<Report>;
  
  // Validate report parameters
  validateReportParams(month: number, year: number): ValidationResult;
  
  // Handle empty data scenario
  handleEmptyReport(month: number, year: number): Report;
  
  // Handle reporting errors
  handleReportingError(error: Error): never;
}
```

---

### 3.4 Category Service

```typescript
interface CategoryService {
  // Get all categories
  getAllCategories(): Promise<Category[]>;
  
  // Get category by ID
  getCategoryById(id: string): Promise<Category | null>;
  
  // Create new category
  createCategory(name: string): Promise<Category>;
  
  // Update category
  updateCategory(id: string, name: string): Promise<Category>;
  
  // Delete category
  deleteCategory(id: string): Promise<boolean>;
  
  // Validate category name
  validateCategoryName(name: string): ValidationResult;
  
  // Check if category is in use
  isCategoryInUse(id: string): Promise<boolean>;
}
```

---

### 3.5 Event Bus

```typescript
interface EventBus {
  // Register event subscriber
  subscribe(eventName: string, handler: EventHandler): void;
  
  // Unregister event subscriber
  unsubscribe(eventName: string, handler: EventHandler): void;
  
  // Publish event
  publish(eventName: string, data: any): Promise<void>;
  
  // Get all subscribers for event
  getSubscribers(eventName: string): EventHandler[];
}

type EventHandler = (data: any) => Promise<void> | void;
```

---

## 4. Business Logic Components

### 4.1 Transaction Data Manager

```typescript
interface TransactionDataManager {
  // Create transactions from parsed CSV data
  createTransactions(parsedData: ParsedTransaction[]): Promise<Transaction[]>;
  
  // Create single transaction
  createTransaction(data: ParsedTransaction): Promise<Transaction>;
  
  // Check for duplicate transactions
  checkDuplicates(transactions: ParsedTransaction[]): Promise<DuplicateCheckResult>;
  
  // Update transaction classification
  updateClassification(transactionId: string, categoryId: string): Promise<Transaction>;
  
  // Get transaction by ID
  getTransactionById(id: string): Promise<Transaction | null>;
  
  // Get transactions by criteria
  getTransactions(criteria: TransactionCriteria): Promise<Transaction[]>;
  
  // Get transactions for review
  getTransactionsForReview(): Promise<Transaction[]>;
  
  // Delete transaction
  deleteTransaction(id: string): Promise<boolean>;
  
  // Emit TransactionsCreated event
  emitTransactionsCreated(transactions: Transaction[]): void;
  
  // Emit TransactionUpdated event
  emitTransactionUpdated(transaction: Transaction): void;
}

interface TransactionCriteria {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  status?: TransactionStatus;
}

interface DuplicateCheckResult {
  duplicates: Transaction[];
  unique: ParsedTransaction[];
}
```

---

### 4.2 Classification Workflow Manager

```typescript
interface ClassificationWorkflowManager {
  // Store classification suggestion
  storeClassification(classification: ClassificationResult): Promise<void>;
  
  // Update classification status
  updateClassificationStatus(transactionId: string, status: TransactionStatus): Promise<void>;
  
  // Get classification by transaction ID
  getClassification(transactionId: string): Promise<ClassificationResult | null>;
  
  // Approve classification
  approveClassification(transactionId: string): Promise<void>;
  
  // Reject classification
  rejectClassification(transactionId: string): Promise<void>;
  
  // Update ML training data
  updateTrainingData(transactionId: string, categoryId: string): Promise<void>;
  
  // Get classification history
  getClassificationHistory(transactionId: string): Promise<ClassificationHistory[]>;
  
  // Emit ClassificationApproved event
  emitClassificationApproved(transactionId: string, categoryId: string): void;
}

interface ClassificationHistory {
  id: string;
  transactionId: string;
  categoryId: string;
  confidenceScore: number;
  timestamp: Date;
  source: 'ml' | 'manual';
}
```

---

### 4.3 Approval Process Manager

```typescript
interface ApprovalProcessManager {
  // Determine if classification should be auto-approved
  shouldAutoApprove(classification: ClassificationResult): boolean;
  
  // Process auto-approval
  processAutoApproval(classification: ClassificationResult): Promise<void>;
  
  // Flag transaction for manual review
  flagForReview(classification: ClassificationResult): Promise<void>;
  
  // Process manual approval
  processManualApproval(transactionId: string, categoryId: string): Promise<void>;
  
  // Get auto-approval threshold
  getAutoApprovalThreshold(): number;
  
  // Emit ApprovalRequired event
  emitApprovalRequired(transactionId: string): void;
  
  // Emit TransactionApproved event
  emitTransactionApproved(transactionId: string, categoryId: string): void;
}
```

---

### 4.4 Category Manager

```typescript
interface CategoryManager {
  // Create category
  createCategory(name: string): Promise<Category>;
  
  // Update category
  updateCategory(id: string, name: string): Promise<Category>;
  
  // Delete category
  deleteCategory(id: string): Promise<boolean>;
  
  // Get all categories
  getAllCategories(): Promise<Category[]>;
  
  // Get category by ID
  getCategoryById(id: string): Promise<Category | null>;
  
  // Get category by name
  getCategoryByName(name: string): Promise<Category | null>;
  
  // Check if category name is unique
  isCategoryNameUnique(name: string): Promise<boolean>;
  
  // Get category usage count
  getCategoryUsageCount(id: string): Promise<number>;
  
  // Validate category name
  validateCategoryName(name: string): ValidationResult;
}
```

---

### 4.5 CSV Parser

```typescript
interface CSVParser {
  // Parse CSV file
  parse(fileContent: Buffer): Promise<ParsedTransaction[]>;
  
  // Validate CSV structure
  validateStructure(csvData: any[]): ValidationResult;
  
  // Extract key fields
  extractKeyFields(row: any): ParsedTransaction;
  
  // Transform data types
  transformDataTypes(row: any): ParsedTransaction;
  
  // Normalize data
  normalizeData(data: ParsedTransaction): ParsedTransaction;
  
  // Validate data
  validateData(data: ParsedTransaction): ValidationResult;
  
  // Handle parsing errors
  handleParsingError(error: Error, row: number): never;
  
  // Emit CSVParsed event
  emitCSVParsed(data: ParsedTransaction[]): void;
}
```

---

### 4.6 Reporting Engine

```typescript
interface ReportingEngine {
  // Generate report for month/year
  generateReport(month: number, year: number): Promise<Report>;
  
  // Get transactions for month
  getTransactionsForMonth(month: number, year: number): Promise<Transaction[]>;
  
  // Calculate category totals
  calculateCategoryTotals(transactions: Transaction[]): CategoryReport[];
  
  // Calculate overall totals
  calculateOverallTotals(categoryReports: CategoryReport[]): { totalIncome: number; totalExpenses: number; netAmount: number };
  
  // Sort categories by amount
  sortCategoriesByAmount(categoryReports: CategoryReport[]): CategoryReport[];
  
  // Handle empty data
  handleEmptyData(month: number, year: number): Report;
}
```

---

### 4.7 ML Classification Engine

```typescript
interface MLClassificationEngine {
  // Load ML model from storage
  loadModel(): Promise<void>;
  
  // Classify transaction
  classify(transaction: Transaction): Promise<ClassificationResult>;
  
  // Classify multiple transactions
  classifyBatch(transactions: Transaction[]): Promise<ClassificationResult[]>;
  
  // Extract features from transaction
  extractFeatures(transaction: Transaction): FeatureVector;
  
  // Preprocess text
  preprocessText(text: string): string[];
  
  // Execute model prediction
  predict(features: FeatureVector): Promise<{ categoryId: string; confidence: number }>;
  
  // Calculate confidence score
  calculateConfidence(prediction: any): number;
  
  // Train/update model with new data
  trainModel(trainingData: TrainingData[]): Promise<void>;
  
  // Save model to storage
  saveModel(): Promise<void>;
  
  // Handle ML errors
  handleMLError(error: Error): never;
}

interface FeatureVector {
  payeeTokens: string[];
  particularsTokens: string[];
  tranType: string;
  amount: number;
}

interface TrainingData {
  transactionId: string;
  features: FeatureVector;
  categoryId: string;
}
```

---

## 5. Data Access Components

### 5.1 Transaction Repository

```typescript
interface TransactionRepository {
  // Insert transaction
  insert(transaction: Transaction): Promise<Transaction>;
  
  // Insert multiple transactions (batch)
  insertBatch(transactions: Transaction[]): Promise<Transaction[]>;
  
  // Update transaction
  update(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  
  // Delete transaction
  delete(id: string): Promise<boolean>;
  
  // Find transaction by ID
  findById(id: string): Promise<Transaction | null>;
  
  // Find transactions by date range
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  
  // Find transactions by category
  findByCategory(categoryId: string): Promise<Transaction[]>;
  
  // Find transactions by status
  findByStatus(status: TransactionStatus): Promise<Transaction[]>;
  
  // Find transactions for review
  findForReview(): Promise<Transaction[]>;
  
  // Check for duplicates
  findDuplicates(transaction: ParsedTransaction): Promise<Transaction[]>;
  
  // Map database row to Transaction object
  mapRowToTransaction(row: any): Transaction;
  
  // Handle database errors
  handleDatabaseError(error: Error): never;
}
```

---

### 5.2 Category Repository

```typescript
interface CategoryRepository {
  // Insert category
  insert(category: Category): Promise<Category>;
  
  // Update category
  update(id: string, updates: Partial<Category>): Promise<Category>;
  
  // Delete category
  delete(id: string): Promise<boolean>;
  
  // Find all categories
  findAll(): Promise<Category[]>;
  
  // Find category by ID
  findById(id: string): Promise<Category | null>;
  
  // Find category by name
  findByName(name: string): Promise<Category | null>;
  
  // Check if category name exists
  existsByName(name: string): Promise<boolean>;
  
  // Map database row to Category object
  mapRowToCategory(row: any): Category;
  
  // Handle database errors
  handleDatabaseError(error: Error): never;
}
```

---

### 5.3 ML Training Data Repository

```typescript
interface MLTrainingDataRepository {
  // Insert classification history record
  insert(history: ClassificationHistory): Promise<ClassificationHistory>;
  
  // Find classification history by transaction ID
  findByTransactionId(transactionId: string): Promise<ClassificationHistory[]>;
  
  // Find classification history by category ID
  findByCategoryId(categoryId: string): Promise<ClassificationHistory[]>;
  
  // Get all training data
  getAllTrainingData(): Promise<TrainingData[]>;
  
  // Get training data for model update
  getTrainingDataSince(date: Date): Promise<TrainingData[]>;
  
  // Map database row to ClassificationHistory object
  mapRowToClassificationHistory(row: any): ClassificationHistory;
  
  // Handle database errors
  handleDatabaseError(error: Error): never;
}
```

---

## Method Signature Conventions

### Naming Conventions
- **Queries**: `get`, `find`, `fetch` prefix
- **Commands**: `create`, `update`, `delete`, `process` prefix
- **Validation**: `validate`, `check`, `is` prefix
- **Events**: `emit`, `on` prefix
- **Handlers**: `handle`, `process` prefix

### Return Types
- **Async operations**: Return `Promise<T>`
- **Validation**: Return `ValidationResult` or `boolean`
- **Queries**: Return `T | null` for single, `T[]` for multiple
- **Commands**: Return created/updated entity or `boolean` for success
- **Events**: Return `void`

### Error Handling
- Methods that can fail throw typed errors
- Validation methods return `ValidationResult` instead of throwing
- Error handlers use `never` return type

### TypeScript Strict Mode
- All parameters and return types are explicitly typed
- No implicit `any` types
- Null safety with `| null` where appropriate
- Enums for fixed value sets

---

## Next Steps

1. Define detailed business logic for each method (Functional Design phase)
2. Implement error handling strategies
3. Define validation rules
4. Implement methods following these signatures
5. Write unit tests for critical methods
