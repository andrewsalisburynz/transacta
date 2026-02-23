# Frontend Components - Household Spending Tracker

## Purpose
This document defines the detailed frontend component specifications including component hierarchy, props, state, user interactions, validation, error handling, loading states, and API integration.

---

## Component Hierarchy

```
App
├── Router
│   ├── DashboardPage
│   │   └── DashboardComponent
│   ├── ImportPage
│   │   └── UploadComponent
│   ├── ReviewPage
│   │   └── TransactionReviewComponent
│   │       ├── TransactionListItem (multiple)
│   │       └── CategoryDropdown
│   ├── ReportsPage
│   │   └── ReportComponent
│   │       ├── MonthYearSelector
│   │       └── ReportTable
│   └── CategoriesPage
│       └── CategoryManagementComponent
│           ├── CategoryList
│           ├── CategoryForm
│           └── DeleteConfirmationModal
└── GlobalComponents
    ├── NavigationBar
    ├── ToastNotification
    ├── LoadingSpinner
    └── ErrorModal
```

---

## 1. App Component

### 1.1 Component Definition

**Purpose**: Root application component, manages routing and global state.

**Template Structure**:
```vue
<template>
  <div id="app">
    <NavigationBar />
    <router-view />
    <ToastNotification />
    <ErrorModal />
  </div>
</template>
```

### 1.2 State (Component Data)

```typescript
data() {
  return {
    // No global state - using component state only
  }
}
```

### 1.3 Lifecycle Hooks

```typescript
created() {
  // Initialize Apollo Client
  // Set up error handlers
}
```

---

## 2. Dashboard Component

### 2.1 Component Definition

**Purpose**: Display overview statistics and welcome message for first-time users.

**Route**: `/` or `/dashboard`

### 2.2 Props

None (root page component)

### 2.3 State (Component Data)

```typescript
data() {
  return {
    stats: null as DashboardStats | null,
    loading: false,
    error: null as string | null,
    isFirstTimeUser: false
  }
}
```

### 2.4 Computed Properties

```typescript
computed: {
  hasCategories(): boolean {
    return this.stats?.totalCategories > 0
  },
  hasTransactions(): boolean {
    return this.stats?.totalTransactions > 0
  },
  hasPendingReviews(): boolean {
    return this.stats?.pendingReviews > 0
  }
}
```

### 2.5 Methods

```typescript
methods: {
  async fetchDashboardStats(): Promise<void> {
    this.loading = true
    this.error = null
    
    try {
      const result = await this.$apollo.query({
        query: GET_DASHBOARD_STATS
      })
      
      this.stats = result.data.getDashboardStats
      this.isFirstTimeUser = this.stats.totalCategories === 0
    } catch (err) {
      this.error = 'Failed to load dashboard statistics'
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  
  navigateTo(route: string): void {
    this.$router.push(route)
  }
}
```

### 2.6 User Interactions

| Interaction | Trigger | Action |
|-------------|---------|--------|
| View dashboard | Page load | Fetch dashboard stats |
| Click "Import CSV" | Button click | Navigate to /import |
| Click "Review Transactions" | Button click | Navigate to /review |
| Click "View Reports" | Button click | Navigate to /reports |
| Click "Manage Categories" | Button click | Navigate to /categories |

### 2.7 API Integration

**GraphQL Query**:
```graphql
query GetDashboardStats {
  getDashboardStats {
    totalTransactions
    totalCategories
    pendingReviews
    lastImportDate
    totalSpendingThisMonth
  }
}
```

### 2.8 Loading States

- **Initial load**: Skeleton screen showing stat placeholders
- **Refresh**: Component spinner in corner

### 2.9 Error Handling

- **API error**: Toast notification with error message
- **No data**: Show welcome message for first-time users

---

## 3. Upload Component

### 3.1 Component Definition

**Purpose**: Handle CSV file upload with drag-and-drop and file picker.

