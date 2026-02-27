/**
 * Transaction Repository
 */

import { Database } from '../database/connection';
import { Transaction, ClassificationStatus } from '../types/models';

export class TransactionRepository {
  constructor(private db: Database) {}

  async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const result = await this.db.run(
      `INSERT INTO transactions (
        date, amount, payee, particulars, code, reference, tran_type,
        this_party_account, other_party_account, serial, transaction_code,
        batch_number, originating_bank_branch, processed_date,
        category_id, classification_status, confidence_score, is_auto_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.date, transaction.amount, transaction.payee,
        transaction.particulars, transaction.code, transaction.reference,
        transaction.tranType, transaction.thisPartyAccount, transaction.otherPartyAccount,
        transaction.serial, transaction.transactionCode, transaction.batchNumber,
        transaction.originatingBankBranch, transaction.processedDate,
        transaction.categoryId, transaction.classificationStatus,
        transaction.confidenceScore, transaction.isAutoApproved ? 1 : 0
      ]
    );

    return this.findById(result.lastID)!;
  }

  async findById(id: number): Promise<Transaction | undefined> {
    const row = await this.db.get<any>(
      `SELECT t.*, c.name as category_name FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id]
    );
    return row ? this.mapRow(row) : undefined;
  }

  async findByStatus(status: ClassificationStatus): Promise<Transaction[]> {
    const rows = await this.db.all<any>(
      `SELECT t.*, c.name as category_name FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.classification_status = ?
       ORDER BY t.date DESC`,
      [status]
    );
    return rows.map(this.mapRow);
  }

  async findAll(limit?: number, offset?: number): Promise<Transaction[]> {
    const sql = `SELECT t.*, c.name as category_name FROM transactions t
                 LEFT JOIN categories c ON t.category_id = c.id
                 ORDER BY t.date DESC
                 ${limit ? `LIMIT ${limit}` : ''}
                 ${offset ? `OFFSET ${offset}` : ''}`;
    const rows = await this.db.all<any>(sql);
    return rows.map(this.mapRow);
  }

  async update(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.categoryId !== undefined) {
      fields.push('category_id = ?');
      values.push(updates.categoryId);
    }
    if (updates.classificationStatus) {
      fields.push('classification_status = ?');
      values.push(updates.classificationStatus);
    }
    if (updates.confidenceScore !== undefined) {
      fields.push('confidence_score = ?');
      values.push(updates.confidenceScore);
    }
    if (updates.isAutoApproved !== undefined) {
      fields.push('is_auto_approved = ?');
      values.push(updates.isAutoApproved ? 1 : 0);
    }

    values.push(id);
    await this.db.run(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id)!;
  }

  async findDuplicate(date: string, amount: number, payee: string, reference?: string): Promise<Transaction | undefined> {
    const row = await this.db.get<any>(
      `SELECT * FROM transactions 
       WHERE date = ? AND amount = ? AND payee = ? AND reference = ?
       LIMIT 1`,
      [date, amount, payee, reference || null]
    );
    return row ? this.mapRow(row) : undefined;
  }

  private mapRow(row: any): Transaction {
    return {
      id: row.id,
      date: row.date,
      amount: row.amount,
      payee: row.payee,
      particulars: row.particulars,
      code: row.code,
      reference: row.reference,
      tranType: row.tran_type,
      thisPartyAccount: row.this_party_account,
      otherPartyAccount: row.other_party_account,
      serial: row.serial,
      transactionCode: row.transaction_code,
      batchNumber: row.batch_number,
      originatingBankBranch: row.originating_bank_branch,
      processedDate: row.processed_date,
      categoryId: row.category_id,
      classificationStatus: row.classification_status as ClassificationStatus,
      confidenceScore: row.confidence_score,
      isAutoApproved: row.is_auto_approved === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      category: row.category_name ? { name: row.category_name } as any : undefined
    };
  }
}
