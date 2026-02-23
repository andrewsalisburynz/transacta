# Domain Entities - Household Spending Tracker

## Purpose
This document defines all domain entities, their properties, relationships, constraints, and lifecycle states for the Household Spending Tracker application.

---

## 1. Transaction Entity

### 1.1 Entity Definition

**Description**: Represents a single financial transaction imported from a bank CSV file.

**Lifecycle**: Created → Classified → Approved → (Optional: Reclassified)

### 1.2 Properties

| Property | Type | Required | Default | Description | Constraints |
|----------|------|----------|---------|-------------|-------------|
| id | String (UUID) | Yes | Auto-generated | Unique identifier | Primary key |
| date | Date | Yes | - | Transaction date | ISO 8601 format (YYYY-MM-DD) |
| amount | Number | Yes | - | Transaction amount | Negative = expense, Positive = income |
| payee | String | Yes | - | Merchant/payee name | Max 255 characters |
| particulars | String | No | null | Additional transaction details | Max 500 characters |
| code | String | No | null | Bank code | - |
| reference | String | No | null | Transaction reference | - |
| tranType | String | No | null | Transaction type (POS, FT, AP, etc.) | - |
| thisPartyAccount | String | No | null | User's account number | - |
| otherPartyAccount | String | No | null | Other party's account number | - |
| serial | String | No | null | Transaction serial number | - |
| transactionCode | String | No | null | Bank transaction code | - |
| batchNumber | String | No | null | Batch number | - |
| originatingBankBranch | String | No | null | Originating bank/branch | - |
| processedDate | String | No | null | Date transaction was processed | - |
| categoryId | String (UUID) | No | null | Foreign key to Category | References Category.id |
| classificationStatus | Enum | Yes | 'unclassified' | Classification status | unclassified, pending_review, approved |
| confidenceScore | Number | No | null | ML confidence score | 0.0 - 1.0 |
| isAutoApproved | Boolean | Yes | false | Whether auto-approved by ML | true/false |
| createdAt | DateTime | Yes | Auto-set | Record creation timestamp | ISO 8601 |
| updatedAt | DateTime | Yes | Auto-set | Record update timestamp | ISO 8601 |

### 1.3 Relationships

| Relationship | Type | Target Entity | Cardinality | Description |
|--------------|------|---------------|-------------|-------------|
| category | Many-to-One | Category | 0..1 : 1 | Transaction belongs to zero or one category |
| classificationHistory | One-to-Many | ClassificationHistory | 1 : 0..* | Transaction has zero or more classification history records |

### 1.4 Lifecycle States

```
┌─────────────────┐
│  UNCLASSIFIED   │ ← Initial state after import
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ PENDING_REVIEW  │ ← ML suggested category, awaiting user approval
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    APPROVED     │ ← Final state (can be reclassified)
└────────┬────────┘
         │
         ↓ (reclassification)
┌─────────────────┐
│ PENDING_REVIEW  │ ← Back to pending if user changes category
└─────────────────┘
```

### 1.5 State Transition Rules

| From State | To State | Trigger | Conditions |
|------------|----------|---------|------------|
| unclassified | pending_review | ML classification | confidence < threshold |
| unclassified | approved | ML classification | confidence ≥ threshold (auto-approval) |
| pending_review | approved | User accepts suggestion | User clicks "Accept" |
| pending_review | approved | User manual classification | User selects category |
| approved | pending_review | User reclassification | User changes category |

### 1.6 Business Rules

- Date must be valid and in the past or present (no future dates)
- Amount can be negative (expense) or positive (income)
- Payee is required and must not be empty after trimming
- Classification status must be one of the three valid values
- Confidence score must be between 0.0 and 1.0 if set
- If categoryId is set, category must exist in Categories table
- Only approved transactions appear in reports

### 1.7 Derived Properties

| Property | Calculation | Description |
|----------|-------------|-------------|
| isIncome | amount > 0 | Whether transaction is income |
| isExpense | amount < 0 | Whether transaction is expense |
| absAmount | Math.abs(amount) | Absolute value of amount |
| monthYear | format(date, "YYYY-MM") | Month and year for grouping |
| needsReview | status IN ('unclassified', 'pending_review') | Whether transaction needs user attention |

