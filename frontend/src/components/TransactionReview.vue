<template>
  <div class="transaction-review">
    <h2>Review Transactions</h2>

    <div v-if="reviewLoading">Loading...</div>
    <div v-else-if="!reviewTransactions?.transactionsRequiringReview?.length">
      <p>No transactions requiring review.</p>
    </div>
    <div v-else class="transactions-list">
      <div
        v-for="transaction in reviewTransactions.transactionsRequiringReview"
        :key="transaction.id"
        class="transaction-card"
      >
        <div class="transaction-info">
          <div class="transaction-header">
            <strong>{{ transaction.payee }}</strong>
            <span class="amount" :class="transaction.amount < 0 ? 'expense' : 'income'">
              ${{ Math.abs(transaction.amount).toFixed(2) }}
            </span>
          </div>
          <div class="transaction-details">
            <span>{{ transaction.date }}</span>
            <span v-if="transaction.particulars">{{ transaction.particulars }}</span>
          </div>
          <div v-if="transaction.confidenceScore" class="confidence">
            Confidence: {{ (transaction.confidenceScore * 100).toFixed(0) }}%
          </div>
        </div>

        <div class="transaction-actions">
          <select
            v-model="selectedCategories[transaction.id]"
            class="category-select"
          >
            <option value="">Select category...</option>
            <option
              v-for="category in categories?.categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>

          <button
            @click="classify(transaction.id)"
            :disabled="!selectedCategories[transaction.id] || classifyLoading"
            class="classify-btn"
          >
            Classify
          </button>

          <button
            @click="getSuggestion(transaction.id)"
            :disabled="suggestionLoading"
            class="suggest-btn"
          >
            Get Suggestion
          </button>
        </div>

        <div v-if="suggestions[transaction.id]" class="suggestion">
          Suggested: {{ getCategoryName(suggestions[transaction.id].suggestedCategoryId) }}
          ({{ (suggestions[transaction.id].confidenceScore * 100).toFixed(0) }}%)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTransactions } from '../composables/useTransactions';
import { useCategories } from '../composables/useCategories';

const { reviewTransactions, reviewLoading, refetchReview, classifyTransaction, classifyLoading, getSuggestion: getSuggestionMutation, suggestionLoading } = useTransactions();
const { categories } = useCategories();

const selectedCategories = ref<Record<number, number>>({});
const suggestions = ref<Record<number, any>>({});

async function classify(transactionId: number) {
  const categoryId = selectedCategories.value[transactionId];
  if (!categoryId) return;

  try {
    await classifyTransaction({
      transactionId: transactionId.toString(),
      categoryId: categoryId.toString()
    });
    await refetchReview();
  } catch (error) {
    console.error('Classification failed:', error);
  }
}

async function getSuggestion(transactionId: number) {
  try {
    const result = await getSuggestionMutation({
      transactionId: transactionId.toString()
    });
    
    if (result?.data?.getClassificationSuggestion) {
      suggestions.value[transactionId] = result.data.getClassificationSuggestion;
      selectedCategories.value[transactionId] = result.data.getClassificationSuggestion.suggestedCategoryId;
    }
  } catch (error) {
    console.error('Failed to get suggestion:', error);
  }
}

function getCategoryName(categoryId: number): string {
  const category = categories.value?.categories?.find((c: any) => c.id === categoryId);
  return category?.name || 'Unknown';
}
</script>

<style scoped>
.transaction-review {
  background: white;
  padding: 2rem;
  border-radius: 8px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.transaction-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 1.2rem;
  font-weight: bold;
}

.amount.expense {
  color: #F44336;
}

.amount.income {
  color: #4CAF50;
}

.transaction-details {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.confidence {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}

.transaction-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.category-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.classify-btn, .suggest-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.classify-btn {
  background: #4CAF50;
  color: white;
}

.suggest-btn {
  background: #2196F3;
  color: white;
}

.classify-btn:disabled, .suggest-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.suggestion {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #E3F2FD;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
