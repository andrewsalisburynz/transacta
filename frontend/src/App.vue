<template>
  <div id="app">
    <header>
      <h1>Household Spending Tracker</h1>
      <nav>
        <button @click="currentView = 'dashboard'" :class="{ active: currentView === 'dashboard' }">
          Dashboard
        </button>
        <button @click="currentView = 'upload'" :class="{ active: currentView === 'upload' }">
          Upload CSV
        </button>
        <button @click="currentView = 'review'" :class="{ active: currentView === 'review' }">
          Review Transactions
        </button>
        <button @click="currentView = 'categories'" :class="{ active: currentView === 'categories' }">
          Categories
        </button>
      </nav>
    </header>

    <main>
      <Dashboard v-if="currentView === 'dashboard'" />
      <CSVUpload v-else-if="currentView === 'upload'" />
      <TransactionReview v-else-if="currentView === 'review'" />
      <CategoryManagement v-else-if="currentView === 'categories'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dashboard from './components/Dashboard.vue';
import CSVUpload from './components/CSVUpload.vue';
import TransactionReview from './components/TransactionReview.vue';
import CategoryManagement from './components/CategoryManagement.vue';

const currentView = ref<'dashboard' | 'upload' | 'review' | 'categories'>('dashboard');
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: #f5f5f5;
}

header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  margin: 0 0 1rem 0;
  color: #333;
}

nav {
  display: flex;
  gap: 1rem;
}

nav button {
  padding: 0.5rem 1rem;
  border: none;
  background: #f0f0f0;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

nav button:hover {
  background: #e0e0e0;
}

nav button.active {
  background: #4CAF50;
  color: white;
}

main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
