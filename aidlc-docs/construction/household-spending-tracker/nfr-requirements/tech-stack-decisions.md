# Technology Stack Decisions - Household Spending Tracker

## Purpose
This document records all technology stack decisions for the Household Spending Tracker application, including rationale, alternatives considered, and trade-offs.

---

## 1. Database Technology

### Decision: SQLite

**Rationale**:
- Local, embedded database - no server needed
- Simple setup - single file database
- Sufficient performance for small data volumes (< 5,000 transactions)
- ACID compliance for data integrity
- Wide platform support
- No licensing costs
- Confirmed appropriate in Q19 (user answer: A)

**Alternatives Considered**:
- **PostgreSQL**: More features but requires server setup, overkill for local application
- **LevelDB/RocksDB**: Key-value stores, less suitable for relational data
- **JSON files**: Simple but no query capabilities, poor performance

**Trade-offs**:
- ✅ Pros: Simple, embedded, no server, good performance for small data
- ❌ Cons: Limited scalability, single-writer limitation, no network access

**Version**: SQLite 3.x (latest stable)

**Configuration**:
- Database file: `./data/household-spending.db`
- Foreign keys: Enabled
- WAL mode: Disabled (not needed for single-user)
- Synchronous: NORMAL (balance between safety and performance)

---

## 2. Frontend Framework

### Decision: Vue 3

**Rationale**:
- Component-based architecture matches application design
- Good performance for desktop application
- Easier learning curve than React
- Composition API provides good code organization
- Reactive data binding simplifies state management
- Good TypeScript support
- Confirmed appropriate in Q20 (user answer: A)

**Alternatives Considered**:
- **React**: Larger ecosystem but more complex, steeper learning curve
- **Svelte**: Smaller bundle, better performance, but smaller ecosystem
- **Vanilla JavaScript**: Too low-level, would require more code

**Trade-offs**:
- ✅ Pros: Easy to learn, good performance, component-based, reactive
- ❌ Cons: Smaller ecosystem than React, fewer resources

**Version**: Vue 3.x (latest stable)

**Key Libraries**:
- Vue Router 4.x for routing
- Apollo Client for GraphQL
- Vite for build tooling

---

## 3. Backend Framework

### Decision: Node.js with Express

**Rationale**:
- JavaScript/TypeScript throughout stack (consistency)
- Large ecosystem of packages
- Good performance for I/O-bound operations
- Simple HTTP server setup
- Works well with GraphQL
- Async/await for clean asynchronous code

**Alternatives Considered**:
- **Python with Flask**: Good for ML but different language from frontend
- **Go**: Better performance but different language, steeper learning curve
- **Deno**: Modern but less mature ecosystem

**Trade-offs**:
- ✅ Pros: Same language as frontend, large ecosystem, good async support
- ❌ Cons: Single-threaded (but sufficient for local app), callback hell (mitigated by async/await)

**Version**: Node.js 18.x LTS or later

**Key Libraries**:
- Express 4.x for HTTP server
- Apollo Server for GraphQL
- SQLite3 for database access

---

## 4. API Technology

### Decision: GraphQL with Apollo Server

**Rationale**:
- Flexible queries - frontend requests exactly what it needs
- Type safety with schema
- Single endpoint simplifies API design
- Good developer experience with Apollo tools
- Introspection for API documentation
- Confirmed appropriate in Q21 (user answer: A)

**Alternatives Considered**:
- **REST**: Simpler but requires multiple endpoints, over-fetching/under-fetching
- **tRPC**: Type-safe but less mature, smaller ecosystem
- **Direct database access**: No API layer, tight coupling

**Trade-offs**:
- ✅ Pros: Flexible queries, type safety, single endpoint, good tooling
- ❌ Cons: More complex than REST, learning curve, potential over-engineering for simple app

**Version**: Apollo Server 4.x

**Schema Definition**:
- Schema-first approach
- GraphQL schema in `backend/src/api/schema/schema.graphql`
- Resolvers in `backend/src/api/resolvers/`

---

## 5. ML Library

### Decision: TensorFlow.js

**Rationale**:
- Runs in Node.js (backend) and browser (if needed)
- JavaScript/TypeScript integration
- Pre-trained models available
- Good documentation and community
- Supports neural networks for text classification
- Can train and run models locally

**Alternatives Considered**:
- **Brain.js**: Simpler but less powerful, limited features
- **ML.js**: Good for traditional ML but less suitable for neural networks
- **Python with scikit-learn**: Better ML tools but requires Python backend

**Trade-offs**:
- ✅ Pros: JavaScript integration, runs locally, good for neural networks
- ❌ Cons: Less powerful than Python ML libraries, smaller model selection

**Version**: TensorFlow.js 4.x

**Model Architecture**:
- Neural network with embedding layer for text
- Dense layers for classification
- Softmax output for category probabilities

---

## 6. Programming Language

### Decision: TypeScript

