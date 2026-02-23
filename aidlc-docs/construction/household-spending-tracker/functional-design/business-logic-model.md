# Business Logic Model - Household Spending Tracker

## Purpose
This document defines the detailed business logic and algorithms for the Household Spending Tracker application. This is technology-agnostic and focuses purely on business behavior.

---

## 1. CSV Parsing and Validation Logic

### 1.1 CSV Upload Workflow

```
User uploads CSV file
    ↓
Validate file format (must be .csv)
    ↓
Read file content into buffer
    ↓
Parse CSV structure
    ↓
Validate CSV columns (14 expected columns)
    ↓
FOR EACH row in CSV:
    Parse row data
    Validate row data
    IF validation fails:
        Pause import
        Show error to user with row details
        Allow user to:
            - Skip this row
            - Edit data inline
            - Cancel entire import
    Transform data types
    Normalize data
    ↓
Check for duplicates
    ↓
IF duplicates found:
    Auto-skip duplicates
    Show summary (X duplicates skipped)
    ↓
Import valid transactions to database
    ↓
Trigger ML classification workflow
    ↓
Show import summary to user
```

### 1.2 CSV Structure Validation

**Algorithm**:
```
FUNCTION validateCSVStructure(csvData):
    expectedColumns = [
        "Date", "Amount", "Payee", "Particulars", "Code", 
        "Reference", "Tran Type", "This Party Account", 
        "Other Party Account", "Serial", "Transaction Code", 
        "Batch Number", "Originating Bank/Branch", "Processed Date"
    ]
    
    actualColumns = csvData.headers
    
    IF actualColumns.length != 14:
        RETURN error("Expected 14 columns, found " + actualColumns.length)
    
    FOR EACH expectedColumn IN expectedColumns:
        IF expectedColumn NOT IN actualColumns:
            RETURN error("Missing required column: " + expectedColumn)
    
    RETURN success()
```

### 1.3 Row Data Validation (Interactive)

**Algorithm**:
```
FUNCTION validateRow(row, rowNumber):
    errors = []
    
    // Validate required fields
    IF row.Date is empty:
        errors.add("Date is required")
    
    IF row.Amount is empty:
        errors.add("Amount is required")
    
    IF row.Payee is empty:
        errors.add("Payee is required")
    
    // Validate date format
    parsedDate = parseDate(row.Date)
    IF parsedDate is null:
        errors.add("Invalid date format: " + row.Date)
    
    // Validate amount format
    parsedAmount = parseAmount(row.Amount)
    IF parsedAmount is null:
        errors.add("Invalid amount format: " + row.Amount)
    
    IF errors.length > 0:
        // Interactive validation - pause and show errors
        userAction = showValidationDialog(rowNumber, row, errors)
        
        IF userAction == "skip":
            RETURN { valid: false, action: "skip" }
        ELSE IF userAction == "edit":
            correctedRow = getUserCorrectedData(row, errors)
            RETURN validateRow(correctedRow, rowNumber) // Recursive validation
        ELSE IF userAction == "cancel":
            RETURN { valid: false, action: "cancel_import" }
    
    RETURN { valid: true, data: row }
```

### 1.4 Date Parsing (Auto-detect Format)

**Algorithm**:
```
FUNCTION parseDate(dateString):
    formats = [
        "YYYY-MM-DD",      // ISO format
        "DD/MM/YYYY",      // European format
        "MM/DD/YYYY",      // US format
        "DD-MM-YYYY",      // Alternative European
        "YYYY/MM/DD",      // Alternative ISO
        "D/M/YYYY",        // Short day/month
        "DD MMM YYYY",     // 15 Jan 2024
        "MMM DD, YYYY"     // Jan 15, 2024
    ]
    
    FOR EACH format IN formats:
        TRY:
            parsedDate = parseWithFormat(dateString, format)
            IF parsedDate is valid:
                RETURN parsedDate
        CATCH:
            continue
    
    RETURN null // No format matched
```

### 1.5 Amount Parsing

**Algorithm**:
```
FUNCTION parseAmount(amountString):
    // Remove currency symbols and whitespace
    cleaned = amountString.replace(/[$£€,\s]/g, "")
    
    // Try to parse as number
    amount = parseFloat(cleaned)
    
    IF isNaN(amount):
        RETURN null
    
    // Store as-is (negative for expenses, positive for income)
    RETURN amount
```

### 1.6 Data Normalization

