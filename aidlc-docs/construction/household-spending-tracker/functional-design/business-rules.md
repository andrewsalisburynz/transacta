# Business Rules - Household Spending Tracker

## Purpose
This document defines all business rules, validation rules, and constraints for the Household Spending Tracker application.

---

## 1. CSV Validation Rules

### 1.1 File Format Rules

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| CSV-001 | File must be CSV format | Check file extension is .csv | "Invalid file format. Please upload a CSV file." |
| CSV-002 | File size must be ≤ 10MB | Check file size ≤ 10,485,760 bytes | "File is too large. Maximum size is 10MB." |
| CSV-003 | File must not be empty | Check file size > 0 | "File is empty. Please upload a valid CSV file." |

### 1.2 CSV Structure Rules

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| CSV-010 | CSV must have exactly 14 columns | Count columns in header row | "Invalid CSV structure. Expected 14 columns, found {count}." |
| CSV-011 | CSV must have header row | Check first row contains expected column names | "Missing header row. Please ensure CSV has column headers." |
| CSV-012 | Required columns must be present | Check for: Date, Amount, Payee, Particulars, Tran Type | "Missing required column: {column_name}" |

### 1.3 Row Data Validation Rules (Interactive)

| Rule ID | Rule | Validation | Error Message | User Action |
|---------|------|------------|---------------|-------------|
| CSV-020 | Date field is required | Check Date is not empty | "Date is required in row {row_number}" | Skip, Edit, Cancel |
| CSV-021 | Date must be valid format | Parse date with auto-detect | "Invalid date format in row {row_number}: {date_value}" | Skip, Edit, Cancel |
| CSV-022 | Amount field is required | Check Amount is not empty | "Amount is required in row {row_number}" | Skip, Edit, Cancel |
| CSV-023 | Amount must be valid number | Parse amount as float | "Invalid amount format in row {row_number}: {amount_value}" | Skip, Edit, Cancel |
| CSV-024 | Payee field is required | Check Payee is not empty | "Payee is required in row {row_number}" | Skip, Edit, Cancel |
| CSV-025 | Payee must be ≤ 255 characters | Check Payee length | "Payee too long in row {row_number} (max 255 characters)" | Skip, Edit, Cancel |

---

## 2. Transaction Validation Rules

### 2.1 Transaction Data Rules

| Rule ID | Rule | Validation | Constraint |
|---------|------|------------|------------|
| TXN-001 | Date is required | NOT NULL | Database constraint |
| TXN-002 | Date must be valid ISO 8601 format | Format: YYYY-MM-DD | Application validation |
| TXN-003 | Amount is required | NOT NULL | Database constraint |
| TXN-004 | Amount must be numeric | Type: REAL | Database constraint |
| TXN-005 | Amount stored as-is (keep sign) | Negative = expense, Positive = income | Business rule |
| TXN-006 | Payee is required | NOT NULL | Database constraint |
| TXN-007 | Payee max length 255 characters | VARCHAR(255) | Database constraint |
| TXN-008 | Classification status must be valid | ENUM: unclassified, pending_review, approved | Database CHECK constraint |
| TXN-009 | Confidence score must be 0.0-1.0 | CHECK: confidence_score >= 0 AND <= 1 | Database CHECK constraint |
| TXN-010 | Confidence score can be NULL | NULL allowed for unclassified | Database constraint |

### 2.2 Transaction State Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| TXN-020 | Initial state is "unclassified" | All imported transactions start as unclassified |
| TXN-021 | State transitions are: unclassified → pending_review → approved | Valid state flow |
| TXN-022 | State can skip pending_review if auto-approved | unclassified → approved (if confidence ≥ threshold) |
| TXN-023 | Approved transactions can be reclassified | approved → pending_review (if user changes category) |
| TXN-024 | Only approved transactions appear in reports | Report query filters by status = 'approved' |

---

## 3. Duplicate Detection Rules

### 3.1 Duplicate Matching Rules

| Rule ID | Rule | Matching Criteria |
|---------|------|-------------------|
| DUP-001 | Exact match on Date | Date must match exactly (YYYY-MM-DD) |
| DUP-002 | Exact match on Amount | Amount must match exactly (including sign) |
| DUP-003 | Exact match on Payee | Payee must match exactly (case-sensitive) |
| DUP-004 | Exact match on Reference | Reference must match exactly |
| DUP-005 | All 4 fields must match | Date AND Amount AND Payee AND Reference |