**Route**: `/import`

### 3.2 Props

None (root page component)

### 3.3 State (Component Data)

```typescript
data() {
  return {
    selectedFile: null as File | null,
    isDragging: false,
    uploading: false,
    uploadProgress: 0,
    uploadResult: null as UploadResult | null,
    error: null as string | null,
    validationDialog: {
      visible: false,
      rowNumber: 0,
      rowData: null,
      errors: []
    }
  }
}
```

### 3.4 Computed Properties

```typescript
computed: {
  hasSelectedFile(): boolean {
    return this.selectedFile !== null
  },
  fileSize(): string {
    if (!this.selectedFile) return ''
    return this.formatFileSize(this.selectedFile.size)
  }
}
```

### 3.5 Methods

```typescript
methods: {
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0]
      this.validateFile()
    }
  },
  
  onFileDrop(event: DragEvent): void {
    event.preventDefault()
    this.isDragging = false
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0]
      this.validateFile()
    }
  },
  
  onDragOver(event: DragEvent): void {
    event.preventDefault()
    this.isDragging = true
  },
  
  onDragLeave(): void {
    this.isDragging = false
  },
  
  validateFile(): boolean {
    if (!this.selectedFile) return false
    
    // Client-side validation
    if (!this.selectedFile.name.endsWith('.csv')) {
      this.error = 'Invalid file format. Please upload a CSV file.'
      this.selectedFile = null
      return false
    }
    
    if (this.selectedFile.size > 10 * 1024 * 1024) {
      this.error = 'File is too large. Maximum size is 10MB.'
      this.selectedFile = null
      return false
    }
    
    this.error = null
    return true
  },
  
  async uploadCSV(): Promise<void> {
    if (!this.selectedFile) return
    
    this.uploading = true
    this.uploadProgress = 0
    this.error = null
    
    try {
      const result = await this.$apollo.mutate({
        mutation: UPLOAD_CSV,
        variables: {
          file: this.selectedFile
        },
        context: {
          fetchOptions: {
            onUploadProgress: (progressEvent: ProgressEvent) => {
              this.uploadProgress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
            }
          }
        }
      })
      
      this.uploadResult = result.data.uploadCSV
      
      if (this.uploadResult.success) {
        this.showSuccessToast(
          `Successfully imported ${this.uploadResult.transactionCount} transactions. ` +
          `${this.uploadResult.duplicateCount} duplicates were skipped.`
        )
        
        // Navigate to review page after 2 seconds
        setTimeout(() => {
          this.$router.push('/review')
        }, 2000)
      }
    } catch (err: any) {
      if (err.graphQLErrors && err.graphQLErrors[0]?.extensions?.validationError) {
        // Interactive validation error
        const validationError = err.graphQLErrors[0].extensions.validationError
        this.showValidationDialog(validationError)
      } else {
        this.error = err.message || 'Failed to upload CSV file'
      }
    } finally {
      this.uploading = false
    }
  },
  
  showValidationDialog(validationError: any): void {
    this.validationDialog = {
      visible: true,
      rowNumber: validationError.rowNumber,
      rowData: validationError.rowData,
      errors: validationError.errors
    }
  },
  
  onValidationAction(action: 'skip' | 'edit' | 'cancel'): void {
    // Handle validation action
    // This would require backend support for interactive validation
    this.validationDialog.visible = false
  },
  
  clearFile(): void {
    this.selectedFile = null
    this.uploadResult = null
    this.error = null
  }
}
```


### 3.6 User Interactions

| Interaction | Trigger | Action |
|-------------|---------|--------|
| Select file | File picker | Store file, validate format |
| Drag file over | Drag event | Show drop zone highlight |
| Drop file | Drop event | Store file, validate format |
| Click upload | Button click | Upload CSV to backend |
| Handle validation error | Server response | Show validation dialog |
| Skip invalid row | Dialog button | Continue import without row |
| Edit invalid row | Dialog button | Show inline editor |
| Cancel import | Dialog button | Abort entire import |
| Clear file | Button click | Reset component state |

