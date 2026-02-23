# Component Definitions - Household Spending Tracker

## Purpose
This document defines all major components in the Household Spending Tracker application, including their responsibilities, boundaries, and purposes.

---

## Component Organization

Components are organized into layers:
1. **Frontend Components** (Vue 3 UI)
2. **API Components** (GraphQL)
3. **Service Components** (Domain Services)
4. **Business Logic Components** (Managers + Specialized Components)
5. **Data Access Components** (Repositories)

---

## 1. Frontend Components

### 1.1 Upload Component
**Purpose**: Handle CSV file upload and import workflow

**Responsibilities**:
- Provide drag-and-drop file upload interface
- Provide file picker for CSV selection
- Display file information (name, size)
- Show upload progress
- Display import results (success/error messages)
- Handle file validation errors
- Navigate user to next step after successful import

**Boundaries**:
- Does NOT parse CSV (backend responsibility)
- Does NOT validate CSV format (backend responsibility)
- Only handles UI and file transmission

**Dependencies**:
- GraphQL API (uploadCSV mutation)

---

### 1.2 Transaction Review Component
**Purpose**: Display transactions requiring manual classification

**Responsibilities**:
- Fetch and display unclassified/low-confidence transactions
- Implement virtual scrolling for large transaction lists
- Display transaction details (date, payee, amount, particulars)
- Show ML suggested category and confidence score
- Provide category selection interface
- Handle "Accept" action for suggested classifications
- Handle manual category selection
- Update transaction classification via API
- Remove classified transactions from review queue
- Display count of remaining transactions

**Boundaries**:
- Does NOT perform classification (backend responsibility)
- Does NOT calculate confidence scores (backend responsibility)
- Only handles UI and user interactions

**Dependencies**:
- GraphQL API (getTransactionsForReview query, classifyTransaction mutation)
- Category Management Component (for category list)

---

### 1.3 Report Component
**Purpose**: Display spending reports and analytics

**Responsibilities**:
- Provide month/year selection interface
- Fetch report data from API
- Display spending totals by category
- Show transaction counts per category
- Distinguish between income and expenses
- Sort categories by spending amount
- Display total spending summary
- Handle empty states (no data for selected month)
- Provide print/export functionality (future)

**Boundaries**:
- Does NOT calculate report data (backend responsibility)
- Does NOT aggregate transactions (backend responsibility)
- Only handles UI and data display

**Dependencies**:
- GraphQL API (getReport query)

---

### 1.4 Category Management Component
**Purpose**: Manage spending categories (CRUD operations)

**Responsibilities**:
- Display list of all categories
- Provide interface to create new category
- Validate category name (non-empty, unique)
- Provide interface to edit category name
- Provide interface to delete category
- Handle deletion validation (prevent deletion of categories with transactions)
- Display category usage statistics (transaction count, total amount)
- Sort categories alphabetically
- Search/filter categories by name

**Boundaries**:
- Does NOT manage transaction-category relationships (backend responsibility)
- Does NOT calculate category statistics (backend responsibility)
- Only handles UI and CRUD operations

**Dependencies**:
- GraphQL API (getCategories query, createCategory, updateCategory, deleteCategory mutations)

---

### 1.5 Dashboard Component
**Purpose**: Provide overview and navigation

**Responsibilities**:
- Display application overview
- Show quick statistics (total transactions, categories, pending reviews)
- Provide navigation to main features
- Display recent activity
- Show welcome message for first-time users
- Guide user through initial setup

**Boundaries**:
- Does NOT perform business logic
- Only handles UI and navigation

**Dependencies**:
- GraphQL API (getDashboardStats query)

---

## 2. API Components

### 2.1 GraphQL Schema
**Purpose**: Define API contract and data types

**Responsibilities**:
- Define all GraphQL types (Transaction, Category, Report, etc.)
- Define all queries (getTransactions, getCategories, getReport, etc.)
- Define all mutations (uploadCSV, classifyTransaction, createCategory, etc.)
- Define input types for mutations
- Define enums (TransactionStatus, ConfidenceLevel, etc.)
- Specify required vs optional fields
- Document API with descriptions

**Boundaries**:
- Does NOT implement business logic
- Only defines API structure

