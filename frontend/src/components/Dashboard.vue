<template>
  <div class="dashboard">
    <h2>Dashboard</h2>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="stats" class="stats-grid">
      <div class="stat-card">
        <h3>Total Transactions</h3>
        <p class="stat-value">{{ stats.dashboardStats.totalTransactions }}</p>
      </div>

      <div class="stat-card">
        <h3>Unclassified</h3>
        <p class="stat-value warning">{{ stats.dashboardStats.unclassifiedCount }}</p>
      </div>

      <div class="stat-card">
        <h3>Pending Review</h3>
        <p class="stat-value">{{ stats.dashboardStats.pendingCount }}</p>
      </div>

      <div class="stat-card">
        <h3>Approved</h3>
        <p class="stat-value success">{{ stats.dashboardStats.approvedCount }}</p>
      </div>

      <div class="stat-card">
        <h3>Categories</h3>
        <p class="stat-value">{{ stats.dashboardStats.categoryCount }}</p>
      </div>

      <div class="stat-card">
        <h3>Current Month Spending</h3>
        <p class="stat-value">${{ stats.dashboardStats.currentMonthSpending.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalTransactions
      unclassifiedCount
      pendingCount
      approvedCount
      categoryCount
      currentMonthSpending
    }
  }
`;

const { result: stats, loading, error } = useQuery(GET_DASHBOARD_STATS);
</script>

<style scoped>
.dashboard {
  background: white;
  padding: 2rem;
  border-radius: 8px;
}

h2 {
  margin-top: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.stat-card {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: normal;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.stat-value.warning {
  color: #FF9800;
}

.stat-value.success {
  color: #4CAF50;
}
</style>
