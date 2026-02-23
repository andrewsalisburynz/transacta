# Functional Design Plan - Household Spending Tracker

## Overview
This plan defines the detailed business logic, domain models, business rules, and frontend component specifications for the Household Spending Tracker application. This is a technology-agnostic functional design focused on business behavior.

---

## Part 1: Planning Questions

### Q1: CSV Parsing Business Rules
The CSV parser needs to handle various data quality issues. What business rules should apply?

**Options**:
A. Strict validation - Reject entire CSV if any row has invalid data (date format, missing required fields, invalid amount)
B. Lenient validation - Skip invalid rows, import valid ones, provide detailed error report
C. Interactive validation - Pause on errors, allow user to correct data inline before continuing
D. Configurable validation - User sets strictness level (strict/lenient) in settings

[Answer]: C

---

### Q2: Duplicate Detection Algorithm
The duplicate detection needs to identify same transactions. What matching criteria should be used?

**Options**:
A. Exact match only - Date, Amount, Payee, Reference must all match exactly
B. Fuzzy match - Allow minor variations in Payee (typos, extra spaces), exact match on Date/Amount/Reference
C. Configurable match - User defines which fields to use for duplicate detection
D. Smart match - Exact match on Date/Amount, fuzzy match on Payee, ignore Reference if empty

[Answer]: A

---

### Q3: Duplicate Detection Action
When duplicates are found, what should happen?

**Options**:
A. Auto-skip duplicates - Automatically skip all duplicates, show summary after import
B. Prompt user - Show duplicate list, let user decide: skip all, import all, or review individually
C. Mark as duplicates - Import all but flag duplicates for user review
D. Configurable default - User sets default action in settings, can override per import

[Answer]: A

---

### Q4: Transaction Amount Validation
Transaction amounts can be positive (income) or negative (expenses). How should this be handled?

**Options**:
A. Store as-is - Keep amounts exactly as in CSV (negative for expenses, positive for income)
B. Normalize to positive - Store all amounts as positive, use separate "type" field (income/expense)
C. Infer from amount - Negative = expense, Positive = income, auto-set transaction type
D. User confirmation - If amount sign doesn't match typical pattern, ask user to confirm

[Answer]: A

---

### Q5: Date Parsing and Validation
CSV dates may be in various formats. How should date parsing work?

**Options**:
A. Single format only - Require specific format (e.g., YYYY-MM-DD), reject others
B. Auto-detect format - Try common formats (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY), use first that works
C. User-specified format - User provides date format pattern in settings
D. Smart parsing - Try multiple formats, if ambiguous (e.g., 01/02/2024), ask user to clarify

[Answer]: B

---

### Q6: ML Feature Extraction
The ML engine extracts features from transactions. What features should be used?

**Options**:
A. Text only - Payee and Particulars text (tokenized, normalized)
B. Text + metadata - Payee, Particulars, Transaction Type, Amount range
C. Text + patterns - Payee, Particulars, Transaction Type, Amount range, Day of month, Day of week
D. Minimal features - Payee text only (simplest approach)

[Answer]: C

---

### Q7: ML Confidence Calculation
How should the ML confidence score be calculated?

**Options**:
A. Model probability - Use raw probability output from ML model (0.0-1.0)
B. Adjusted probability - Scale model probability based on training data size (lower confidence if few examples)
C. Multi-factor score - Combine model probability, exact match bonus, frequency bonus, recency bonus
D. Simple threshold - Binary high/low based on whether probability exceeds threshold

[Answer]: C

---

### Q8: ML Training Strategy
When should the ML model be retrained?

**Options**:
A. After every classification - Retrain immediately after each user classification
B. Batch retraining - Retrain after N classifications (e.g., every 10 classifications)
C. Session-based - Retrain once at end of classification session
D. Manual trigger - User manually triggers retraining when desired

[Answer]: C

---

### Q9: Auto-Approval Threshold
What confidence threshold should trigger auto-approval?