### 3.7 API Integration

**GraphQL Mutation**:
```graphql
mutation UploadCSV($file: Upload!) {
  uploadCSV(file: $file) {
    success
    transactionCount
    duplicateCount
    errorCount
    message
  }
}
```

### 3.8 Form Validation (Client-side)

| Field | Validation | Error Message |
|-------|------------|---------------|
| File | Must be selected | "Please select a file" |
| File extension | Must be .csv | "Invalid file format. Please upload a CSV file." |
| File size | Must be ≤ 10MB | "File is too large. Maximum size is 10MB." |

### 3.9 Loading States

- **Uploading**: Global spinner overlay with progress bar
- **Processing**: Spinner with "Processing CSV..." message

### 3.10 Error Handling

- **Validation error**: Inline error below file picker
- **Upload error**: Modal dialog with error details
- **Network error**: Toast notification with retry option

---

## 4. Transaction Review Component

### 4.1 Component Definition

**Purpose**: Display transactions requiring review with classification options.

**Route**: `/review`

### 4.2 Props

None (root page component)

### 4.3 State (Component Data)

```typescript
data() {
  return {
    transactions: [] as Transaction[],
    categories: [] as Category[],
    loading: false,
    error: null as string | null,
    selectedTransaction: null as Transaction | null,
    filterDateRange: {
      start: null as Date | null,
      end: null as Date | null
    }
  }
}
```

### 4.4 Computed Properties

```typescript
computed: {
  filteredTransactions(): Transaction[] {
    let filtered = this.transactions
    
    if (this.filterDateRange.start) {
      filtered = filtered.filter(t => 
        new Date(t.date) >= this.filterDateRange.start!
      )
    }
    
    if (this.filterDateRange.end) {
      filtered = filtered.filter(t => 
        new Date(t.date) <= this.filterDateRange.end!
      )
    }
    
    return filtered
  },
  
  remainingCount(): number {
    return this.filteredTransactions.length
  },
  
  hasTransactions(): boolean {
    return this.transactions.length > 0
  }
}
```

### 4.5 Methods

```typescript
methods: {
  async fetchTransactionsForReview(): Promise<void> {
    this.loading = true
    this.error = null
    
    try {
      const result = await this.$apollo.query({
        query: GET_TRANSACTIONS_FOR_REVIEW
      })
      
      this.transactions = result.data.getTransactionsForReview
    } catch (err) {
      this.error = 'Failed to load transactions'
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  
  async fetchCategories(): Promise<void> {
    try {
      const result = await this.$apollo.query({
        query: GET_CATEGORIES
      })
      
      this.categories = result.data.getCategories
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  },
  
  async acceptSuggestion(transactionId: string): Promise<void> {
    try {
      const transaction = this.transactions.find(t => t.id === transactionId)
      if (!transaction || !transaction.suggestedCategory) return
      
      await this.$apollo.mutate({
        mutation: CLASSIFY_TRANSACTION,
        variables: {
          transactionId: transactionId,
          categoryId: transaction.suggestedCategory.id
        }
      })
      
      this.removeFromQueue(transactionId)
      this.showSuccessToast('Classification accepted')
    } catch (err) {
      this.showErrorToast('Failed to accept classification')
      console.error(err)
    }
  },
  
  async selectCategory(transactionId: string, categoryId: string): Promise<void> {
    try {
      await this.$apollo.mutate({
        mutation: CLASSIFY_TRANSACTION,
        variables: {
          transactionId: transactionId,
          categoryId: categoryId
        }
      })
      
      this.removeFromQueue(transactionId)
      this.showSuccessToast('Transaction classified')
    } catch (err) {
      this.showErrorToast('Failed to classify transaction')
      console.error(err)
    }
  },
  
  removeFromQueue(transactionId: string): void {
    const index = this.transactions.findIndex(t => t.id === transactionId)
    if (index !== -1) {
      this.transactions.splice(index, 1)
    }
  },
  
  showTransactionDetails(transaction: Transaction): void {
    this.selectedTransaction = transaction
  },
  
  closeTransactionDetails(): void {
    this.selectedTransaction = null
  },
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(amount)
  },
  
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}
```

