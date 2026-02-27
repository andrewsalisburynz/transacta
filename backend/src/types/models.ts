/**
 * Core TypeScript Models
 */

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  payee: string;
  particulars?: string | null;
  code?: string | null;
  reference?: string | null;
  tranType?: string | null;
  thisPartyAccount?: string | null;
  otherPartyAccount?: string | null;
  serial?: string | null;
  transactionCode?: string | null;
  batchNumber?: string | null;
  originatingBankBranch?: string | null;
  processedDate?: string | null;
  categoryId?: number | null;
  classificationStatus: ClassificationStatus;
  confidenceScore?: number | null;
  isAutoApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
}

export enum ClassificationStatus {
  UNCLASSIFIED = 'unclassified',
  PENDING = 'pending',
  APPROVED = 'approved'
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  categoryType: CategoryType;
  color?: string | null;
  transactionCount: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum CategoryType {
  EXPENSE = 'expense',
  INCOME = 'income',
  TRANSFER = 'transfer'
}

export interface ClassificationHistoryEntry {
  id: number;
  transactionId: number;
  categoryId: number;
  payee: string;
  particulars?: string | null;
  tranType?: string | null;
  amount: number;
  classificationMethod: ClassificationMethod;
  confidenceScore?: number | null;
  wasCorrected: boolean;
  previousCategoryId?: number | null;
  classifiedAt: Date;
}

export enum ClassificationMethod {
  MANUAL = 'manual',
  ML_AUTO = 'ml_auto',
  ML_ACCEPTED = 'ml_accepted'
}

export interface ClassificationResult {
  transactionId: number;
  suggestedCategoryId: number;
  confidenceScore: number;
  shouldAutoApprove: boolean;
  explanation?: string;
}

export interface CSVRow {
  Date: string;
  Amount: string;
  Payee: string;
  Particulars: string;
  Code: string;
  Reference: string;
  'Tran Type': string;
  'This Party Account': string;
  'Other Party Account': string;
  Serial: string;
  'Transaction Code': string;
  'Batch Number': string;
  'Originating Bank/Branch': string;
  'Processed Date': string;
}

export interface CSVImportResult {
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  transactions: Transaction[];
  duplicates: Transaction[];
  errors: ImportError[];
  success: boolean;
  message: string;
}

export interface ImportError {
  row: number;
  message: string;
  field?: string;
  rawData?: string;
}