### 3.2 Duplicate Handling Rules

| Rule ID | Rule | Action |
|---------|------|--------|
| DUP-010 | Duplicates are auto-skipped | Do not import duplicate transactions |
| DUP-011 | Show duplicate count to user | Display: "{count} duplicate transactions were automatically skipped" |
| DUP-012 | Only unique transactions are imported | Import transactions that don't match existing ones |

---

## 4. Category Validation Rules

### 4.1 Category Name Rules

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| CAT-001 | Category name is required | Check name is not empty after trim | "Category name cannot be empty" |
| CAT-002 | Category name max 50 characters | Check trimmed name length ≤ 50 | "Category name must be 50 characters or less" |
| CAT-003 | Category name must be unique | Check no existing category with same name (case-insensitive) | "Category name already exists" |
| CAT-004 | Category name whitespace is trimmed | Trim leading/trailing whitespace before save | Automatic |
| CAT-005 | Special characters are allowed | No restrictions on characters | N/A |

### 4.2 Category Lifecycle Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| CAT-010 | At least 1 category required before import | User must create categories before importing transactions |
| CAT-011 | Categories can be created at any time | No restrictions on when categories can be added |
| CAT-012 | Category names can be edited | Update category name (must still be unique) |
| CAT-013 | Categories with transactions require reassignment before deletion | Prompt user to select replacement category |
| CAT-014 | Empty categories can be deleted directly | No reassignment needed if transaction count = 0 |

---

## 5. Category Deletion Rules

### 5.1 Deletion with Transactions

| Rule ID | Rule | Action |
|---------|------|--------|
| DEL-001 | Check transaction count before deletion | Query: SELECT COUNT(*) FROM transactions WHERE category_id = {id} |
| DEL-002 | If count > 0, prompt for reassignment | Show dialog: "This category has {count} transactions. Select a replacement category:" |
| DEL-003 | User must select replacement category | Dropdown of all other categories |
| DEL-004 | User can cancel deletion | Return without deleting if user cancels |
| DEL-005 | Reassign all transactions to new category | UPDATE transactions SET category_id = {new_id} WHERE category_id = {old_id} |
| DEL-006 | Update training data with new category | UPDATE classification_history SET category_id = {new_id} WHERE category_id = {old_id} |
| DEL-007 | Delete category after reassignment | DELETE FROM categories WHERE id = {old_id} |

### 5.2 Deletion without Transactions

| Rule ID | Rule | Action |
|---------|------|--------|
| DEL-010 | If count = 0, delete directly | No reassignment needed |
| DEL-011 | Confirm deletion with user | Show confirmation: "Delete category '{name}'?" |
| DEL-012 | Delete category immediately | DELETE FROM categories WHERE id = {id} |

---

## 6. ML Confidence Threshold Rules

### 6.1 Adaptive Threshold Rules

| Rule ID | Rule | Threshold | Condition |
|---------|------|-----------|-----------|
| ML-001 | New user threshold | 90% | Training data count < 50 |
| ML-002 | Intermediate user threshold | 80% | Training data count 50-99 |
| ML-003 | Experienced user threshold | 70% | Training data count ≥ 100 |

### 6.2 Confidence Calculation Rules

| Rule ID | Rule | Formula Component | Value |
|---------|------|-------------------|-------|
| ML-010 | Base confidence | Model probability | 0.0 - 1.0 |
| ML-011 | Exact match bonus | If exact payee match in training data | +0.15 |
| ML-012 | Frequency bonus (moderate) | If category used > 10 times | +0.05 |
| ML-013 | Frequency bonus (high) | If category used > 50 times | +0.10 |
| ML-014 | Recency bonus | If similar transaction in last 30 days | +0.05 |
| ML-015 | Training data penalty (low) | If training data < 20 samples | -0.10 |
| ML-016 | Training data penalty (moderate) | If training data 20-49 samples | -0.05 |
| ML-017 | Final confidence clamped | Clamp to [0, 1] range | max(0, min(1, score)) |