### 4.6 User Interactions

| Interaction | Trigger | Action |
|-------------|---------|--------|
| View review queue | Page load | Fetch transactions and categories |
| Accept suggestion | Button click | Classify with suggested category |
| Select category | Dropdown selection | Classify with selected category |
| View details | Click transaction | Show transaction details modal |
| Close details | Click outside/close button | Hide transaction details modal |
| Filter by date | Date range picker | Filter transactions |
| Clear filters | Button click | Reset date range filter |

### 4.7 API Integration

**GraphQL Queries**:
```graphql
query GetTransactionsForReview {
  getTransactionsForReview {
    id
    date
    amount
    payee
    particulars
    tranType
    suggestedCategory {
      id
      name
    }
    confidenceScore
    status
  }
}

query GetCategories {
  getCategories {
    id
    name
  }
}
```

**GraphQL Mutation**:
```graphql
mutation ClassifyTransaction($transactionId: ID!, $categoryId: ID!) {
  classifyTransaction(transactionId: $transactionId, categoryId: $categoryId) {
    id
    categoryId
    classificationStatus
  }
}
```

### 4.8 Loading States

- **Initial load**: Skeleton screen showing transaction list placeholders
- **Classification**: Component spinner on transaction being classified

### 4.9 Error Handling

- **Load error**: Toast notification with retry option
- **Classification error**: Toast notification with error message
- **Empty state**: Show message "No transactions need review"

---

## 5. Report Component

### 5.1 Component Definition

**Purpose**: Display monthly spending report with category breakdown.

**Route**: `/reports`

### 5.2 Props

None (root page component)

### 5.3 State (Component Data)

```typescript
data() {
  return {
    report: null as Report | null,
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
    loading: false,
    error: null as string | null
  }
}
```

### 5.4 Computed Properties

```typescript
computed: {
  hasReport(): boolean {
    return this.report !== null
  },
  
  hasTransactions(): boolean {
    return this.report?.categories.some(c => c.transactionCount > 0) ?? false
  },
  
  expenseCategories(): CategoryReport[] {
    return this.report?.categories.filter(c => !c.isIncome) ?? []
  },
  
  incomeCategories(): CategoryReport[] {
    return this.report?.categories.filter(c => c.isIncome) ?? []
  }
}
```

### 5.5 Methods

```typescript
methods: {
  async fetchReport(): Promise<void> {
    this.loading = true
    this.error = null
    
    try {
      const result = await this.$apollo.query({
        query: GET_REPORT,
        variables: {
          month: this.selectedMonth,
          year: this.selectedYear
        }
      })
      
      this.report = result.data.getReport
    } catch (err) {
      this.error = 'Failed to load report'
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  
  onMonthYearChange(month: number, year: number): void {
    this.selectedMonth = month
    this.selectedYear = year
    this.fetchReport()
  },
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(Math.abs(amount))
  },
  
  printReport(): void {
    window.print()
  }
}
```

### 5.6 User Interactions

| Interaction | Trigger | Action |
|-------------|---------|--------|
| View report | Page load | Fetch report for current month |
| Change month/year | Dropdown selection | Fetch report for selected period |
| Print report | Button click | Open print dialog |
| View category details | Click category row | Navigate to transaction list (future) |

### 5.7 API Integration

**GraphQL Query**:
```graphql
query GetReport($month: Int!, $year: Int!) {
  getReport(month: $month, year: $year) {
    month
    year
    categories {
      category {
        id
        name
      }
      totalAmount
      transactionCount
      isIncome
    }
    totalIncome
    totalExpenses
    netAmount
  }
}
```

