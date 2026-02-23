# Unit of Work Dependency Matrix - Household Spending Tracker

## Overview
This document defines the dependencies between modules within the single unit of work. Since this is a monolithic application, all dependencies are internal module dependencies within the same deployable unit.

---

## Dependency Matrix

### Layer Dependencies

| Layer | Depends On | Description |
|-------|-----------|-------------|
| Frontend | Backend API | Makes GraphQL queries/mutations to API |
| Backend API | Backend Services | Calls services to execute business logic |
| Backend Services | Backend Managers, Backend Repositories | Orchestrates managers and repositories |
| Backend Managers | Backend Repositories | Accesses data through repositories |
| Backend Repositories | SQLite Database | Executes database queries |
| All Layers | Shared | Uses shared types, interfaces, constants |

### Dependency Rules

1. **Unidirectional Flow**: Dependencies flow downward through layers
2. **No Circular Dependencies**: Lower layers cannot depend on higher layers
3. **Shared Layer**: All layers can depend on shared layer
4. **API Boundary**: Frontend only communicates with backend through GraphQL API

---

## Module Dependency Details

### Frontend Dependencies

#### Frontend → Backend API (GraphQL)
- **Type**: External HTTP/GraphQL calls
- **Interface**: GraphQL schema (queries, mutations, types)
- **Data Format**: JSON over HTTP
- **Dependencies**:
  - All frontend components depend on GraphQL API
  - Frontend does not directly access backend services or database

**GraphQL Operations Used**:
- Queries: `getTransactions`, `getCategories`, `getReport`, `getDashboardStats`
- Mutations: `uploadCSV`, `classifyTransaction`, `createCategory`, `updateCategory`, `deleteCategory`

---

### Backend API Dependencies

#### Backend API → Backend Services
- **Type**: Direct function calls
- **Interface**: Service method signatures
- **Dependencies**:
  - `resolvers/transaction-resolvers.ts` → `services/transaction-service.ts`
  - `resolvers/category-resolvers.ts` → `services/category-service.ts`
  - `resolvers/classification-resolvers.ts` → `services/classification-service.ts`
  - `resolvers/report-resolvers.ts` → `services/report-service.ts`
  - `resolvers/csv-resolvers.ts` → `services/csv-service.ts`

**Service Methods Used**:
- `TransactionService`: `getTransactions()`, `getTransactionById()`, `updateTransaction()`, `deleteTransaction()`
- `CategoryService`: `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()`
- `ClassificationService`: `classifyTransaction()`, `classifyBatch()`, `getConfidenceScore()`
- `ReportService`: `generateMonthlyReport()`, `getDashboardStats()`
- `CSVService`: `parseCSV()`, `validateCSV()`, `importTransactions()`

---

### Backend Services Dependencies

#### Backend Services → Backend Managers
- **Type**: Direct function calls
- **Interface**: Manager method signatures
- **Dependencies**:
  - `classification-service.ts` → `ml-manager.ts`, `classification-manager.ts`
  - `csv-service.ts` → `duplicate-detection-manager.ts`, `feature-extraction-manager.ts`

**Manager Methods Used**:
- `MLManager`: `predict()`, `train()`, `evaluateModel()`, `saveModel()`, `loadModel()`
- `ClassificationManager`: `classifyTransaction()`, `calculateConfidence()`, `shouldAutoApprove()`
- `DuplicateDetectionManager`: `findDuplicates()`, `compareTransactions()`
- `FeatureExtractionManager`: `extractFeatures()`, `normalizeText()`, `tokenize()`

#### Backend Services → Backend Repositories
- **Type**: Direct function calls
- **Interface**: Repository method signatures
- **Dependencies**:
  - `transaction-service.ts` → `transaction-repository.ts`
  - `category-service.ts` → `category-repository.ts`
  - `classification-service.ts` → `classification-history-repository.ts`
  - `csv-service.ts` → `transaction-repository.ts`
  - `report-service.ts` → `transaction-repository.ts`, `category-repository.ts`

**Repository Methods Used**:
- `TransactionRepository`: `findAll()`, `findById()`, `create()`, `update()`, `delete()`, `findByDateRange()`, `findUnclassified()`
- `CategoryRepository`: `findAll()`, `findById()`, `create()`, `update()`, `delete()`, `findByName()`
- `ClassificationHistoryRepository`: `create()`, `findByTransactionId()`, `findAll()`
- `MLModelRepository`: `save()`, `load()`, `getMetadata()`, `updateMetadata()`

---

### Backend Managers Dependencies

#### Backend Managers → Backend Repositories
- **Type**: Direct function calls
- **Interface**: Repository method signatures
- **Dependencies**:
  - `ml-manager.ts` → `classification-history-repository.ts`, `ml-model-repository.ts`
  - `classification-manager.ts` → `classification-history-repository.ts`, `category-repository.ts`
  - `duplicate-detection-manager.ts` → `transaction-repository.ts`

**Repository Methods Used**:
- `ClassificationHistoryRepository`: `findAll()`, `findByCategory()`, `create()`
- `MLModelRepository`: `save()`, `load()`, `getMetadata()`
- `TransactionRepository`: `findAll()`, `findByDateRange()`
- `CategoryRepository`: `findAll()`

---

### Backend Repositories Dependencies

#### Backend Repositories → SQLite Database
- **Type**: SQL queries through SQLite driver
- **Interface**: SQL statements
- **Dependencies**:
  - All repositories depend on `database.ts` for connection
  - All repositories execute SQL queries against SQLite

**Database Tables Used**:
- `transactions` - Transaction data
- `categories` - Category definitions
- `classification_history` - Classification training data
- `ml_model_metadata` - ML model metadata

---

### Shared Layer Dependencies

