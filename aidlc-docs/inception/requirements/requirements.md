# Requirements Document - Household Spending Tracker

## Intent Analysis Summary

### User Request
Create a household spending tracker application that imports bank transaction CSV files, automatically classifies transactions using machine learning, allows manual approval/correction of classifications, and provides monthly spending reports by category.

### Request Type
**New Project** (Greenfield) - Complete application development from scratch

### Scope Estimate
**Multiple Components** - CSV parser, ML classification engine, transaction management, category management, reporting system, web UI

### Complexity Estimate
**Moderate to Complex** - Involves data processing, machine learning, database design, web application development, and user workflow management

---

## Functional Requirements

### FR1: CSV Import and Parsing
- **FR1.1**: System shall accept CSV file uploads through web interface
- **FR1.2**: System shall parse custom bank CSV format with 14 columns:
  - Date, Amount, Payee, Particulars, Code, Reference, Tran Type
  - This Party Account, Other Party Account, Serial, Transaction Code
  - Batch Number, Originating Bank/Branch, Processed Date
- **FR1.3**: System shall validate CSV format and provide clear error messages for invalid files
- **FR1.4**: System shall handle both positive (income) and negative (expense) amounts
- **FR1.5**: System shall extract key fields for classification: Date, Amount, Payee, Particulars, Tran Type

### FR2: Category Management
- **FR2.1**: System shall allow users to create custom spending categories
- **FR2.2**: System shall allow users to edit and delete categories
- **FR2.3**: System shall prevent deletion of categories that have associated transactions (or provide reassignment option)
- **FR2.4**: System shall store category definitions persistently
- **FR2.5**: System shall support unlimited number of user-defined categories

### FR3: Machine Learning Classification
- **FR3.1**: System shall use sophisticated ML to suggest transaction classifications
- **FR3.2**: ML engine shall use both:
  - Text matching on transaction description (Payee, Particulars fields)
  - Pattern learning from user's historical classification decisions
- **FR3.3**: System shall provide confidence score for each classification suggestion
- **FR3.4**: System shall improve classification accuracy over time as more transactions are classified
- **FR3.5**: System shall handle new/unseen merchants by finding similar patterns in historical data
- **FR3.6**: ML model shall be trained on user's classification history stored in SQLite database

### FR4: Transaction Review and Approval
- **FR4.1**: System shall automatically approve high-confidence classification suggestions
- **FR4.2**: System shall flag low-confidence transactions for manual review
- **FR4.3**: System shall provide interface to review flagged transactions
- **FR4.4**: System shall allow user to accept suggested classification
- **FR4.5**: System shall allow user to manually select different category
- **FR4.6**: System shall save user's classification decision to improve future ML predictions
- **FR4.7**: System shall display transaction details (date, payee, amount, particulars) during review

### FR5: Transaction Management
- **FR5.1**: System shall store all imported transactions in SQLite database
- **FR5.2**: System shall prevent duplicate transaction imports (detect by date, amount, payee, reference)
- **FR5.3**: System shall allow users to view all transactions
- **FR5.4**: System shall allow users to edit transaction classifications after initial approval
- **FR5.5**: System shall maintain transaction history and classification changes

### FR6: Reporting and Analytics
- **FR6.1**: System shall generate monthly spending totals by category
- **FR6.2**: System shall display reports in simple text/table format
- **FR6.3**: System shall allow user to select specific month for reporting
- **FR6.4**: System shall calculate total spending per category for selected month
- **FR6.5**: System shall show both income and expense categories separately
- **FR6.6**: System shall display transaction count per category

---

## Non-Functional Requirements

### NFR1: Technology Stack
- **NFR1.1**: Backend shall be built with Node.js and TypeScript
- **NFR1.2**: Frontend shall be built with modern JavaScript framework (React or Vue)
- **NFR1.3**: Database shall be SQLite for local data storage
- **NFR1.4**: ML implementation shall use JavaScript/TypeScript ML libraries (e.g., TensorFlow.js, natural, compromise)

### NFR2: Performance
- **NFR2.1**: CSV import shall process files with up to 1000 transactions within 5 seconds
- **NFR2.2**: ML classification shall provide suggestions within 2 seconds per transaction
- **NFR2.3**: Report generation shall complete within 3 seconds for up to 12 months of data
- **NFR2.4**: Web interface shall be responsive and load pages within 1 second

### NFR3: Usability
- **NFR3.1**: Web interface shall be intuitive and require minimal training
- **NFR3.2**: CSV upload shall support drag-and-drop functionality
- **NFR3.3**: Transaction review interface shall clearly indicate confidence levels
- **NFR3.4**: Error messages shall be clear and actionable
- **NFR3.5**: Application shall work on modern web browsers (Chrome, Firefox, Safari, Edge)

