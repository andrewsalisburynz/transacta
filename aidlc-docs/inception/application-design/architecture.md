# Application Architecture - Household Spending Tracker

## Architecture Overview

The Household Spending Tracker follows a **layered architecture** with **event-driven workflow orchestration** and **domain-based service organization**.

### Architecture Style
- **Layered Architecture**: Clear separation between presentation, service, business logic, and data layers
- **Event-Driven Workflows**: Components communicate via events for multi-step processes
- **Domain Services**: Services organized by business domain (Import, Classification, Reporting)
- **Repository Pattern**: Abstracted database access layer

### Technology Stack

**Frontend**:
- Framework: Vue 3
- Language: TypeScript (Strict Mode)
- State Management: Component State (Vue Composition API)
- UI Rendering: Virtual Scrolling for large lists
- File Upload: Drag-and-Drop + Form Input

**Backend**:
- Runtime: Node.js
- Language: TypeScript (Strict Mode)
- API: GraphQL
- ML Library: TensorFlow.js
- Database: SQLite
- Schema Management: Manual SQL Scripts

**Communication**:
- Frontend-Backend: Direct HTTP calls to GraphQL endpoint
- Component Communication: Event-driven (publish/subscribe)
- Error Handling: Layered (each layer handles and escalates)

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│                         (Vue 3 + TS)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Upload     │  │ Transaction  │  │   Report     │      │
│  │  Component   │  │   Review     │  │  Component   │      │
│  │              │  │  Component   │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Category   │  │  Dashboard   │                         │
│  │  Management  │  │  Component   │                         │
│  │              │  │              │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/GraphQL
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      API LAYER (GraphQL)                     │
│                         (Node.js + TS)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   GraphQL    │  │   GraphQL    │  │   GraphQL    │      │
│  │   Resolvers  │  │    Schema    │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       SERVICE LAYER                          │
│                    (Domain Services)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Import    │  │Classification│  │   Reporting  │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Category   │  │    Event     │                         │
│  │   Service    │  │     Bus      │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│                      (Managers + ML)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Transaction  │  │Classification│  │   Approval   │      │
│  │     Data     │  │   Workflow   │  │   Process    │      │
│  │   Manager    │  │   Manager    │  │   Manager    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Category   │  │  CSV Parser  │  │  Reporting   │      │
│  │   Manager    │  │              │  │   Engine     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐                                            │
│  │      ML      │                                            │
│  │Classification│                                            │
│  │    Engine    │                                            │
│  └──────────────┘                                            │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       DATA ACCESS LAYER                      │
│                     (Repository Pattern)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Transaction  │  │   Category   │  │  ML Training │      │
│  │  Repository  │  │  Repository  │  │     Data     │      │
│  │              │  │              │  │  Repository  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      DATABASE LAYER                          │
│                         (SQLite)                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SQLite Database File                    │   │
│  │                                                       │   │
│  │  Tables: transactions, categories,                   │   │
│  │          classification_history, ml_model_metadata   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         ML Model Files (JSON/Binary)                 │   │
│  │                                                       │   │
│  │  Files: model_structure.json, model_weights.bin      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### 1. Frontend Layer (Vue 3)
**Purpose**: User interface and interaction

**Responsibilities**:
- Render UI components
- Handle user input and interactions
- Manage component-level state
- Make GraphQL API calls
- Display data and feedback to user
- Handle client-side validation
- Implement virtual scrolling for large lists

**Key Components**:
- Upload Component (CSV file upload)
- Transaction Review Component (classification workflow)
- Report Component (spending reports)
- Category Management Component (CRUD operations)
- Dashboard Component (overview)

---

### 2. API Layer (GraphQL)
**Purpose**: API gateway and request handling

**Responsibilities**:
- Define GraphQL schema (queries, mutations, types)
- Implement GraphQL resolvers
- Handle HTTP requests/responses
- Validate API inputs
- Route requests to appropriate services
- Handle API-level errors
- Implement middleware (logging, authentication if needed)

**Key Elements**:
- GraphQL Schema Definition
- Query Resolvers (getTransactions, getCategories, getReport)
- Mutation Resolvers (uploadCSV, classifyTransaction, createCategory)
- Type Definitions (Transaction, Category, Report)

---

### 3. Service Layer (Domain Services)
**Purpose**: Business workflow orchestration

**Responsibilities**:
- Orchestrate multi-step business workflows
- Coordinate between managers and components
- Publish and subscribe to domain events
- Handle service-level errors
- Implement business rules and validations
- Manage transactions (database transactions)

**Key Services**:
- **Import Service**: Orchestrates CSV upload → parsing → validation → storage → classification
- **Classification Service**: Manages ML classification workflow and approval process
- **Reporting Service**: Coordinates data aggregation and report generation
- **Category Service**: Handles category CRUD and validation

**Event Bus**: Central event dispatcher for event-driven workflows

---

