# Manual Testing Checklist - Household Spending Tracker MVP

## Overview

This checklist provides a systematic approach to manually testing all MVP features. Use this document to ensure comprehensive coverage of functionality before deployment.

**Testing Date**: _______________  
**Tester Name**: _______________  
**Build Version**: _______________  
**Environment**: ☐ Local ☐ Staging ☐ Production

---

## Pre-Testing Setup

### Environment Verification

- [ ] Node.js version 18+ installed
- [ ] Backend running on http://localhost:4000
- [ ] Frontend running on http://localhost:5173
- [ ] Database initialized with seed data
- [ ] Sample CSV file available
- [ ] Browser developer console open (F12)
- [ ] No console errors on page load

### Database Reset (Optional)

```bash
rm data/transacta.db
npm run db:init --workspace=backend
npm run dev --workspace=backend
```

---

## Feature 1: CSV Import

### 1.1 Basic CSV Upload

- [ ] Navigate to upload page
- [ ] "Choose File" button is visible and clickable
- [ ] Click "Choose File" and select `sample-transactions.csv`
- [ ] File name displays after selection
- [ ] "Upload" button is enabled
- [ ] Click "Upload" button
- [ ] Progress indicator shows during upload
- [ ] Success message displays: "X transactions imported successfully"
- [ ] Transaction count is accurate
- [ ] No error messages appear

**Expected Result**: All transactions from CSV are imported successfully.

**Actual Result**: _______________________________________________

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 1.2 File Validation

- [ ] Try to upload a .txt file
- [ ] Error message: "Please upload a CSV file"
- [ ] Try to upload a .xlsx file
- [ ] Error message: "Please upload a CSV file"
- [ ] Try to upload empty CSV (headers only)
- [ ] Error message: "No transactions found"

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 1.3 Duplicate Detection

- [ ] Upload same CSV file again
- [ ] Message displays: "X duplicates skipped"
- [ ] No new transactions added to database
- [ ] Transaction count remains unchanged
- [ ] Verify in database:
  ```bash
  sqlite3 data/transacta.db "SELECT COUNT(*) FROM transactions;"
  ```

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 1.4 Malformed CSV Handling

- [ ] Create CSV with missing required columns
- [ ] Upload malformed CSV
- [ ] Error message displays with specific issue
- [ ] No partial import occurs
- [ ] Database remains in consistent state

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

---

## Feature 2: Transaction Review

### 2.1 Transaction List Display

- [ ] Navigate to "Review Transactions" page
- [ ] All imported transactions display
- [ ] Each transaction shows:
  - [ ] Date (formatted correctly)
  - [ ] Description/Payee
  - [ ] Amount (with currency symbol)
  - [ ] Category (or "Uncategorized")
  - [ ] Status indicator
- [ ] Transactions are sorted by date (newest first)
- [ ] Pagination works (if implemented)
- [ ] No duplicate transactions visible

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 2.2 Transaction Filtering

- [ ] Filter by date range
- [ ] Only transactions in range display
- [ ] Filter by category
- [ ] Only transactions in category display
- [ ] Filter by status (classified/unclassified)
- [ ] Correct transactions display
- [ ] Clear filters button works
- [ ] All transactions return after clearing

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 2.3 Transaction Search

- [ ] Search by description/payee
- [ ] Matching transactions display
- [ ] Search is case-insensitive
- [ ] Partial matches work
- [ ] Clear search returns all transactions

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

---

## Feature 3: ML Classification

### 3.1 Get Classification Suggestion

- [ ] Select an unclassified transaction
- [ ] Click "Get Suggestion" or similar button
- [ ] Suggested category displays
- [ ] Confidence score displays (e.g., "85%")
- [ ] Suggestion is reasonable for the payee
- [ ] Response time < 2 seconds

**Test Cases**:

| Payee | Expected Category | Confidence | Actual Category | Pass/Fail |
|-------|-------------------|------------|-----------------|-----------|
| Grocery Store | Groceries | High | _____________ | ☐ |
| Power Company | Utilities | High | _____________ | ☐ |
| Netflix | Entertainment | High | _____________ | ☐ |
| Salary | Income | High | _____________ | ☐ |
| Unknown Store | Various | Low | _____________ | ☐ |

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 3.2 Accept ML Suggestion

- [ ] Get suggestion for a transaction
- [ ] Click "Accept" or "Approve"
- [ ] Transaction category updates to suggested category
- [ ] Confidence score is saved
- [ ] Status changes to "Approved" or "Classified"
- [ ] Success message displays
- [ ] Change persists after page refresh

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 3.3 Reject ML Suggestion (Manual Override)