### 6.3 New Merchant Rules

| Rule ID | Rule | Confidence | Condition |
|---------|------|------------|-----------|
| ML-020 | Fuzzy match confidence | similarity × 0.6 | Similar merchant found (≥70% similarity) |
| ML-021 | Keyword match confidence | 0.3 (30%) | Keyword found in category name |
| ML-022 | No match confidence | 0.0 (0%) | No similar merchants or keywords |

---

## 7. Auto-Approval Rules

### 7.1 Auto-Approval Decision Rules

| Rule ID | Rule | Condition | Action |
|---------|------|-----------|--------|
| APP-001 | Auto-approve if confidence ≥ threshold | confidence ≥ getAdaptiveThreshold() | Set status = 'approved', isAutoApproved = true |
| APP-002 | Flag for review if confidence < threshold | confidence < getAdaptiveThreshold() | Set status = 'pending_review', isAutoApproved = false |
| APP-003 | Auto-approved transactions added to training data | isAutoApproved = true | Add to classification_history immediately |
| APP-004 | Pending transactions not added to training data | status = 'pending_review' | Wait for user approval |

---

## 8. Report Date Range Rules

### 8.1 Monthly Report Rules

| Rule ID | Rule | Calculation |
|---------|------|-------------|
| RPT-001 | Use calendar month | Start: 1st day of month, End: Last day of month |
| RPT-002 | Start date calculation | new Date(year, month - 1, 1) |
| RPT-003 | End date calculation | new Date(year, month, 0) |
| RPT-004 | Date range is inclusive | Include transactions on start and end dates |

### 8.2 Report Content Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| RPT-010 | Only include approved transactions | WHERE classification_status = 'approved' |
| RPT-011 | Group transactions by category | GROUP BY category_id |
| RPT-012 | Calculate total per category | SUM(amount) for each category |
| RPT-013 | Count transactions per category | COUNT(*) for each category |
| RPT-014 | Identify income vs expense | isIncome = (totalAmount > 0) |
| RPT-015 | Include categories with $0 spending | Show all categories, display $0 if no transactions |
| RPT-016 | Sort categories alphabetically | ORDER BY category.name ASC |
| RPT-017 | Calculate total income | SUM(amount) WHERE amount > 0 |
| RPT-018 | Calculate total expenses | ABS(SUM(amount)) WHERE amount < 0 |
| RPT-019 | Calculate net amount | totalIncome - totalExpenses |

---

## 9. Transaction Review Queue Rules

### 9.1 Queue Inclusion Rules

| Rule ID | Rule | Condition |
|---------|------|-----------|
| REV-001 | Include unclassified transactions | classification_status = 'unclassified' |
| REV-002 | Include pending review transactions | classification_status = 'pending_review' |
| REV-003 | Exclude approved transactions | classification_status != 'approved' |

### 9.2 Queue Sorting Rules

| Rule ID | Rule | Sort Order |
|---------|------|------------|
| REV-010 | Sort by date ascending | ORDER BY date ASC (oldest first) |
| REV-011 | Secondary sort by ID | ORDER BY date ASC, id ASC |

---

## 10. Data Integrity Rules

### 10.1 Referential Integrity Rules

| Rule ID | Rule | Constraint | Action on Delete |
|---------|------|------------|------------------|
| INT-001 | Transaction → Category | FOREIGN KEY (category_id) REFERENCES categories(id) | ON DELETE SET NULL |
| INT-002 | Classification History → Transaction | FOREIGN KEY (transaction_id) REFERENCES transactions(id) | ON DELETE CASCADE |
| INT-003 | Classification History → Category | FOREIGN KEY (category_id) REFERENCES categories(id) | ON DELETE CASCADE |

### 10.2 Data Consistency Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| INT-010 | Category statistics are denormalized | transaction_count and total_amount cached in categories table |
| INT-011 | Category statistics updated via triggers | Database triggers maintain consistency |
| INT-012 | Timestamps auto-updated | updated_at set to current timestamp on UPDATE |
| INT-013 | Timestamps auto-set on creation | created_at set to current timestamp on INSERT |

---

## 11. ML Training Rules

