# Integration Test Instructions - Household Spending Tracker MVP

## Overview

This document provides manual integration testing scenarios to validate end-to-end workflows in the Household Spending Tracker MVP. These tests verify that all components (frontend, backend, database, ML engine) work together correctly.

## Prerequisites

Before testing:
1. Complete build instructions (see build-instructions.md)
2. Database initialized with seed data
3. Both backend and frontend running:
   ```bash
   npm run dev:all
   ```
4. Sample CSV file available: `sample-transactions.csv`

## Test Environment

- **Backend**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Frontend**: http://localhost:5173
- **Database**: `data/transacta.db`

## Integration Test Scenarios

### Scenario 1: CSV Import Workflow

**Objective**: Verify complete CSV import process from file upload to database storage.

#### Test Steps

1. **Prepare Test Data**
   - Use provided `sample-transactions.csv`
   - Verify file contains valid transactions (date, amount, payee)
   - Note: File should have 20-30 transactions

2. **Upload via Frontend**
   - Navigate to http://localhost:5173
   - Click "Upload CSV" or "Import Transactions"
   - Select `sample-transactions.csv`
   - Click "Upload"

3. **Verify Upload Response**
   - Success message displays
   - Shows count: "Imported X transactions"
   - Shows duplicate count (should be 0 on first import)
   - Shows error count (should be 0 for valid file)

4. **Verify Database Storage**
   ```bash
   sqlite3 data/transacta.db "SELECT COUNT(*) FROM transactions;"
   ```
   - Count should match imported count

5. **Verify Transaction Display**
   - Transactions appear in transaction list
   - All fields populated: date, payee, amount
   - Status shows "UNCLASSIFIED"
   - No category assigned yet

6. **Test Duplicate Detection**
   - Upload same CSV file again
   - Verify: "X duplicates skipped" message
   - Verify: No new transactions added to database
   - Verify: Transaction count unchanged

#### Expected Results

| Step | Expected Outcome | Pass/Fail |
|------|------------------|-----------|
| File upload | Success message, no errors | ☐ |
| Database insert | All transactions stored | ☐ |
| UI display | Transactions visible in list | ☐ |
| Duplicate detection | Duplicates identified and skipped | ☐ |

#### Error Cases to Test

**Invalid CSV Format**:
- Upload file with missing columns
- Expected: Error message "Invalid CSV format"

**Invalid Date Format**:
- Upload CSV with malformed dates
- Expected: Error report with row numbers

**Empty File**:
- Upload empty CSV
- Expected: "No transactions found" message

---

### Scenario 2: ML Classification Workflow

**Objective**: Verify ML-based transaction classification and confidence scoring.

#### Test Steps

1. **Ensure Transactions Exist**
   - Import sample CSV (from Scenario 1)
   - Verify unclassified transactions present

2. **Request Classification Suggestion (GraphQL)**
   - Open http://localhost:4000/graphql
   - Run query:
   ```graphql
   mutation {
     getClassificationSuggestion(transactionId: "1") {
       transactionId
       suggestedCategoryId
       confidenceScore
       shouldAutoApprove
       explanation
     }
   }
   ```

3. **Verify ML Response**
   - Returns suggested category ID
   - Confidence score between 0.0 and 1.0
   - `shouldAutoApprove` is true if confidence > 0.85
   - Explanation provided (optional)

4. **Test Classification via Frontend**
   - Navigate to Transaction Review page
   - Find unclassified transaction
   - Click "Get Suggestion" or similar button
   - Verify suggested category displays
   - Verify confidence score displays (e.g., "85% confident")

5. **Accept ML Suggestion**
   - Click "Accept" or "Approve" on suggestion
   - Verify transaction status changes to "APPROVED"
   - Verify category assigned
   - Verify classification method recorded as "ML_ACCEPTED"

6. **Manual Override**
   - Get ML suggestion for another transaction
   - Select different category manually
   - Save classification
   - Verify manual category saved (not ML suggestion)
   - Verify classification method recorded as "MANUAL"

7. **Verify Classification History**
   ```bash
   sqlite3 data/transacta.db "SELECT * FROM classification_history LIMIT 5;"
   ```
   - Records exist for classified transactions
   - Contains: transaction_id, category_id, method, confidence_score

#### Expected Results

| Step | Expected Outcome | Pass/Fail |
|------|------------------|-----------|
| ML suggestion | Returns category with confidence | ☐ |
| High confidence | Auto-approve flag set correctly | ☐ |
| Accept suggestion | Transaction classified as ML_ACCEPTED | ☐ |
| Manual override | Manual classification takes precedence | ☐ |
| History tracking | Classification recorded in history | ☐ |

#### Test Cases by Payee Type

Test classification accuracy for common payees:

| Payee | Expected Category | Confidence | Pass/Fail |
|-------|-------------------|------------|-----------|
| COUNTDOWN SUPERMARKET | Groceries | High (>0.8) | ☐ |
| CONTACT ENERGY | Utilities | High (>0.8) | ☐ |
| NETFLIX | Entertainment | High (>0.8) | ☐ |
| SALARY PAYMENT | Income | High (>0.8) | ☐ |
| UNKNOWN MERCHANT | Various | Low (<0.5) | ☐ |

---

### Scenario 3: Report Generation Workflow

**Objective**: Verify monthly report generation with accurate calculations.

#### Test Steps

1. **Prepare Test Data**
   - Ensure transactions exist for a specific month (e.g., January 2024)
   - Ensure transactions are classified
   - Mix of expenses and income

2. **Generate Report via GraphQL**
   - Open http://localhost:4000/graphql
   - Run query:
   ```graphql
   query {
     monthlyReport(month: "2024-01") {
       month
       startDate
       endDate
       totalExpenses
       totalIncome
       netAmount
       transactionCount
       categorySummaries {
         categoryId
         category {
           name
           categoryType
         }
         totalAmount
         transactionCount
         percentage
       }
     }
   }
   ```

3. **Verify Report Data**
   - Month matches requested period
   - Start/end dates correct (1st to last day of month)
   - Transaction count matches database
   - Total expenses sum is negative
   - Total income sum is positive
   - Net amount = income + expenses (expenses are negative)

4. **Verify Category Summaries**
   - All categories with transactions included
   - Total amounts correct per category
   - Transaction counts correct per category
   - Percentages sum to ~100% (for expenses)
   - Categories sorted by amount (highest first)

5. **Generate Report via Frontend**
   - Navigate to Reports page
   - Select month: "January 2024"
   - Click "Generate Report"
   - Verify report displays

6. **Verify Frontend Display**
   - Month header shows "January 2024"
   - Total expenses displayed
   - Total income displayed
   - Net amount displayed (with color: green if positive, red if negative)
   - Category breakdown table/chart shows
   - Each category shows: name, amount, count, percentage

7. **Test Edge Cases**

   **Empty Month**:
   - Request report for month with no transactions
   - Expected: Report shows zeros, empty category list

   **Unclassified Transactions**:
   - Request report with unclassified transactions
   - Expected: Unclassified transactions excluded from category summaries

   **Single Category**:
   - Request report where all transactions are one category
   - Expected: 100% for that category

#### Expected Results

| Step | Expected Outcome | Pass/Fail |
|------|------------------|-----------|
| Report generation | Returns complete report data | ☐ |
| Date range | Correct month boundaries | ☐ |
| Totals calculation | Accurate sums for income/expenses | ☐ |
| Category breakdown | All categories with correct amounts | ☐ |
| Percentages | Sum to 100% for expenses | ☐ |
| Frontend display | Report renders correctly | ☐ |

#### Manual Calculation Verification

For a sample month, manually verify:

1. **Count transactions in database**:
   ```sql
   SELECT COUNT(*) FROM transactions 
   WHERE date >= '2024-01-01' AND date < '2024-02-01';
   ```

2. **Calculate total expenses**:
   ```sql
   SELECT SUM(amount) FROM transactions 
   WHERE date >= '2024-01-01' AND date < '2024-02-01' 
   AND amount < 0;
   ```

3. **Calculate total income**:
   ```sql
   SELECT SUM(amount) FROM transactions 
   WHERE date >= '2024-01-01' AND date < '2024-02-01' 
   AND amount > 0;
   ```

4. **Compare with report output** - should match exactly

---

### Scenario 4: End-to-End User Journey

**Objective**: Simulate complete user workflow from import to reporting.

#### Test Steps

1. **Fresh Start**
   - Clear database (optional):
   ```bash
   rm data/transacta.db
   npm run db:init --workspace=backend
   ```

2. **Import Transactions**
   - Upload `sample-transactions.csv`
   - Verify import success

3. **Review Dashboard**
   - Navigate to Dashboard
   - Verify stats:
     - Total transactions count
     - Unclassified count (should equal total)
     - Pending count (0)
     - Approved count (0)
     - Category count (10 seed categories)

4. **Classify Transactions**
   - Go to Transaction Review page
   - For each unclassified transaction:
     - Request ML suggestion
     - Review confidence score
     - Accept or manually select category
   - Continue until all classified

5. **Verify Dashboard Update**
   - Return to Dashboard
   - Verify stats updated:
     - Unclassified count (0)
     - Approved count (equals total)

6. **Generate Monthly Report**
   - Go to Reports page
   - Select current month
   - Generate report
   - Verify all classified transactions included

7. **Create Custom Category**
   - Go to Categories page
   - Click "Add Category"
   - Enter: Name="Dining Out", Type="Expense", Color="#FF5733"
   - Save
   - Verify category appears in list

8. **Reclassify Transaction**
   - Find a transaction classified as "Entertainment"
   - Change to "Dining Out"
   - Save
   - Regenerate report
   - Verify "Dining Out" appears in report

#### Expected Results