**Rationale**:
- Type safety reduces bugs
- Better IDE support (autocomplete, refactoring)
- Catches errors at compile time
- Self-documenting code with types
- Strict mode enforces best practices
- Compiles to JavaScript for runtime

**Alternatives Considered**:
- **JavaScript**: Simpler but no type safety, more runtime errors
- **Flow**: Type system but less popular than TypeScript
- **ReasonML**: Strong types but different syntax, steeper learning curve

**Trade-offs**:
- ✅ Pros: Type safety, better tooling, catches errors early
- ❌ Cons: Compilation step, learning curve, more verbose

**Version**: TypeScript 5.x

**Configuration**:
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals/parameters

---

## 7. Build and Deployment

### Decision: Simple build with npm scripts

**Rationale**:
- No complex packaging needed
- User runs application locally
- Simple deployment (copy files)
- No installer required
- Confirmed in Q22 (user answer: A)

**Alternatives Considered**:
- **Electron**: Packaged desktop app but adds complexity and size
- **Docker**: Containerized but overkill for local app
- **Web-based**: Deploy to local server but requires server setup

**Trade-offs**:
- ✅ Pros: Simple, no packaging overhead, easy to update
- ❌ Cons: User must have Node.js installed, manual setup

**Build Process**:
```bash
# Frontend build
cd frontend
npm run build  # Vite builds to dist/

# Backend build
cd backend
npm run build  # TypeScript compiles to dist/

# Run production
npm start  # Starts backend server, serves frontend
```

**Deployment**:
- User clones repository or downloads zip
- User runs `npm install` in root, frontend, and backend
- User runs `npm run build` in frontend and backend
- User runs `npm start` to start application
- Application opens in browser at http://localhost:4000

---

## 8. Development Tools

### Decision: Standard development environment

**Rationale**:
- Node.js and npm are standard for JavaScript development
- VS Code is popular and has good extensions
- ESLint and Prettier enforce code quality
- Confirmed in Q23 (user answer: B)

**Tools**:
- **Node.js**: 18.x LTS or later
- **npm**: Package manager (comes with Node.js)
- **VS Code**: Recommended IDE
  - Extensions: ESLint, Prettier, Volar (Vue), GraphQL
- **ESLint**: Linting with strict rules
- **Prettier**: Code formatting
- **Git**: Version control

**Development Workflow**:
```bash
# Install dependencies
npm install

# Start development servers
npm run dev  # Starts both frontend and backend in dev mode

# Run linting
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

---

## 9. Testing Frameworks

### Decision: Jest for unit tests, Supertest for API tests

**Rationale**:
- Jest is standard for JavaScript testing
- Good TypeScript support
- Built-in mocking and assertions
- Supertest for HTTP/GraphQL API testing
- Minimal testing per requirements (Q11: A)

**Alternatives Considered**:
- **Mocha + Chai**: More modular but requires more setup
- **Vitest**: Faster but less mature
- **Cypress**: E2E testing but not needed per requirements

**Trade-offs**:
- ✅ Pros: Standard tools, good TypeScript support, easy setup
- ❌ Cons: Jest can be slow for large test suites (not an issue for minimal testing)

**Testing Stack**:
- **Jest**: Unit tests for business logic
- **Supertest**: API integration tests
- **@testing-library/vue**: Component tests (if needed)

**Test Structure**:
```
backend/
  src/
    __tests__/
      unit/
        csv-parser.test.ts
        duplicate-detection.test.ts
        ml-classification.test.ts
      integration/
        csv-import.test.ts
        classification-workflow.test.ts
```

---

## 10. Logging Framework

### Decision: Winston for structured logging

**Rationale**:
- Structured logging with multiple transports
- Log levels (ERROR, WARN, INFO, DEBUG)
- Log rotation support
- Good TypeScript support
- Confirmed in Q9 (user answer: B - Structured logging)

**Alternatives Considered**:
- **Pino**: Faster but less features
- **Bunyan**: Good but less popular
- **console.log**: Too basic, no structure

**Trade-offs**:
- ✅ Pros: Structured logs, multiple transports, log rotation
- ❌ Cons: Slightly more complex than console.log

**Configuration**:
```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/application.log' 
    })
  ]
})
```

---

## 11. Monitoring and Metrics

### Decision: Custom metrics logging with Winston

**Rationale**:
- Log performance metrics to file
- Simple implementation
- No external dependencies
- Sufficient for local application
- Confirmed in Q24 (user answer: C - Moderate monitoring)

**Alternatives Considered**:
- **Prometheus**: Overkill for local app, requires server
- **New Relic**: Cloud-based, not suitable for local app
- **Custom dashboard**: Too complex for requirements

**Trade-offs**:
- ✅ Pros: Simple, no external dependencies, sufficient for debugging
- ❌ Cons: No real-time dashboard, manual log analysis

**Metrics to Log**:
- CSV import time
- ML classification time
- Report generation time
- Database query time
- Error counts and types

**Implementation**:
```typescript
logger.info('CSV import completed', {
  transactionCount: 1000,
  duration: 4.2,
  duplicates: 5
})