**Algorithm**:
```
FUNCTION normalizeData(row):
    normalized = {}
    
    // Normalize date to ISO format
    normalized.date = formatDate(row.Date, "YYYY-MM-DD")
    
    // Store amount as-is (keep sign)
    normalized.amount = row.Amount
    
    // Trim and normalize text fields
    normalized.payee = row.Payee.trim()
    normalized.particulars = row.Particulars ? row.Particulars.trim() : null
    normalized.tranType = row["Tran Type"] ? row["Tran Type"].trim() : null
    
    // Copy other fields as-is
    normalized.code = row.Code
    normalized.reference = row.Reference
    normalized.thisPartyAccount = row["This Party Account"]
    normalized.otherPartyAccount = row["Other Party Account"]
    normalized.serial = row.Serial
    normalized.transactionCode = row["Transaction Code"]
    normalized.batchNumber = row["Batch Number"]
    normalized.originatingBankBranch = row["Originating Bank/Branch"]
    normalized.processedDate = row["Processed Date"]
    
    RETURN normalized
```

---

## 2. Duplicate Detection Algorithm

### 2.1 Duplicate Detection (Exact Match)

**Algorithm**:
```
FUNCTION detectDuplicates(newTransactions, existingTransactions):
    duplicates = []
    unique = []
    
    FOR EACH newTxn IN newTransactions:
        isDuplicate = false
        
        FOR EACH existingTxn IN existingTransactions:
            IF exactMatch(newTxn, existingTxn):
                isDuplicate = true
                duplicates.add(newTxn)
                BREAK
        
        IF NOT isDuplicate:
            unique.add(newTxn)
    
    RETURN { duplicates, unique }

FUNCTION exactMatch(txn1, txn2):
    RETURN (
        txn1.date == txn2.date AND
        txn1.amount == txn2.amount AND
        txn1.payee == txn2.payee AND
        txn1.reference == txn2.reference
    )
```

### 2.2 Duplicate Handling (Auto-skip)

**Algorithm**:
```
FUNCTION handleDuplicates(duplicates, unique):
    // Auto-skip all duplicates
    importedCount = unique.length
    skippedCount = duplicates.length
    
    // Import only unique transactions
    importTransactions(unique)
    
    // Show summary to user
    showSummary({
        imported: importedCount,
        skipped: skippedCount,
        message: skippedCount + " duplicate transactions were automatically skipped"
    })
```

---

## 3. Transaction Data Transformation Logic

### 3.1 CSV Row to Transaction Entity

**Algorithm**:
```
FUNCTION transformToTransaction(csvRow):
    transaction = {
        // CSV fields
        date: csvRow.date,
        amount: csvRow.amount,
        payee: csvRow.payee,
        particulars: csvRow.particulars,
        code: csvRow.code,
        reference: csvRow.reference,
        tranType: csvRow.tranType,
        thisPartyAccount: csvRow.thisPartyAccount,
        otherPartyAccount: csvRow.otherPartyAccount,
        serial: csvRow.serial,
        transactionCode: csvRow.transactionCode,
        batchNumber: csvRow.batchNumber,
        originatingBankBranch: csvRow.originatingBankBranch,
        processedDate: csvRow.processedDate,
        
        // Classification fields (initialized)
        categoryId: null,
        classificationStatus: "unclassified",
        confidenceScore: null,
        isAutoApproved: false,
        
        // Metadata
        createdAt: now(),
        updatedAt: now()
    }
    
    RETURN transaction
```

---

## 4. ML Classification Algorithm

### 4.1 Classification Workflow

```
Transactions imported
    ↓
FOR EACH transaction:
    Extract features from transaction
    ↓
    Check if merchant exists in training data
    ↓
    IF merchant exists (exact or fuzzy match):
        Get ML model prediction
        Calculate confidence score
        ↓
        IF confidence >= adaptive threshold:
            Auto-approve classification
            Mark as "approved"
        ELSE:
            Flag for manual review
            Mark as "pending_review"
    ELSE (new merchant):
        Try fuzzy match with similar merchants
        ↓
        IF similar merchant found:
            Suggest category with low confidence
            Mark as "pending_review"
        ELSE:
            Try keyword match with category names
            ↓
            IF keyword match found:
                Suggest category with very low confidence
                Mark as "pending_review"
            ELSE:
                Leave unclassified
                Mark as "unclassified"
    ↓
    Store classification result
    ↓
Emit ClassificationsReady event
```

