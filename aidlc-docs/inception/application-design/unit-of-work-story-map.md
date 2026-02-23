# Unit of Work Story Mapping - Household Spending Tracker

## Overview
This document maps all 23 user stories to the single unit of work. Since this is a monolithic application with one deployable unit, all stories are implemented within the same unit but across different layers and modules.

---

## Unit Assignment

### Unit 1: Household Spending Tracker Application
**All 23 stories are assigned to this single unit**

---

## Story Mapping by Layer

### Frontend Layer Stories
Stories that primarily involve frontend implementation:

| Story ID | Story Title | Primary Components | Secondary Components |
|----------|-------------|-------------------|---------------------|
| 1.1 | Initial Application Launch | Frontend (Welcome page) | Backend API (health check) |
| 2.1 | Upload CSV File | Frontend (CSV upload component) | Backend API (file upload) |
| 4.1 | View Transactions Requiring Review | Frontend (Transaction list) | Backend API (queries) |
| 4.3 | Accept Suggested Classification | Frontend (Accept button) | Backend API (mutations) |
| 4.4 | View Transaction Details | Frontend (Details modal) | Backend API (queries) |
| 5.2 | View Report in Simple Format | Frontend (Report display) | Backend API (queries) |
| 6.1 | View All Categories | Frontend (Category list) | Backend API (queries) |
| 7.2 | Handle Empty or No Data Scenarios | Frontend (Empty states) | All layers |

**Total Frontend-Primary Stories**: 8

---

### Backend API Layer Stories
Stories that primarily involve API implementation (all stories use API):

| Story ID | Story Title | GraphQL Operations | Resolvers |
|----------|-------------|-------------------|-----------|
| All | All Stories | Queries + Mutations | All resolvers |

**Note**: Backend API layer supports all 23 stories through GraphQL schema and resolvers.

---

### Backend Services Layer Stories
Stories that primarily involve business logic:

| Story ID | Story Title | Primary Services | Secondary Services |
|----------|-------------|-----------------|-------------------|
| 1.2 | Create Initial Spending Categories | CategoryService | - |
| 2.2 | Parse and Validate CSV Format | CSVService | - |
| 2.3 | Detect Duplicate Transactions | CSVService | DuplicateDetectionManager |
| 2.4 | Import Transactions to Database | CSVService, TransactionService | - |
| 3.1 | ML Classification Engine | ClassificationService | MLManager |
| 3.2 | Classification Confidence Scoring | ClassificationService | ClassificationManager |
| 3.3 | Auto-Approval of High-Confidence Classifications | ClassificationService | - |
| 3.4 | Learning from User Feedback | ClassificationService | MLManager |
| 3.5 | Handling New Merchants | ClassificationService | FeatureExtractionManager |
| 4.2 | Manually Classify Transaction | TransactionService | ClassificationService |
| 5.1 | Generate Monthly Spending Report | ReportService | - |
| 5.3 | Compare Spending Across Months | ReportService | - |
| 5.4 | View Transaction List by Category | ReportService, TransactionService | - |
| 6.2 | Edit Category Name | CategoryService | - |
| 6.3 | Delete Unused Category | CategoryService | - |
| 6.4 | Reassign Transactions When Deleting Category | CategoryService, TransactionService | - |
| 6.5 | Find and Reclassify Transactions | TransactionService | ClassificationService |
| 7.1 | Handle CSV Import Errors Gracefully | CSVService | - |
| 7.3 | Recover from Database Errors | All Services | - |

**Total Services-Primary Stories**: 19

---

### Backend Managers Layer Stories
Stories that primarily involve ML and domain logic:

| Story ID | Story Title | Primary Managers | Purpose |
|----------|-------------|-----------------|---------|
| 2.3 | Detect Duplicate Transactions | DuplicateDetectionManager | Find duplicate transactions |
| 3.1 | ML Classification Engine | MLManager | ML model operations |
| 3.2 | Classification Confidence Scoring | ClassificationManager | Calculate confidence scores |
| 3.4 | Learning from User Feedback | MLManager | Train ML model |
| 3.5 | Handling New Merchants | FeatureExtractionManager | Extract features for new merchants |