**Options**:
A. Fixed threshold - 80% confidence (as specified in requirements)
B. Adaptive threshold - Start at 90%, lower to 80% after 50 training examples, 70% after 100 examples
C. User-configurable - User sets threshold in settings (default 80%)
D. Category-specific - Different thresholds per category (higher for important categories)

[Answer]: B

---

### Q10: New Merchant Handling
When a new merchant is encountered, how should classification work?

**Options**:
A. No suggestion - Leave unclassified, require manual classification
B. Fuzzy match - Find similar merchant names, suggest their category with low confidence
C. Keyword match - Match keywords in merchant name to category names
D. Hybrid approach - Try fuzzy match first, fall back to keyword match, otherwise leave unclassified

[Answer]: D

---

### Q11: Category Name Validation
What validation rules should apply to category names?

**Options**:
A. Basic validation - Non-empty, unique, max 50 characters
B. Strict validation - Non-empty, unique, max 50 characters, alphanumeric + spaces only, no leading/trailing spaces
C. Lenient validation - Non-empty, unique, max 100 characters, trim whitespace
D. User-friendly validation - Non-empty, unique (case-insensitive), max 50 characters, trim whitespace, allow special characters

[Answer]: D

---

### Q12: Category Deletion with Transactions
When user tries to delete a category with transactions, what should happen?

**Options**:
A. Block deletion - Show error message, require user to reclassify transactions first
B. Prompt reassignment - Show dialog to select replacement category, reassign all transactions
C. Unclassify transactions - Set all transactions to "unclassified" status
D. Soft delete - Mark category as deleted but keep in database, hide from UI

[Answer]: B

---

### Q13: Report Date Range
For monthly reports, what date range should be used?

**Options**:
A. Calendar month - 1st to last day of month (e.g., Jan 1-31)
B. Statement period - User-defined start day (e.g., 15th of month to 14th of next month)
C. Flexible range - User can select any start/end date
D. Calendar month default - Default to calendar month, allow user to adjust dates

[Answer]: A

---

### Q14: Report Category Sorting
How should categories be sorted in reports?

**Options**:
A. By amount descending - Highest spending first (as specified in requirements)
B. Alphabetical - Category name A-Z
C. User-configurable - User chooses sort order (amount, name, transaction count)
D. Smart sorting - Expenses by amount descending, Income by amount descending, separate sections

[Answer]: B

---

### Q15: Report Empty Categories
Should categories with $0 spending be shown in reports?

**Options**:
A. Hide empty - Only show categories with transactions in selected period
B. Show all - Show all categories, display $0 for empty ones
C. User preference - Setting to show/hide empty categories
D. Conditional - Show empty if user has < 10 categories, hide if more

[Answer]: B

---

### Q16: Transaction Review Queue Sorting
How should transactions be sorted in the review queue?

**Options**:
A. Date descending - Most recent first (as specified in requirements)
B. Confidence ascending - Lowest confidence first (most uncertain)
C. Amount descending - Highest amounts first (most important)
D. User-configurable - User chooses sort order

[Answer]: Date ascending - Oldest first

---

### Q17: Frontend State Management
How should frontend components manage state?

**Options**:
A. Component state only - Each component manages its own state with Vue data/computed
B. Vuex store - Centralized state management for all application state
C. Hybrid approach - Component state for UI, Vuex for shared data (transactions, categories)
D. Composition API - Use Vue 3 Composition API with composables for shared logic

[Answer]: A

---

### Q18: Frontend Form Validation
How should form validation work in frontend components?

**Options**:
A. Client-side only - Validate in frontend, trust validation before API call
B. Server-side only - Send to API, display errors returned from server
C. Both sides - Validate in frontend for UX, validate in backend for security
D. Progressive validation - Validate on blur/change in frontend, final validation on submit in backend

[Answer]: D

---

### Q19: Frontend Error Display
How should errors be displayed to users?

**Options**:
A. Toast notifications - Temporary pop-up messages that auto-dismiss
B. Inline errors - Show errors next to relevant form fields or components
C. Modal dialogs - Show errors in modal that requires user acknowledgment
D. Hybrid approach - Inline for validation errors, toast for success/info, modal for critical errors