### 4.2 Feature Extraction (Text + Patterns)

**Algorithm**:
```
FUNCTION extractFeatures(transaction):
    features = {}
    
    // Text features - Payee
    features.payeeTokens = tokenize(transaction.payee)
    features.payeeNormalized = normalizeText(transaction.payee)
    
    // Text features - Particulars
    IF transaction.particulars:
        features.particularsTokens = tokenize(transaction.particulars)
        features.particularsNormalized = normalizeText(transaction.particulars)
    ELSE:
        features.particularsTokens = []
        features.particularsNormalized = ""
    
    // Metadata features
    features.tranType = transaction.tranType
    
    // Amount range features
    features.amountRange = categorizeAmount(transaction.amount)
    
    // Temporal pattern features
    features.dayOfMonth = getDayOfMonth(transaction.date)
    features.dayOfWeek = getDayOfWeek(transaction.date)
    
    RETURN features

FUNCTION tokenize(text):
    // Convert to lowercase, split on whitespace and punctuation
    tokens = text.toLowerCase()
                 .replace(/[^\w\s]/g, " ")
                 .split(/\s+/)
                 .filter(token => token.length > 0)
    RETURN tokens

FUNCTION normalizeText(text):
    // Remove common words, normalize spacing
    stopWords = ["the", "a", "an", "and", "or", "of", "to", "in", "for"]
    tokens = tokenize(text)
    filtered = tokens.filter(token => NOT IN stopWords)
    RETURN filtered.join(" ")

FUNCTION categorizeAmount(amount):
    absAmount = abs(amount)
    
    IF absAmount < 10:
        RETURN "micro"      // < $10
    ELSE IF absAmount < 50:
        RETURN "small"      // $10-50
    ELSE IF absAmount < 200:
        RETURN "medium"     // $50-200
    ELSE IF absAmount < 1000:
        RETURN "large"      // $200-1000
    ELSE:
        RETURN "very_large" // > $1000
```

### 4.3 ML Model Prediction

**Algorithm**:
```
FUNCTION predict(features, mlModel):
    // Convert features to model input format
    inputVector = featuresToVector(features)
    
    // Get model prediction (category probabilities)
    predictions = mlModel.predict(inputVector)
    
    // Find category with highest probability
    topCategory = predictions.maxBy(p => p.probability)
    
    RETURN {
        categoryId: topCategory.categoryId,
        probability: topCategory.probability,
        allPredictions: predictions
    }
```

### 4.4 Confidence Score Calculation (Multi-factor)

**Algorithm**:
```
FUNCTION calculateConfidence(prediction, features, trainingData):
    baseConfidence = prediction.probability
    
    // Factor 1: Exact match bonus
    exactMatchBonus = 0
    IF hasExactPayeeMatch(features.payeeNormalized, trainingData):
        exactMatchBonus = 0.15  // +15% for exact match
    
    // Factor 2: Frequency bonus
    frequencyBonus = 0
    categoryFrequency = getCategoryFrequency(prediction.categoryId, trainingData)
    IF categoryFrequency > 10:
        frequencyBonus = 0.05   // +5% if category used frequently
    ELSE IF categoryFrequency > 50:
        frequencyBonus = 0.10   // +10% if category used very frequently
    
    // Factor 3: Recency bonus
    recencyBonus = 0
    daysSinceLastSimilar = getDaysSinceLastSimilarTransaction(features, trainingData)
    IF daysSinceLastSimilar < 30:
        recencyBonus = 0.05     // +5% if similar transaction in last 30 days
    
    // Factor 4: Training data size penalty
    trainingDataPenalty = 0
    IF trainingData.length < 20:
        trainingDataPenalty = 0.10  // -10% if insufficient training data
    ELSE IF trainingData.length < 50:
        trainingDataPenalty = 0.05  // -5% if limited training data
    
    // Calculate final confidence
    finalConfidence = baseConfidence + exactMatchBonus + frequencyBonus + recencyBonus - trainingDataPenalty
    
    // Clamp to [0, 1]
    finalConfidence = max(0, min(1, finalConfidence))
    
    RETURN finalConfidence
```

### 4.5 New Merchant Handling (Hybrid Approach)