**Total Managers-Primary Stories**: 5

---

### Backend Repositories Layer Stories
Stories that involve data persistence (all stories with data operations):

| Story ID | Story Title | Primary Repositories | Operations |
|----------|-------------|---------------------|-----------|
| 1.2 | Create Initial Spending Categories | CategoryRepository | Create categories |
| 2.3 | Detect Duplicate Transactions | TransactionRepository | Query existing transactions |
| 2.4 | Import Transactions to Database | TransactionRepository | Bulk insert transactions |
| 3.1 | ML Classification Engine | ClassificationHistoryRepository | Query training data |
| 3.4 | Learning from User Feedback | ClassificationHistoryRepository, MLModelRepository | Save training data, update model |
| 4.1 | View Transactions Requiring Review | TransactionRepository | Query unclassified transactions |
| 4.2 | Manually Classify Transaction | TransactionRepository, ClassificationHistoryRepository | Update transaction, save history |
| 5.1 | Generate Monthly Spending Report | TransactionRepository, CategoryRepository | Query transactions by date range |
| 5.4 | View Transaction List by Category | TransactionRepository | Query transactions by category |
| 6.1 | View All Categories | CategoryRepository | Query all categories |
| 6.2 | Edit Category Name | CategoryRepository | Update category |
| 6.3 | Delete Unused Category | CategoryRepository | Delete category |
| 6.4 | Reassign Transactions When Deleting Category | CategoryRepository, TransactionRepository | Update category, reassign transactions |
| 6.5 | Find and Reclassify Transactions | TransactionRepository, ClassificationHistoryRepository | Query and update transactions |

**Total Repository-Involved Stories**: 14

---

## Story Mapping by Feature Area

### 1. First-Time Setup (2 stories)
| Story ID | Story Title | Unit | Layers Involved |
|----------|-------------|------|----------------|
| 1.1 | Initial Application Launch | Unit 1 | Frontend, API |
| 1.2 | Create Initial Spending Categories | Unit 1 | Frontend, API, Services, Repositories |

---

### 2. CSV Import (4 stories)
| Story ID | Story Title | Unit | Layers Involved |
|----------|-------------|------|----------------|
| 2.1 | Upload CSV File | Unit 1 | Frontend, API, Services |
| 2.2 | Parse and Validate CSV Format | Unit 1 | API, Services |
| 2.3 | Detect Duplicate Transactions | Unit 1 | Services, Managers, Repositories |
| 2.4 | Import Transactions to Database | Unit 1 | Services, Repositories |

---

### 3. Transaction Classification (5 stories)
| Story ID | Story Title | Unit | Layers Involved |
|----------|-------------|------|----------------|
| 3.1 | ML Classification Engine | Unit 1 | Services, Managers, Repositories |
| 3.2 | Classification Confidence Scoring | Unit 1 | Services, Managers |
| 3.3 | Auto-Approval of High-Confidence Classifications | Unit 1 | Services |
| 3.4 | Learning from User Feedback | Unit 1 | Services, Managers, Repositories |
| 3.5 | Handling New Merchants | Unit 1 | Services, Managers |

---

### 4. Transaction Review (4 stories)
| Story ID | Story Title | Unit | Layers Involved |
|----------|-------------|------|----------------|
| 4.1 | View Transactions Requiring Review | Unit 1 | Frontend, API, Services, Repositories |
| 4.2 | Manually Classify Transaction | Unit 1 | Frontend, API, Services, Repositories |
| 4.3 | Accept Suggested Classification | Unit 1 | Frontend, API, Services, Repositories |
| 4.4 | View Transaction Details | Unit 1 | Frontend, API, Services, Repositories |

---

