# Requirements Clarification Questions

Please answer the following questions to help clarify the requirements for your household spending tracker application.

## Question 1
What type of application interface would you prefer?

A) Web application (browser-based)
B) Desktop application (native app for macOS/Windows/Linux)
C) Mobile application (iOS/Android)
D) Command-line interface (CLI)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How do you want to manage spending classifications/categories?

A) Predefined set of categories (e.g., Groceries, Utilities, Entertainment)
B) Fully customizable categories that I can create and modify
C) Hierarchical categories (e.g., Food > Groceries, Food > Restaurants)
D) Tags-based system (multiple tags per transaction)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
What CSV format does your bank provide? (This helps us parse the files correctly)

A) Standard format with columns: Date, Description, Amount, Balance
B) Custom format (I can provide a sample)
C) Multiple banks with different formats
D) I'm not sure yet
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
How should the machine learning classification work?

A) Suggest classification based on transaction description text matching
B) Learn from my past classifications and suggest based on patterns
C) Use both description matching and learning from past behavior
D) Allow me to create rules (e.g., "if description contains 'SAFEWAY' then classify as 'Groceries'")
E) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 5
How do you want to approve/review transactions?

A) Review all transactions one-by-one before they're saved
B) Auto-approve high-confidence suggestions, manually review uncertain ones
C) Bulk approve all suggestions, then manually fix incorrect ones
D) Review only new/unrecognized transactions
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
What kind of reporting and visualization do you need?

A) Simple monthly totals by category (text/table format)
B) Charts and graphs (pie charts, bar charts, trend lines)
C) Comparison across months (e.g., "spending this month vs last month")
D) Detailed drill-down reports (click category to see all transactions)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
Where should the data be stored?

A) Local database file (SQLite) - data stays on my computer
B) Cloud database - accessible from multiple devices
C) Simple file-based storage (JSON/CSV files)
D) I want to choose later based on the implementation
E) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8
Do you need multi-user support or is this single-user?

A) Single user only (just for me)
B) Multiple users with separate accounts (family members)
C) Multiple users with shared data (household view)
D) Not sure yet
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
What programming language/technology would you prefer?

A) Python (good for ML, data processing, and quick development)
B) JavaScript/TypeScript (Node.js backend, React/Vue frontend)
C) Java or C# (enterprise-grade, strongly typed)
D) No preference - choose what's best for the project
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 10
How important is the machine learning accuracy initially?

A) Critical - I want sophisticated ML from the start
B) Important - basic pattern matching is fine to start, can improve later
C) Nice to have - simple rule-based matching is acceptable initially
D) Not sure - recommend what's appropriate
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 11
Do you need to handle multiple currencies or just one?

A) Single currency only
B) Multiple currencies with conversion
C) Multiple currencies without conversion (track separately)
D) Not sure yet
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 12
What time period of historical data do you expect to import?

A) Just going forward from now
B) Last few months (< 6 months)
C) Last year or two
D) Several years of historical data
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

**Instructions**: Please fill in your answer choice (A, B, C, D, or E) after each [Answer]: tag. If you choose "Other", please add a brief description of your preference. Let me know when you're done!