**Algorithm**:
```
FUNCTION handleNewMerchant(features, trainingData, categories):
    // Step 1: Try fuzzy match with existing merchants
    similarMerchants = findSimilarMerchants(features.payeeNormalized, trainingData)
    
    IF similarMerchants.length > 0:
        // Use most similar merchant's category
        topMatch = similarMerchants[0]
        
        RETURN {
            categoryId: topMatch.categoryId,
            confidence: topMatch.similarity * 0.6,  // Max 60% for fuzzy match
            reason: "Similar to: " + topMatch.payee
        }
    
    // Step 2: Fall back to keyword match
    keywordMatches = findKeywordMatches(features.payeeNormalized, categories)
    
    IF keywordMatches.length > 0:
        topMatch = keywordMatches[0]
        
        RETURN {
            categoryId: topMatch.categoryId,
            confidence: 0.3,  // Low confidence for keyword match
            reason: "Keyword match: " + topMatch.keyword
        }
    
    // Step 3: Leave unclassified
    RETURN {
        categoryId: null,
        confidence: 0,
        reason: "No similar merchants or keywords found"
    }

FUNCTION findSimilarMerchants(payee, trainingData):
    similarities = []
    
    FOR EACH historicalTxn IN trainingData:
        similarity = calculateTextSimilarity(payee, historicalTxn.payee)
        
        IF similarity > 0.7:  // 70% similarity threshold
            similarities.add({
                payee: historicalTxn.payee,
                categoryId: historicalTxn.categoryId,
                similarity: similarity
            })
    
    // Sort by similarity descending
    similarities.sortBy(s => s.similarity, descending)
    
    RETURN similarities

FUNCTION findKeywordMatches(payee, categories):
    matches = []
    payeeWords = tokenize(payee)
    
    FOR EACH category IN categories:
        categoryWords = tokenize(category.name)
        
        FOR EACH word IN payeeWords:
            IF word IN categoryWords:
                matches.add({
                    categoryId: category.id,
                    keyword: word
                })
                BREAK
    
    RETURN matches
```

---

## 5. ML Training Workflow

### 5.1 Session-based Training

**Algorithm**:
```
// Training happens at end of classification session

classificationSession = {
    newClassifications: [],
    sessionActive: true
}

FUNCTION onUserClassification(transactionId, categoryId):
    // Store classification
    saveClassification(transactionId, categoryId)
    
    // Add to session training data
    classificationSession.newClassifications.add({
        transactionId: transactionId,
        categoryId: categoryId,
        timestamp: now()
    })

FUNCTION onSessionEnd():
    IF classificationSession.newClassifications.length > 0:
        // Retrain model with new data
        retrainModel(classificationSession.newClassifications)
        
        // Clear session
        classificationSession.newClassifications = []
    
    classificationSession.sessionActive = false

FUNCTION retrainModel(newClassifications):
    // Get all training data (historical + new)
    allTrainingData = getAllTrainingData()
    
    // Extract features for all training data
    trainingSet = []
    FOR EACH classification IN allTrainingData:
        transaction = getTransaction(classification.transactionId)
        features = extractFeatures(transaction)
        trainingSet.add({
            features: features,
            label: classification.categoryId
        })
    
    // Retrain ML model
    mlModel.train(trainingSet)
    
    // Save updated model
    saveModel(mlModel)
    
    // Update model metadata
    updateModelMetadata({
        lastTrainedAt: now(),
        trainingSamplesCount: trainingSet.length
    })
```

---

## 6. Auto-Approval Logic

### 6.1 Adaptive Threshold

**Algorithm**:
```
FUNCTION getAutoApprovalThreshold(trainingDataCount):
    IF trainingDataCount < 50:
        RETURN 0.90  // 90% threshold for new users
    ELSE IF trainingDataCount < 100:
        RETURN 0.80  // 80% threshold for intermediate users
    ELSE:
        RETURN 0.70  // 70% threshold for experienced users

FUNCTION shouldAutoApprove(classification, trainingDataCount):
    threshold = getAutoApprovalThreshold(trainingDataCount)
    
    RETURN classification.confidence >= threshold
```

### 6.2 Auto-Approval Processing

**Algorithm**:
```
FUNCTION processClassification(classification):
    trainingDataCount = getTrainingDataCount()
    
    IF shouldAutoApprove(classification, trainingDataCount):
        // Auto-approve
        updateTransaction(classification.transactionId, {
            categoryId: classification.categoryId,
            classificationStatus: "approved",
            confidenceScore: classification.confidence,
            isAutoApproved: true
        })
        
        // Add to training data immediately
        addToTrainingData(classification)
    ELSE:
        // Flag for manual review
        updateTransaction(classification.transactionId, {
            categoryId: classification.categoryId,  // Store as suggestion
            classificationStatus: "pending_review",
            confidenceScore: classification.confidence,
            isAutoApproved: false
        })
```