- [ ] Get suggestion for a transaction
- [ ] Manually select different category from dropdown
- [ ] Click "Save" or "Update"
- [ ] Transaction updates to manual category (not suggestion)
- [ ] Classification method recorded as "Manual"
- [ ] Success message displays
- [ ] Change persists after page refresh

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 3.4 Bulk Classification

- [ ] Select multiple transactions (checkboxes)
- [ ] Click "Get Suggestions for Selected" (if available)
- [ ] Suggestions display for all selected
- [ ] Click "Accept All Suggestions"
- [ ] All selected transactions update
- [ ] Success message shows count
- [ ] Changes persist

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

---

## Feature 4: Category Management

### 4.1 View Categories

- [ ] Navigate to "Categories" page
- [ ] All seed categories display (10 default)
- [ ] Each category shows:
  - [ ] Name
  - [ ] Type (Income/Expense)
  - [ ] Color indicator (if implemented)
  - [ ] Transaction count (if implemented)
- [ ] Categories are sorted alphabetically or by type

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 4.2 Create New Category

- [ ] Click "Add Category" button
- [ ] Form displays with fields:
  - [ ] Name (text input)
  - [ ] Type (dropdown: Income/Expense)
  - [ ] Color (color picker, optional)
- [ ] Enter name: "Test Category"
- [ ] Select type: "Expense"
- [ ] Click "Save"
- [ ] Success message displays
- [ ] New category appears in list
- [ ] Category has unique ID
- [ ] Verify in database:
  ```bash
  sqlite3 data/transacta.db "SELECT * FROM categories WHERE name='Test Category';"
  ```

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 4.3 Edit Category

- [ ] Click "Edit" on existing category
- [ ] Form pre-fills with current values
- [ ] Change name: "Groceries" → "Food & Groceries"
- [ ] Click "Save"
- [ ] Success message displays
- [ ] Category name updates in list
- [ ] Navigate to transactions page
- [ ] Transactions with this category show updated name
- [ ] Change persists after page refresh

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 4.4 Delete Category

- [ ] Create a new category with no transactions
- [ ] Click "Delete" on the new category
- [ ] Confirmation dialog appears
- [ ] Click "Confirm"
- [ ] Category removed from list
- [ ] Success message displays
- [ ] Try to delete category with transactions
- [ ] Warning message or prevention mechanism
- [ ] Category with transactions not deleted

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 4.5 Category Validation

- [ ] Try to create category with empty name
- [ ] Validation error: "Name is required"
- [ ] Try to create category with duplicate name
- [ ] Validation error: "Category already exists"
- [ ] Try to create category with special characters
- [ ] Category saves correctly with special characters

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

---

## Feature 5: Reporting

### 5.1 Monthly Report Generation

- [ ] Navigate to "Reports" page
- [ ] Month selector displays
- [ ] Select current month
- [ ] Click "Generate Report"
- [ ] Report loads within 2 seconds
- [ ] Report displays:
  - [ ] Month header (e.g., "January 2024")
  - [ ] Total expenses (negative amount)
  - [ ] Total income (positive amount)
  - [ ] Net amount (income - expenses)
  - [ ] Transaction count
  - [ ] Category breakdown table/chart

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 5.2 Category Breakdown Accuracy

- [ ] Each category in report shows:
  - [ ] Category name
  - [ ] Total amount
  - [ ] Transaction count
  - [ ] Percentage of total
- [ ] Percentages sum to ~100%
- [ ] Amounts match database query:
  ```bash
  sqlite3 data/transacta.db "
    SELECT c.name, SUM(t.amount), COUNT(t.id)
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.date >= '2024-01-01' AND t.date < '2024-02-01'
    GROUP BY c.name;
  "
  ```
- [ ] Manual calculation matches report

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 5.3 Date Range Selection

- [ ] Select "Last 7 days"
- [ ] Report updates with correct date range
- [ ] Select "Last 30 days"
- [ ] Report updates with correct date range
- [ ] Select custom date range
- [ ] Report updates with custom range
- [ ] Invalid date range shows error

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 5.4 Visual Representation

- [ ] Chart/graph displays (if implemented)
- [ ] Chart data matches table data
- [ ] Chart is readable and properly labeled
- [ ] Chart responds to window resize
- [ ] Chart colors match category colors

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 5.5 Report Export (if implemented)

- [ ] Click "Export" button
- [ ] Format options display (CSV, PDF)
- [ ] Select CSV format
- [ ] File downloads successfully
- [ ] Open downloaded file
- [ ] Data matches report display
- [ ] Repeat for PDF format

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

---

## Feature 6: Dashboard

### 6.1 Dashboard Statistics