---

## 2. Category Entity

### 2.1 Entity Definition

**Description**: Represents a spending or income category for classifying transactions.

**Lifecycle**: Created → (Optional: Updated) → (Optional: Deleted with reassignment)

### 2.2 Properties

| Property | Type | Required | Default | Description | Constraints |
|----------|------|----------|---------|-------------|-------------|
| id | String (UUID) | Yes | Auto-generated | Unique identifier | Primary key |
| name | String | Yes | - | Category name | Max 50 characters, unique (case-insensitive), trimmed |
| description | String | No | null | Optional description | Max 500 characters |
| categoryType | Enum | Yes | 'expense' | Category type | expense, income |
| color | String | No | null | Hex color code for UI | Format: #RRGGBB |
| transactionCount | Number | Yes | 0 | Cached count of transactions | ≥ 0, denormalized |
| totalAmount | Number | Yes | 0.0 | Cached total amount | Denormalized |
| createdAt | DateTime | Yes | Auto-set | Record creation timestamp | ISO 8601 |
| updatedAt | DateTime | Yes | Auto-set | Record update timestamp | ISO 8601 |

### 2.3 Relationships

| Relationship | Type | Target Entity | Cardinality | Description |
|--------------|------|---------------|-------------|-------------|
| transactions | One-to-Many | Transaction | 1 : 0..* | Category has zero or more transactions |
| classificationHistory | One-to-Many | ClassificationHistory | 1 : 0..* | Category has zero or more classification history records |

### 2.4 Lifecycle States

```
┌─────────────────┐
│     ACTIVE      │ ← Normal state
└────────┬────────┘
         │
         ↓ (delete with transactions)
┌─────────────────┐
│ PENDING_DELETE  │ ← Awaiting reassignment
└────────┬────────┘
         │
         ↓ (reassignment complete)
┌─────────────────┐
│    DELETED      │ ← Removed from database
└─────────────────┘
```

### 2.5 Business Rules

- Name is required and must be unique (case-insensitive comparison)
- Name is automatically trimmed of leading/trailing whitespace
- Name can contain special characters
- Name maximum length is 50 characters
- At least 1 category must exist before importing transactions
- Categories with transactions cannot be deleted without reassignment
- Empty categories (transactionCount = 0) can be deleted directly
- Category statistics (transactionCount, totalAmount) are maintained by database triggers

### 2.6 Derived Properties

| Property | Calculation | Description |
|----------|-------------|-------------|
| isEmpty | transactionCount == 0 | Whether category has no transactions |
| canDelete | transactionCount == 0 | Whether category can be deleted directly |
| averageAmount | totalAmount / transactionCount | Average transaction amount |

---

## 3. ClassificationResult Entity

### 3.1 Entity Definition

**Description**: Represents the result of ML classification for a transaction (transient entity, not persisted directly).

**Lifecycle**: Created during classification → Used for approval decision → Discarded or stored in ClassificationHistory

### 3.2 Properties

| Property | Type | Required | Default | Description | Constraints |
|----------|------|----------|---------|-------------|-------------|
| transactionId | String (UUID) | Yes | - | Transaction being classified | References Transaction.id |
| suggestedCategoryId | String (UUID) | No | null | Suggested category | References Category.id |
| confidenceScore | Number | Yes | - | ML confidence score | 0.0 - 1.0 |
| status | Enum | Yes | - | Classification status | unclassified, pending_review, approved |
| reason | String | No | null | Explanation for suggestion | E.g., "Similar to: COUNTDOWN" |
| features | Object | No | null | Extracted features used | For debugging/analysis |

### 3.3 Relationships

| Relationship | Type | Target Entity | Cardinality | Description |
|--------------|------|---------------|-------------|-------------|
| transaction | Many-to-One | Transaction | * : 1 | Classification result for a transaction |
| suggestedCategory | Many-to-One | Category | * : 0..1 | Suggested category (if any) |