### 5.8 Loading States

- **Initial load**: Skeleton screen showing report table placeholder
- **Month change**: Component spinner in report area

### 5.9 Error Handling

- **Load error**: Toast notification with error message
- **Empty state**: Show message "No transactions for this period"

---

## 6. Category Management Component

### 6.1 Component Definition

**Purpose**: Manage spending categories (create, edit, delete).

**Route**: `/categories`

### 6.2 Props

None (root page component)

### 6.3 State (Component Data)

```typescript
data() {
  return {
    categories: [] as Category[],
    loading: false,
    error: null as string | null,
    showCreateForm: false,
    editingCategory: null as Category | null,
    deletingCategory: null as Category | null,
    newCategoryName: '',
    editCategoryName: '',
    searchTerm: '',
    deleteConfirmation: {
      visible: false,
      category: null as Category | null,
      replacementCategoryId: null as string | null
    }
  }
}
```

### 6.4 Computed Properties

```typescript
computed: {
  filteredCategories(): Category[] {
    if (!this.searchTerm) return this.sortedCategories
    
    const term = this.searchTerm.toLowerCase()
    return this.sortedCategories.filter(c => 
      c.name.toLowerCase().includes(term)
    )
  },
  
  sortedCategories(): Category[] {
    return [...this.categories].sort((a, b) => 
      a.name.localeCompare(b.name)
    )
  },
  
  replacementCategories(): Category[] {
    if (!this.deleteConfirmation.category) return []
    
    return this.categories.filter(c => 
      c.id !== this.deleteConfirmation.category!.id
    )
  }
}
```

### 6.5 Methods

```typescript
methods: {
  async fetchCategories(): Promise<void> {
    this.loading = true
    this.error = null
    
    try {
      const result = await this.$apollo.query({
        query: GET_CATEGORIES
      })
      
      this.categories = result.data.getCategories
    } catch (err) {
      this.error = 'Failed to load categories'
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  
  async createCategory(): Promise<void> {
    // Progressive validation
    const validationError = this.validateCategoryName(this.newCategoryName)
    if (validationError) {
      this.showErrorToast(validationError)
      return
    }
    
    try {
      const result = await this.$apollo.mutate({
        mutation: CREATE_CATEGORY,
        variables: {
          name: this.newCategoryName.trim()
        }
      })
      
      this.categories.push(result.data.createCategory)
      this.newCategoryName = ''
      this.showCreateForm = false
      this.showSuccessToast('Category created')
    } catch (err: any) {
      if (err.graphQLErrors && err.graphQLErrors[0]?.message.includes('already exists')) {
        this.showErrorToast('Category name already exists')
      } else {
        this.showErrorToast('Failed to create category')
      }
      console.error(err)
    }
  },
  
  async updateCategory(categoryId: string): Promise<void> {
    const validationError = this.validateCategoryName(this.editCategoryName)
    if (validationError) {
      this.showErrorToast(validationError)
      return
    }
    
    try {
      const result = await this.$apollo.mutate({
        mutation: UPDATE_CATEGORY,
        variables: {
          id: categoryId,
          name: this.editCategoryName.trim()
        }
      })
      
      const index = this.categories.findIndex(c => c.id === categoryId)
      if (index !== -1) {
        this.categories[index] = result.data.updateCategory
      }
      
      this.editingCategory = null
      this.editCategoryName = ''
      this.showSuccessToast('Category updated')
    } catch (err: any) {
      if (err.graphQLErrors && err.graphQLErrors[0]?.message.includes('already exists')) {
        this.showErrorToast('Category name already exists')
      } else {
        this.showErrorToast('Failed to update category')
      }
      console.error(err)
    }
  },
  
  promptDeleteCategory(category: Category): void {
    if (category.transactionCount === 0) {
      // Can delete directly
      this.confirmDeleteCategory(category)
    } else {
      // Need reassignment
      this.deleteConfirmation = {
        visible: true,
        category: category,
        replacementCategoryId: null
      }
    }
  },
  
  async confirmDeleteCategory(category: Category): void {
    try {
      await this.$apollo.mutate({
        mutation: DELETE_CATEGORY,
        variables: {
          id: category.id
        }
      })
      
      const index = this.categories.findIndex(c => c.id === category.id)
      if (index !== -1) {
        this.categories.splice(index, 1)
      }
      
      this.showSuccessToast('Category deleted')
    } catch (err) {
      this.showErrorToast('Failed to delete category')
      console.error(err)
    }
  },
  
  async deleteWithReassignment(): Promise<void> {
    if (!this.deleteConfirmation.replacementCategoryId) {
      this.showErrorToast('Please select a replacement category')
      return
    }
    
    try {
      // This would require a backend mutation that handles reassignment
      // For now, show error that this is not implemented
      this.showErrorToast('Reassignment not yet implemented')
      this.deleteConfirmation.visible = false
    } catch (err) {
      this.showErrorToast('Failed to delete category')
      console.error(err)
    }
  },
  
  validateCategoryName(name: string): string | null {
    const trimmed = name.trim()
    
    if (trimmed.length === 0) {
      return 'Category name cannot be empty'
    }
    
    if (trimmed.length > 50) {
      return 'Category name must be 50 characters or less'
    }
    
    return null
  },
  
  startEdit(category: Category): void {
    this.editingCategory = category
    this.editCategoryName = category.name
  },
  
  cancelEdit(): void {
    this.editingCategory = null
    this.editCategoryName = ''
  }
}
```

