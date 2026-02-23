# Service Layer Design - Household Spending Tracker

## Purpose
This document defines the service layer architecture, including service responsibilities, orchestration patterns, and interaction workflows.

---

## Service Layer Overview

The service layer sits between the API layer and the business logic layer, orchestrating complex workflows that involve multiple managers and components.

### Service Layer Principles

1. **Domain-Driven**: Services are organized by business domain (Import, Classification, Reporting, Category)
2. **Orchestration**: Services coordinate between managers but don't implement business logic
3. **Event-Driven**: Services use events for asynchronous, multi-step workflows
4. **Stateless**: Services don't maintain state; they delegate to managers
5. **Transaction Management**: Services manage database transactions for multi-step operations

---

## Service Definitions

### 1. Import Service

**Domain**: CSV Import and Transaction Creation

**Purpose**: Orchestrate the end-to-end CSV import workflow from file upload to transaction classification.

**Responsibilities**:
- Receive CSV file from API layer
- Coordinate CSV parsing with CSV Parser
- Validate parsed data
- Coordinate transaction creation with Transaction Data Manager
- Handle duplicate detection
- Trigger classification workflow via events
- Manage import transaction (rollback on failure)
- Return import summary to API

**Does NOT**:
- Parse CSV directly (delegates to CSV Parser)
- Create transactions directly (delegates to Transaction Data Manager)
- Classify transactions (emits event for Classification Service)

**Dependencies**:
- CSV Parser (for parsing)
- Transaction Data Manager (for transaction creation)
- Event Bus (for emitting events)

**Events Emitted**:
- `ImportCompleted` - When import workflow finishes successfully

**Events Subscribed**:
- None

**Workflow**:
```
1. Receive CSV file from API
2. Call CSV Parser.parse()
3. Validate parsed data
4. Call Transaction Data Manager.checkDuplicates()
5. Call Transaction Data Manager.createTransactions()
6. Emit ImportCompleted event
7. Return UploadResult to API
```

**Error Handling**:
- Catch parsing errors → return error in UploadResult
- Catch validation errors → return error in UploadResult
- Catch database errors → rollback transaction, return error
- All errors are logged and returned to API layer

---

### 2. Classification Service

**Domain**: ML Classification and Approval Workflow

**Purpose**: Orchestrate the transaction classification workflow, including ML prediction, confidence scoring, and approval processing.

**Responsibilities**:
- Subscribe to `TransactionsCreated` event
- Coordinate ML classification with ML Classification Engine
- Coordinate classification workflow with Classification Workflow Manager
- Coordinate approval process with Approval Process Manager
- Handle manual classification requests from API
- Trigger ML model updates when classifications are approved
- Emit classification events

**Does NOT**:
- Perform ML classification directly (delegates to ML Classification Engine)
- Manage classification state (delegates to Classification Workflow Manager)
- Determine approval logic (delegates to Approval Process Manager)

**Dependencies**:
- ML Classification Engine (for classification)
- Classification Workflow Manager (for state management)
- Approval Process Manager (for approval logic)
- Event Bus (for events)

**Events Emitted**:
- `ClassificationsReady` - When classifications are complete and ready for approval

**Events Subscribed**:
- `TransactionsCreated` - Triggers classification workflow
- `ImportCompleted` - Alternative trigger for classification

**Workflow (Automatic Classification)**:
```
1. Receive TransactionsCreated event
2. Call ML Classification Engine.classifyBatch()
3. For each classification result:
   a. Call Classification Workflow Manager.storeClassification()
   b. Call Approval Process Manager.shouldAutoApprove()
   c. If auto-approve: Call Approval Process Manager.processAutoApproval()
   d. If manual review: Call Approval Process Manager.flagForReview()
4. Emit ClassificationsReady event
```

**Workflow (Manual Classification)**:
```
1. Receive manual classification request from API
2. Call Classification Workflow Manager.approveClassification()
3. Call Approval Process Manager.processManualApproval()
4. Call Classification Workflow Manager.updateTrainingData()
5. Trigger ML model update (async)
6. Return updated transaction to API
```