logger.info('ML classification completed', {
  transactionId: '123',
  duration: 1.8,
  confidence: 0.92
})
```

---

## 12. Code Quality Tools

### Decision: ESLint + Prettier + TypeScript strict mode

**Rationale**:
- ESLint catches code issues
- Prettier enforces consistent formatting
- TypeScript strict mode catches type errors
- Confirmed in Q10 (user answer: B - Strict standards)

**Configuration**:

**ESLint** (`.eslintrc.json`):
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "max-lines-per-function": ["warn", 50],
    "max-lines": ["warn", 500]
  }
}
```

**Prettier** (`.prettierrc.json`):
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

**TypeScript** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 13. Version Control

### Decision: Git with GitHub

**Rationale**:
- Industry standard version control
- Good branching and merging
- GitHub for remote repository (if needed)
- Good integration with development tools

**Branching Strategy**:
- `main` branch for stable code
- Feature branches for development
- Simple workflow (no GitFlow needed for personal project)

---

## 14. Technology Stack Summary

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Database | SQLite | 3.x | Local, embedded, simple |
| Backend Runtime | Node.js | 18.x LTS | JavaScript throughout stack |
| Backend Framework | Express | 4.x | Simple HTTP server |
| API | GraphQL (Apollo Server) | 4.x | Flexible queries, type safety |
| Frontend Framework | Vue 3 | 3.x | Component-based, reactive |
| Build Tool (Frontend) | Vite | 4.x | Fast builds, good DX |
| Language | TypeScript | 5.x | Type safety, better tooling |
| ML Library | TensorFlow.js | 4.x | JavaScript ML, runs locally |
| Testing | Jest + Supertest | Latest | Standard testing tools |
| Logging | Winston | 3.x | Structured logging |
| Code Quality | ESLint + Prettier | Latest | Enforce standards |
| Version Control | Git | Latest | Industry standard |

---

## 15. Dependency Management

### Package Versions

**Backend** (`backend/package.json`):
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "apollo-server-express": "^3.12.0",
    "graphql": "^16.6.0",
    "sqlite3": "^5.1.6",
    "@tensorflow/tfjs-node": "^4.10.0",
    "winston": "^3.10.0",
    "csv-parse": "^5.5.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/node": "^20.5.0",
    "@types/express": "^4.17.17",
    "eslint": "^8.48.0",
    "prettier": "^3.0.3",
    "jest": "^29.6.4",
    "supertest": "^6.3.3"
  }
}
```

**Frontend** (`frontend/package.json`):
```json
{
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.4",
    "@apollo/client": "^3.8.1",
    "graphql": "^16.8.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "vite": "^4.4.9",
    "@vitejs/plugin-vue": "^4.3.4",
    "eslint": "^8.48.0",
    "prettier": "^3.0.3"
  }
}
```

---

## 16. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Vue 3 Frontend                           │  │
│  │  (TypeScript, Vite, Apollo Client)                    │  │
│  └───────────────────┬───────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTP/GraphQL
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Backend                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Express + Apollo Server                       │  │
│  │         (TypeScript, GraphQL API)                     │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      │                                       │
│  ┌──────────────────┴────────────────────────────────────┐  │
│  │              Business Logic Layer                     │  │
│  │  (Services, Managers, ML Engine)                      │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      │                                       │
│  ┌──────────────────┴────────────────────────────────────┐  │
│  │            Data Access Layer                          │  │
│  │  (Repositories, SQLite3)                              │  │
│  └───────────────────┬───────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   SQLite Database                            │
│  (household-spending.db)                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  TensorFlow.js ML Model                      │
│  (Stored in database as BLOB)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 17. Trade-off Analysis

### Simplicity vs Features
**Decision**: Prioritize simplicity
- Simple build and deployment over packaged app
- Manual backup over automatic backup
- Basic validation over paranoid validation
- Minimal testing over comprehensive testing

**Rationale**: Personal application, ease of development and maintenance more important than enterprise features.

### Performance vs Accuracy (ML)
**Decision**: Prioritize accuracy
- Complex ML model over simple model
- Accept 2-second classification time
- Comprehensive feature extraction

**Rationale**: Better user experience with accurate classifications, 2 seconds is acceptable for personal use.

### Type Safety vs Development Speed
**Decision**: Prioritize type safety
- TypeScript strict mode
- GraphQL schema
- ESLint strict rules

**Rationale**: Type safety reduces bugs and improves maintainability, worth the extra development time.

---

## Notes

- Technology stack is designed for a personal, local desktop application
- Emphasis on simplicity, type safety, and maintainability
- All technologies are mature and well-supported
- Stack is consistent (JavaScript/TypeScript throughout)
- No enterprise-level complexity (no microservices, no Kubernetes, no cloud services)
- All technologies confirmed appropriate by user in planning questions