### NFR4: Data Storage and Security
- **NFR4.1**: All data shall be stored locally in SQLite database
- **NFR4.2**: Database file shall be stored in user-accessible location
- **NFR4.3**: No data shall be transmitted to external servers
- **NFR4.4**: Application shall handle sensitive financial data securely
- **NFR4.5**: Database shall support backup and restore functionality

### NFR5: Scalability
- **NFR5.1**: System shall handle up to 10,000 transactions efficiently
- **NFR5.2**: ML model shall scale with increasing training data
- **NFR5.3**: Database queries shall remain performant as data grows

### NFR6: Maintainability
- **NFR6.1**: Code shall follow TypeScript best practices and style guidelines
- **NFR6.2**: Code shall be well-documented with comments
- **NFR6.3**: Application shall have modular architecture for easy updates
- **NFR6.4**: ML model shall be retrained automatically as new data is added

### NFR7: Single User Support
- **NFR7.1**: Application shall be designed for single-user use
- **NFR7.2**: No authentication or user management required
- **NFR7.3**: All data belongs to single user running the application

### NFR8: Currency Support
- **NFR8.1**: Application shall handle single currency only (NZD based on CSV sample)
- **NFR8.2**: Currency symbol and formatting shall be configurable

---

## User Scenarios

### Scenario 1: First-Time Setup
1. User launches web application
2. User creates initial spending categories (e.g., Groceries, Utilities, Entertainment, Savings)
3. User uploads first CSV file from bank
4. System parses CSV and displays transactions
5. User manually classifies first batch of transactions
6. System learns from initial classifications

### Scenario 2: Regular CSV Import
1. User downloads monthly CSV from bank
2. User uploads CSV to application
3. System parses transactions and applies ML classification
4. System auto-approves high-confidence transactions
5. System flags uncertain transactions for review
6. User reviews flagged transactions and approves/corrects classifications
7. System saves all transactions and updates ML model

### Scenario 3: Monthly Reporting
1. User navigates to reports section
2. User selects month to view
3. System displays spending totals by category
4. User reviews spending patterns
5. User identifies categories with high spending

### Scenario 4: Category Management
1. User realizes need for new category (e.g., "Healthcare")
2. User creates new category
3. User finds existing transactions that should be in new category
4. User reclassifies transactions to new category
5. System updates ML model with new classification patterns

### Scenario 5: Handling New Merchants
1. User imports CSV with transaction from new merchant
2. ML system finds similar merchants in history
3. System suggests classification based on similar patterns
4. User reviews and approves/corrects suggestion
5. System learns merchant classification for future

---

## Technical Context

### CSV Format Details
Bank provides CSV with following structure:
```
Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date
```

**Key Fields for Classification:**
- **Payee**: Primary merchant/transaction name
- **Particulars**: Additional transaction details
- **Tran Type**: Transaction type (POS, FT, etc.)
- **Amount**: Negative for expenses, positive for income

### ML Classification Strategy
1. **Feature Extraction**: Extract text features from Payee and Particulars
2. **Pattern Matching**: Use string similarity for known merchants
3. **Learning Model**: Train classification model on user's historical decisions
4. **Confidence Scoring**: Calculate confidence based on feature similarity and model certainty
5. **Threshold**: Auto-approve above 80% confidence, flag below for review

### Data Storage Schema (Conceptual)
- **Transactions Table**: Store all transaction data with classification
- **Categories Table**: Store user-defined categories
- **Classification History**: Store ML training data
- **ML Model State**: Persist trained model parameters

---

## Success Criteria

1. **CSV Import Success**: User can successfully import bank CSV files without errors
2. **Classification Accuracy**: ML achieves >80% accuracy after 100 classified transactions
3. **Review Efficiency**: User spends <30 seconds per flagged transaction
4. **Report Usefulness**: User can generate monthly reports in <5 clicks
5. **Learning Improvement**: Classification accuracy improves measurably over time
6. **User Satisfaction**: User finds application intuitive and time-saving

---

## Out of Scope (Future Enhancements)

- Multi-user support
- Multiple bank account tracking
- Multiple currency support
- Historical data import (several years)
- Advanced visualizations (charts, graphs)
- Mobile application
- Cloud synchronization
- Budget planning and alerts
- Recurring transaction detection
- Export functionality

---

## Assumptions

1. User has basic computer literacy and web browser access
2. Bank CSV format remains consistent over time
3. User will provide initial training data by classifying first batch of transactions
4. SQLite database is sufficient for expected data volume
5. User's computer has sufficient resources to run local web server
6. User is comfortable with command-line setup (npm install, npm start)

---

## Dependencies

1. Node.js runtime environment
2. TypeScript compiler
3. Web framework (React or Vue)
4. SQLite database library
5. ML/NLP libraries for JavaScript/TypeScript
6. CSV parsing library
7. Modern web browser

---

## Constraints

1. Must work offline (local-only application)
2. Must use JavaScript/TypeScript ecosystem
3. Must use SQLite for data storage
4. Must handle custom CSV format with 14 columns
5. Single user only
6. Single currency only
7. Web-based interface only