| Step | Expected Outcome | Pass/Fail |
|------|------------------|-----------|
| Import | All transactions imported | ☐ |
| Dashboard stats | Accurate counts displayed | ☐ |
| Classification | All transactions classified | ☐ |
| Stats update | Dashboard reflects changes | ☐ |
| Report generation | Complete report with all data | ☐ |
| Custom category | New category created and usable | ☐ |
| Reclassification | Report updates with new category | ☐ |

---

## Performance Testing

### Load Testing Scenarios

**Large CSV Import**:
- Create CSV with 1000+ transactions
- Upload and measure time
- Expected: < 5 seconds for 1000 transactions

**Bulk Classification**:
- Request suggestions for 100 transactions
- Measure total time
- Expected: < 10 seconds for 100 classifications

**Report Generation**:
- Generate report for month with 500+ transactions
- Measure response time
- Expected: < 2 seconds

### Concurrent User Testing

Simulate multiple users (if possible):
1. User A uploads CSV
2. User B classifies transactions
3. User C generates report
4. Verify no conflicts or errors

---

## Error Handling Testing

### Network Errors

1. **Backend Offline**
   - Stop backend server
   - Try frontend actions
   - Expected: User-friendly error messages

2. **GraphQL Errors**
   - Send invalid GraphQL query
   - Expected: Error response with details

### Data Validation Errors

1. **Invalid Transaction ID**
   - Request classification for non-existent ID
   - Expected: "Transaction not found" error

2. **Invalid Category ID**
   - Classify transaction with invalid category
   - Expected: "Category not found" error

3. **Invalid Date Format**
   - Request report with malformed month
   - Expected: "Invalid date format" error

---

## Browser Compatibility Testing

Test frontend in multiple browsers:

| Browser | Version | CSV Upload | Classification | Reports | Pass/Fail |
|---------|---------|------------|----------------|---------|-----------|
| Chrome | Latest | ☐ | ☐ | ☐ | ☐ |
| Firefox | Latest | ☐ | ☐ | ☐ | ☐ |
| Safari | Latest | ☐ | ☐ | ☐ | ☐ |
| Edge | Latest | ☐ | ☐ | ☐ | ☐ |

---

## Database Integrity Testing

### Referential Integrity

1. **Delete Category with Transactions**
   - Attempt to delete category that has transactions
   - Expected: Error or transactions set to NULL

2. **Orphaned Transactions**
   - Query for transactions with invalid category_id
   - Expected: None found

### Data Consistency

1. **Classification History Sync**
   ```sql
   SELECT t.id, t.category_id, ch.category_id 
   FROM transactions t
   LEFT JOIN classification_history ch ON t.id = ch.transaction_id
   WHERE t.category_id != ch.category_id;
   ```
   - Expected: Empty result (history matches current state)

---

## Test Results Summary Template

```
Integration Test Results - [Date]
Tester: [Name]
Environment: [Local/Staging/Production]

Scenario 1: CSV Import Workflow
- Status: PASS/FAIL
- Issues: [List any issues]

Scenario 2: ML Classification Workflow
- Status: PASS/FAIL
- Issues: [List any issues]

Scenario 3: Report Generation Workflow
- Status: PASS/FAIL
- Issues: [List any issues]

Scenario 4: End-to-End User Journey
- Status: PASS/FAIL
- Issues: [List any issues]

Performance Testing
- Large CSV Import: [Time] - PASS/FAIL
- Bulk Classification: [Time] - PASS/FAIL
- Report Generation: [Time] - PASS/FAIL

Error Handling
- Network Errors: PASS/FAIL
- Data Validation: PASS/FAIL

Browser Compatibility
- Chrome: PASS/FAIL
- Firefox: PASS/FAIL
- Safari: PASS/FAIL
- Edge: PASS/FAIL

Overall Status: PASS/FAIL
Critical Issues: [Count]
Minor Issues: [Count]

Recommendation: READY FOR DEPLOYMENT / NEEDS FIXES
```

---

## Next Steps

After completing integration tests:

1. **Document Issues**: Record all failures in issue tracker
2. **Prioritize Fixes**: Critical issues must be resolved before deployment
3. **Retest**: After fixes, rerun failed scenarios
4. **Sign-off**: Obtain approval from stakeholders
5. **Proceed to Deployment**: Follow deployment-architecture.md

## Automated Integration Testing (Future)

For future iterations, consider implementing:
- Playwright or Cypress for E2E tests
- Automated CSV upload tests
- API integration tests with Supertest
- Database state verification tests
- Performance benchmarking tests

Example future test:
```typescript
// e2e/csv-import.spec.ts
test('complete CSV import workflow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('text=Upload CSV');
  await page.setInputFiles('input[type="file"]', 'sample-transactions.csv');
  await page.click('text=Upload');
  await expect(page.locator('.success-message')).toContainText('Imported');
});
```

---

## Conclusion

These integration tests validate that all system components work together correctly. Complete all scenarios before considering the MVP ready for deployment. Manual testing is thorough but time-consuming; prioritize automation in future sprints.