### 3.4 Business Rules

- Confidence score must be between 0.0 and 1.0
- If suggestedCategoryId is null, confidenceScore should be 0.0
- Status is determined by confidence score and threshold
- Classification results are transient and not stored directly
- Approved classifications are stored in ClassificationHistory

---

## 4. Report Entity

### 4.1 Entity Definition

**Description**: Represents a monthly spending report (transient entity, generated on-demand).

**Lifecycle**: Generated on request → Displayed to user → Discarded

### 4.2 Properties

| Property | Type | Required | Default | Description | Constraints |
|----------|------|----------|---------|-------------|-------------|
| month | Number | Yes | - | Report month | 1-12 |
| year | Number | Yes | - | Report year | 4-digit year |
| categories | Array<CategoryReport> | Yes | [] | Category breakdown | Sorted alphabetically |
| totalIncome | Number | Yes | 0.0 | Total income for period | Sum of positive amounts |
| totalExpenses | Number | Yes | 0.0 | Total expenses for period | Absolute sum of negative amounts |
| netAmount | Number | Yes | 0.0 | Net amount (income - expenses) | Can be negative |
| startDate | Date | Yes | - | Report start date | First day of month |
| endDate | Date | Yes | - | Report end date | Last day of month |
| transactionCount | Number | Yes | 0 | Total transactions in period | Derived |

### 4.3 Relationships

| Relationship | Type | Target Entity | Cardinality | Description |
|--------------|------|---------------|-------------|-------------|
| categoryReports | One-to-Many | CategoryReport | 1 : 0..* | Report has zero or more category breakdowns |

### 4.4 Business Rules

- Month must be 1-12
- Year must be valid 4-digit year
- Start date is first day of month (YYYY-MM-01)
- End date is last day of month (YYYY-MM-DD where DD is last day)
- Only approved transactions are included
- All categories are shown, even if $0 spending
- Categories sorted alphabetically by name
- Total income = sum of all positive amounts
- Total expenses = absolute value of sum of all negative amounts
- Net amount = totalIncome - totalExpenses

### 4.5 Derived Properties

| Property | Calculation | Description |
|----------|-------------|-------------|
| hasTransactions | transactionCount > 0 | Whether report has any transactions |
| isPositive | netAmount > 0 | Whether net amount is positive (surplus) |
| isNegative | netAmount < 0 | Whether net amount is negative (deficit) |
| periodLabel | format(month, year) | E.g., "January 2024" |

---

## 5. CategoryReport Entity

### 5.1 Entity Definition

**Description**: Represents spending breakdown for a single category within a report (transient entity).

**Lifecycle**: Created as part of Report generation → Displayed to user → Discarded

### 5.2 Properties

| Property | Type | Required | Default | Description | Constraints |
|----------|------|----------|---------|-------------|-------------|
| category | Category | Yes | - | Category details | Full category object |
| totalAmount | Number | Yes | 0.0 | Total amount for category | Can be negative or positive |
| transactionCount | Number | Yes | 0 | Number of transactions | ≥ 0 |
| isIncome | Boolean | Yes | - | Whether category is income | totalAmount > 0 |
| percentage | Number | No | null | Percentage of total spending | 0-100 |

### 5.3 Relationships

| Relationship | Type | Target Entity | Cardinality | Description |
|--------------|------|---------------|-------------|-------------|
| category | Many-to-One | Category | * : 1 | Category report belongs to a category |
| report | Many-to-One | Report | * : 1 | Category report belongs to a report |

### 5.4 Business Rules

- Total amount can be negative (expense) or positive (income)
- Transaction count must be ≥ 0
- isIncome is true if totalAmount > 0
- Percentage is calculated as (absAmount / totalExpenses) × 100 for expenses
- Categories with $0 spending are included in report

### 5.5 Derived Properties

| Property | Calculation | Description |
|----------|-------------|-------------|
| absAmount | Math.abs(totalAmount) | Absolute value of total amount |
| averageAmount | totalAmount / transactionCount | Average transaction amount |
| isEmpty | transactionCount == 0 | Whether category has no transactions in period |