**Dependencies**:
- None (schema definition)

---

### 2.2 GraphQL Resolvers
**Purpose**: Implement API operations and route to services

**Responsibilities**:
- Implement query resolvers (fetch data)
- Implement mutation resolvers (modify data)
- Validate API inputs
- Call appropriate services
- Transform service responses to GraphQL types
- Handle errors and return GraphQL errors
- Log API requests/responses

**Boundaries**:
- Does NOT implement business logic (delegates to services)
- Does NOT access database directly (uses services)
- Only handles API request/response

**Dependencies**:
- Import Service
- Classification Service
- Reporting Service
- Category Service

---

### 2.3 GraphQL Middleware
**Purpose**: Handle cross-cutting API concerns

**Responsibilities**:
- Log incoming requests
- Handle CORS (if needed)
- Parse request body
- Handle authentication (future, if needed)
- Rate limiting (future, if needed)
- Error formatting
- Response compression

**Boundaries**:
- Does NOT implement business logic
- Only handles API-level concerns

**Dependencies**:
- None (middleware layer)

---

## 3. Service Components

### 3.1 Import Service
**Purpose**: Orchestrate CSV import workflow

**Responsibilities**:
- Receive CSV file from API
- Coordinate CSV parsing
- Validate parsed data
- Coordinate transaction creation
- Trigger classification workflow
- Emit "ImportCompleted" event
- Handle import errors
- Rollback on failure
- Return import summary (success count, error count)

**Boundaries**:
- Does NOT parse CSV (delegates to CSV Parser)
- Does NOT create transactions directly (delegates to Transaction Data Manager)
- Does NOT classify transactions (emits event for Classification Service)
- Only orchestrates workflow

**Dependencies**:
- CSV Parser
- Transaction Data Manager
- Event Bus

---

### 3.2 Classification Service
**Purpose**: Orchestrate ML classification workflow

**Responsibilities**:
- Subscribe to "TransactionsCreated" event
- Coordinate ML classification
- Coordinate classification workflow management
- Coordinate approval process
- Emit "ClassificationsReady" event
- Handle classification errors
- Return classification results

**Boundaries**:
- Does NOT perform ML classification (delegates to ML Classification Engine)
- Does NOT manage classification state (delegates to Classification Workflow Manager)
- Does NOT determine approval (delegates to Approval Process Manager)
- Only orchestrates workflow

**Dependencies**:
- ML Classification Engine
- Classification Workflow Manager
- Approval Process Manager
- Event Bus

---

### 3.3 Reporting Service
**Purpose**: Orchestrate report generation

**Responsibilities**:
- Receive report request (month, year)
- Coordinate data aggregation
- Coordinate report generation
- Format report data
- Handle empty data scenarios
- Return report to API
- Handle reporting errors

**Boundaries**:
- Does NOT calculate aggregations (delegates to Reporting Engine)
- Does NOT access database directly (uses Reporting Engine)
- Only orchestrates workflow

**Dependencies**:
- Reporting Engine

---

### 3.4 Category Service
**Purpose**: Orchestrate category management operations

**Responsibilities**:
- Handle category CRUD operations
- Validate category names (uniqueness, non-empty)
- Check category usage before deletion
- Coordinate category updates
- Handle category errors
- Return category data to API

**Boundaries**:
- Does NOT access database directly (delegates to Category Manager)
- Does NOT manage transactions (delegates to Transaction Data Manager)
- Only orchestrates workflow

**Dependencies**:
- Category Manager
- Transaction Data Manager (for usage checks)

---

### 3.5 Event Bus
**Purpose**: Central event dispatcher for event-driven workflows

**Responsibilities**:
- Register event subscribers
- Publish events
- Route events to subscribers
- Handle event errors
- Log events (for debugging)
- Support async event handling

**Boundaries**:
- Does NOT implement business logic
- Only handles event routing

**Dependencies**:
- None (infrastructure component)

---

## 4. Business Logic Components

### 4.1 Transaction Data Manager
**Purpose**: Manage transaction data and CRUD operations

**Responsibilities**:
- Create transactions from parsed CSV data
- Validate transaction data
- Check for duplicate transactions
- Update transaction classifications
- Retrieve transactions by various criteria (date, category, status)
- Delete transactions (if needed)
- Emit "TransactionsCreated" event
- Emit "TransactionUpdated" event
- Handle transaction data errors

