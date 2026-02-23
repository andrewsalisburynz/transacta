# Component Dependencies and Data Flow - Household Spending Tracker

## Purpose
This document defines the dependency relationships between components and illustrates data flow patterns throughout the application.

---

## Dependency Matrix

### Legend
- ✅ Direct Dependency (synchronous call)
- 📡 Event Dependency (asynchronous via Event Bus)
- ❌ No Dependency

### Frontend Layer Dependencies

| Component | GraphQL API | Upload Comp | Review Comp | Report Comp | Category Comp | Dashboard Comp |
|-----------|-------------|-------------|-------------|-------------|---------------|----------------|
| Upload Component | ✅ | - | ❌ | ❌ | ❌ | ❌ |
| Review Component | ✅ | ❌ | - | ❌ | ❌ | ❌ |
| Report Component | ✅ | ❌ | ❌ | - | ❌ | ❌ |
| Category Component | ✅ | ❌ | ❌ | ❌ | - | ❌ |
| Dashboard Component | ✅ | ❌ | ❌ | ❌ | ❌ | - |

**Analysis**: All frontend components depend only on GraphQL API. No inter-component dependencies.

---

### API Layer Dependencies

| Component | Import Service | Classification Service | Reporting Service | Category Service | Event Bus |
|-----------|----------------|------------------------|-------------------|------------------|-----------|
| GraphQL Resolvers | ✅ | ✅ | ✅ | ✅ | ❌ |
| GraphQL Middleware | ❌ | ❌ | ❌ | ❌ | ❌ |

**Analysis**: GraphQL Resolvers depend on all domain services. Middleware has no dependencies.

---

### Service Layer Dependencies

| Component | CSV Parser | Transaction Manager | Classification Manager | Approval Manager | Category Manager | Reporting Engine | ML Engine | Event Bus |
|-----------|------------|---------------------|------------------------|------------------|------------------|------------------|-----------|-----------|
| Import Service | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Classification Service | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Reporting Service | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Category Service | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Event Bus | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - |

**Analysis**: Services depend on specific managers and Event Bus. No circular dependencies.

---

### Business Logic Layer Dependencies

| Component | Transaction Repo | Category Repo | ML Training Repo | Event Bus | File System |
|-----------|------------------|---------------|------------------|-----------|-------------|
| Transaction Manager | ✅ | ❌ | ❌ | ✅ | ❌ |
| Classification Manager | ✅ | ❌ | ✅ | ✅ | ❌ |
| Approval Manager | ❌ | ❌ | ❌ | ✅ | ❌ |
| Category Manager | ❌ | ✅ | ❌ | ❌ | ❌ |
| CSV Parser | ❌ | ❌ | ❌ | ✅ | ❌ |
| Reporting Engine | ✅ | ✅ | ❌ | ❌ | ❌ |
| ML Engine | ❌ | ❌ | ✅ | ❌ | ✅ |

**Analysis**: Managers depend on repositories and Event Bus. ML Engine depends on file system for model storage.

---

### Data Access Layer Dependencies

| Component | Database Connection |
|-----------|---------------------|
| Transaction Repository | ✅ |
| Category Repository | ✅ |
| ML Training Repository | ✅ |

**Analysis**: All repositories depend only on database connection.

---

