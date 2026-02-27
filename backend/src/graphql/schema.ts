/**
 * GraphQL Schema Definition
 */

export const typeDefs = `#graphql
  scalar Date
  scalar DateTime

  enum ClassificationStatus {
    UNCLASSIFIED
    PENDING
    APPROVED
  }

  enum CategoryType {
    EXPENSE
    INCOME
    TRANSFER
  }

  enum ClassificationMethod {
    MANUAL
    ML_AUTO
    ML_ACCEPTED
  }

  type Transaction {
    id: ID!
    date: Date!
    amount: Float!
    payee: String!
    particulars: String
    reference: String
    tranType: String
    categoryId: Int
    category: Category
    classificationStatus: ClassificationStatus!
    confidenceScore: Float
    isAutoApproved: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    categoryType: CategoryType!
    color: String
    transactionCount: Int!
    totalAmount: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClassificationResult {
    transactionId: ID!
    suggestedCategoryId: ID!
    confidenceScore: Float!
    shouldAutoApprove: Boolean!
    explanation: String
  }

  type ImportError {
    row: Int!
    message: String!
    field: String
  }

  type CSVImportResult {
    importedCount: Int!
    duplicateCount: Int!
    errorCount: Int!
    transactions: [Transaction!]!
    errors: [ImportError!]!
    success: Boolean!
    message: String!
  }

  type CategorySummary {
    categoryId: ID!
    category: Category!
    totalAmount: Float!
    transactionCount: Int!
    percentage: Float!
  }

  type Report {
    month: String!
    startDate: Date!
    endDate: Date!
    categorySummaries: [CategorySummary!]!
    totalExpenses: Float!
    totalIncome: Float!
    netAmount: Float!
    transactionCount: Int!
  }

  type DashboardStats {
    totalTransactions: Int!
    unclassifiedCount: Int!
    pendingCount: Int!
    approvedCount: Int!
    categoryCount: Int!
    currentMonthSpending: Float!
  }

  input CreateCategoryInput {
    name: String!
    description: String
    categoryType: CategoryType
    color: String
  }

  input CSVUploadInput {
    fileContent: String!
    filename: String!
    skipDuplicates: Boolean
  }

  type Query {
    transaction(id: ID!): Transaction
    transactions(status: ClassificationStatus, limit: Int, offset: Int): [Transaction!]!
    transactionsRequiringReview: [Transaction!]!
    category(id: ID!): Category
    categories: [Category!]!
    monthlyReport(month: String!): Report!
    dashboardStats: DashboardStats!
  }

  type Mutation {
    uploadCSV(input: CSVUploadInput!): CSVImportResult!
    classifyTransaction(transactionId: ID!, categoryId: ID!): Transaction!
    getClassificationSuggestion(transactionId: ID!): ClassificationResult!
    createCategory(input: CreateCategoryInput!): Category!
    trainMLModel: Boolean!
  }
`;