**Boundaries**:
- Does NOT parse CSV (receives parsed data)
- Does NOT classify transactions (only stores classifications)
- Does NOT access database directly (uses Transaction Repository)
- Only manages transaction data

**Dependencies**:
- Transaction Repository
- Event Bus

---

### 4.2 Classification Workflow Manager
**Purpose**: Manage classification state and workflow

**Responsibilities**:
- Store classification suggestions
- Update classification status (pending, approved, rejected)
- Track confidence scores
- Manage classification history
- Retrieve transactions by classification status
- Update ML training data when classifications are approved
- Emit "ClassificationApproved" event
- Handle classification workflow errors

**Boundaries**:
- Does NOT perform ML classification (receives suggestions)
- Does NOT determine approval (receives approval decisions)
- Does NOT access database directly (uses repositories)
- Only manages classification state

**Dependencies**:
- Transaction Repository
- ML Training Data Repository
- Event Bus

---

### 4.3 Approval Process Manager
**Purpose**: Manage approval workflow and auto-approval logic

**Responsibilities**:
- Determine auto-approval based on confidence threshold (>80%)
- Flag low-confidence transactions for manual review
- Process manual approval decisions
- Process manual category selections
- Update transaction status (approved, pending review)
- Emit "ApprovalRequired" event
- Emit "TransactionApproved" event
- Handle approval errors

**Boundaries**:
- Does NOT classify transactions (receives classifications)
- Does NOT update transaction data directly (delegates to Classification Workflow Manager)
- Only manages approval logic

**Dependencies**:
- Classification Workflow Manager
- Event Bus

---

### 4.4 Category Manager
**Purpose**: Manage category data and CRUD operations

**Responsibilities**:
- Create categories
- Validate category names (uniqueness, non-empty)
- Update category names
- Delete categories
- Retrieve all categories
- Retrieve category by ID
- Check category usage (transaction count)
- Handle category data errors

**Boundaries**:
- Does NOT manage transactions (only checks usage)
- Does NOT access database directly (uses Category Repository)
- Only manages category data

**Dependencies**:
- Category Repository

---

### 4.5 CSV Parser
**Purpose**: Parse and validate CSV files

**Responsibilities**:
- Read CSV file content
- Parse CSV format (14 columns)
- Validate CSV structure (required columns present)
- Extract key fields (Date, Amount, Payee, Particulars, Tran Type)
- Transform data types (date parsing, amount parsing)
- Normalize data (trim whitespace, handle empty fields)
- Validate data (date format, amount format)
- Return parsed transaction data
- Emit "CSVParsed" event
- Handle parsing errors with clear messages

**Boundaries**:
- Does NOT create transactions (returns parsed data)
- Does NOT access database
- Only parses and validates CSV

**Dependencies**:
- Event Bus

---

### 4.6 Reporting Engine
**Purpose**: Calculate aggregations and generate reports

**Responsibilities**:
- Retrieve transactions for specified month/year
- Calculate total spending per category
- Calculate transaction count per category
- Distinguish between income and expenses
- Sort categories by spending amount
- Calculate overall totals
- Handle empty data scenarios
- Return report data
- Handle reporting errors

**Boundaries**:
- Does NOT format report for display (returns raw data)
- Does NOT access database directly (uses Transaction Repository)
- Only calculates aggregations

**Dependencies**:
- Transaction Repository
- Category Repository

---

### 4.7 ML Classification Engine
**Purpose**: Perform machine learning classification of transactions

**Responsibilities**:
- Load ML model from storage (hybrid: structure + data)
- Extract features from transaction (Payee, Particulars, Tran Type)
- Perform text preprocessing (tokenization, normalization)
- Execute ML model prediction using TensorFlow.js
- Calculate confidence score
- Return suggested category and confidence
- Train/update model with new classification data
- Save updated model to storage
- Handle ML errors

**Boundaries**:
- Does NOT manage classification workflow (only provides suggestions)
- Does NOT determine approval (only provides confidence)
- Does NOT access database directly (receives training data)
- Only performs ML operations

