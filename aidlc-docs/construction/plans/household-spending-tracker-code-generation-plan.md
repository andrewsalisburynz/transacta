# Code Generation Plan (Part 1) - Household Spending Tracker

## Overview

**Project**: Household Spending Tracker  
**Phase**: Code Planning (Part 1 of Code Generation)  
**Project Type**: Greenfield Monorepo  
**Architecture**: Layered Architecture with Event-Driven Workflows  
**Technology Stack**: Node.js + TypeScript (Backend), Vue 3 + TypeScript (Frontend), GraphQL, SQLite, TensorFlow.js

---

## Project Structure

```
transacta/
├── backend/                     # Node.js + TypeScript backend
│   ├── src/
│   │   ├── api/                 # GraphQL API layer
│   │   ├── services/            # Domain services
│   │   ├── managers/            # Business logic managers
│   │   ├── repositories/        # Data access layer
│   │   ├── database/            # Database setup
│   │   ├── models/              # Domain models/types
│   │   ├── utils/               # Utility functions
│   │   └── server.ts            # Server entry point
│   ├── __tests__/               # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── frontend/                    # Vue 3 + TypeScript frontend
│   ├── src/
│   │   ├── components/          # Vue components
│   │   ├── composables/         # Vue composition functions
│   │   ├── services/            # API client services
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utility functions
│   │   ├── App.vue              # Root component
│   │   └── main.ts              # Entry point
│   ├── __tests__/               # Frontend tests
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/                        # SQLite database
│   └── household-spending.db
├── models/                      # ML model files
│   └── classifier_latest/
├── .env                         # Environment variables
├── package.json                 # Root package.json
└── README.md                    # Project documentation
```

---

## Code Generation Steps


### 1. Project Structure Setup

#### 1.1 Create Directory Structure
- [x] Create `backend/` directory
- [x] Create `backend/src/` directory with subdirectories: `api/`, `services/`, `managers/`, `repositories/`, `database/`, `models/`, `utils/`
- [x] Create `backend/__tests__/` directory
- [x] Create `frontend/` directory
- [x] Create `frontend/src/` directory with subdirectories: `components/`, `composables/`, `services/`, `types/`, `utils/`
- [x] Create `frontend/__tests__/` directory
- [x] Create `data/` directory for SQLite database
- [x] Create `models/` directory for ML model files
- **User Stories**: Foundation for all stories
- **Description**: Set up the complete directory structure for the monorepo

#### 1.2 Create Root Package Configuration
- [x] Create root `package.json` with workspace configuration
- [x] Create root `.gitignore` file
- [x] Create root `README.md` with project overview
- [x] Create `.env.example` file with environment variable templates
- **User Stories**: Foundation for all stories
- **Files**: `package.json`, `.gitignore`, `README.md`, `.env.example`

#### 1.3 Create Backend Package Configuration
- [ ] Create `backend/package.json` with dependencies (express, apollo-server-express, sqlite3, @tensorflow/tfjs-node, graphql, typescript)
- [ ] Create `backend/tsconfig.json` with strict TypeScript configuration
- [ ] Create `backend/.eslintrc.json` for code linting
- [ ] Create `backend/.prettierrc` for code formatting
- **User Stories**: Foundation for all stories
- **Files**: `backend/package.json`, `backend/tsconfig.json`, `backend/.eslintrc.json`, `backend/.prettierrc`

