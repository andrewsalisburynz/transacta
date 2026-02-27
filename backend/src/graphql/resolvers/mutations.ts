/**
 * GraphQL Mutation Resolvers
 */

import { ImportService } from '../../services/ImportService';
import { ClassificationService } from '../../services/ClassificationService';
import { CategoryRepository } from '../../repositories/CategoryRepository';
import { Database } from '../../database/connection';

export const mutationResolvers = {
  Mutation: {
    uploadCSV: async (
      _: any,
      { input }: { input: { fileContent: string; filename: string; skipDuplicates?: boolean } },
      { importService }: { importService: ImportService }
    ) => {
      // Handle both base64 and plain text input
      let csvContent: string;
      try {
        csvContent = Buffer.from(input.fileContent, 'base64').toString('utf-8');
      } catch {
        // If not base64, assume it's already plain text
        csvContent = input.fileContent;
      }
      return importService.importCSV(csvContent, input.skipDuplicates ?? true);
    },

    classifyTransaction: async (
      _: any,
      { transactionId, categoryId }: { transactionId: number; categoryId: number },
      { classificationService }: { classificationService: ClassificationService }
    ) => {
      return classificationService.manualClassify(transactionId, categoryId);
    },

    getClassificationSuggestion: async (
      _: any,
      { transactionId }: { transactionId: number },
      { classificationService }: { classificationService: ClassificationService }
    ) => {
      return classificationService.classifyTransaction(transactionId);
    },

    createCategory: async (
      _: any,
      { input }: { input: { name: string; description?: string; categoryType?: string; color?: string } },
      { db }: { db: Database }
    ) => {
      const repo = new CategoryRepository(db);
      return repo.create({
        name: input.name,
        description: input.description || null,
        // Convert GraphQL enum (EXPENSE/INCOME) to database value (expense/income)
        categoryType: (input.categoryType?.toLowerCase() as any) || 'expense',
        color: input.color || null
      });
    },

    trainMLModel: async (
      _: any,
      __: any,
      { classificationService }: { classificationService: ClassificationService }
    ) => {
      await classificationService.trainModel();
      return true;
    }
  }
};