### 11.1 Training Data Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| TRN-001 | Only approved classifications used for training | classification_status = 'approved' |
| TRN-002 | Manual classifications added to training data | classification_method = 'manual' |
| TRN-003 | Accepted ML suggestions added to training data | classification_method = 'ml_accepted' |
| TRN-004 | Auto-approved classifications added to training data | classification_method = 'ml_auto' |
| TRN-005 | Reclassifications update training data | Update existing classification_history record |

### 11.2 Training Timing Rules

| Rule ID | Rule | Trigger |
|---------|------|---------|
| TRN-010 | Training happens at session end | User completes classification session |
| TRN-011 | Session ends when user navigates away | User leaves review page |
| TRN-012 | Session ends on explicit action | User clicks "Done" or "Finish" |
| TRN-013 | Training uses all historical data | Include all classification_history records |

---

## 12. Frontend Validation Rules

### 12.1 Form Validation Rules

| Rule ID | Rule | Validation Timing | Error Display |
|---------|------|-------------------|---------------|
| FE-001 | Validate on blur | When user leaves field | Inline error below field |
| FE-002 | Validate on change | As user types (debounced) | Inline error below field |
| FE-003 | Final validation on submit | Before API call | Inline errors + summary |
| FE-004 | Backend validation always runs | After frontend validation passes | Toast or modal for server errors |

### 12.2 Error Display Rules

| Rule ID | Rule | Error Type | Display Method |
|---------|------|------------|----------------|
| FE-010 | Validation errors | Form field errors | Inline below field |
| FE-011 | Success messages | Operation completed | Toast notification (auto-dismiss) |
| FE-012 | Info messages | Non-critical information | Toast notification (auto-dismiss) |
| FE-013 | Critical errors | System errors, data loss risk | Modal dialog (requires acknowledgment) |
| FE-014 | Network errors | API call failures | Toast with retry option |

### 12.3 Loading State Rules

| Rule ID | Rule | Operation Type | Loading Indicator |
|---------|------|----------------|-------------------|
| FE-020 | Initial page load | First data fetch | Skeleton screen |
| FE-021 | Data updates | Refresh, filter, sort | Component spinner |
| FE-022 | Critical operations | CSV import, bulk operations | Global overlay spinner |
| FE-023 | Background operations | Auto-save, sync | Subtle indicator (no blocking) |

---

## 13. Business Logic Constraints

### 13.1 Workflow Constraints

| Rule ID | Rule | Constraint |
|---------|------|------------|
| WF-001 | Categories must exist before import | Enforce in UI (disable import if no categories) |
| WF-002 | Transactions must be imported before classification | Classification triggered after import |
| WF-003 | Transactions must be classified before reporting | Reports only include approved transactions |
| WF-004 | ML model requires training data | Show message if < 10 training samples |

### 13.2 Performance Constraints

| Rule ID | Rule | Constraint |
|---------|------|------------|
| PERF-001 | CSV import must complete in < 5 seconds | For up to 1000 transactions |
| PERF-002 | ML classification must complete in < 2 seconds | Per transaction |
| PERF-003 | Report generation must complete in < 3 seconds | For monthly report |
| PERF-004 | Duplicate detection must complete in < 2 seconds | For up to 1000 transactions |

---

## 14. Security and Privacy Rules

### 14.1 Data Security Rules

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| SEC-001 | All data stored locally | SQLite database in local file system |
| SEC-002 | No external data transmission | No API calls to external services |
| SEC-003 | No user authentication required | Single-user application |
| SEC-004 | Database file should be protected | File system permissions |

### 14.2 Input Sanitization Rules

| Rule ID | Rule | Sanitization |
|---------|------|--------------|
| SEC-010 | Sanitize all user input | Escape special characters for SQL |
| SEC-011 | Validate all file uploads | Check file type and size |
| SEC-012 | Sanitize CSV data | Escape special characters, validate data types |
| SEC-013 | Prevent SQL injection | Use parameterized queries |

---

## Notes

- All rules are enforced at appropriate layers (database, business logic, frontend)
- Rules are designed to be testable and verifiable
- Validation provides clear, actionable error messages
- Business rules balance strictness with user-friendliness
- Performance constraints ensure good user experience
- Security rules protect user's financial data