#### 1.4 Create Frontend Package Configuration
- [ ] Create `frontend/package.json` with dependencies (vue, vue-router, @apollo/client, graphql, typescript, vite)
- [ ] Create `frontend/tsconfig.json` with strict TypeScript configuration
- [ ] Create `frontend/vite.config.ts` for Vite build configuration
- [ ] Create `frontend/.eslintrc.json` for code linting
- [ ] Create `frontend/.prettierrc` for code formatting
- [ ] Create `frontend/index.html` as entry HTML file
- **User Stories**: Foundation for all stories
- **Files**: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/.eslintrc.json`, `frontend/.prettierrc`, `frontend/index.html`

---

### 2. Database Setup

#### 2.1 Create Database Schema
- [ ] Create `backend/src/database/schema.sql` with all table definitions (transactions, categories, classification_history, ml_model_metadata)
- [ ] Include indexes for performance optimization
- [ ] Include triggers for updated_at timestamps and category statistics
- **User Stories**: Foundation for all data-related stories
- **Files**: `backend/src/database/schema.sql`

#### 2.2 Create Database Connection Module
- [ ] Create `backend/src/database/connection.ts` for SQLite connection management
- [ ] Implement connection pooling and error handling
- [ ] Enable foreign keys and set pragmas
- **User Stories**: Foundation for all data-related stories
- **Files**: `backend/src/database/connection.ts`

#### 2.3 Create Database Initialization Script
- [ ] Create `backend/src/database/init.ts` to initialize database from schema
- [ ] Include seed data for default categories
- [ ] Handle database migration logic
- **User Stories**: 1.1, 1.2
- **Files**: `backend/src/database/init.ts`

---

### 3. Backend - Repository Layer

#### 3.1 Create Transaction Repository
- [ ] Create `backend/src/repositories/transaction.repository.ts`
- [ ] Implement CRUD operations: create, findById, findAll, update, delete
- [ ] Implement query methods: findByDateRange, findByCategory, findByStatus, findUnclassified
- [ ] Implement duplicate detection: findDuplicates
- [ ] Implement batch operations: createBatch
- **User Stories**: 2.4, 4.1, 4.2, 5.1
- **Files**: `backend/src/repositories/transaction.repository.ts`

#### 3.2 Create Category Repository
- [ ] Create `backend/src/repositories/category.repository.ts`
- [ ] Implement CRUD operations: create, findById, findAll, update, delete
- [ ] Implement query methods: findByName, checkNameUniqueness
- [ ] Implement usage statistics: getTransactionCount, getTotalAmount
- **User Stories**: 1.2, 6.1, 6.2, 6.3
- **Files**: `backend/src/repositories/category.repository.ts`

#### 3.3 Create Classification History Repository
- [ ] Create `backend/src/repositories/classification-history.repository.ts`
- [ ] Implement create operation for classification history
- [ ] Implement query methods: findByTransaction, findByCategory, findForTraining
- [ ] Implement training data retrieval for ML model
- **User Stories**: 3.1, 3.4, 3.5
- **Files**: `backend/src/repositories/classification-history.repository.ts`

#### 3.4 Create ML Model Metadata Repository
- [ ] Create `backend/src/repositories/ml-model-metadata.repository.ts`
- [ ] Implement CRUD operations for model metadata
- [ ] Implement query methods: findActiveModel, findByVersion
- [ ] Implement model activation/deactivation logic
- **User Stories**: 3.1, 3.4
- **Files**: `backend/src/repositories/ml-model-metadata.repository.ts`

---


### 4. Backend - Business Logic Layer (Managers)

#### 4.1 Create Transaction Data Manager
- [ ] Create `backend/src/managers/transaction-data.manager.ts`
- [ ] Implement transaction creation with validation
- [ ] Implement duplicate detection logic
- [ ] Implement transaction update and classification assignment
- [ ] Implement transaction retrieval with filtering
- [ ] Emit domain events (TransactionsCreated, TransactionUpdated)
- **User Stories**: 2.4, 4.1, 4.2
- **Files**: `backend/src/managers/transaction-data.manager.ts`

#### 4.2 Create Classification Workflow Manager
- [ ] Create `backend/src/managers/classification-workflow.manager.ts`
- [ ] Implement classification state management
- [ ] Implement classification history tracking
- [ ] Implement confidence score management
- [ ] Implement classification approval workflow
- [ ] Update ML training data on approval
- **User Stories**: 3.1, 3.2, 4.2, 4.3
- **Files**: `backend/src/managers/classification-workflow.manager.ts`

#### 4.3 Create Approval Process Manager
- [ ] Create `backend/src/managers/approval-process.manager.ts`
- [ ] Implement auto-approval logic (confidence > 80%)
- [ ] Implement manual review flagging
- [ ] Implement approval decision processing
- [ ] Emit approval events (ApprovalRequired, TransactionApproved)
- **User Stories**: 3.3, 4.1, 4.2, 4.3
- **Files**: `backend/src/managers/approval-process.manager.ts`

#### 4.4 Create Category Manager
- [ ] Create `backend/src/managers/category.manager.ts`
- [ ] Implement category CRUD operations with validation
- [ ] Implement category name uniqueness checking
- [ ] Implement category usage validation (prevent deletion with transactions)
- [ ] Implement category statistics calculation
- **User Stories**: 1.2, 6.1, 6.2, 6.3
- **Files**: `backend/src/managers/category.manager.ts`

#### 4.5 Create CSV Parser
- [ ] Create `backend/src/managers/csv-parser.ts`
- [ ] Implement CSV file reading and parsing (14 columns)
- [ ] Implement CSV format validation (required columns)
- [ ] Implement data transformation (date parsing, amount parsing)
- [ ] Implement data normalization (trim whitespace, handle nulls)
- [ ] Emit CSVParsed event
- [ ] Generate detailed error messages for parsing failures
- **User Stories**: 2.1, 2.2, 7.1
- **Files**: `backend/src/managers/csv-parser.ts`

#### 4.6 Create Reporting Engine
- [ ] Create `backend/src/managers/reporting.engine.ts`
- [ ] Implement monthly report generation
- [ ] Implement date range report generation
- [ ] Implement category aggregation (sum, count)
- [ ] Implement income vs expense separation
- [ ] Implement sorting by amount
- [ ] Handle empty data scenarios
- **User Stories**: 5.1, 5.2, 7.2
- **Files**: `backend/src/managers/reporting.engine.ts`

#### 4.7 Create ML Classification Engine
- [ ] Create `backend/src/managers/ml-classification.engine.ts`
- [ ] Implement TensorFlow.js model creation (neural network architecture)
- [ ] Implement feature extraction (TF-IDF vectorization from payee, particulars, tranType)
- [ ] Implement model training with classification history data
- [ ] Implement transaction classification (prediction)
- [ ] Implement confidence score calculation
- [ ] Implement model persistence (save/load)
- [ ] Implement model evaluation metrics
- **User Stories**: 3.1, 3.2, 3.4, 3.5
- **Files**: `backend/src/managers/ml-classification.engine.ts`

---

### 5. Backend - Service Layer

#### 5.1 Create Event Bus
- [ ] Create `backend/src/services/event-bus.ts`
- [ ] Implement event subscription mechanism
- [ ] Implement event publishing mechanism
- [ ] Implement async event handling
- [ ] Implement error handling for subscribers
- [ ] Add event logging for debugging
- **User Stories**: Foundation for event-driven workflows
- **Files**: `backend/src/services/event-bus.ts`

#### 5.2 Create Import Service
- [ ] Create `backend/src/services/import.service.ts`
- [ ] Implement CSV upload workflow orchestration
- [ ] Coordinate CSV parsing, validation, and transaction creation
- [ ] Implement duplicate detection workflow
- [ ] Emit ImportCompleted event
- [ ] Handle import errors and rollback
- [ ] Return import summary (imported count, duplicate count, errors)
- **User Stories**: 2.1, 2.2, 2.3, 2.4, 7.1
- **Files**: `backend/src/services/import.service.ts`

#### 5.3 Create Classification Service
- [ ] Create `backend/src/services/classification.service.ts`
- [ ] Subscribe to TransactionsCreated event
- [ ] Orchestrate ML classification workflow
- [ ] Coordinate classification, approval, and history tracking
- [ ] Handle manual classification requests
- [ ] Trigger ML model updates on approval
- [ ] Emit ClassificationsReady event
- **User Stories**: 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 4.3
- **Files**: `backend/src/services/classification.service.ts`

#### 5.4 Create Reporting Service
- [ ] Create `backend/src/services/reporting.service.ts`
- [ ] Implement report request handling
- [ ] Coordinate report generation with Reporting Engine
- [ ] Validate report parameters (month, year)
- [ ] Format report data for API response
- [ ] Handle empty data scenarios
- **User Stories**: 5.1, 5.2, 7.2
- **Files**: `backend/src/services/reporting.service.ts`

#### 5.5 Create Category Service
- [ ] Create `backend/src/services/category.service.ts`
- [ ] Implement category CRUD workflow orchestration
- [ ] Validate category operations (uniqueness, usage)
- [ ] Coordinate with Category Manager and Transaction Data Manager
- [ ] Handle category errors
- **User Stories**: 1.2, 6.1, 6.2, 6.3
- **Files**: `backend/src/services/category.service.ts`

---


### 6. Backend - API Layer (GraphQL)

#### 6.1 Create GraphQL Type Definitions
- [ ] Create `backend/src/api/schema/types.graphql` with all type definitions (Transaction, Category, Report, etc.)
- [ ] Define scalar types (Date, DateTime, JSON)
- [ ] Define enums (ClassificationStatus, CategoryType, ClassificationMethod)
- [ ] Define input types for mutations
- [ ] Add descriptions for all types and fields
- **User Stories**: All stories (API contract)
- **Files**: `backend/src/api/schema/types.graphql`

#### 6.2 Create GraphQL Query Definitions
- [ ] Create `backend/src/api/schema/queries.graphql` with all query definitions
- [ ] Define queries: transaction, transactions, transactionsRequiringReview, category, categories, monthlyReport, dateRangeReport, dashboardStats
- [ ] Add query parameters and return types
- [ ] Add descriptions for all queries
- **User Stories**: 4.1, 5.1, 5.2, 6.1, 7.2
- **Files**: `backend/src/api/schema/queries.graphql`

#### 6.3 Create GraphQL Mutation Definitions
- [ ] Create `backend/src/api/schema/mutations.graphql` with all mutation definitions
- [ ] Define mutations: uploadCSV, classifyTransaction, bulkClassifyTransactions, createCategory, updateCategory, deleteCategory, trainMLModel
- [ ] Add mutation parameters and return types
- [ ] Add descriptions for all mutations
- **User Stories**: 2.1, 4.2, 4.3, 1.2, 6.2, 6.3, 3.4
- **Files**: `backend/src/api/schema/mutations.graphql`

#### 6.4 Create Query Resolvers
- [ ] Create `backend/src/api/resolvers/query.resolvers.ts`
- [ ] Implement transaction query resolver
- [ ] Implement transactions query resolver with filtering and pagination
- [ ] Implement transactionsRequiringReview resolver
- [ ] Implement category and categories resolvers
- [ ] Implement monthlyReport and dateRangeReport resolvers
- [ ] Implement dashboardStats resolver
- [ ] Add error handling for all resolvers
- **User Stories**: 4.1, 5.1, 5.2, 6.1, 7.2
- **Files**: `backend/src/api/resolvers/query.resolvers.ts`

#### 6.5 Create Mutation Resolvers
- [ ] Create `backend/src/api/resolvers/mutation.resolvers.ts`
- [ ] Implement uploadCSV mutation resolver
- [ ] Implement classifyTransaction and bulkClassifyTransactions resolvers
- [ ] Implement createCategory, updateCategory, deleteCategory resolvers
- [ ] Implement trainMLModel resolver
- [ ] Add input validation for all mutations
- [ ] Add error handling for all mutations
- **User Stories**: 2.1, 4.2, 4.3, 1.2, 6.2, 6.3, 3.4
- **Files**: `backend/src/api/resolvers/mutation.resolvers.ts`

#### 6.6 Create GraphQL Context
- [ ] Create `backend/src/api/context.ts` for request context and dependency injection
- [ ] Inject services into context (Import, Classification, Reporting, Category)
- [ ] Add request metadata (user info, timestamps)
- **User Stories**: Foundation for all API operations
- **Files**: `backend/src/api/context.ts`

#### 6.7 Create GraphQL Middleware
- [ ] Create `backend/src/api/middleware/error-handler.ts` for error formatting
- [ ] Create `backend/src/api/middleware/logger.ts` for request logging
- [ ] Create `backend/src/api/middleware/validator.ts` for input validation
- **User Stories**: Foundation for all API operations
- **Files**: `backend/src/api/middleware/error-handler.ts`, `backend/src/api/middleware/logger.ts`, `backend/src/api/middleware/validator.ts`

---

### 7. Backend - Server Setup

#### 7.1 Create Express Server
- [ ] Create `backend/src/server.ts` as main server entry point
- [ ] Configure Express application
- [ ] Set up middleware (body-parser, cors, error handling)
- [ ] Configure file upload handling (multipart/form-data)
- **User Stories**: Foundation for all API operations
- **Files**: `backend/src/server.ts`

#### 7.2 Create Apollo Server Configuration
- [ ] Configure Apollo Server with GraphQL schema
- [ ] Integrate Apollo Server with Express
- [ ] Configure GraphQL Playground (development only)
- [ ] Set up context creation for each request
- [ ] Configure error formatting
- **User Stories**: Foundation for all API operations
- **Files**: `backend/src/server.ts` (continued)

#### 7.3 Create Server Startup Logic
- [ ] Initialize database connection
- [ ] Run database migrations/initialization
- [ ] Load ML model (if exists)
- [ ] Start Express server on configured port
- [ ] Add graceful shutdown handling
- [ ] Add health check endpoint
- **User Stories**: 1.1, Foundation for all operations
- **Files**: `backend/src/server.ts` (continued)

---

### 8. Backend - Utilities

#### 8.1 Create Logger Utility
- [ ] Create `backend/src/utils/logger.ts`
- [ ] Implement logging levels (debug, info, warn, error)
- [ ] Implement log formatting
- [ ] Add timestamp and context to logs
- [ ] Configure log output (console, file)
- **User Stories**: Foundation for debugging and monitoring
- **Files**: `backend/src/utils/logger.ts`

#### 8.2 Create Error Handler Utility
- [ ] Create `backend/src/utils/error-handler.ts`
- [ ] Define custom error classes (ValidationError, NotFoundError, BusinessLogicError)
- [ ] Implement error transformation for API responses
- [ ] Implement error logging
- **User Stories**: 7.1, 7.2
- **Files**: `backend/src/utils/error-handler.ts`

#### 8.3 Create Validator Utility
- [ ] Create `backend/src/utils/validator.ts`
- [ ] Implement validation functions (date format, amount format, non-empty string)
- [ ] Implement CSV validation helpers
- [ ] Implement category name validation
- **User Stories**: 2.2, 1.2, 7.1
- **Files**: `backend/src/utils/validator.ts`

#### 8.4 Create Cache Utility (Optional)
- [ ] Create `backend/src/utils/cache.ts`
- [ ] Implement in-memory caching for frequently accessed data
- [ ] Implement cache invalidation logic
- [ ] Add TTL (time-to-live) support
- **User Stories**: Performance optimization
- **Files**: `backend/src/utils/cache.ts`

---


### 9. Backend - TypeScript Models

#### 9.1 Create Domain Models
- [ ] Create `backend/src/models/transaction.model.ts` with Transaction interface and enums
- [ ] Create `backend/src/models/category.model.ts` with Category interface and enums
- [ ] Create `backend/src/models/classification.model.ts` with ClassificationHistoryEntry and ClassificationResult interfaces
- [ ] Create `backend/src/models/report.model.ts` with Report and CategorySummary interfaces
- [ ] Create `backend/src/models/csv.model.ts` with CSVRow interface and constants
- [ ] Create `backend/src/models/ml-model.model.ts` with MLModelMetadata interface
- **User Stories**: Foundation for all type-safe operations
- **Files**: `backend/src/models/*.model.ts`

#### 9.2 Create Input/Output Models
- [ ] Create `backend/src/models/import.model.ts` with CSVImportResult and ImportError interfaces
- [ ] Create `backend/src/models/dashboard.model.ts` with DashboardStats interface
- [ ] Create `backend/src/models/filter.model.ts` with TransactionFilter and TransactionSort interfaces
- [ ] Create `backend/src/models/pagination.model.ts` with PaginatedResult and PageInfo interfaces
- **User Stories**: API input/output contracts
- **Files**: `backend/src/models/*.model.ts`

#### 9.3 Create Type Guards and Utilities
- [ ] Create `backend/src/models/type-guards.ts` with type guard functions (isTransaction, isCategory)
- [ ] Create `backend/src/models/constants.ts` with application constants
- [ ] Create `backend/src/models/validation-rules.ts` with validation rule definitions
- **User Stories**: Type safety and validation
- **Files**: `backend/src/models/type-guards.ts`, `backend/src/models/constants.ts`, `backend/src/models/validation-rules.ts`

---

### 10. Backend - Unit Tests

#### 10.1 Create Repository Tests
- [ ] Create `backend/__tests__/repositories/transaction.repository.test.ts`
- [ ] Create `backend/__tests__/repositories/category.repository.test.ts`
- [ ] Create `backend/__tests__/repositories/classification-history.repository.test.ts`
- [ ] Test CRUD operations, query methods, error handling
- [ ] Use in-memory SQLite for testing
- **User Stories**: Quality assurance for data layer
- **Files**: `backend/__tests__/repositories/*.test.ts`

#### 10.2 Create Manager Tests
- [ ] Create `backend/__tests__/managers/transaction-data.manager.test.ts`
- [ ] Create `backend/__tests__/managers/classification-workflow.manager.test.ts`
- [ ] Create `backend/__tests__/managers/csv-parser.test.ts`
- [ ] Create `backend/__tests__/managers/ml-classification.engine.test.ts`
- [ ] Test business logic, validation, error handling
- [ ] Mock repository dependencies
- **User Stories**: Quality assurance for business logic
- **Files**: `backend/__tests__/managers/*.test.ts`

#### 10.3 Create Service Tests
- [ ] Create `backend/__tests__/services/import.service.test.ts`
- [ ] Create `backend/__tests__/services/classification.service.test.ts`
- [ ] Create `backend/__tests__/services/reporting.service.test.ts`
- [ ] Test workflow orchestration, event handling, error handling
- [ ] Mock manager and repository dependencies
- **User Stories**: Quality assurance for service layer
- **Files**: `backend/__tests__/services/*.test.ts`

---

### 11. Frontend - Setup

#### 11.1 Create Vite Configuration
- [ ] Create `frontend/vite.config.ts` with Vue plugin configuration
- [ ] Configure build options (output directory, source maps)
- [ ] Configure dev server (port, proxy to backend)
- [ ] Configure path aliases (@/ for src/)
- **User Stories**: Foundation for frontend development
- **Files**: `frontend/vite.config.ts`

#### 11.2 Create Apollo Client Setup
- [ ] Create `frontend/src/services/apollo-client.ts`
- [ ] Configure Apollo Client with GraphQL endpoint
- [ ] Set up HTTP link and cache
- [ ] Configure error handling
- [ ] Add authentication headers (if needed)
- **User Stories**: Foundation for API communication
- **Files**: `frontend/src/services/apollo-client.ts`

#### 11.3 Create Vue Router Setup
- [ ] Create `frontend/src/router/index.ts`
- [ ] Define routes: Dashboard (/), Import (/import), Review (/review), Reports (/reports), Categories (/categories)
- [ ] Configure route guards (if needed)
- [ ] Set up navigation guards
- **User Stories**: 1.1, Navigation between features
- **Files**: `frontend/src/router/index.ts`

#### 11.4 Create Main Application Files
- [ ] Create `frontend/src/main.ts` as entry point
- [ ] Create `frontend/src/App.vue` as root component
- [ ] Set up Vue app with router and Apollo provider
- [ ] Add global styles and CSS reset
- **User Stories**: Foundation for all frontend features
- **Files**: `frontend/src/main.ts`, `frontend/src/App.vue`

---

### 12. Frontend - Components

#### 12.1 Create Dashboard Component
- [ ] Create `frontend/src/components/Dashboard.vue`
- [ ] Implement dashboard statistics display
- [ ] Implement recent transactions list
- [ ] Implement top categories display
- [ ] Implement navigation to other features
- [ ] Add welcome message for first-time users
- [ ] Query: dashboardStats
- **User Stories**: 1.1, 7.2
- **Files**: `frontend/src/components/Dashboard.vue`

#### 12.2 Create CSV Upload Component
- [ ] Create `frontend/src/components/upload/CSVUpload.vue`
- [ ] Implement drag-and-drop file upload
- [ ] Implement file picker interface
- [ ] Display file information (name, size)
- [ ] Show upload progress
- [ ] Display import results (success/error messages)
- [ ] Handle file validation errors
- [ ] Mutation: uploadCSV
- **User Stories**: 2.1, 7.1
- **Files**: `frontend/src/components/upload/CSVUpload.vue`

#### 12.3 Create Transaction Review Component
- [ ] Create `frontend/src/components/review/TransactionReview.vue`
- [ ] Implement virtual scrolling for large transaction lists
- [ ] Display transaction details (date, payee, amount, particulars)
- [ ] Show ML suggested category and confidence score
- [ ] Implement category selection dropdown
- [ ] Implement "Accept" button for suggested classifications
- [ ] Update transaction classification via mutation
- [ ] Remove classified transactions from queue
- [ ] Display count of remaining transactions
- [ ] Query: transactionsRequiringReview, categories
- [ ] Mutation: classifyTransaction
- **User Stories**: 4.1, 4.2, 4.3, 4.4
- **Files**: `frontend/src/components/review/TransactionReview.vue`

#### 12.4 Create Transaction List Item Component
- [ ] Create `frontend/src/components/review/TransactionListItem.vue`
- [ ] Display single transaction with all details
- [ ] Show suggested category with confidence indicator
- [ ] Implement category selection interface
- [ ] Implement accept/reject actions
- [ ] Emit events for classification actions
- **User Stories**: 4.1, 4.2, 4.3, 4.4
- **Files**: `frontend/src/components/review/TransactionListItem.vue`

#### 12.5 Create Report Component
- [ ] Create `frontend/src/components/reports/Report.vue`
- [ ] Implement month/year selection interface
- [ ] Display spending totals by category
- [ ] Show transaction counts per category
- [ ] Distinguish between income and expenses
- [ ] Sort categories by spending amount
- [ ] Display total spending summary
- [ ] Handle empty states (no data for selected month)
- [ ] Query: monthlyReport
- **User Stories**: 5.1, 5.2, 7.2
- **Files**: `frontend/src/components/reports/Report.vue`

#### 12.6 Create Category Summary Component
- [ ] Create `frontend/src/components/reports/CategorySummary.vue`
- [ ] Display category name with color indicator
- [ ] Display total amount and transaction count
- [ ] Display percentage of total spending
- [ ] Implement drill-down to transaction list (optional)
- **User Stories**: 5.2, 5.4
- **Files**: `frontend/src/components/reports/CategorySummary.vue`

#### 12.7 Create Category Management Component
- [ ] Create `frontend/src/components/categories/CategoryManagement.vue`
- [ ] Display list of all categories
- [ ] Implement create category form
- [ ] Implement edit category interface
- [ ] Implement delete category with confirmation
- [ ] Display category usage statistics
- [ ] Sort categories alphabetically
- [ ] Search/filter categories by name
- [ ] Query: categories
- [ ] Mutations: createCategory, updateCategory, deleteCategory
- **User Stories**: 1.2, 6.1, 6.2, 6.3
- **Files**: `frontend/src/components/categories/CategoryManagement.vue`

#### 12.8 Create Category List Item Component
- [ ] Create `frontend/src/components/categories/CategoryListItem.vue`
- [ ] Display category name with color
- [ ] Display transaction count and total amount
- [ ] Implement edit and delete actions
- [ ] Emit events for CRUD operations
- **User Stories**: 6.1, 6.2, 6.3
- **Files**: `frontend/src/components/categories/CategoryListItem.vue`

#### 12.9 Create Global Components
- [ ] Create `frontend/src/components/common/Header.vue` for navigation
- [ ] Create `frontend/src/components/common/Loading.vue` for loading states
- [ ] Create `frontend/src/components/common/ErrorMessage.vue` for error display
- [ ] Create `frontend/src/components/common/EmptyState.vue` for empty data scenarios
- [ ] Create `frontend/src/components/common/ConfirmDialog.vue` for confirmations
- **User Stories**: Foundation for all UI features
- **Files**: `frontend/src/components/common/*.vue`

---


### 13. Frontend - Composables and Services

#### 13.1 Create GraphQL Query Composables
- [ ] Create `frontend/src/composables/useTransactions.ts` for transaction queries
- [ ] Create `frontend/src/composables/useCategories.ts` for category queries
- [ ] Create `frontend/src/composables/useReports.ts` for report queries
- [ ] Create `frontend/src/composables/useDashboard.ts` for dashboard queries
- [ ] Implement loading, error, and data state management
- [ ] Implement query refetching logic
- **User Stories**: Foundation for data fetching
- **Files**: `frontend/src/composables/*.ts`

#### 13.2 Create GraphQL Mutation Composables
- [ ] Create `frontend/src/composables/useImport.ts` for CSV upload mutation
- [ ] Create `frontend/src/composables/useClassification.ts` for classification mutations
- [ ] Create `frontend/src/composables/useCategoryMutations.ts` for category CRUD mutations
- [ ] Implement mutation execution with loading and error states
- [ ] Implement optimistic updates (where appropriate)
- [ ] Implement cache updates after mutations
- **User Stories**: Foundation for data mutations
- **Files**: `frontend/src/composables/*.ts`

#### 13.3 Create Utility Composables
- [ ] Create `frontend/src/composables/useNotification.ts` for toast notifications
- [ ] Create `frontend/src/composables/useConfirmation.ts` for confirmation dialogs
- [ ] Create `frontend/src/composables/useFormatting.ts` for date/currency formatting
- **User Stories**: Foundation for UI interactions
- **Files**: `frontend/src/composables/*.ts`

---

### 14. Frontend - TypeScript Types

#### 14.1 Create GraphQL Generated Types
- [ ] Create `frontend/src/types/graphql.ts` with GraphQL type definitions
- [ ] Define types matching backend GraphQL schema (Transaction, Category, Report, etc.)
- [ ] Define input types for mutations
- [ ] Define enum types
- **User Stories**: Type safety for API communication
- **Files**: `frontend/src/types/graphql.ts`

#### 14.2 Create Component Types
- [ ] Create `frontend/src/types/components.ts` with component prop types
- [ ] Define event payload types
- [ ] Define component state types
- **User Stories**: Type safety for components
- **Files**: `frontend/src/types/components.ts`

---

### 15. Frontend - Unit Tests

#### 15.1 Create Component Tests
- [ ] Create `frontend/__tests__/components/Dashboard.test.ts`
- [ ] Create `frontend/__tests__/components/CSVUpload.test.ts`
- [ ] Create `frontend/__tests__/components/TransactionReview.test.ts`
- [ ] Create `frontend/__tests__/components/Report.test.ts`
- [ ] Create `frontend/__tests__/components/CategoryManagement.test.ts`
- [ ] Test component rendering, user interactions, data display
- [ ] Mock Apollo Client queries and mutations
- **User Stories**: Quality assurance for UI components
- **Files**: `frontend/__tests__/components/*.test.ts`

#### 15.2 Create Composable Tests
- [ ] Create `frontend/__tests__/composables/useTransactions.test.ts`
- [ ] Create `frontend/__tests__/composables/useCategories.test.ts`
- [ ] Create `frontend/__tests__/composables/useImport.test.ts`
- [ ] Test composable logic, state management, error handling
- [ ] Mock Apollo Client
- **User Stories**: Quality assurance for composables
- **Files**: `frontend/__tests__/composables/*.test.ts`

---

### 16. Configuration Files

#### 16.1 Create Environment Configuration
- [ ] Create `.env` file with environment variables (DATABASE_PATH, PORT, NODE_ENV, ML_MODEL_PATH)
- [ ] Create `.env.example` as template
- [ ] Document all environment variables
- **User Stories**: Foundation for configuration management
- **Files**: `.env`, `.env.example`

#### 16.2 Create TypeScript Configuration
- [ ] Verify `backend/tsconfig.json` with strict mode enabled
- [ ] Verify `frontend/tsconfig.json` with strict mode enabled
- [ ] Configure path aliases and module resolution
- [ ] Configure target ES version and lib
- **User Stories**: Foundation for type safety
- **Files**: `backend/tsconfig.json`, `frontend/tsconfig.json`

#### 16.3 Create ESLint Configuration
- [ ] Verify `backend/.eslintrc.json` with TypeScript rules
- [ ] Verify `frontend/.eslintrc.json` with Vue and TypeScript rules
- [ ] Configure code style rules
- [ ] Configure import order rules
- **User Stories**: Code quality and consistency
- **Files**: `backend/.eslintrc.json`, `frontend/.eslintrc.json`

#### 16.4 Create Prettier Configuration
- [ ] Verify `backend/.prettierrc` with formatting rules
- [ ] Verify `frontend/.prettierrc` with formatting rules
- [ ] Configure line width, tabs vs spaces, semicolons
- **User Stories**: Code formatting consistency
- **Files**: `backend/.prettierrc`, `frontend/.prettierrc`

#### 16.5 Create Jest Configuration
- [ ] Create `backend/jest.config.js` for backend tests
- [ ] Create `frontend/jest.config.js` for frontend tests
- [ ] Configure test environment (node for backend, jsdom for frontend)
- [ ] Configure coverage thresholds
- [ ] Configure test file patterns
- **User Stories**: Testing infrastructure
- **Files**: `backend/jest.config.js`, `frontend/jest.config.js`

---

### 17. Documentation

#### 17.1 Create API Documentation
- [ ] Create `aidlc-docs/construction/household-spending-tracker/code/api-documentation.md`
- [ ] Document all GraphQL queries with examples
- [ ] Document all GraphQL mutations with examples
- [ ] Document error codes and error handling
- [ ] Document authentication (if applicable)
- **User Stories**: Developer reference
- **Files**: `aidlc-docs/construction/household-spending-tracker/code/api-documentation.md`

#### 17.2 Create Database Documentation
- [ ] Create `aidlc-docs/construction/household-spending-tracker/code/database-documentation.md`
- [ ] Document database schema with table descriptions
- [ ] Document indexes and performance considerations
- [ ] Document migration strategy
- [ ] Document backup and restore procedures
- **User Stories**: Developer reference
- **Files**: `aidlc-docs/construction/household-spending-tracker/code/database-documentation.md`

#### 17.3 Create ML Model Documentation
- [ ] Create `aidlc-docs/construction/household-spending-tracker/code/ml-model-documentation.md`
- [ ] Document model architecture and hyperparameters
- [ ] Document feature extraction process
- [ ] Document training process and evaluation metrics
- [ ] Document model persistence format
- **User Stories**: Developer reference for ML
- **Files**: `aidlc-docs/construction/household-spending-tracker/code/ml-model-documentation.md`

#### 17.4 Create Developer Guide
- [ ] Create `aidlc-docs/construction/household-spending-tracker/code/developer-guide.md`
- [ ] Document project setup instructions
- [ ] Document development workflow
- [ ] Document testing strategy
- [ ] Document deployment process
- [ ] Document troubleshooting common issues
- **User Stories**: Developer onboarding
- **Files**: `aidlc-docs/construction/household-spending-tracker/code/developer-guide.md`

#### 17.5 Create User Guide
- [ ] Create `README.md` in project root
- [ ] Document application overview and features
- [ ] Document installation instructions
- [ ] Document usage instructions for each feature
- [ ] Document CSV file format requirements
- [ ] Document troubleshooting for users
- **User Stories**: All user stories (end-user documentation)
- **Files**: `README.md`

---

### 18. Build and Deployment Scripts

#### 18.1 Create Build Scripts
- [ ] Add `build` script to `backend/package.json` (TypeScript compilation)
- [ ] Add `build` script to `frontend/package.json` (Vite build)
- [ ] Add `build:all` script to root `package.json` (build both frontend and backend)
- [ ] Configure output directories (backend/dist, frontend/dist)
- **User Stories**: Deployment preparation
- **Files**: `package.json` files

#### 18.2 Create Development Scripts
- [ ] Add `dev` script to `backend/package.json` (nodemon with TypeScript)
- [ ] Add `dev` script to `frontend/package.json` (Vite dev server)
- [ ] Add `dev:all` script to root `package.json` (run both concurrently)
- [ ] Configure hot reload for development
- **User Stories**: Development workflow
- **Files**: `package.json` files

#### 18.3 Create Test Scripts
- [ ] Add `test` script to `backend/package.json` (Jest)
- [ ] Add `test` script to `frontend/package.json` (Jest)
- [ ] Add `test:all` script to root `package.json` (run all tests)
- [ ] Add `test:coverage` script for coverage reports
- [ ] Add `test:watch` script for watch mode
- **User Stories**: Testing workflow
- **Files**: `package.json` files

#### 18.4 Create Lint and Format Scripts
- [ ] Add `lint` script to `backend/package.json` (ESLint)
- [ ] Add `lint` script to `frontend/package.json` (ESLint)
- [ ] Add `format` script to `backend/package.json` (Prettier)
- [ ] Add `format` script to `frontend/package.json` (Prettier)
- [ ] Add `lint:fix` and `format:fix` scripts
- **User Stories**: Code quality
- **Files**: `package.json` files

#### 18.5 Create Database Scripts
- [ ] Add `db:init` script to `backend/package.json` (initialize database)
- [ ] Add `db:seed` script to `backend/package.json` (seed default categories)
- [ ] Add `db:reset` script to `backend/package.json` (drop and recreate database)
- [ ] Add `db:backup` script to `backend/package.json` (backup database)
- **User Stories**: Database management
- **Files**: `package.json` files

#### 18.6 Create Deployment Script
- [ ] Create `scripts/deploy.sh` for production deployment
- [ ] Build frontend and backend
- [ ] Copy necessary files to deployment directory
- [ ] Set up environment variables
- [ ] Start production server
- **User Stories**: Deployment automation
- **Files**: `scripts/deploy.sh`

---

## Execution Order

The steps should be executed in the following order to maintain dependencies:

1. **Phase 1: Foundation** (Steps 1-2)
   - Project structure setup
   - Database setup

2. **Phase 2: Backend Core** (Steps 3-5)
   - Repository layer
   - Business logic layer (managers)
   - Service layer

3. **Phase 3: Backend API** (Steps 6-7)
   - GraphQL API layer
   - Server setup

4. **Phase 4: Backend Support** (Steps 8-9)
   - Utilities
   - TypeScript models

5. **Phase 5: Frontend Core** (Steps 11-12)
   - Frontend setup
   - Components

6. **Phase 6: Frontend Support** (Steps 13-14)
   - Composables and services
   - TypeScript types

7. **Phase 7: Testing** (Steps 10, 15)
   - Backend unit tests
   - Frontend unit tests

8. **Phase 8: Configuration and Documentation** (Steps 16-17)
   - Configuration files
   - Documentation

9. **Phase 9: Build and Deployment** (Step 18)
   - Build scripts
   - Deployment scripts

---

## Success Criteria

- [ ] All directory structure created
- [ ] All configuration files in place
- [ ] Database schema created and initialized
- [ ] All backend layers implemented (repositories, managers, services, API)
- [ ] All frontend components implemented
- [ ] GraphQL API fully functional
- [ ] ML classification engine operational
- [ ] Unit tests passing for critical paths
- [ ] Documentation complete
- [ ] Application runs successfully in development mode
- [ ] Application builds successfully for production

---

## Notes

- **Technology Stack**: Node.js + TypeScript (backend), Vue 3 + TypeScript (frontend), GraphQL, SQLite, TensorFlow.js
- **Architecture**: Layered architecture with event-driven workflows
- **Testing**: Focus on critical paths (CSV parsing, ML classification, report generation)
- **Documentation**: Comprehensive documentation for developers and users
- **Deployment**: Single deployable unit (monorepo)

---

## Next Steps

After completing this code generation plan:
1. Begin implementation starting with Phase 1 (Foundation)
2. Follow the execution order to maintain dependencies
3. Test each component as it's implemented
4. Update documentation as code is written
5. Perform integration testing after all components are complete
6. Prepare for deployment