### 4. Business Logic Layer (Managers + ML)
**Purpose**: Core business logic and data manipulation

**Responsibilities**:
- Implement business logic and rules
- Manage domain entities
- Perform data transformations
- Execute ML classification
- Validate business constraints
- Emit domain events

**Key Managers**:
- **Transaction Data Manager**: CRUD operations for transactions
- **Classification Workflow Manager**: Classification state management
- **Approval Process Manager**: Approval workflow logic
- **Category Manager**: Category CRUD operations
- **CSV Parser**: Parse, validate, transform CSV data
- **Reporting Engine**: Calculate aggregations and generate reports
- **ML Classification Engine**: Train and execute ML model

---

### 5. Data Access Layer (Repository Pattern)
**Purpose**: Abstract database operations

**Responsibilities**:
- Execute database queries
- Map database rows to domain objects
- Handle database connections
- Implement CRUD operations
- Manage database transactions
- Handle data access errors

**Key Repositories**:
- **Transaction Repository**: Transaction table operations
- **Category Repository**: Category table operations
- **ML Training Data Repository**: Classification history operations

---

### 6. Database Layer (SQLite)
**Purpose**: Data persistence

**Responsibilities**:
- Store application data
- Maintain data integrity
- Support queries and indexes
- Store ML training data

**Storage**:
- SQLite database file (transactions, categories, classification history)
- ML model files (model structure and weights)

---

## Event-Driven Workflow Example

### CSV Import Workflow

```
1. User uploads CSV file
   ↓
2. Frontend → GraphQL API: uploadCSV mutation
   ↓
3. API → Import Service: handleCSVUpload()
   ↓
4. Import Service → CSV Parser: parse()
   ↓
5. CSV Parser emits: "CSVParsed" event
   ↓
6. Import Service → Transaction Data Manager: createTransactions()
   ↓
7. Transaction Data Manager emits: "TransactionsCreated" event
   ↓
8. Classification Service (subscribed to event) → ML Classification Engine: classifyTransactions()
   ↓
9. ML Classification Engine → Classification Workflow Manager: updateClassifications()
   ↓
10. Classification Workflow Manager emits: "ClassificationsReady" event
    ↓
11. Approval Process Manager (subscribed to event) → determines auto-approve vs manual review
    ↓
12. Approval Process Manager emits: "ApprovalRequired" event
    ↓
13. Frontend receives notification → displays review queue
```

---

## Data Flow Patterns

### 1. Query Flow (Read Operations)
```
Frontend → GraphQL API → Service → Manager → Repository → Database
                                                              ↓
Frontend ← GraphQL API ← Service ← Manager ← Repository ← Database
```

### 2. Command Flow (Write Operations)
```
Frontend → GraphQL API → Service → Manager → Repository → Database
                            ↓
                        Event Bus → Subscribers (other services/managers)
```

### 3. ML Classification Flow
```
Transaction Data → ML Classification Engine → TensorFlow.js Model
                                                      ↓
                                              Confidence Score
                                                      ↓
                                          Classification Workflow Manager
                                                      ↓
                                    Auto-Approve (>80%) or Flag for Review
```

---

## Component Communication Patterns

### 1. Direct Calls
- Frontend → API (HTTP/GraphQL)
- API → Services
- Services → Managers
- Managers → Repositories
- Repositories → Database

### 2. Event-Driven
- Managers emit events to Event Bus
- Services subscribe to relevant events
- Decouples components for complex workflows

### 3. Repository Pattern
- All database access goes through repositories
- Managers never directly access database
- Enables easy testing and database abstraction

---

## Error Handling Strategy

### Layered Error Handling

**Frontend Layer**:
- Catch API errors
- Display user-friendly error messages
- Handle validation errors
- Retry failed requests (where appropriate)

**API Layer**:
- Catch service errors
- Transform to GraphQL errors
- Log errors
- Return appropriate HTTP status codes

**Service Layer**:
- Catch manager/component errors
- Handle business logic errors
- Rollback transactions on failure
- Emit error events
- Escalate critical errors

**Business Logic Layer**:
- Validate inputs
- Throw domain-specific errors
- Handle data transformation errors
- Escalate to service layer

**Data Access Layer**:
- Catch database errors
- Handle connection errors
- Throw data access exceptions
- Escalate to business logic layer

---

## Folder Structure

