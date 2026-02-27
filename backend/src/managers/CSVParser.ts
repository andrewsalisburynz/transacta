/**
 * CSV Parser Manager
 */

import { parse } from 'csv-parse/sync';
import { CSVRow, ImportError } from '../types/models';
import { logger } from '../utils/logger';

export class CSVParser {
  private readonly REQUIRED_COLUMNS = ['Date', 'Amount', 'Payee'];

  parse(csvContent: string): { rows: CSVRow[]; errors: ImportError[] } {
    const errors: ImportError[] = [];
    let rows: CSVRow[] = [];

    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      rows = records as CSVRow[];

      // Validate each row
      rows.forEach((row, index) => {
        const rowErrors = this.validateRow(row, index + 2); // +2 for header and 0-index
        errors.push(...rowErrors);
      });

      logger.info('CSV parsed', { totalRows: rows.length, errors: errors.length });
    } catch (error: any) {
      logger.error('CSV parse error', { error: error.message });
      errors.push({
        row: 0,
        message: `CSV parsing failed: ${error.message}`,
        rawData: csvContent.substring(0, 100)
      });
    }

    return { rows, errors };
  }

  private validateRow(row: CSVRow, rowNumber: number): ImportError[] {
    const errors: ImportError[] = [];

    // Check required fields
    for (const field of this.REQUIRED_COLUMNS) {
      if (!row[field as keyof CSVRow] || row[field as keyof CSVRow].trim() === '') {
        errors.push({
          row: rowNumber,
          message: `Missing required field: ${field}`,
          field: field
        });
      }
    }

    // Validate amount format
    if (row.Amount && isNaN(parseFloat(row.Amount))) {
      errors.push({
        row: rowNumber,
        message: `Invalid amount format: ${row.Amount}`,
        field: 'Amount'
      });
    }

    // Validate date format (DD/MM/YYYY)
    if (row.Date && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(row.Date)) {
      errors.push({
        row: rowNumber,
        message: `Invalid date format: ${row.Date}. Expected DD/MM/YYYY`,
        field: 'Date'
      });
    }

    return errors;
  }

  convertToISO8601(ddmmyyyy: string): string {
    const [day, month, year] = ddmmyyyy.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}