#### All Layers → Shared
- **Type**: Import statements
- **Interface**: TypeScript types, interfaces, constants, utilities
- **Dependencies**:
  - All layers import from `shared/types/`
  - All layers import from `shared/interfaces/`
  - All layers import from `shared/constants/`
  - All layers import from `shared/utils/`

**Shared Exports**:
- **Types**: `Transaction`, `Category`, `ClassificationResult`, `Report`, `CSVRow`, `MLModelMetadata`
- **Interfaces**: `ITransactionRepository`, `ICategoryRepository`, `IMLManager`, `IClassificationManager`
- **Constants**: `CONFIDENCE_THRESHOLD`, `CSV_COLUMNS`, `DATE_FORMAT`, `CURRENCY_SYMBOL`
- **Utils**: `formatCurrency()`, `parseDate()`, `validateEmail()`, `sanitizeInput()`

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  (React Components, Pages, GraphQL Client)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ GraphQL HTTP
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  (GraphQL Schema, Resolvers, Middleware)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend Services                           │
│  (Business Logic, Workflow Orchestration)                   │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           ↓                          ↓
┌──────────────────────┐   ┌──────────────────────────────────┐
│  Backend Managers    │   │   Backend Repositories           │
│  (ML, Classification)│   │   (Data Access)                  │
└──────────┬───────────┘   └──────────┬───────────────────────┘
           │                          │
           └──────────┬───────────────┘
                      ↓
           ┌──────────────────────┐
           │  SQLite Database     │
           └──────────────────────┘

                      ↑
                      │
         ┌────────────┴────────────┐
         │     Shared Layer        │
         │  (Types, Utils, etc.)   │
         └─────────────────────────┘
              (Used by all layers)
```

---

## External Dependencies

### Third-Party Libraries

| Library | Used By | Purpose |
|---------|---------|---------|
| React | Frontend | UI framework |
| Apollo Client | Frontend | GraphQL client |
| Apollo Server | Backend API | GraphQL server |
| TensorFlow.js | Backend Managers | ML model operations |
| SQLite3 | Backend Repositories | Database driver |
| csv-parse | Backend Services | CSV parsing |
| natural | Backend Managers | NLP text processing |
| date-fns | Shared | Date formatting and parsing |

---

## Dependency Injection

### Service Layer DI
Services receive dependencies through constructor injection:

```typescript
class TransactionService {
  constructor(
    private transactionRepository: ITransactionRepository,
    private classificationService: IClassificationService
  ) {}
}
```

### Manager Layer DI
Managers receive dependencies through constructor injection:

```typescript
class MLManager {
  constructor(
    private classificationHistoryRepository: IClassificationHistoryRepository,
    private mlModelRepository: IMLModelRepository
  ) {}
}
```

### Repository Layer DI
Repositories receive database connection through constructor injection:

```typescript
class TransactionRepository {
  constructor(private db: Database) {}
}
```

---

## Circular Dependency Prevention

### Rules
1. **No upward dependencies**: Lower layers cannot import from higher layers
2. **Interface segregation**: Use interfaces to break circular dependencies
3. **Dependency inversion**: Depend on abstractions (interfaces), not concrete implementations

### Example: Breaking Circular Dependencies

**Problem**: Service needs Manager, Manager needs Service

**Solution**: Use interfaces
```typescript
// shared/interfaces/IClassificationService.ts
export interface IClassificationService {
  classifyTransaction(transaction: Transaction): Promise<ClassificationResult>;
}

// managers/ml-manager.ts
import { IClassificationService } from '../shared/interfaces';

class MLManager {
  constructor(private classificationService: IClassificationService) {}
}
```

---

## Build Order

Since this is a monolithic application with internal dependencies, the build order is:

1. **Shared Layer** - Build first (no dependencies)
2. **Backend Repositories** - Build second (depends on Shared)
3. **Backend Managers** - Build third (depends on Shared, Repositories)
4. **Backend Services** - Build fourth (depends on Shared, Managers, Repositories)
5. **Backend API** - Build fifth (depends on Shared, Services)
6. **Frontend** - Build last (depends on API schema)

### Build Commands
```bash
# Build shared types
npm run build:shared

# Build backend
npm run build:backend

# Build frontend
npm run build:frontend
```

---

## Testing Dependencies

### Unit Test Dependencies
- Each layer can be tested independently using mocks
- Repositories: Mock database connection
- Managers: Mock repositories
- Services: Mock managers and repositories
- API: Mock services
- Frontend: Mock GraphQL client

### Integration Test Dependencies
- Test multiple layers together
- Use test database for repository tests
- Use test ML model for manager tests
- Use test GraphQL server for API tests

---

## Deployment Dependencies

### Runtime Dependencies
All components deploy together, so runtime dependencies are:
- Node.js runtime
- SQLite database file
- ML model files
- Static frontend files

### Configuration Dependencies
- Database configuration (file path)
- Server configuration (ports)
- ML configuration (model paths, thresholds)
- CORS configuration (allowed origins)

---

## Dependency Management

### Package Management
- Root `package.json` for shared dependencies
- `frontend/package.json` for frontend-specific dependencies
- `backend/package.json` for backend-specific dependencies

### Version Pinning
- Pin major versions for stability
- Use exact versions for critical dependencies (database, ML)
- Allow minor/patch updates for non-critical dependencies

### Dependency Updates
- Regular security updates
- Test thoroughly before updating major versions
- Document breaking changes

---

## Notes

- **Single Unit**: All dependencies are internal to the monolithic application
- **Clear Boundaries**: Layer dependencies are well-defined and unidirectional
- **No Circular Dependencies**: Architecture prevents circular dependencies
- **Testability**: Dependency injection enables easy testing with mocks
- **Future Extensibility**: Clear boundaries allow for future microservices extraction if needed