```
transacta/
├── frontend/                    # Vue 3 frontend
│   ├── src/
│   │   ├── components/          # Vue components
│   │   │   ├── upload/
│   │   │   ├── review/
│   │   │   ├── reports/
│   │   │   └── categories/
│   │   ├── composables/         # Vue composition functions
│   │   ├── services/            # API client services
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utility functions
│   └── package.json
│
├── backend/                     # Node.js + TypeScript backend
│   ├── src/
│   │   ├── api/                 # GraphQL API layer
│   │   │   ├── schema/          # GraphQL schema definitions
│   │   │   ├── resolvers/       # GraphQL resolvers
│   │   │   └── middleware/      # API middleware
│   │   │
│   │   ├── services/            # Domain services
│   │   │   ├── import.service.ts
│   │   │   ├── classification.service.ts
│   │   │   ├── reporting.service.ts
│   │   │   ├── category.service.ts
│   │   │   └── event-bus.ts
│   │   │
│   │   ├── managers/            # Business logic managers
│   │   │   ├── transaction-data.manager.ts
│   │   │   ├── classification-workflow.manager.ts
│   │   │   ├── approval-process.manager.ts
│   │   │   ├── category.manager.ts
│   │   │   └── reporting.engine.ts
│   │   │
│   │   ├── components/          # Specialized components
│   │   │   ├── csv-parser.ts
│   │   │   └── ml-classification.engine.ts
│   │   │
│   │   ├── repositories/        # Data access layer
│   │   │   ├── transaction.repository.ts
│   │   │   ├── category.repository.ts
│   │   │   └── ml-training-data.repository.ts
│   │   │
│   │   ├── database/            # Database setup
│   │   │   ├── connection.ts
│   │   │   └── schema.sql
│   │   │
│   │   ├── models/              # Domain models/types
│   │   │   ├── transaction.model.ts
│   │   │   ├── category.model.ts
│   │   │   └── classification.model.ts
│   │   │
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utility functions
│   │
│   └── package.json
│
├── ml-models/                   # ML model files
│   ├── model_structure.json
│   └── model_weights.bin
│
├── data/                        # SQLite database
│   └── transacta.db
│
└── docs/                        # Documentation
    └── aidlc-docs/
```

---

## Design Principles

### 1. Separation of Concerns
- Each layer has clear, distinct responsibilities
- Components are focused and single-purpose
- Business logic separated from data access

### 2. Dependency Inversion
- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)
- Repository pattern abstracts database access

### 3. Event-Driven Architecture
- Loose coupling between components
- Asynchronous workflow processing
- Easy to add new event subscribers

### 4. Domain-Driven Design
- Services organized by business domain
- Domain events represent business occurrences
- Rich domain models with behavior

### 5. Type Safety
- TypeScript strict mode throughout
- Strong typing for all interfaces
- Compile-time error detection

---

## Performance Considerations

### Frontend
- Virtual scrolling for large transaction lists
- Component-level state (no global state overhead)
- Lazy loading of components
- Efficient re-rendering with Vue 3 reactivity

### Backend
- Incremental ML classification (not batch)
- Repository pattern enables query optimization
- Event-driven processing prevents blocking
- Database indexing on frequently queried fields

### ML
- TensorFlow.js runs locally (no network latency)
- Model stored in hybrid format (structure + data)
- Incremental model updates (not full retraining)
- Confidence-based auto-approval reduces manual work

---

## Security Considerations

### Data Security
- All data stored locally (no external transmission)
- SQLite database file permissions
- No authentication required (single-user)

### Input Validation
- CSV format validation
- GraphQL input validation
- Type checking with TypeScript
- Sanitization of user inputs

### Error Handling
- No sensitive data in error messages
- Proper error logging
- Graceful degradation

---

## Scalability Considerations

### Current Design (Up to 10,000 transactions)
- SQLite sufficient for data volume
- In-memory ML model
- Single-server architecture

### Future Scalability (If needed)
- Database: Migrate to PostgreSQL
- ML: Separate ML service
- API: Add caching layer
- Frontend: Add state management library

---

## Testing Strategy

### Minimal Testing (Per User Decision)
- Focus on critical paths
- Test CSV parsing and validation
- Test ML classification accuracy
- Test report generation
- Defer comprehensive testing to later phase

### Testing Approach
- Unit tests for critical business logic
- Integration tests for workflows
- Manual testing for UI/UX
- No E2E tests initially

---

## Technology Justification

### Vue 3
- Simpler API than React
- Better documentation
- Composition API for component state
- Excellent TypeScript support

### GraphQL
- Flexible queries for complex data needs
- Single endpoint simplifies API
- Strong typing with schema
- Efficient data fetching

### TensorFlow.js
- Full-featured ML framework
- Runs in Node.js (backend)
- Good documentation and community
- Supports model persistence

### SQLite
- Lightweight and local
- No server setup required
- Sufficient for data volume
- Easy backup (single file)

### TypeScript Strict Mode
- Maximum type safety
- Catch errors at compile time
- Better IDE support
- Improved code quality

---

## Next Steps

1. **Functional Design**: Define detailed business logic for each component (CONSTRUCTION phase)
2. **Database Schema**: Create SQL scripts for tables and indexes
3. **API Schema**: Define complete GraphQL schema
4. **Component Implementation**: Build components following this architecture
5. **Testing**: Implement critical path tests

---

## Approval

This architecture design is ready for review and approval before proceeding to implementation.