---

## 7. Report Generation Logic

### 7.1 Monthly Report Generation

**Algorithm**:
```
FUNCTION generateMonthlyReport(month, year):
    // Calculate date range (calendar month)
    startDate = firstDayOfMonth(month, year)
    endDate = lastDayOfMonth(month, year)
    
    // Get all approved transactions in date range
    transactions = getTransactions({
        startDate: startDate,
        endDate: endDate,
        status: "approved"
    })
    
    // Group transactions by category
    categoryGroups = groupBy(transactions, txn => txn.categoryId)
    
    // Calculate totals for each category
    categoryReports = []
    FOR EACH (categoryId, txns) IN categoryGroups:
        category = getCategory(categoryId)
        totalAmount = sum(txns.map(t => t.amount))
        transactionCount = txns.length
        isIncome = totalAmount > 0
        
        categoryReports.add({
            category: category,
            totalAmount: totalAmount,
            transactionCount: transactionCount,
            isIncome: isIncome
        })
    
    // Add categories with $0 spending
    allCategories = getAllCategories()
    FOR EACH category IN allCategories:
        IF category.id NOT IN categoryGroups:
            categoryReports.add({
                category: category,
                totalAmount: 0,
                transactionCount: 0,
                isIncome: false
            })
    
    // Sort categories alphabetically
    categoryReports.sortBy(cr => cr.category.name, ascending)
    
    // Calculate overall totals
    totalIncome = sum(categoryReports.filter(cr => cr.isIncome).map(cr => cr.totalAmount))
    totalExpenses = abs(sum(categoryReports.filter(cr => NOT cr.isIncome).map(cr => cr.totalAmount)))
    netAmount = totalIncome - totalExpenses
    
    RETURN {
        month: month,
        year: year,
        categories: categoryReports,
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netAmount: netAmount
    }
```

---

## 8. Category Management Logic

### 8.1 Category Creation

**Algorithm**:
```
FUNCTION createCategory(name):
    // Validate name
    validationResult = validateCategoryName(name)
    IF NOT validationResult.valid:
        THROW ValidationError(validationResult.errors)
    
    // Trim whitespace
    trimmedName = name.trim()
    
    // Check uniqueness (case-insensitive)
    existingCategory = findCategoryByName(trimmedName, caseInsensitive: true)
    IF existingCategory:
        THROW ValidationError("Category name already exists")
    
    // Create category
    category = {
        name: trimmedName,
        transactionCount: 0,
        totalAmount: 0,
        createdAt: now()
    }
    
    saveCategory(category)
    
    RETURN category
```

### 8.2 Category Name Validation (User-friendly)

**Algorithm**:
```
FUNCTION validateCategoryName(name):
    errors = []
    
    // Check non-empty
    IF name is empty OR name.trim() is empty:
        errors.add("Category name cannot be empty")
    
    // Check length
    trimmedName = name.trim()
    IF trimmedName.length > 50:
        errors.add("Category name must be 50 characters or less")
    
    // Allow special characters (no restrictions)
    // Trim whitespace automatically
    
    IF errors.length > 0:
        RETURN { valid: false, errors: errors }
    
    RETURN { valid: true }
```

### 8.3 Category Deletion with Reassignment

**Algorithm**:
```
FUNCTION deleteCategory(categoryId):
    // Check if category has transactions
    transactionCount = getTransactionCount(categoryId)
    
    IF transactionCount > 0:
        // Prompt user for reassignment
        replacementCategoryId = promptUserForReassignment(categoryId, transactionCount)
        
        IF replacementCategoryId is null:
            // User cancelled
            RETURN { cancelled: true }
        
        // Reassign all transactions
        reassignTransactions(categoryId, replacementCategoryId)
    
    // Delete category
    deleteCategoryFromDatabase(categoryId)
    
    RETURN { success: true, reassignedCount: transactionCount }

FUNCTION reassignTransactions(oldCategoryId, newCategoryId):
    transactions = getTransactionsByCategory(oldCategoryId)
    
    FOR EACH transaction IN transactions:
        updateTransaction(transaction.id, {
            categoryId: newCategoryId,
            updatedAt: now()
        })
        
        // Update training data
        updateTrainingData(transaction.id, newCategoryId)
```

