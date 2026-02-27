/**
 * GraphQL Query Resolvers
 */

import { TransactionRepository } from '../../repositories/TransactionRepository';
import { CategoryRepository } from '../../repositories/CategoryRepository';
import { ClassificationStatus } from '../../types/models';
import { Database } from '../../database/connection';

export const queryResolvers = {
  Query: {
    transaction: async (_: any, { id }: { id: number }, { db }: { db: Database }) => {
      const repo = new TransactionRepository(db);
      return repo.findById(id);
    },

    transactions: async (
      _: any,
      { status, limit, offset }: { status?: ClassificationStatus; limit?: number; offset?: number },
      { db }: { db: Database }
    ) => {
      const repo = new TransactionRepository(db);
      if (status) {
        return repo.findByStatus(status);
      }
      return repo.findAll(limit, offset);
    },

    transactionsRequiringReview: async (_: any, __: any, { db }: { db: Database }) => {
      const repo = new TransactionRepository(db);
      const unclassified = await repo.findByStatus(ClassificationStatus.UNCLASSIFIED);
      const pending = await repo.findByStatus(ClassificationStatus.PENDING);
      return [...unclassified, ...pending];
    },

    category: async (_: any, { id }: { id: number }, { db }: { db: Database }) => {
      const repo = new CategoryRepository(db);
      return repo.findById(id);
    },

    categories: async (_: any, __: any, { db }: { db: Database }) => {
      const repo = new CategoryRepository(db);
      return repo.findAll();
    },

    monthlyReport: async (_: any, { month }: { month: string }, { db }: { db: Database }) => {
      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split('T')[0];

      const transactions = await db.all<any>(
        `SELECT t.*, c.id as cat_id, c.name as cat_name, c.category_type
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.date >= ? AND t.date <= ? AND t.classification_status = 'approved'`,
        [startDate, endDate]
      );

      const categoryMap = new Map<number, any>();
      let totalExpenses = 0;
      let totalIncome = 0;

      transactions.forEach((t: any) => {
        if (!t.cat_id) return;

        if (!categoryMap.has(t.cat_id)) {
          categoryMap.set(t.cat_id, {
            categoryId: t.cat_id,
            category: { id: t.cat_id, name: t.cat_name, categoryType: t.category_type },
            totalAmount: 0,
            transactionCount: 0
          });
        }

        const summary = categoryMap.get(t.cat_id);
        summary.totalAmount += t.amount;
        summary.transactionCount += 1;

        if (t.category_type === 'expense') {
          totalExpenses += Math.abs(t.amount);
        } else {
          totalIncome += t.amount;
        }
      });

      const categorySummaries = Array.from(categoryMap.values()).map(s => ({
        ...s,
        percentage: totalExpenses > 0 ? (Math.abs(s.totalAmount) / totalExpenses) * 100 : 0
      }));

      return {
        month,
        startDate,
        endDate,
        categorySummaries,
        totalExpenses: -totalExpenses,
        totalIncome,
        netAmount: totalIncome - totalExpenses,
        transactionCount: transactions.length
      };
    },

    dashboardStats: async (_: any, __: any, { db }: { db: Database }) => {
      const repo = new TransactionRepository(db);
      const categoryRepo = new CategoryRepository(db);

      const [unclassified, pending, approved, categories] = await Promise.all([
        repo.findByStatus(ClassificationStatus.UNCLASSIFIED),
        repo.findByStatus(ClassificationStatus.PENDING),
        repo.findByStatus(ClassificationStatus.APPROVED),
        categoryRepo.findAll()
      ]);

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const currentMonthStart = `${currentMonth}-01`;

      const currentMonthTxns = await db.all<any>(
        `SELECT amount FROM transactions 
         WHERE date >= ? AND classification_status = 'approved'`,
        [currentMonthStart]
      );

      const currentMonthSpending = currentMonthTxns
        .filter((t: any) => t.amount < 0)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      return {
        totalTransactions: unclassified.length + pending.length + approved.length,
        unclassifiedCount: unclassified.length,
        pendingCount: pending.length,
        approvedCount: approved.length,
        categoryCount: categories.length,
        currentMonthSpending
      };
    }
  }
};
