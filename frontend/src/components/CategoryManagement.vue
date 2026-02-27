<template>
  <div class="category-management">
    <h2>Category Management</h2>

    <div class="create-category">
      <h3>Create New Category</h3>
      <form @submit.prevent="handleCreateCategory">
        <div class="form-group">
          <label>Name:</label>
          <input v-model="newCategory.name" required />
        </div>

        <div class="form-group">
          <label>Description:</label>
          <input v-model="newCategory.description" />
        </div>

        <div class="form-group">
          <label>Type:</label>
          <select v-model="newCategory.categoryType">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div class="form-group">
          <label>Color:</label>
          <input type="color" v-model="newCategory.color" />
        </div>

        <button type="submit" :disabled="createLoading">
          {{ createLoading ? 'Creating...' : 'Create Category' }}
        </button>
      </form>
    </div>

    <div class="categories-list">
      <h3>Existing Categories</h3>
      <div v-if="categoriesLoading">Loading...</div>
      <div v-else-if="categories?.categories" class="category-grid">
        <div
          v-for="category in categories.categories"
          :key="category.id"
          class="category-card"
          :style="{ borderLeftColor: category.color }"
        >
          <div class="category-header">
            <h4>{{ category.name }}</h4>
            <span class="category-type">{{ category.categoryType }}</span>
          </div>
          <p v-if="category.description" class="category-description">
            {{ category.description }}
          </p>
          <div class="category-stats">
            <span>Transactions: {{ category.transactionCount }}</span>
            <span>Total: ${{ Math.abs(category.totalAmount).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCategories } from '../composables/useCategories';

const { categories, categoriesLoading, refetchCategories, createCategory, createLoading } = useCategories();

const newCategory = ref({
  name: '',
  description: '',
  categoryType: 'expense',
  color: '#4CAF50'
});

async function handleCreateCategory() {
  try {
    await createCategory({
      input: {
        name: newCategory.value.name,
        description: newCategory.value.description || null,
        // Convert lowercase to uppercase for GraphQL enum
        categoryType: newCategory.value.categoryType.toUpperCase(),
        color: newCategory.value.color
      }
    });

    // Reset form
    newCategory.value = {
      name: '',
      description: '',
      categoryType: 'expense',
      color: '#4CAF50'
    };

    await refetchCategories();
  } catch (error) {
    console.error('Failed to create category:', error);
    alert('Failed to create category. Please try again.');
  }
}
</script>

<style scoped>
.category-management {
  background: white;
  padding: 2rem;
  border-radius: 8px;
}

.create-category {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.create-category h3 {
  margin-top: 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button[type="submit"] {
  padding: 0.75rem 2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button[type="submit"]:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.category-card {
  border: 1px solid #e0e0e0;
  border-left: 4px solid;
  border-radius: 8px;
  padding: 1rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.category-header h4 {
  margin: 0;
}

.category-type {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: #e0e0e0;
  border-radius: 4px;
  text-transform: uppercase;
}

.category-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}
</style>