- [ ] Navigate to Dashboard/Home page
- [ ] Dashboard displays:
  - [ ] Total transactions count
  - [ ] Unclassified transactions count
  - [ ] Classified transactions count
  - [ ] Total categories count
  - [ ] Recent transactions list (5-10)
  - [ ] Quick stats (total spent this month, etc.)
- [ ] All counts are accurate
- [ ] Stats update after classification

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 6.2 Quick Actions

- [ ] "Upload CSV" button navigates to upload page
- [ ] "Review Transactions" button navigates to review page
- [ ] "View Reports" button navigates to reports page
- [ ] All navigation works correctly

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

---

## Non-Functional Testing

### 7.1 Performance

- [ ] Page load time < 2 seconds
- [ ] CSV upload (100 transactions) < 3 seconds
- [ ] Report generation < 2 seconds
- [ ] Classification suggestion < 1 second
- [ ] No noticeable lag in UI interactions

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 7.2 Responsiveness

- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Layout adapts correctly to all sizes
- [ ] No horizontal scrolling
- [ ] All buttons/inputs are accessible
- [ ] Text is readable at all sizes

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 7.3 Browser Compatibility

Test in multiple browsers:

| Browser | Version | All Features Work | Notes |
|---------|---------|-------------------|-------|
| Chrome | _______ | ☐ Pass ☐ Fail | _____ |
| Firefox | _______ | ☐ Pass ☐ Fail | _____ |
| Safari | _______ | ☐ Pass ☐ Fail | _____ |
| Edge | _______ | ☐ Pass ☐ Fail | _____ |

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 7.4 Error Handling

- [ ] Stop backend server
- [ ] Try to perform frontend action
- [ ] User-friendly error message displays
- [ ] No cryptic error codes shown
- [ ] Restart backend
- [ ] Application recovers gracefully
- [ ] Test with invalid GraphQL query
- [ ] Error response is handled properly

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 7.5 Data Persistence

- [ ] Classify several transactions
- [ ] Refresh browser page
- [ ] All classifications persist
- [ ] Close browser completely
- [ ] Reopen and navigate to app
- [ ] All data still present
- [ ] Restart backend server
- [ ] All data still present

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

### 7.6 Security

- [ ] Check for exposed API keys in frontend code
- [ ] Verify CORS is properly configured
- [ ] Test SQL injection in search fields
- [ ] Test XSS in transaction descriptions
- [ ] Verify no sensitive data in browser console
- [ ] Check network tab for secure connections

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

---

## End-to-End User Journey

### 8.1 Complete Workflow

- [ ] Start with clean database
- [ ] Upload CSV with 20+ transactions
- [ ] Review all transactions
- [ ] Get ML suggestions for 10 transactions
- [ ] Accept 5 suggestions
- [ ] Manually classify 5 transactions
- [ ] Create 1 custom category
- [ ] Assign custom category to 2 transactions
- [ ] Generate monthly report
- [ ] Verify report includes all classifications
- [ ] Export report (if available)
- [ ] Verify exported data is correct

**Status**: ☐ Pass ☐ Fail

**Notes**: _______________________________________________

---

## Bug Reporting Template

If any test fails, document the bug using this template:

```
Bug ID: _______________
Date Found: _______________
Tester: _______________

Title: [Brief description]

Severity: ☐ Critical ☐ High ☐ Medium ☐ Low

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:


Actual Result:


Screenshots/Logs:


Environment:
- OS: _______________
- Browser: _______________
- Build Version: _______________

Additional Notes:

```

---

## Test Summary

**Total Tests**: _______  
**Passed**: _______  
**Failed**: _______  
**Pass Rate**: _______%

### Critical Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Minor Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Overall Assessment

☐ **Ready for Deployment** - All critical tests passed, minor issues documented  
☐ **Needs Fixes** - Critical issues must be resolved before deployment  
☐ **Major Rework Required** - Significant issues found, requires development iteration

### Tester Sign-off

**Name**: _______________  
**Date**: _______________  
**Signature**: _______________

### Reviewer Sign-off

**Name**: _______________  
**Date**: _______________  
**Signature**: _______________

---

## Next Steps

After completing this checklist:

1. **Document all bugs** in issue tracking system
2. **Prioritize fixes** (Critical → High → Medium → Low)
3. **Retest failed scenarios** after fixes
4. **Update build-and-test-summary.md** with results
5. **Obtain stakeholder approval** for deployment
6. **Proceed to deployment** if all critical tests pass

## References

- [Build Instructions](./build-instructions.md)
- [Integration Test Instructions](./integration-test-instructions.md)
- [Unit Test Instructions](./unit-test-instructions.md)
- [Build and Test Summary](./build-and-test-summary.md)
