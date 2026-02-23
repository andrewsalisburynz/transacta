# Unit of Work Plan - Household Spending Tracker

## Overview
This plan decomposes the Household Spending Tracker system into manageable units of work for development. Based on the application design, this is a **monolithic application** with a single deployable unit containing multiple logical modules.

---

## Part 1: Planning Questions

### Q1: Deployment Model
The application design indicates a monolithic architecture with frontend and backend. How should the codebase be organized?

**Options**:
A. Single repository with frontend and backend in separate folders (monorepo)
B. Separate repositories for frontend and backend
C. Single repository with all code in one folder

[Answer]: A

---

### Q2: Unit of Work Definition
For this monolithic application, how should we define the unit of work?

**Options**:
A. Single unit representing the entire application (frontend + backend as one deployable unit)
B. Two units: Frontend unit and Backend unit (separately deployable)
C. Multiple units by layer: Frontend, API, Services, Business Logic, Data Access

[Answer]: A

---

### Q3: Database Schema Specifications
What level of detail should the database schema specifications include?

**Options**:
A. Complete SQL DDL with all tables, columns, types, constraints, and indexes
B. High-level table definitions with key columns only
C. Entity-relationship diagram with table names and relationships only

[Answer]: A

---

### Q4: GraphQL API Schema Specifications
What level of detail should the GraphQL API schema specifications include?

**Options**:
A. Complete GraphQL schema with all types, queries, mutations, inputs, and field descriptions
B. High-level API endpoints with request/response types only
C. API contract with example requests and responses

[Answer]: A

---

### Q5: TypeScript Data Models
What level of detail should the TypeScript data model specifications include?

**Options**:
A. Complete TypeScript interfaces/types with all properties, types, and JSDoc comments
B. High-level model definitions with key properties only
C. Class diagrams with properties and methods

[Answer]: A

---

### Q6: ML Model Structure
What level of detail should the ML model structure specifications include?

**Options**:
A. Complete model architecture with layers, neurons, activation functions, and training parameters
B. High-level model description with input/output specifications
C. Model requirements with expected accuracy and performance metrics

[Answer]: A

---

### Q7: Configuration Specifications
What configuration aspects need to be specified?

**Options**:
A. All configuration (database connection, server ports, ML parameters, file paths)
B. Critical configuration only (database connection, server ports)
C. No configuration specifications (handle during implementation)

[Answer]: A

---

### Q8: Story-to-Unit Mapping
How should user stories be mapped to units of work?

**Options**:
A. All stories map to the single unit (if single unit chosen in Q2)
B. Stories distributed across units based on primary component (if multiple units chosen in Q2)
C. Stories can span multiple units with clear ownership

[Answer]: A

---

### Q9: Module Organization (If Single Unit)
If a single unit is chosen, how should logical modules be organized within the unit?

**Options**:
A. By layer (frontend/, backend/api/, backend/services/, backend/managers/, backend/repositories/)
B. By feature (import/, classification/, reporting/, categories/)
C. Hybrid: Backend by layer, frontend by feature

[Answer]: A

---

### Q10: Specification Format
What format should be used for unit specifications?

**Options**:
A. Markdown documents with code examples
B. Formal specification language (e.g., OpenAPI for API, JSON Schema for data models)
C. Mix: Markdown for descriptions, formal schemas for API and data models

[Answer]: A

---

## Part 2: Generation Plan

Based on the answers above, the following artifacts will be generated:

### Mandatory Artifacts
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md` with unit definitions and responsibilities
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md` with dependency matrix
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md` mapping stories to units
- [x] Document code organization strategy in `unit-of-work.md` (greenfield project)

### Database Schema Specifications
- [x] Generate `aidlc-docs/inception/units/database-schema.md` with complete table definitions
  - [x] Define `transactions` table with all columns, types, constraints, indexes
  - [x] Define `categories` table with all columns, types, constraints, indexes
  - [x] Define `classification_history` table with all columns, types, constraints, indexes
  - [x] Define `ml_model_metadata` table with all columns, types, constraints, indexes
  - [x] Define relationships and foreign keys
  - [x] Define indexes for query optimization
  - [x] Include sample SQL DDL scripts

### GraphQL API Schema Specifications
- [x] Generate `aidlc-docs/inception/units/graphql-schema.md` with complete API schema
  - [x] Define all GraphQL types (Transaction, Category, Report, ClassificationResult, etc.)
  - [x] Define all queries (getTransactions, getCategories, getReport, getDashboardStats, etc.)
  - [x] Define all mutations (uploadCSV, classifyTransaction, createCategory, updateCategory, deleteCategory, etc.)
  - [x] Define input types for mutations
  - [x] Define enums (TransactionStatus, ConfidenceLevel, TransactionType, etc.)
  - [x] Include field descriptions and validation rules
  - [x] Include example queries and mutations

### TypeScript Data Models
- [x] Generate `aidlc-docs/inception/units/typescript-models.md` with complete data models
  - [x] Define Transaction model with all properties and types
  - [x] Define Category model with all properties and types
  - [x] Define ClassificationResult model with all properties and types
  - [x] Define Report model with all properties and types
  - [x] Define CSVRow model with all properties and types
  - [x] Define MLModelMetadata model with all properties and types
  - [x] Include validation rules and constraints
  - [x] Include JSDoc comments for all models

### ML Model Structure
- [x] Generate `aidlc-docs/inception/units/ml-model-structure.md` with complete model architecture
  - [x] Define model architecture (layers, neurons, activation functions)
  - [x] Define input features (Payee, Particulars, Tran Type)
  - [x] Define output (category probabilities)
  - [x] Define training parameters (learning rate, epochs, batch size)
  - [x] Define model storage format (JSON structure + binary weights)
  - [x] Define model evaluation metrics (accuracy, precision, recall)
  - [x] Include TensorFlow.js implementation approach

### Configuration Specifications
- [x] Generate `aidlc-docs/inception/units/configuration.md` with configuration requirements
  - [x] Define database configuration (SQLite file path, connection settings)
  - [x] Define server configuration (port, host, CORS settings)
  - [x] Define ML configuration (model file paths, confidence threshold, training parameters)
  - [x] Define file storage configuration (upload directory, model directory)
  - [x] Define environment-specific configurations (development, production)

### Validation Steps
- [x] Validate unit boundaries and dependencies
- [x] Ensure all stories are assigned to units
- [x] Verify all components from application design are covered
- [x] Check for missing specifications
- [x] Ensure consistency across all unit specifications

---

## Completion Criteria
- All planning questions answered
- All ambiguities resolved
- User approval obtained
- All generation steps completed and marked [x]
- All unit artifacts generated and validated
