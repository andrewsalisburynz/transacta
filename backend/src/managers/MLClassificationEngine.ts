/**
 * ML Classification Engine (Simplified MVP)
 */

import { ClassificationHistoryEntry, Category, Transaction, ClassificationResult } from '../types/models';
import { logger } from '../utils/logger';

export class MLClassificationEngine {
  private vocabulary: Map<string, number> = new Map();
  private categoryWeights: Map<number, Map<string, number>> = new Map();
  private trained: boolean = false;

  async train(trainingData: ClassificationHistoryEntry[], categories: Category[]): Promise<void> {
    if (trainingData.length < 10) {
      throw new Error('Insufficient training data. Need at least 10 samples.');
    }

    logger.info('Training ML model', { samples: trainingData.length, categories: categories.length });

    // Build vocabulary
    const allTokens = new Set<string>();
    trainingData.forEach(entry => {
      const tokens = this.tokenize(entry.payee);
      tokens.forEach(token => allTokens.add(token));
    });

    // Create vocabulary index
    Array.from(allTokens).slice(0, 100).forEach((token, index) => {
      this.vocabulary.set(token, index);
    });

    // Train simple frequency-based model
    categories.forEach(category => {
      const categoryData = trainingData.filter(e => e.categoryId === category.id);
      const weights = new Map<string, number>();

      categoryData.forEach(entry => {
        const tokens = this.tokenize(entry.payee);
        tokens.forEach(token => {
          if (this.vocabulary.has(token)) {
            weights.set(token, (weights.get(token) || 0) + 1);
          }
        });
      });

      this.categoryWeights.set(category.id, weights);
    });

    this.trained = true;
    logger.info('ML model trained successfully');
  }

  async predict(transaction: Transaction, categories: Category[]): Promise<ClassificationResult> {
    if (!this.trained) {
      throw new Error('Model not trained yet');
    }

    const tokens = this.tokenize(transaction.payee);
    let maxScore = 0;
    let bestCategoryId = categories[0].id;

    // Calculate scores for each category
    categories.forEach(category => {
      const weights = this.categoryWeights.get(category.id);
      if (!weights) return;

      let score = 0;
      tokens.forEach(token => {
        if (this.vocabulary.has(token)) {
          score += weights.get(token) || 0;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestCategoryId = category.id;
      }
    });

    // Normalize confidence score
    const totalWeight = Array.from(this.categoryWeights.values())
      .reduce((sum, weights) => sum + Array.from(weights.values()).reduce((s, w) => s + w, 0), 0);
    
    const confidenceScore = totalWeight > 0 ? Math.min(maxScore / totalWeight * 10, 1.0) : 0.5;
    const shouldAutoApprove = confidenceScore >= 0.8;

    return {
      transactionId: transaction.id,
      suggestedCategoryId: bestCategoryId,
      confidenceScore,
      shouldAutoApprove,
      explanation: `Classified based on payee "${transaction.payee}" with ${(confidenceScore * 100).toFixed(0)}% confidence`
    };
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  isTrained(): boolean {
    return this.trained;
  }
}