### 5. Reporting (3 stories)
| Story ID | Story Title | Unit | Layers Involved |
|----------|-------------|------|----------------|
| 5.1 | Generate Monthly Spending Report | Unit 1 | Frontend, API, Services, Repositories |
| 5.2 | View Report in Simple Format | Unit 1 | Frontend, API |
| 5.3 | Compare Spending Across Months | Unit 1 | Frontend, API, Services, Repositories |
| 5.4 | View Transaction List by Category | Unit 1 | Frontend, API, Services, Repositories |

---

### 6. Category Management (5 stories)
| Story ID | Story Title | Unit | Layers Involved |
|----------|-------------|------|----------------|
| 6.1 | View All Categories | Unit 1 | Frontend, API, Services, Repositories |
| 6.2 | Edit Category Name | Unit 1 | Frontend, API, Services, Repositories |
| 6.3 | Delete Unused Category | Unit 1 | Frontend, API, Services, Repositories |
| 6.4 | Reassign Transactions When Deleting Category | Unit 1 | Frontend, API, Services, Repositories |
| 6.5 | Find and Reclassify Transactions | Unit 1 | Frontend, API, Services, Repositories |

---

### 7. Error Handling (3 stories)
| Story ID | Story Title | Unit | Layers Involved |
|----------|-------------|------|----------------|
| 7.1 | Handle CSV Import Errors Gracefully | Unit 1 | Frontend, API, Services |
| 7.2 | Handle Empty or No Data Scenarios | Unit 1 | Frontend, API, Services |
| 7.3 | Recover from Database Errors | Unit 1 | All layers |

---

## Story Implementation Priority

### Phase 1: MVP Core (12 stories)
**Goal**: Basic CSV import, manual classification, and reporting

| Priority | Story ID | Story Title | Reason |
|----------|----------|-------------|--------|
| 1 | 1.1 | Initial Application Launch | Foundation |
| 2 | 1.2 | Create Initial Spending Categories | Required for classification |
| 3 | 2.1 | Upload CSV File | Core functionality |
| 4 | 2.2 | Parse and Validate CSV Format | Core functionality |
| 5 | 2.4 | Import Transactions to Database | Core functionality |
| 6 | 4.1 | View Transactions Requiring Review | Core functionality |
| 7 | 4.2 | Manually Classify Transaction | Core functionality |
| 8 | 4.3 | Accept Suggested Classification | User efficiency |
| 9 | 5.1 | Generate Monthly Spending Report | Core functionality |
| 10 | 5.2 | View Report in Simple Format | Core functionality |
| 11 | 6.1 | View All Categories | Category management |
| 12 | 6.3 | Delete Unused Category | Category management |

---

### Phase 2: ML Enhancement (7 stories)
**Goal**: Add ML classification to reduce manual effort

| Priority | Story ID | Story Title | Reason |
|----------|----------|-------------|--------|
| 13 | 3.1 | ML Classification Engine | ML foundation |
| 14 | 3.2 | Classification Confidence Scoring | ML quality |
| 15 | 3.3 | Auto-Approval of High-Confidence Classifications | Efficiency |
| 16 | 3.4 | Learning from User Feedback | ML improvement |
| 17 | 3.5 | Handling New Merchants | ML robustness |
| 18 | 2.3 | Detect Duplicate Transactions | Data quality |
| 19 | 4.4 | View Transaction Details | User experience |

---

### Phase 3: Advanced Features (4 stories)
**Goal**: Add advanced features for power users

| Priority | Story ID | Story Title | Reason |
|----------|----------|-------------|--------|
| 20 | 5.3 | Compare Spending Across Months | Advanced reporting |
| 21 | 5.4 | View Transaction List by Category | Drill-down analysis |
| 22 | 6.2 | Edit Category Name | Category refinement |
| 23 | 6.4 | Reassign Transactions When Deleting Category | Data management |

---

### Phase 4: Error Handling (3 stories)
**Goal**: Robust error handling (implemented throughout all phases)