**Error Handling**:
- Catch ML errors → flag transaction for manual review
- Catch workflow errors → log and continue with next transaction
- Catch approval errors → escalate to API layer
- Partial failures allowed (some transactions may succeed)

---

### 3. Reporting Service

**Domain**: Report Generation and Analytics

**Purpose**: Orchestrate report generation by coordinating data retrieval and aggregation.

**Responsibilities**:
- Receive report request from API (month, year)
- Validate report parameters
- Coordinate report generation with Reporting Engine
- Handle empty data scenarios
- Format report data for API response
- Handle reporting errors

**Does NOT**:
- Calculate aggregations directly (delegates to Reporting Engine)
- Access database directly (uses Reporting Engine)

**Dependencies**:
- Reporting Engine (for report generation)

**Events Emitted**:
- None

**Events Subscribed**:
- None

**Workflow**:
```
1. Receive report request from API (month, year)
2. Validate parameters (month 1-12, year valid)
3. Call Reporting Engine.generateReport()
4. If empty data: Call Reporting Engine.handleEmptyData()
5. Return Report to API
```

**Error Handling**:
- Catch validation errors → return error to API
- Catch reporting errors → log and return error to API
- Empty data is not an error (return empty report)

---

### 4. Category Service

**Domain**: Category Management

**Purpose**: Orchestrate category CRUD operations and validation.

**Responsibilities**:
- Handle category CRUD requests from API
- Validate category names (uniqueness, non-empty)
- Check category usage before deletion
- Coordinate with Category Manager and Transaction Data Manager
- Handle category errors

**Does NOT**:
- Access database directly (delegates to Category Manager)
- Manage transactions (uses Transaction Data Manager for usage checks)

**Dependencies**:
- Category Manager (for category operations)
- Transaction Data Manager (for usage checks)

**Events Emitted**:
- None (category operations are synchronous)

**Events Subscribed**:
- None

**Workflow (Create Category)**:
```
1. Receive create request from API
2. Validate category name (non-empty)
3. Call Category Manager.isCategoryNameUnique()
4. If not unique: Return error
5. Call Category Manager.createCategory()
6. Return created Category to API
```

**Workflow (Delete Category)**:
```
1. Receive delete request from API
2. Call Category Manager.getCategoryUsageCount()
3. If usage > 0: Return error (cannot delete)
4. Call Category Manager.deleteCategory()
5. Return success to API
```

**Error Handling**:
- Catch validation errors → return error to API
- Catch uniqueness errors → return error to API
- Catch usage errors → return error to API
- Catch database errors → escalate to API layer

---

### 5. Event Bus

**Domain**: Event Infrastructure

**Purpose**: Provide event-driven communication infrastructure for services and managers.

**Responsibilities**:
- Register event subscribers
- Publish events to subscribers
- Route events to appropriate handlers
- Handle event errors (log and continue)
- Support async event handling
- Log events for debugging

**Does NOT**:
- Implement business logic
- Store events (in-memory only)
- Guarantee event delivery (best-effort)

**Dependencies**:
- None (infrastructure component)

**Events Supported**:
- `CSVParsed` - CSV parsing complete
- `TransactionsCreated` - Transactions created in database
- `ImportCompleted` - Import workflow complete
- `ClassificationsReady` - Classifications complete
- `ClassificationApproved` - Classification approved
- `ApprovalRequired` - Transaction flagged for manual review
- `TransactionApproved` - Transaction approved
- `TransactionUpdated` - Transaction updated

**Implementation Pattern**:
```typescript
// Subscribe to event
eventBus.subscribe('TransactionsCreated', async (data) => {
  // Handle event
});

// Publish event
await eventBus.publish('TransactionsCreated', { transactions });
```

**Error Handling**:
- Catch subscriber errors → log and continue with next subscriber
- Don't let one subscriber failure affect others
- Log all events and errors for debugging

---

## Service Interaction Patterns

### 1. Synchronous Service Calls (API → Service)

**Pattern**: API layer calls service, waits for response

**Use Cases**:
- Category CRUD operations
- Report generation
- Manual classification

