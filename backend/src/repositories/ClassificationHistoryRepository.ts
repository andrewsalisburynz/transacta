/**
 * Classification History Repository
 */

import { Database } from '../database/connection';
import { ClassificationHistoryEntry, ClassificationMethod } from '../types/models';

export class ClassificationHistoryRepository {
  constructor(private db: Database) {}

  async create(entry: Omit<ClassificationHistoryEntry, 'id' | 'classifiedAt'>): Promise<ClassificationHistoryEntry> {
    const result = await this.db.run(
      `INSERT INTO classification_history (
        transaction_id, category_id, payee, particulars, tran_type, amount,
        classification_method, confidence_score, was_corrected, previous_category_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.transactionId, entry.categoryId, entry.payee, entry.particulars,
        entry.tranType, entry.amount, entry.classificationMethod,
        entry.confidenceScore, entry.wasCorrected ? 1 : 0, entry.previousCategoryId
      ]
    );

    return this.findById(result.lastID)!;
  }

  async findById(id: number): Promise<ClassificationHistoryEntry | undefined> {
    const row = await this.db.get<any>(
      'SELECT * FROM classification_history WHERE id = ?',
      [id]
    );
    return row ? this.mapRow(row) : undefined;
  }

  async findForTraining(minSamples: number = 10): Promise<ClassificationHistoryEntry[]> {
    const rows = await this.db.all<any>(
      `SELECT * FROM classification_history 
       WHERE classification_method IN ('manual', 'ml_accepted')
       ORDER BY classified_at DESC
       LIMIT ?`,
      [minSamples * 10]
    );
    return rows.map(this.mapRow);
  }

  async findByTransactionId(transactionId: number): Promise<ClassificationHistoryEntry[]> {
    const rows = await this.db.all<any>(
      `SELECT * FROM classification_history 
       WHERE transaction_id = ?
       ORDER BY classified_at DESC`,
      [transactionId]
    );
    return rows.map(this.mapRow);
  }

  private mapRow(row: any): ClassificationHistoryEntry {
    return {
      id: row.id,
      transactionId: row.transaction_id,
      categoryId: row.category_id,
      payee: row.payee,
      particulars: row.particulars,
      tranType: row.tran_type,
      amount: row.amount,
      classificationMethod: row.classification_method as ClassificationMethod,
      confidenceScore: row.confidence_score,
      wasCorrected: row.was_corrected === 1,
      previousCategoryId: row.previous_category_id,
      classifiedAt: new Date(row.classified_at)
    };
  }
}