---

## 6. CSVRow Entity

### 6.1 Entity Definition

**Description**: Represents a single row from an imported CSV file (transient entity during import).

**Lifecycle**: Parsed from CSV → Validated → Transformed to Transaction → Discarded

### 6.2 Properties

| Property | Type | Required | Default | Description | Constraints |
|----------|------|----------|---------|-------------|-------------|
| rowNumber | Number | Yes | - | Row number in CSV | For error reporting |
| date | String | Yes | - | Transaction date (raw) | Will be parsed |
| amount | String | Yes | - | Transaction amount (raw) | Will be parsed |
| payee | String | Yes | - | Merchant/payee name | Max 255 characters |
| particulars | String | No | null | Additional details | Max 500 characters |
| code | String | No | null | Bank code | - |
| reference | String | No | null | Transaction reference | - |
| tranType | String | No | null | Transaction type | - |
| thisPartyAccount | String | No | null | User's account | - |
| otherPartyAccount | String | No | null | Other party's account | - |
| serial | String | No | null | Serial number | - |
| transactionCode | String | No | null | Bank transaction code | - |
| batchNumber | String | No | null | Batch number | - |
| originatingBankBranch | String | No | null | Originating bank/branch | - |
| processedDate | String | No | null | Processed date (raw) | - |
| validationErrors | Array<String> | No | [] | Validation errors | For interactive validation |

### 6.3 Business Rules

- All fields are initially strings (raw CSV data)
- Required fields must not be empty
- Date must be parseable to valid date
- Amount must be parseable to valid number
- Validation errors are collected for interactive validation
- User can skip, edit, or cancel import on validation errors

---

## 7. ClassificationHistory Entity

### 7.1 Entity Definition

**Description**: Represents a historical classification decision, used for ML training.

**Lifecycle**: Created when transaction is classified → Used for ML training → Persisted indefinitely

### 7.2 Properties

| Property | Type | Required | Default | Description | Constraints |
|----------|------|----------|---------|-------------|-------------|
| id | String (UUID) | Yes | Auto-generated | Unique identifier | Primary key |
| transactionId | String (UUID) | Yes | - | Transaction that was classified | References Transaction.id |
| categoryId | String (UUID) | Yes | - | Category assigned | References Category.id |
| payee | String | Yes | - | Payee at time of classification | Snapshot |
| particulars | String | No | null | Particulars at time of classification | Snapshot |
| tranType | String | No | null | Transaction type at time of classification | Snapshot |
| amount | Number | Yes | - | Amount at time of classification | Snapshot |
| classificationMethod | Enum | Yes | - | How classification was made | manual, ml_auto, ml_accepted |
| confidenceScore | Number | No | null | ML confidence (if ML classification) | 0.0 - 1.0 |
| wasCorrected | Boolean | Yes | false | Whether user corrected ML suggestion | true/false |
| previousCategoryId | String (UUID) | No | null | Previous category (if reclassified) | References Category.id |
| classifiedAt | DateTime | Yes | Auto-set | When classification was made | ISO 8601 |

### 7.3 Relationships

| Relationship | Type | Target Entity | Cardinality | Description |
|--------------|------|---------------|-------------|-------------|
| transaction | Many-to-One | Transaction | * : 1 | History record belongs to a transaction |
| category | Many-to-One | Category | * : 1 | History record references a category |
| previousCategory | Many-to-One | Category | * : 0..1 | History record may reference previous category |

### 7.4 Business Rules

- Transaction data is snapshotted at time of classification
- Classification method indicates how category was chosen
- Confidence score is only set for ML classifications
- wasCorrected is true if user changed ML suggestion
- previousCategoryId is set if transaction was reclassified
- All classification history is used for ML training

---

## 8. MLModel Entity

### 8.1 Entity Definition

**Description**: Represents ML model metadata and configuration.

**Lifecycle**: Created on first training → Updated on each training → Persisted