---

## 9. Transaction Review Logic

### 9.1 Review Queue Retrieval

**Algorithm**:
```
FUNCTION getTransactionsForReview():
    // Get unclassified and pending review transactions
    transactions = getTransactions({
        status: ["unclassified", "pending_review"]
    })
    
    // Sort by date ascending (oldest first)
    transactions.sortBy(t => t.date, ascending)
    
    RETURN transactions
```

### 9.2 Manual Classification

**Algorithm**:
```
FUNCTION manuallyClassifyTransaction(transactionId, categoryId):
    // Update transaction
    updateTransaction(transactionId, {
        categoryId: categoryId,
        classificationStatus: "approved",
        confidenceScore: 1.0,  // Manual classification = 100% confidence
        isAutoApproved: false,
        updatedAt: now()
    })
    
    // Add to training data
    addToTrainingData({
        transactionId: transactionId,
        categoryId: categoryId,
        classificationMethod: "manual",
        timestamp: now()
    })
    
    // Add to session training queue
    classificationSession.newClassifications.add({
        transactionId: transactionId,
        categoryId: categoryId
    })
```

### 9.3 Accept Suggested Classification

**Algorithm**:
```
FUNCTION acceptSuggestedClassification(transactionId):
    transaction = getTransaction(transactionId)
    
    IF transaction.categoryId is null:
        THROW Error("No suggested classification to accept")
    
    // Update transaction status to approved
    updateTransaction(transactionId, {
        classificationStatus: "approved",
        isAutoApproved: false,  // User accepted, not auto-approved
        updatedAt: now()
    })
    
    // Add to training data
    addToTrainingData({
        transactionId: transactionId,
        categoryId: transaction.categoryId,
        classificationMethod: "ml_accepted",
        confidenceScore: transaction.confidenceScore,
        timestamp: now()
    })
    
    // Add to session training queue
    classificationSession.newClassifications.add({
        transactionId: transactionId,
        categoryId: transaction.categoryId
    })
```

---

## 10. Error Handling Logic

### 10.1 CSV Import Error Handling

**Algorithm**:
```
FUNCTION handleCSVImportError(error, context):
    IF error.type == "INVALID_FORMAT":
        RETURN {
            userMessage: "Invalid CSV format. Expected 14 columns.",
            technicalDetails: error.details,
            suggestedAction: "Please check your CSV file format and try again.",
            canRetry: true
        }
    
    ELSE IF error.type == "INVALID_ROW_DATA":
        RETURN {
            userMessage: "Row " + context.rowNumber + " has invalid data: " + error.message,
            technicalDetails: error.details,
            suggestedAction: "Please correct the data and try again.",
            canRetry: true,
            rowData: context.rowData
        }
    
    ELSE IF error.type == "FILE_TOO_LARGE":
        RETURN {
            userMessage: "File is too large. Maximum size is 10MB.",
            technicalDetails: "File size: " + context.fileSize,
            suggestedAction: "Please split your CSV into smaller files.",
            canRetry: false
        }
    
    ELSE:
        RETURN {
            userMessage: "An unexpected error occurred during import.",
            technicalDetails: error.message,
            suggestedAction: "Please try again or contact support.",
            canRetry: true
        }
```

### 10.2 Database Error Handling

**Algorithm**:
```
FUNCTION handleDatabaseError(error, operation):
    // Log error for troubleshooting
    logError(error, operation)
    
    IF error.type == "CONNECTION_ERROR":
        RETURN {
            userMessage: "Unable to connect to database.",
            suggestedAction: "Please check your database connection and try again.",
            canRetry: true
        }
    
    ELSE IF error.type == "CONSTRAINT_VIOLATION":
        RETURN {
            userMessage: "Data validation error: " + error.constraint,
            suggestedAction: "Please check your input and try again.",
            canRetry: true
        }
    
    ELSE:
        RETURN {
            userMessage: "A database error occurred.",
            suggestedAction: "Please try again. If the problem persists, contact support.",
            canRetry: true
        }
```

---

## Notes

- All algorithms are technology-agnostic and focus on business logic
- Error handling is comprehensive and user-friendly
- ML algorithms balance accuracy with simplicity
- Interactive validation provides good user experience
- Adaptive thresholds improve over time as user trains the system
- All business rules are clearly defined and testable