### 6.6 User Interactions

| Interaction | Trigger | Action |
|-------------|---------|--------|
| View categories | Page load | Fetch all categories |
| Search categories | Input change | Filter categories by name |
| Show create form | Button click | Display category creation form |
| Create category | Form submit | Validate and create category |
| Edit category | Click edit icon | Show inline editor |
| Save edit | Click save | Validate and update category |
| Cancel edit | Click cancel | Hide inline editor |
| Delete category (empty) | Click delete icon | Show confirmation, delete |
| Delete category (with txns) | Click delete icon | Show reassignment dialog |
| Select replacement | Dropdown selection | Store replacement category ID |
| Confirm deletion | Dialog button | Delete and reassign transactions |
| Cancel deletion | Dialog button | Close dialog |

### 6.7 API Integration

**GraphQL Queries**:
```graphql
query GetCategories {
  getCategories {
    id
    name
    transactionCount
    totalAmount
    createdAt
  }
}
```

**GraphQL Mutations**:
```graphql
mutation CreateCategory($name: String!) {
  createCategory(name: $name) {
    id
    name
    transactionCount
    totalAmount
    createdAt
  }
}

mutation UpdateCategory($id: ID!, $name: String!) {
  updateCategory(id: $id, name: $name) {
    id
    name
    updatedAt
  }
}

mutation DeleteCategory($id: ID!) {
  deleteCategory(id: $id)
}
```

### 6.8 Form Validation (Progressive)

| Field | Validation Timing | Validation | Error Display |
|-------|-------------------|------------|---------------|
| Category name | On blur | Non-empty, ≤50 chars | Inline below field |
| Category name | On submit | Non-empty, ≤50 chars, unique | Inline below field |

### 6.9 Loading States

- **Initial load**: Skeleton screen showing category list placeholder
- **Create/Update/Delete**: Component spinner on affected category

### 6.10 Error Handling

- **Validation error**: Inline error below form field
- **Duplicate name**: Toast notification "Category name already exists"
- **Delete error**: Toast notification with error message
- **Network error**: Toast notification with retry option

---

## 7. Global Components

### 7.1 Navigation Bar

**Purpose**: Provide navigation between pages.

**Props**: None