| Priority | Story ID | Story Title | Reason |
|----------|----------|-------------|--------|
| Ongoing | 7.1 | Handle CSV Import Errors Gracefully | Robustness |
| Ongoing | 7.2 | Handle Empty or No Data Scenarios | User experience |
| Future | 7.3 | Recover from Database Errors | Reliability |

---

## Cross-Cutting Concerns

### Stories Affecting Multiple Layers

| Story ID | Frontend | API | Services | Managers | Repositories |
|----------|----------|-----|----------|----------|--------------|
| 1.1 | ✓ | ✓ | - | - | - |
| 1.2 | ✓ | ✓ | ✓ | - | ✓ |
| 2.1 | ✓ | ✓ | ✓ | - | - |
| 2.2 | - | ✓ | ✓ | - | - |
| 2.3 | - | - | ✓ | ✓ | ✓ |
| 2.4 | - | - | ✓ | - | ✓ |
| 3.1 | - | - | ✓ | ✓ | ✓ |
| 3.2 | - | - | ✓ | ✓ | - |
| 3.3 | - | - | ✓ | - | - |
| 3.4 | - | - | ✓ | ✓ | ✓ |
| 3.5 | - | - | ✓ | ✓ | - |
| 4.1 | ✓ | ✓ | ✓ | - | ✓ |
| 4.2 | ✓ | ✓ | ✓ | - | ✓ |
| 4.3 | ✓ | ✓ | ✓ | - | ✓ |
| 4.4 | ✓ | ✓ | ✓ | - | ✓ |
| 5.1 | ✓ | ✓ | ✓ | - | ✓ |
| 5.2 | ✓ | ✓ | - | - | - |
| 5.3 | ✓ | ✓ | ✓ | - | ✓ |
| 5.4 | ✓ | ✓ | ✓ | - | ✓ |
| 6.1 | ✓ | ✓ | ✓ | - | ✓ |
| 6.2 | ✓ | ✓ | ✓ | - | ✓ |
| 6.3 | ✓ | ✓ | ✓ | - | ✓ |
| 6.4 | ✓ | ✓ | ✓ | - | ✓ |
| 6.5 | ✓ | ✓ | ✓ | - | ✓ |

---

## Story Dependencies

### Critical Path
```
1.1 → 1.2 → 2.1 → 2.2 → 2.4 → 4.1 → 4.2 → 5.1 → 5.2
```

### ML Classification Path
```
3.1 → 3.2 → 3.3
3.1 + 4.2 → 3.4 → 3.5
```

### Category Management Path
```
1.2 → 6.1 → 6.2
6.1 → 6.3 → 6.4
6.1 + 4.2 → 6.5
```

### Reporting Enhancement Path
```
5.2 → 5.3
5.2 → 5.4
```

---

## Development Workflow

### Story Implementation Approach

For each story, implement across layers in this order:

1. **Shared Layer**: Define types and interfaces
2. **Backend Repositories**: Implement data access
3. **Backend Managers**: Implement domain logic (if needed)
4. **Backend Services**: Implement business logic
5. **Backend API**: Implement GraphQL schema and resolvers
6. **Frontend**: Implement UI components

### Example: Story 4.2 (Manually Classify Transaction)

1. **Shared**: Define `ClassificationInput` type
2. **Repositories**: Implement `TransactionRepository.updateClassification()`
3. **Services**: Implement `TransactionService.classifyTransaction()`
4. **API**: Implement `classifyTransaction` mutation
5. **Frontend**: Implement category selection dropdown

---

## Testing Strategy by Story

### Unit Tests
- Each layer tested independently
- Mock dependencies from lower layers

### Integration Tests
- Test story end-to-end across all layers
- Use test database and test ML model

### Acceptance Tests
- Validate story acceptance criteria
- Test from user perspective (frontend → backend)

---

## Notes

- **Single Unit**: All 23 stories implemented in one deployable unit
- **Layer Organization**: Stories span multiple layers but follow clear boundaries
- **Incremental Development**: Stories can be implemented incrementally within the unit
- **Testing**: Each story can be tested independently despite being in same unit
- **Deployment**: All stories deploy together as single application
