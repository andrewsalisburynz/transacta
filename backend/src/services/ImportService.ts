/**
 * Import Service
 */

import { CSVParser } from '../managers/CSVParser';
import { TransactionDataManager } from '../managers/TransactionDataManager';
import { CSVImportResult, Transaction } from '../types/models';
import { logger } from '../utils/logger';

export class ImportService {
  constructor(
    private csvParser: CSVParser,
    private transactionManager: TransactionDataManager
  ) {}

  async importCSV(csvContent: string, skipDuplicates: boolean = true): Promise<CSVImportResult> {
    logger.info('Starting CSV import', { skipDuplicates });

    const { rows, errors } = this.csvParser.parse(csvContent);
    const transactions: Transaction[] = [];
    const duplicates: Transaction[] = [];

    for (const row of rows) {
      try {
        // Check for duplicates
        const duplicate = await this.transactionManager.checkDuplicate(row);
        
        if (duplicate) {
          duplicates.push(duplicate);
          if (skipDuplicates) {
            continue;
          }
        }

        // Create transaction
        const transaction = await this.transactionManager.createFromCSVRow(row);
        transactions.push(transaction);
      } catch (error: any) {
        logger.error('Failed to import row', { error: error.message, row });
        errors.push({
          row: rows.indexOf(row) + 2,
          message: error.message,
          rawData: JSON.stringify(row)
        });
      }
    }

    const result: CSVImportResult = {
      importedCount: transactions.length,
      duplicateCount: duplicates.length,
      errorCount: errors.length,
      transactions,
      duplicates,
      errors,
      success: errors.length === 0,
      message: `Imported ${transactions.length} transactions, ${duplicates.length} duplicates, ${errors.length} errors`
    };

    logger.info('CSV import completed', result);
    return result;
  }
}
