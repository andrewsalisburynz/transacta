# Unit of Work - Household Spending Tracker

## Overview
This document defines the unit of work for the Household Spending Tracker application. Based on the planning decisions, this is a **monolithic application** with a single deployable unit containing multiple logical modules organized by layer.

---

## Unit Definition

### Unit 1: Household Spending Tracker Application

**Type**: Full-Stack Monolithic Application

**Description**: Complete household spending tracker application including frontend UI, backend API, business logic, data access layer, and ML classification engine. All components are deployed together as a single unit.

**Deployment Model**: Single deployable unit (frontend + backend)

**Technology Stack**:
- **Frontend**: React with TypeScript
- **Backend**: Node.js with TypeScript
- **API Layer**: GraphQL (Apollo Server)
- **Database**: SQLite
- **ML Engine**: TensorFlow.js
- **Build Tools**: Webpack, TypeScript Compiler

---

## Module Organization

The single unit is organized by architectural layer:

### 1. Frontend Layer (`frontend/`)
**Responsibility**: User interface and client-side logic

**Sub-modules**:
- `components/` - React components (CSV upload, transaction review, reports, category management)
- `pages/` - Page-level components (Dashboard, Import, Review, Reports, Categories)
- `graphql/` - GraphQL queries and mutations
- `hooks/` - Custom React hooks
- `utils/` - Frontend utilities and helpers
- `styles/` - CSS/styling files

**Key Responsibilities**:
- Render user interface
- Handle user interactions
- Make GraphQL API calls
- Display data and reports
- Client-side validation

---

### 2. Backend API Layer (`backend/api/`)
**Responsibility**: GraphQL API endpoints and request handling

**Sub-modules**:
- `schema/` - GraphQL schema definitions (types, queries, mutations)
- `resolvers/` - GraphQL resolvers for queries and mutations
- `middleware/` - Request validation and error handling
- `context/` - Request context and dependency injection

**Key Responsibilities**:
- Define GraphQL API schema
- Handle API requests
- Validate input data
- Call service layer
- Format responses
- Error handling

---

### 3. Backend Services Layer (`backend/services/`)
**Responsibility**: Business logic and orchestration

**Sub-modules**:
- `csv-service.ts` - CSV parsing and validation
- `classification-service.ts` - ML classification orchestration
- `transaction-service.ts` - Transaction business logic
- `category-service.ts` - Category business logic
- `report-service.ts` - Report generation logic

**Key Responsibilities**:
- Implement business rules
- Orchestrate operations across managers
- Validate business logic
- Handle complex workflows
- Coordinate between layers

---

### 4. Backend Managers Layer (`backend/managers/`)
**Responsibility**: Domain logic and ML operations

**Sub-modules**:
- `ml-manager.ts` - ML model training and prediction
- `classification-manager.ts` - Classification logic and confidence scoring
- `duplicate-detection-manager.ts` - Duplicate transaction detection
- `feature-extraction-manager.ts` - Extract features from transactions

**Key Responsibilities**:
- ML model operations (train, predict, evaluate)
- Feature engineering
- Classification algorithms
- Pattern matching
- Confidence scoring

---

### 5. Backend Repositories Layer (`backend/repositories/`)
**Responsibility**: Data access and persistence

**Sub-modules**:
- `transaction-repository.ts` - Transaction CRUD operations
- `category-repository.ts` - Category CRUD operations
- `classification-history-repository.ts` - Classification history operations
- `ml-model-repository.ts` - ML model persistence
- `database.ts` - Database connection and initialization

**Key Responsibilities**:
- Database queries
- Data persistence
- Transaction management
- Database schema management
- Query optimization

---

### 6. Shared Layer (`shared/`)
**Responsibility**: Shared types, interfaces, and utilities

**Sub-modules**:
- `types/` - TypeScript type definitions
- `interfaces/` - Shared interfaces
- `constants/` - Application constants
- `utils/` - Shared utility functions
- `validators/` - Validation functions

**Key Responsibilities**:
- Define shared data structures
- Provide common utilities
- Define constants
- Validation logic

---

## Code Organization Structure