### 8.2 Properties

| Property | Type | Required | Default | Description | Constraints |
|----------|------|----------|---------|-------------|-------------|
| id | String (UUID) | Yes | Auto-generated | Unique identifier | Primary key |
| modelVersion | String | Yes | - | Model version | Semantic version (e.g., "1.0.0") |
| modelFilePath | String | Yes | - | Path to model file | Relative path |
| modelType | String | Yes | - | Model type | E.g., "neural_network" |
| trainingSamplesCount | Number | Yes | 0 | Number of training samples | ≥ 0 |
| trainingAccuracy | Number | No | null | Training accuracy | 0.0 - 1.0 |
| validationAccuracy | Number | No | null | Validation accuracy | 0.0 - 1.0 |
| lastTrainedAt | DateTime | No | null | Last training timestamp | ISO 8601 |
| confidenceThreshold | Number | Yes | 0.8 | Auto-approval threshold | 0.0 - 1.0 |
| featureExtractionMethod | String | No | null | Feature extraction method | E.g., "text_patterns" |
| modelParameters | String | No | null | JSON string of parameters | Serialized JSON |
| isActive | Boolean | Yes | true | Whether model is active | true/false |
| createdAt | DateTime | Yes | Auto-set | Record creation timestamp | ISO 8601 |
| updatedAt | DateTime | Yes | Auto-set | Record update timestamp | ISO 8601 |

### 8.3 Business Rules

- Only one model should be active at a time
- Model file path is relative to application root
- Training samples count increases with each classification
- Confidence threshold is adaptive based on training samples count
- Model parameters stored as JSON string for flexibility

---

## 9. DashboardStats Entity

### 9.1 Entity Definition

**Description**: Represents dashboard statistics (transient entity, generated on-demand).

**Lifecycle**: Generated on request → Displayed to user → Discarded

### 9.2 Properties

| Property | Type | Required | Default | Description | Constraints |
|----------|------|----------|---------|-------------|-------------|
| totalTransactions | Number | Yes | 0 | Total number of transactions | ≥ 0 |
| totalCategories | Number | Yes | 0 | Total number of categories | ≥ 0 |
| pendingReviews | Number | Yes | 0 | Transactions needing review | ≥ 0 |
| lastImportDate | DateTime | No | null | Date of last CSV import | ISO 8601 |
| totalSpendingThisMonth | Number | Yes | 0.0 | Total spending for current month | Absolute value |

### 9.3 Business Rules

- All counts must be ≥ 0
- Pending reviews includes unclassified and pending_review transactions
- Total spending this month is absolute value of negative amounts
- Last import date is null if no imports yet

---

## Entity Relationship Diagram

```
┌──────────────────┐
│    Category      │
│──────────────────│
│ id (PK)          │
│ name             │
│ categoryType     │
└────────┬─────────┘
         │
         │ 1:N
         │
┌────────┴──────────────────────┐
│       Transaction             │
│───────────────────────────────│
│ id (PK)                       │
│ categoryId (FK)               │
│ date, amount, payee           │
│ classificationStatus          │
│ confidenceScore               │
└────────┬──────────────────────┘
         │
         │ 1:N
         │
┌────────┴───────────────────────┐
│  ClassificationHistory         │
│────────────────────────────────│
│ id (PK)                        │
│ transactionId (FK)             │
│ categoryId (FK)                │
│ classificationMethod           │
└────────────────────────────────┘

┌────────────────────────────────┐
│         MLModel                │
│────────────────────────────────│
│ id (PK)                        │
│ modelVersion                   │
│ trainingSamplesCount           │
│ confidenceThreshold            │
└────────────────────────────────┘
```

---

## Notes

- Entities are designed to be technology-agnostic
- Relationships follow standard database normalization principles
- Denormalized fields (category statistics) are maintained by triggers
- Transient entities (Report, CategoryReport, CSVRow, ClassificationResult) are not persisted
- All entities have clear lifecycle states and transition rules
- Business rules are enforced at entity level
- Derived properties are calculated on-demand, not stored