## Complete Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Upload Component ────────┐                                  │
│  Review Component ────────┤                                  │
│  Report Component ────────┼──► GraphQL API                   │
│  Category Component ──────┤                                  │
│  Dashboard Component ─────┘                                  │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                        API LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  GraphQL Resolvers ───┬──► Import Service                    │
│                       ├──► Classification Service            │
│                       ├──► Reporting Service                 │
│                       └──► Category Service                  │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      SERVICE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Import Service ──────┬──► CSV Parser                        │
│                       ├──► Transaction Data Manager          │
│                       └──► Event Bus                         │
│                                                               │
│  Classification ──────┬──► ML Classification Engine          │
│  Service              ├──► Classification Workflow Manager   │
│                       ├──► Approval Process Manager          │
│                       └──► Event Bus                         │
│                                                               │
│  Reporting Service ───┴──► Reporting Engine                  │
│                                                               │
│  Category Service ────┬──► Category Manager                  │
│                       └──► Transaction Data Manager          │
│                                                               │
│  Event Bus ◄──────────────── (Publishers/Subscribers)        │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Transaction Data ────┬──► Transaction Repository            │
│  Manager              └──► Event Bus                         │
│                                                               │
│  Classification ──────┬──► Transaction Repository            │
│  Workflow Manager     ├──► ML Training Data Repository       │
│                       └──► Event Bus                         │
│                                                               │
│  Approval Process ────┴──► Event Bus                         │
│  Manager                                                      │
│                                                               │
│  Category Manager ────┴──► Category Repository               │
│                                                               │
│  CSV Parser ───────────┴──► Event Bus                        │
│                                                               │
│  Reporting Engine ────┬──► Transaction Repository            │
│                       └──► Category Repository               │
│                                                               │
│  ML Classification ───┬──► ML Training Data Repository       │
│  Engine               └──► File System (model storage)       │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Transaction Repository ──┐                                  │
│  Category Repository ─────┼──► Database Connection           │
│  ML Training Repository ──┘                                  │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  SQLite Database                                              │
│  ML Model Files                                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Event-Driven Dependencies

### Event Publishers and Subscribers

| Event Name | Publisher | Subscribers |
|------------|-----------|-------------|
| `CSVParsed` | CSV Parser | Import Service |
| `TransactionsCreated` | Transaction Data Manager | Classification Service |
| `ImportCompleted` | Import Service | (None currently) |
| `ClassificationsReady` | Classification Service | (None currently) |
| `ClassificationApproved` | Classification Workflow Manager | ML Classification Engine |
| `ApprovalRequired` | Approval Process Manager | (Frontend notification) |
| `TransactionApproved` | Approval Process Manager | (None currently) |
| `TransactionUpdated` | Transaction Data Manager | (None currently) |

### Event Flow Diagram

```
CSV Upload Workflow:

User Upload
    ↓
Import Service
    ↓
CSV Parser ──────────► [CSVParsed] ──────────► Import Service
    ↓
Transaction Data Manager ──► [TransactionsCreated] ──► Classification Service
    ↓
ML Classification Engine
    ↓
Classification Workflow Manager
    ↓
Approval Process Manager ──► [ApprovalRequired] ──► Frontend
```

---

## Data Flow Patterns

### 1. CSV Import Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Upload CSV
     ▼
┌──────────────────┐
│ Upload Component │
└────┬─────────────┘
     │ 2. GraphQL uploadCSV mutation
     ▼
┌──────────────────┐
│ GraphQL Resolver │
└────┬─────────────┘
     │ 3. handleCSVUpload()
     ▼
┌──────────────────┐
│ Import Service   │
└────┬─────────────┘
     │ 4. parse()
     ▼
┌──────────────────┐
│  CSV Parser      │
└────┬─────────────┘
     │ 5. Parsed data
     ▼
┌──────────────────┐
│ Import Service   │
└────┬─────────────┘
     │ 6. createTransactions()
     ▼
┌──────────────────────┐
│ Transaction Data     │
│ Manager              │
└────┬─────────────────┘
     │ 7. insert()
     ▼
┌──────────────────────┐
│ Transaction          │
│ Repository           │
└────┬─────────────────┘
     │ 8. SQL INSERT
     ▼
┌──────────────────────┐
│ SQLite Database      │
└──────────────────────┘
     │
     │ 9. [TransactionsCreated] event
     ▼
┌──────────────────────┐
│ Classification       │
│ Service              │
└──────────────────────┘
```

**Data Transformations**:
1. CSV File (Buffer) → Parsed Data (ParsedTransaction[])
2. Parsed Data → Transaction Domain Objects
3. Transaction Objects → Database Rows
4. Database Rows → Event Data

---

### 2. Classification Flow

```
[TransactionsCreated] Event
     │
     ▼