[Answer]: D

---

### Q20: Frontend Loading States
How should loading states be handled during async operations?

**Options**:
A. Global spinner - Full-page loading overlay for all async operations
B. Component spinners - Each component shows its own loading indicator
C. Skeleton screens - Show placeholder content while loading
D. Hybrid approach - Skeleton for initial load, component spinners for updates, global for critical operations

[Answer]: D

---

## Part 2: Generation Plan

Based on the answers above, the following artifacts will be generated:

### Mandatory Artifacts
- [x] Generate `aidlc-docs/construction/household-spending-tracker/functional-design/business-logic-model.md`
  - [x] CSV parsing and validation logic
  - [x] Duplicate detection algorithm
  - [x] Transaction data transformation logic
  - [x] ML classification algorithm
  - [x] ML feature extraction logic
  - [x] ML confidence calculation logic
  - [x] ML training workflow
  - [x] Auto-approval logic
  - [x] Report generation logic
  - [x] Category management logic

- [x] Generate `aidlc-docs/construction/household-spending-tracker/functional-design/business-rules.md`
  - [x] CSV validation rules
  - [x] Transaction validation rules (amount, date, required fields)
  - [x] Duplicate detection rules
  - [x] Category validation rules (name uniqueness, length, characters)
  - [x] Category deletion rules
  - [x] ML confidence threshold rules
  - [x] Auto-approval rules
  - [x] Report date range rules
  - [x] Data integrity rules

- [x] Generate `aidlc-docs/construction/household-spending-tracker/functional-design/domain-entities.md`
  - [x] Transaction entity (properties, relationships, lifecycle states)
  - [x] Category entity (properties, relationships, constraints)
  - [x] ClassificationResult entity (properties, relationships)
  - [x] Report entity (properties, aggregations)
  - [x] CSVRow entity (properties, validation)
  - [x] MLModel entity (properties, metadata)
  - [x] Entity relationships and cardinality
  - [x] Entity state transitions

- [x] Generate `aidlc-docs/construction/household-spending-tracker/functional-design/frontend-components.md`
  - [x] Component hierarchy and structure
  - [x] Props and state definitions for each component
  - [x] User interaction flows (click, drag-drop, form submit)
  - [x] Form validation rules (client-side)
  - [x] Error handling and display patterns
  - [x] Loading state patterns
  - [x] API integration points (which GraphQL operations each component uses)
  - [x] Component communication patterns (events, props)
  - [x] Routing and navigation logic

### Validation Steps
- [x] Validate business logic covers all user stories
- [x] Ensure business rules are complete and unambiguous
- [x] Verify domain entities match database schema
- [x] Check frontend components match application design
- [x] Ensure all edge cases are handled
- [x] Verify consistency across all artifacts

---

## Completion Criteria
- All planning questions answered
- All ambiguities resolved
- User approval obtained
- All generation steps completed and marked [x]
- All functional design artifacts generated and validated


---

## Part 3: Clarification Questions

### Clarification 1: Report Category Sorting Conflict
**Issue**: Your answer for Q14 (Alphabetical sorting) conflicts with the original requirement in Story 5.1 which states "Report shows categories sorted by spending amount (highest first)".

**Question**: Which sorting should be used for monthly reports?
A. Alphabetical (as answered in Q14)
B. By amount descending (as specified in Story 5.1)
C. User-configurable (allow user to toggle between alphabetical and amount sorting)

[Answer]: A

---

### Clarification 2: Transaction Review Queue Sorting Conflict
**Issue**: Your answer for Q16 (Date ascending - Oldest first) conflicts with the original requirement in Story 4.1 which states "Transactions are sorted by date (most recent first)".

**Question**: Which sorting should be used for the transaction review queue?
A. Date ascending - Oldest first (as answered in Q16)
B. Date descending - Most recent first (as specified in Story 4.1)
C. User-configurable (allow user to toggle between oldest/newest first)

[Answer]: A

---
