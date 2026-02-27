/**
 * Transaction Data Manager
 */

import { TransactionRepository } from '../repositories/TransactionRepository';
import { CSVRow, Transaction, ClassificationStatus } from '../types/models';
import { CSVParser } from './CSVParser';
import { logger } from '../utils/logger';

export class TransactionDataManager {
  constructor(
    private transactionRepo: TransactionRepository,
    private csvParser: CSVParser
  ) {}

  async createFromCSVRow(row: CSVRow): Promise<Transaction> {
    const transaction = {
      date: this.csvParser.convertToISO8601(row.Date),
      amount: parseFloat(row.Amount),
      payee: row.Payee,
      particulars: row.Particulars || null,
      code: row.Code || null,
      reference: row.Reference || null,
      tranType: row['Tran Type'] || null,
      thisPartyAccount: row['This Party Account'] || null,
      otherPartyAccount: row['Other Party Account'] || null,
      serial: row.Serial || null,
      transactionCode: row['Transaction Code'] || null,
      batchNumber: row['Batch Number'] || null,
      originatingBankBranch: row['Originating Bank/Branch'] || null,
      processedDate: row['Processed Date'] ? this.csvParser.convertToISO8601(row['Processed Date']) : null,
      categoryId: null,
      classificationStatus: ClassificationStatus.UNCLASSIFIED,
      confidenceScore: null,
      isAutoApproved: false
    };

    return this.transactionRepo.create(transaction);
  }

  async checkDuplicate(row: CSVRow): Promise<Transaction | undefined> {
    const date = this.csvParser.convertToISO8601(row.Date);
    const amount = parseFloat(row.Amount);
    const payee = row.Payee;
    const reference = row.Reference || undefined;

    return this.transactionRepo.findDuplicate(date, amount, payee, reference);
  }

  async classifyTransaction(
    transactionId: number,
    categoryId: number,
    confidenceScore?: number,
    autoApprove: boolean = false
  ): Promise<Transaction> {
    const status = autoApprove ? ClassificationStatus.APPROVED : ClassificationStatus.PENDING;

    return this.transactionRepo.update(transactionId, {
      categoryId,
      classificationStatus: status,
      confidenceScore,
      isAutoApproved: autoApprove
    });
  }

  async approveClassification(transactionId: number): Promise<Transaction> {
    return this.transactionRepo.update(transactionId, {
      classificationStatus: ClassificationStatus.APPROVED
    });
  }
}