┌──────────────────────┐
│ Classification       │
│ Service              │
└────┬─────────────────┘
     │ 1. classifyBatch()
     ▼
┌──────────────────────┐
│ ML Classification    │
│ Engine               │
└────┬─────────────────┘
     │ 2. extractFeatures()
     ▼
┌──────────────────────┐
│ Feature Vector       │
└────┬─────────────────┘
     │ 3. predict()
     ▼
┌──────────────────────┐
│ TensorFlow.js Model  │
└────┬─────────────────┘
     │ 4. Prediction + Confidence
     ▼
┌──────────────────────┐
│ Classification       │
│ Service              │
└────┬─────────────────┘
     │ 5. storeClassification()
     ▼
┌──────────────────────┐
│ Classification       │
│ Workflow Manager     │
└────┬─────────────────┘
     │ 6. shouldAutoApprove()
     ▼
┌──────────────────────┐
│ Approval Process     │
│ Manager              │
└────┬─────────────────┘
     │ 7a. Auto-approve (>80%)
     │ OR
     │ 7b. Flag for review (<80%)
     ▼
┌──────────────────────┐
│ Transaction          │
│ Repository           │
└────┬─────────────────┘
     │ 8. Update status
     ▼
┌──────────────────────┐
│ SQLite Database      │
└──────────────────────┘
```

**Data Transformations**:
1. Transaction → Feature Vector (text tokens, amount, type)
2. Feature Vector → ML Prediction (category ID + confidence)
3. Prediction → Classification Result (with status)
4. Classification Result → Database Update

---

### 3. Manual Classification Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Select category
     ▼
┌──────────────────┐
│ Review Component │
└────┬─────────────┘
     │ 2. GraphQL classifyTransaction mutation
     ▼
┌──────────────────┐
│ GraphQL Resolver │
└────┬─────────────┘
     │ 3. handleManualClassification()
     ▼
┌──────────────────────┐
│ Classification       │
│ Service              │
└────┬─────────────────┘
     │ 4. approveClassification()
     ▼
┌──────────────────────┐
│ Classification       │
│ Workflow Manager     │
└────┬─────────────────┘
     │ 5. updateTrainingData()
     ▼
┌──────────────────────┐
│ ML Training Data     │
│ Repository           │
└────┬─────────────────┘
     │ 6. insert()
     ▼
┌──────────────────────┐
│ SQLite Database      │
│ (classification_     │
│  history table)      │
└──────────────────────┘
     │
     │ 7. [ClassificationApproved] event
     ▼
┌──────────────────────┐
│ ML Classification    │
│ Engine               │
└────┬─────────────────┘
     │ 8. trainModel() (async)
     ▼
┌──────────────────────┐
│ Updated ML Model     │
│ (File System)        │
└──────────────────────┘
```

**Data Transformations**:
1. User Selection → Classification Request (transaction ID + category ID)
2. Classification Request → Training Data Record
3. Training Data → ML Model Update
4. Updated Model → File System (JSON + binary)

---

### 4. Report Generation Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Select month/year
     ▼
┌──────────────────┐
│ Report Component │
└────┬─────────────┘
     │ 2. GraphQL getReport query
     ▼
┌──────────────────┐
│ GraphQL Resolver │
└────┬─────────────┘
     │ 3. generateReport()
     ▼
┌──────────────────┐
│ Reporting Service│
└────┬─────────────┘
     │ 4. generateReport()
     ▼
┌──────────────────┐
│ Reporting Engine │
└────┬─────────────┘
     │ 5. getTransactionsForMonth()
     ▼
┌──────────────────────┐
│ Transaction          │
│ Repository           │
└────┬─────────────────┘
     │ 6. SQL SELECT with date filter
     ▼
┌──────────────────────┐
│ SQLite Database      │
└────┬─────────────────┘
     │ 7. Transaction rows
     ▼