**State**:
```typescript
data() {
  return {
    currentRoute: this.$route.path
  }
}
```

**Template**:
```vue
<nav>
  <router-link to="/">Dashboard</router-link>
  <router-link to="/import">Import</router-link>
  <router-link to="/review">Review</router-link>
  <router-link to="/reports">Reports</router-link>
  <router-link to="/categories">Categories</router-link>
</nav>
```

### 7.2 Toast Notification

**Purpose**: Display temporary success/info messages.

**Props**:
```typescript
props: {
  message: String,
  type: {
    type: String as PropType<'success' | 'info' | 'warning'>,
    default: 'info'
  },
  duration: {
    type: Number,
    default: 3000
  }
}
```

**State**:
```typescript
data() {
  return {
    visible: false
  }
}
```

**Methods**:
```typescript
methods: {
  show(): void {
    this.visible = true
    setTimeout(() => {
      this.visible = false
    }, this.duration)
  }
}
```

### 7.3 Error Modal

**Purpose**: Display critical errors requiring user acknowledgment.

**Props**:
```typescript
props: {
  title: String,
  message: String,
  technicalDetails: String,
  canRetry: Boolean
}
```

**State**:
```typescript
data() {
  return {
    visible: false
  }
}
```

**Methods**:
```typescript
methods: {
  show(): void {
    this.visible = true
  },
  
  close(): void {
    this.visible = false
    this.$emit('close')
  },
  
  retry(): void {
    this.$emit('retry')
    this.close()
  }
}
```

### 7.4 Loading Spinner

**Purpose**: Display loading indicator.

**Props**:
```typescript
props: {
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium'
  },
  overlay: {
    type: Boolean,
    default: false
  }
}
```

---

## 8. Routing Configuration

```typescript
const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardPage
  },
  {
    path: '/import',
    name: 'Import',
    component: ImportPage
  },
  {
    path: '/review',
    name: 'Review',
    component: ReviewPage
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsPage
  },
  {
    path: '/categories',
    name: 'Categories',
    component: CategoriesPage
  }
]
```

---

## 9. Component Communication Patterns

### 9.1 Parent-Child Communication

- **Props down**: Parent passes data to child via props
- **Events up**: Child emits events to parent

### 9.2 Sibling Communication

- **Via parent**: Siblings communicate through shared parent component
- **Via router**: Navigate between pages to trigger data refresh

### 9.3 Global State

- **No Vuex**: Using component state only
- **Apollo cache**: GraphQL queries cached by Apollo Client

---

## 10. Error Display Patterns (Hybrid Approach)

| Error Type | Display Method | Auto-dismiss | Example |
|------------|----------------|--------------|---------|
| Validation error | Inline below field | No | "Category name cannot be empty" |
| Success message | Toast notification | Yes (3s) | "Category created successfully" |
| Info message | Toast notification | Yes (3s) | "5 duplicates were skipped" |
| Critical error | Modal dialog | No | "Failed to connect to database" |
| Network error | Toast with retry | No | "Network error. Retry?" |

---

## 11. Loading State Patterns (Hybrid Approach)

| Operation Type | Loading Indicator | Blocking | Example |
|----------------|-------------------|----------|---------|
| Initial page load | Skeleton screen | Yes | Dashboard stats loading |
| Data refresh | Component spinner | No | Refresh category list |
| CSV import | Global overlay spinner | Yes | Uploading and processing CSV |
| Classification | Component spinner | No | Classifying single transaction |
| Background sync | Subtle indicator | No | Auto-save (future) |

---

## Notes

- All components use Vue 3 Composition API or Options API
- Component state management only (no Vuex)
- Apollo Client for GraphQL queries and mutations
- Progressive validation (on blur/change + on submit)
- Hybrid error display (inline + toast + modal)
- Hybrid loading states (skeleton + spinner + overlay)
- All user interactions are clearly defined
- API integration points are documented
- Error handling is comprehensive
