/**
 * Classification Service
 */

import { MLClassificationEngine } from '../managers/MLClassificationEngine';
import { TransactionDataManager } from '../managers/TransactionDataManager';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { ClassificationHistoryRepository } from '../repositories/ClassificationHistoryRepository';
import { ClassificationResult, ClassificationMethod, Transaction } from '../types/models';
import { logger } from '../utils/logger';

export class ClassificationService {
  constructor(
    private mlEngine: MLClassificationEngine,
    private transactionManager: TransactionDataManager,
    private transactionRepo: TransactionRepository,
    private categoryRepo: CategoryRepository,
    private historyRepo: ClassificationHistoryRepository
  ) {}

  async trainModel(): Promise<void> {
    logger.info('Training ML model');

    const trainingData = await this.historyRepo.findForTraining(10);
    const categories = await this.categoryRepo.findAll();

    if (trainingData.length < 10) {
      throw new Error('Insufficient training data. Need at least 10 classified transactions.');
    }

    await this.mlEngine.train(trainingData, categories);
    logger.info('ML model trained successfully');
  }

  async classifyTransaction(transactionId: number): Promise<ClassificationResult> {
    const transaction = await this.transactionRepo.findById(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (!this.mlEngine.isTrained()) {
      await this.trainModel();
    }

    const categories = await this.categoryRepo.findAll();
    const result = await this.mlEngine.predict(transaction, categories);

    // Update transaction with suggestion
    await this.transactionManager.classifyTransaction(
      transactionId,
      result.suggestedCategoryId,
      result.confidenceScore,
      result.shouldAutoApprove
    );

    // Record in history if auto-approved
    if (result.shouldAutoApprove) {
      await this.historyRepo.create({
        transactionId,
        categoryId: result.suggestedCategoryId,
        payee: transaction.payee,
        particulars: transaction.particulars,
        tranType: transaction.tranType,
        amount: transaction.amount,
        classificationMethod: ClassificationMethod.ML_AUTO,
        confidenceScore: result.confidenceScore,
        wasCorrected: false,
        previousCategoryId: null
      });
    }

    return result;
  }

  async manualClassify(transactionId: number, categoryId: number): Promise<Transaction> {
    const transaction = await this.transactionRepo.findById(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // Update transaction
    const updated = await this.transactionManager.classifyTransaction(
      transactionId,
      categoryId,
      undefined,
      true
    );

    // Record in history
    await this.historyRepo.create({
      transactionId,
      categoryId,
      payee: transaction.payee,
      particulars: transaction.particulars,
      tranType: transaction.tranType,
      amount: transaction.amount,
      classificationMethod: ClassificationMethod.MANUAL,
      confidenceScore: null,
      wasCorrected: false,
      previousCategoryId: transaction.categoryId || null
    });

    return updated;
  }
}