┌──────────────────────┐
│ Reporting Engine     │
└────┬─────────────────┘
     │ 8. calculateCategoryTotals()
     │ 9. calculateOverallTotals()
     │ 10. sortCategoriesByAmount()
     ▼
┌──────────────────────┐
│ Report Object        │
└────┬─────────────────┘
     │ 11. Return to API
     ▼
┌──────────────────────┐
│ GraphQL Resolver     │
└────┬─────────────────┘
     │ 12. Return to frontend
     ▼
┌──────────────────────┐
│ Report Component     │
└────┬─────────────────┘
     │ 13. Display report
     ▼
┌──────────┐
│  User    │
└──────────┘
```

**Data Transformations**:
1. User Input (month, year) → Query Parameters
2. Query Parameters → SQL WHERE clause
3. Database Rows → Transaction Objects
4. Transaction Objects → Aggregated Data (category totals)
5. Aggregated Data → Report Object
6. Report Object → GraphQL Response
7. GraphQL Response → UI Display

---

### 5. Category Management Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Create category
     ▼
┌──────────────────────┐
│ Category Management  │
│ Component            │
└────┬─────────────────┘
     │ 2. GraphQL createCategory mutation
     ▼
┌──────────────────────┐
│ GraphQL Resolver     │
└────┬─────────────────┘
     │ 3. createCategory()
     ▼
┌──────────────────────┐
│ Category Service     │
└────┬─────────────────┘
     │ 4. Validate name
     │ 5. isCategoryNameUnique()
     ▼
┌──────────────────────┐
│ Category Manager     │
└────┬─────────────────┘
     │ 6. findByName()
     ▼
┌──────────────────────┐
│ Category Repository  │
└────┬─────────────────┘
     │ 7. SQL SELECT
     ▼
┌──────────────────────┐
│ SQLite Database      │
└────┬─────────────────┘
     │ 8. No match (unique)
     ▼
┌──────────────────────┐
│ Category Manager     │
└────┬─────────────────┘
     │ 9. createCategory()
     ▼
┌──────────────────────┐
│ Category Repository  │
└────┬─────────────────┘
     │ 10. SQL INSERT
     ▼
┌──────────────────────┐
│ SQLite Database      │
└────┬─────────────────┘
     │ 11. New category
     ▼
┌──────────────────────┐
│ Category Service     │
└────┬─────────────────┘
     │ 12. Return to API
     ▼
┌──────────────────────┐
│ GraphQL Resolver     │
└────┬─────────────────┘
     │ 13. Return to frontend
     ▼
┌──────────────────────┐
│ Category Management  │
│ Component            │
└────┬─────────────────┘
     │ 14. Display new category
     ▼
┌──────────┐
│  User    │
└──────────┘
```

**Data Transformations**:
1. User Input (category name) → Mutation Parameters
2. Mutation Parameters → Validation
3. Validation → Database Query
4. Database Query → Uniqueness Check
5. Uniqueness Check → Database Insert
6. Database Insert → Category Object
7. Category Object → GraphQL Response
8. GraphQL Response → UI Display

---

## Dependency Injection Strategy

### Constructor Injection

All components receive dependencies via constructor:

```typescript
// Service Layer
class ImportService {
  constructor(
    private csvParser: CSVParser,
    private transactionDataManager: TransactionDataManager,
    private eventBus: EventBus
  ) {}
}

// Business Logic Layer
class TransactionDataManager {
  constructor(
    private transactionRepository: TransactionRepository,
    private eventBus: EventBus
  ) {}
}

// Data Access Layer
class TransactionRepository {
  constructor(
    private db: Database
  ) {}
}
```

### Dependency Container

Use a simple dependency container for instantiation:

```typescript
// container.ts
export class DependencyContainer {
  private instances = new Map<string, any>();
  
  register<T>(name: string, factory: () => T): void {
    this.instances.set(name, factory());
  }
  
  get<T>(name: string): T {
    return this.instances.get(name);
  }
}

// Setup
const container = new DependencyContainer();

// Register dependencies (bottom-up)
container.register('db', () => new Database('./data/transacta.db'));
container.register('eventBus', () => new EventBus());

container.register('transactionRepository', () => 
  new TransactionRepository(container.get('db'))
);
container.register('categoryRepository', () => 
  new CategoryRepository(container.get('db'))
);

container.register('transactionDataManager', () => 
  new TransactionDataManager(
    container.get('transactionRepository'),
    container.get('eventBus')
  )
);

container.register('importService', () => 
  new ImportService(
    container.get('csvParser'),
    container.get('transactionDataManager'),
    container.get('eventBus')
  )
);

// Use in API
const importService = container.get<ImportService>('importService');
```

---

## Circular Dependency Prevention

### Rules

1. **Layered Architecture**: Dependencies flow downward only (Frontend → API → Service → Manager → Repository → Database)
2. **Event-Driven**: Use events for upward communication (Manager → Service)
3. **No Peer Dependencies**: Components in same layer don't depend on each other
4. **Interface Segregation**: Use interfaces to break dependencies if needed

### Example: Breaking Circular Dependency

**Problem**: Classification Service needs Transaction Data Manager, and Transaction Data Manager needs to notify Classification Service.

**Solution**: Use Event Bus

```typescript
// Transaction Data Manager emits event
class TransactionDataManager {
  async createTransactions(data: ParsedTransaction[]): Promise<Transaction[]> {
    const transactions = await this.repository.insertBatch(data);
    await this.eventBus.publish('TransactionsCreated', { transactions });
    return transactions;
  }
}

// Classification Service subscribes to event
class ClassificationService {
  constructor(eventBus: EventBus) {
    eventBus.subscribe('TransactionsCreated', this.onTransactionsCreated.bind(this));
  }
  
  async onTransactionsCreated({ transactions }: { transactions: Transaction[] }) {
    await this.classifyTransactions(transactions);
  }
}
```

---

## Testing Dependencies

### Unit Testing

Mock all dependencies:

```typescript
describe('ImportService', () => {
  let importService: ImportService;
  let mockCSVParser: jest.Mocked<CSVParser>;
  let mockTransactionDataManager: jest.Mocked<TransactionDataManager>;
  let mockEventBus: jest.Mocked<EventBus>;
  
  beforeEach(() => {
    mockCSVParser = {
      parse: jest.fn()
    } as any;
    
    mockTransactionDataManager = {
      checkDuplicates: jest.fn(),
      createTransactions: jest.fn()
    } as any;
    
    mockEventBus = {
      publish: jest.fn()
    } as any;
    
    importService = new ImportService(
      mockCSVParser,
      mockTransactionDataManager,
      mockEventBus
    );
  });
  
  // Tests...
});
```

### Integration Testing

Use real dependencies:

```typescript
describe('Import Workflow Integration', () => {
  let db: Database;
  let eventBus: EventBus;
  let importService: ImportService;
  
  beforeEach(async () => {
    db = await setupTestDatabase();
    eventBus = new EventBus();
    
    const transactionRepository = new TransactionRepository(db);
    const transactionDataManager = new TransactionDataManager(transactionRepository, eventBus);
    const csvParser = new CSVParser(eventBus);
    
    importService = new ImportService(csvParser, transactionDataManager, eventBus);
  });
  
  // Tests...
});
```

---

## Dependency Documentation

### Component Dependency Cards

Each component should document its dependencies:

```typescript
/**
 * Import Service
 * 
 * Dependencies:
 * - CSVParser: For parsing CSV files
 * - TransactionDataManager: For creating transactions
 * - EventBus: For emitting events
 * 
 * Dependents:
 * - GraphQL Resolvers: Call handleCSVUpload()
 * 
 * Events Emitted:
 * - ImportCompleted: When import workflow finishes
 * 
 * Events Subscribed:
 * - None
 */
export class ImportService {
  // Implementation...
}
```

---

## Next Steps

1. Implement dependency injection container
2. Set up Event Bus infrastructure
3. Implement components following dependency graph
4. Write integration tests for workflows
5. Document component interfaces