**Example**:
```typescript
// API Resolver
async createCategory(parent, { name }, context) {
  return await context.services.categoryService.createCategory(name);
}
```

---

### 2. Event-Driven Service Orchestration (Service → Event → Service)

**Pattern**: Service emits event, other services subscribe and react

**Use Cases**:
- CSV import → classification workflow
- Transaction creation → ML classification
- Classification approval → ML model update

**Example**:
```typescript
// Import Service (publisher)
async handleCSVUpload(file) {
  const transactions = await this.processCSV(file);
  await this.eventBus.publish('TransactionsCreated', { transactions });
  return { success: true, transactionCount: transactions.length };
}

// Classification Service (subscriber)
constructor(eventBus) {
  eventBus.subscribe('TransactionsCreated', this.onTransactionsCreated.bind(this));
}

async onTransactionsCreated({ transactions }) {
  await this.classifyTransactions(transactions);
}
```

---

### 3. Service → Manager Delegation

**Pattern**: Service delegates business logic to managers

**Use Cases**:
- All business logic operations
- Data access operations

**Example**:
```typescript
// Category Service
async createCategory(name: string): Promise<Category> {
  // Validate
  if (!name || name.trim().length === 0) {
    throw new Error('Category name is required');
  }
  
  // Check uniqueness
  const isUnique = await this.categoryManager.isCategoryNameUnique(name);
  if (!isUnique) {
    throw new Error('Category name already exists');
  }
  
  // Delegate to manager
  return await this.categoryManager.createCategory(name);
}
```

---

## Service Layer Benefits

### 1. Separation of Concerns
- API layer handles HTTP/GraphQL concerns
- Service layer handles workflow orchestration
- Manager layer handles business logic
- Repository layer handles data access

### 2. Loose Coupling
- Services communicate via events
- Easy to add new subscribers without modifying publishers
- Components can be tested independently

### 3. Transaction Management
- Services manage database transactions
- Rollback on failure
- Ensure data consistency

### 4. Error Handling
- Services catch and handle errors from managers
- Transform errors for API layer
- Log errors for debugging

### 5. Testability
- Services can be tested with mocked managers
- Event-driven workflows can be tested independently
- Easy to simulate error scenarios

---

## Service Implementation Guidelines

### 1. Service Structure

```typescript
export class ImportService {
  constructor(
    private csvParser: CSVParser,
    private transactionDataManager: TransactionDataManager,
    private eventBus: EventBus
  ) {}
  
  async handleCSVUpload(file: Buffer, filename: string): Promise<UploadResult> {
    try {
      // 1. Validate file
      const validation = this.validateCSVFile(file);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }
      
      // 2. Parse CSV
      const parsedData = await this.csvParser.parse(file);
      
      // 3. Check duplicates
      const duplicateCheck = await this.transactionDataManager.checkDuplicates(parsedData);
      
      // 4. Create transactions
      const transactions = await this.transactionDataManager.createTransactions(duplicateCheck.unique);
      
      // 5. Emit event
      await this.eventBus.publish('TransactionsCreated', { transactions });
      
      // 6. Return result
      return {
        success: true,
        transactionCount: transactions.length,
        duplicateCount: duplicateCheck.duplicates.length,
        errorCount: 0,
        message: 'Import successful'
      };
    } catch (error) {
      return this.handleImportError(error);
    }
  }
  
  private handleImportError(error: Error): UploadResult {
    // Log error
    console.error('Import error:', error);
    
    // Return error result
    return {
      success: false,
      transactionCount: 0,
      duplicateCount: 0,
      errorCount: 1,
      message: error.message
    };
  }
}
```

### 2. Dependency Injection

Services receive dependencies via constructor injection:

```typescript
// Service instantiation
const eventBus = new EventBus();
const csvParser = new CSVParser(eventBus);
const transactionRepository = new TransactionRepository(db);
const transactionDataManager = new TransactionDataManager(transactionRepository, eventBus);
const importService = new ImportService(csvParser, transactionDataManager, eventBus);
```

### 3. Error Handling

Services catch errors and transform them for API layer:

```typescript
async createCategory(name: string): Promise<Category> {
  try {
    // Validation
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Category name is required');
    }
    
    // Business logic
    const isUnique = await this.categoryManager.isCategoryNameUnique(name);
    if (!isUnique) {
      throw new ValidationError('Category name already exists');
    }
    
    // Delegate
    return await this.categoryManager.createCategory(name);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error; // Re-throw validation errors
    }
    // Log and transform other errors
    console.error('Category creation error:', error);
    throw new Error('Failed to create category');
  }
}
```

### 4. Event Handling

Services subscribe to events in constructor:

```typescript
export class ClassificationService {
  constructor(
    private mlEngine: MLClassificationEngine,
    private classificationWorkflowManager: ClassificationWorkflowManager,
    private approvalProcessManager: ApprovalProcessManager,
    private eventBus: EventBus
  ) {
    // Subscribe to events
    this.eventBus.subscribe('TransactionsCreated', this.onTransactionsCreated.bind(this));
  }
  
  async onTransactionsCreated({ transactions }: { transactions: Transaction[] }): Promise<void> {
    try {
      await this.classifyTransactions(transactions);
    } catch (error) {
      console.error('Classification error:', error);
      // Don't throw - event handlers should not fail
    }
  }
}
```

---

## Service Testing Strategy

### 1. Unit Tests

Test services with mocked dependencies:

```typescript
describe('ImportService', () => {
  let importService: ImportService;
  let mockCSVParser: jest.Mocked<CSVParser>;
  let mockTransactionDataManager: jest.Mocked<TransactionDataManager>;
  let mockEventBus: jest.Mocked<EventBus>;
  
  beforeEach(() => {
    mockCSVParser = createMock<CSVParser>();
    mockTransactionDataManager = createMock<TransactionDataManager>();
    mockEventBus = createMock<EventBus>();
    importService = new ImportService(mockCSVParser, mockTransactionDataManager, mockEventBus);
  });
  
  it('should handle CSV upload successfully', async () => {
    // Arrange
    const file = Buffer.from('csv content');
    mockCSVParser.parse.mockResolvedValue([/* parsed data */]);
    mockTransactionDataManager.checkDuplicates.mockResolvedValue({ duplicates: [], unique: [/* data */] });
    mockTransactionDataManager.createTransactions.mockResolvedValue([/* transactions */]);
    
    // Act
    const result = await importService.handleCSVUpload(file, 'test.csv');
    
    // Assert
    expect(result.success).toBe(true);
    expect(mockEventBus.publish).toHaveBeenCalledWith('TransactionsCreated', expect.any(Object));
  });
});
```

### 2. Integration Tests

Test service workflows with real dependencies:

```typescript
describe('Import Workflow Integration', () => {
  it('should complete full import workflow', async () => {
    // Setup real dependencies
    const db = await setupTestDatabase();
    const eventBus = new EventBus();
    const csvParser = new CSVParser(eventBus);
    const transactionRepository = new TransactionRepository(db);
    const transactionDataManager = new TransactionDataManager(transactionRepository, eventBus);
    const importService = new ImportService(csvParser, transactionDataManager, eventBus);
    
    // Execute workflow
    const file = await readTestCSVFile();
    const result = await importService.handleCSVUpload(file, 'test.csv');
    
    // Verify
    expect(result.success).toBe(true);
    const transactions = await transactionRepository.findAll();
    expect(transactions.length).toBeGreaterThan(0);
  });
});
```

---

## Service Layer Scalability

### Current Design (Single-User, Local)
- Services run in same process
- Event Bus is in-memory
- Synchronous event handling

### Future Scalability (If Needed)
- **Separate Services**: Run services as separate processes/microservices
- **Message Queue**: Replace Event Bus with RabbitMQ or Redis
- **Async Processing**: Use job queues for long-running tasks
- **Caching**: Add Redis for caching frequently accessed data
- **Load Balancing**: Distribute API requests across multiple instances

---

## Next Steps

1. Implement services following this design
2. Implement Event Bus infrastructure
3. Define error types and error handling
4. Write service tests
5. Document service APIs