```
household-spending-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── csv-upload/
│   │   │   ├── transaction-review/
│   │   │   ├── reports/
│   │   │   ├── categories/
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Import.tsx
│   │   │   ├── Review.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Categories.tsx
│   │   ├── graphql/
│   │   │   ├── queries/
│   │   │   └── mutations/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── schema/
│   │   │   ├── resolvers/
│   │   │   ├── middleware/
│   │   │   └── context/
│   │   ├── services/
│   │   │   ├── csv-service.ts
│   │   │   ├── classification-service.ts
│   │   │   ├── transaction-service.ts
│   │   │   ├── category-service.ts
│   │   │   └── report-service.ts
│   │   ├── managers/
│   │   │   ├── ml-manager.ts
│   │   │   ├── classification-manager.ts
│   │   │   ├── duplicate-detection-manager.ts
│   │   │   └── feature-extraction-manager.ts
│   │   ├── repositories/
│   │   │   ├── transaction-repository.ts
│   │   │   ├── category-repository.ts
│   │   │   ├── classification-history-repository.ts
│   │   │   ├── ml-model-repository.ts
│   │   │   └── database.ts
│   │   └── server.ts
│   └── package.json
├── shared/
│   ├── types/
│   ├── interfaces/
│   ├── constants/
│   ├── utils/
│   └── validators/
├── database/
│   └── schema.sql
├── models/
│   └── (ML model files stored here)
├── uploads/
│   └── (CSV files stored here temporarily)
└── package.json (root)
```

---

## Responsibilities by Layer

### Frontend Layer
- **User Stories**: 1.1, 2.1, 4.1, 4.3, 4.4, 5.2, 6.1, 7.2
- **Components**: CSV upload UI, transaction review UI, report display, category management UI
- **Data Flow**: GraphQL queries/mutations → API layer

### Backend API Layer
- **User Stories**: All stories (provides API for all functionality)
- **Components**: GraphQL schema, resolvers, input validation
- **Data Flow**: Frontend → API → Services

### Backend Services Layer
- **User Stories**: 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 5.1, 6.2, 6.3, 6.4, 6.5, 7.1
- **Components**: Business logic, workflow orchestration
- **Data Flow**: API → Services → Managers/Repositories

### Backend Managers Layer
- **User Stories**: 3.1, 3.2, 3.3, 3.4, 3.5, 2.3
- **Components**: ML operations, classification logic, duplicate detection
- **Data Flow**: Services → Managers → Repositories

### Backend Repositories Layer
- **User Stories**: All data persistence operations
- **Components**: Database queries, CRUD operations
- **Data Flow**: Managers/Services → Repositories → SQLite

---

## Build and Deployment

### Development Mode
```bash
# Install dependencies
npm install

# Start backend (port 4000)
cd backend
npm run dev

# Start frontend (port 3000)
cd frontend
npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Start production server
npm start
```

### Deployment Package
Single deployment package containing:
- Compiled frontend (static files)
- Compiled backend (Node.js application)
- Database schema
- ML model files
- Configuration files

---

## External Dependencies

### Runtime Dependencies
- Node.js (v18+)
- SQLite3
- TensorFlow.js
- Apollo Server
- React
- GraphQL

### Development Dependencies
- TypeScript
- Webpack
- ESLint
- Jest (testing)
- Prettier (code formatting)

---

## Data Flow

```
User → Frontend UI → GraphQL API → Services → Managers → Repositories → SQLite
                                                    ↓
                                              ML Manager → TensorFlow.js
```

---

## Configuration

### Database Configuration
- SQLite database file location
- Connection pool settings
- Query timeout settings

### Server Configuration
- Backend port (default: 4000)
- Frontend port (default: 3000)
- CORS settings
- GraphQL playground settings

### ML Configuration
- Model file paths
- Confidence thresholds
- Training parameters
- Feature extraction settings

### File Storage Configuration
- CSV upload directory
- Model storage directory
- Temporary file cleanup settings

---

## Testing Strategy

### Unit Tests
- Services layer: Business logic tests
- Managers layer: ML and classification tests
- Repositories layer: Database operation tests
- Frontend components: Component tests

### Integration Tests
- API layer: GraphQL resolver tests
- End-to-end workflows: CSV import → classification → reporting

### Performance Tests
- CSV import with 1000 transactions
- ML classification speed
- Report generation performance

---

## Success Criteria

1. **Single Deployment**: Entire application deploys as one unit
2. **Clear Separation**: Layers have clear responsibilities and boundaries
3. **Maintainability**: Code is organized logically and easy to navigate
4. **Testability**: Each layer can be tested independently
5. **Performance**: Meets all NFR performance requirements
6. **Scalability**: Can handle up to 10,000 transactions efficiently

---

## Notes

- **Monolithic Architecture**: Chosen for simplicity and single-user use case
- **Layer Organization**: Provides clear separation of concerns
- **Shared Code**: Common types and utilities in shared layer
- **Future Extensibility**: Layer architecture allows for future microservices extraction if needed
- **Development Workflow**: Frontend and backend can be developed independently but deploy together