**Dependencies**:
- ML Training Data Repository (for training data)
- File System (for model storage)

---

## 5. Data Access Components

### 5.1 Transaction Repository
**Purpose**: Abstract transaction database operations

**Responsibilities**:
- Execute SQL queries for transactions table
- Insert transactions (single and batch)
- Update transactions
- Delete transactions
- Retrieve transactions by ID
- Retrieve transactions by date range
- Retrieve transactions by category
- Retrieve transactions by status
- Retrieve transactions for review (unclassified or low-confidence)
- Map database rows to Transaction domain objects
- Handle database errors

**Boundaries**:
- Does NOT implement business logic
- Does NOT validate business rules
- Only handles database operations

**Dependencies**:
- Database Connection

---

### 5.2 Category Repository
**Purpose**: Abstract category database operations

**Responsibilities**:
- Execute SQL queries for categories table
- Insert categories
- Update categories
- Delete categories
- Retrieve all categories
- Retrieve category by ID
- Retrieve category by name
- Check category name uniqueness
- Map database rows to Category domain objects
- Handle database errors

**Boundaries**:
- Does NOT implement business logic
- Does NOT validate business rules
- Only handles database operations

**Dependencies**:
- Database Connection

---

### 5.3 ML Training Data Repository
**Purpose**: Abstract ML training data database operations

**Responsibilities**:
- Execute SQL queries for classification_history table
- Insert classification history records
- Retrieve classification history for training
- Retrieve classification history by transaction
- Retrieve classification history by category
- Map database rows to ClassificationHistory domain objects
- Handle database errors

**Boundaries**:
- Does NOT implement business logic
- Does NOT train ML model
- Only handles database operations

**Dependencies**:
- Database Connection

---

## Component Dependency Summary

### Frontend Layer Dependencies
- Upload Component → GraphQL API
- Transaction Review Component → GraphQL API
- Report Component → GraphQL API
- Category Management Component → GraphQL API
- Dashboard Component → GraphQL API

### API Layer Dependencies
- GraphQL Resolvers → Services (Import, Classification, Reporting, Category)
- GraphQL Middleware → None

### Service Layer Dependencies
- Import Service → CSV Parser, Transaction Data Manager, Event Bus
- Classification Service → ML Classification Engine, Classification Workflow Manager, Approval Process Manager, Event Bus
- Reporting Service → Reporting Engine
- Category Service → Category Manager, Transaction Data Manager
- Event Bus → None

### Business Logic Layer Dependencies
- Transaction Data Manager → Transaction Repository, Event Bus
- Classification Workflow Manager → Transaction Repository, ML Training Data Repository, Event Bus
- Approval Process Manager → Classification Workflow Manager, Event Bus
- Category Manager → Category Repository
- CSV Parser → Event Bus
- Reporting Engine → Transaction Repository, Category Repository
- ML Classification Engine → ML Training Data Repository, File System

### Data Access Layer Dependencies
- Transaction Repository → Database Connection
- Category Repository → Database Connection
- ML Training Data Repository → Database Connection

---

## Component Communication Patterns

### Synchronous Communication (Direct Calls)
- Frontend → API
- API → Services
- Services → Managers
- Managers → Repositories
- Repositories → Database

### Asynchronous Communication (Events)
- CSV Parser → "CSVParsed" event
- Transaction Data Manager → "TransactionsCreated" event
- Classification Workflow Manager → "ClassificationApproved" event
- Approval Process Manager → "ApprovalRequired" event

---

## Component Boundaries and Principles

### Single Responsibility
Each component has one clear purpose and responsibility.

### Separation of Concerns
- Frontend: UI and user interaction
- API: Request handling and routing
- Services: Workflow orchestration
- Managers: Business logic
- Repositories: Data access

### Dependency Inversion
- High-level components depend on abstractions (interfaces)
- Low-level components implement abstractions
- Repository pattern abstracts database access

### Event-Driven
- Components emit events for significant occurrences
- Other components subscribe to relevant events
- Loose coupling between components

---

## Next Steps

1. Define detailed method signatures for each component (see component-methods.md)
2. Define service interfaces and contracts (see services.md)
3. Define component dependencies and data flow (see component-dependency.md)
4. Implement components following this design
