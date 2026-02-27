# Quick Start Guide - MVP

This guide will get you up and running with the Household Spending Tracker MVP in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed

## Setup Steps

### 1. Install Dependencies

```bash
# Install all dependencies (root + workspaces)
npm install
```

### 2. Initialize Database

```bash
# Create database and seed default categories
npm run db:init --workspace=backend
```

This creates:
- SQLite database at `./data/household-spending.db`
- 10 default categories (Groceries, Utilities, Entertainment, etc.)

### 3. Start Development Servers

```bash
# Start both backend and frontend
npm run dev:all
```

This starts:
- **Backend API**: http://localhost:4000/graphql
- **Frontend UI**: http://localhost:5173

## First Steps

### 1. Open the Application

Navigate to http://localhost:5173 in your browser.

### 2. Upload Sample CSV

1. Click "Upload CSV" tab
2. Upload a CSV file with your bank transactions
3. View import results

**CSV Format Required:**
```
Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date
15/01/2024,-45.50,COUNTDOWN SUPERMARKET,Weekly groceries,,,POS,12-3456-7890123-00,,001,POS,B001,12-3456,15/01/2024
```

### 3. Review Transactions

1. Click "Review Transactions" tab
2. You'll see unclassified transactions
3. Click "Get Suggestion" to get ML classification (after training)
4. Or manually select a category and click "Classify"

### 4. Train ML Model

After classifying at least 10 transactions manually:

1. The ML model will automatically train on your classifications
2. Future transactions will get automatic suggestions
3. High-confidence suggestions (>80%) are auto-approved

### 5. View Dashboard

1. Click "Dashboard" tab
2. See statistics:
   - Total transactions
   - Unclassified count
   - Current month spending
   - Category breakdown

### 6. Manage Categories

1. Click "Categories" tab
2. View existing categories
3. Create new categories with custom colors
4. See transaction counts per category

## Core Workflow

```
1. Upload CSV → 2. Review Transactions → 3. Classify → 4. View Reports
                         ↓
                   Get ML Suggestion
                         ↓
                   Accept or Correct
                         ↓
                   Model Learns
```

## Troubleshooting

### Database Issues

If you see database errors:
```bash
# Reinitialize database
rm -rf data/
npm run db:init --workspace=backend
```

### Port Conflicts

If ports 4000 or 5173 are in use:

**Backend:**
```bash
# Edit backend/.env
PORT=4001
```

**Frontend:**
```bash
# Edit vite.config.ts
server: { port: 5174 }
```

### ML Model Not Training

The ML model requires at least 10 manually classified transactions:

1. Classify 10+ transactions manually
2. The model will train automatically
3. Check backend logs for training confirmation

## Development Commands

```bash
# Backend only
npm run dev --workspace=backend

# Frontend only
npm run dev --workspace=frontend

# Build for production
npm run build:all

# Lint code
npm run lint:all

# Format code
npm run format:all
```

## GraphQL Playground

Access GraphQL Playground at http://localhost:4000/graphql

**Example Query:**
```graphql
query {
  dashboardStats {
    totalTransactions
    unclassifiedCount
    currentMonthSpending
  }
}
```

**Example Mutation:**
```graphql
mutation {
  createCategory(input: {
    name: "Coffee"
    categoryType: EXPENSE
    color: "#795548"
  }) {
    id
    name
  }
}
```

## Next Steps

1. Import your bank CSV files
2. Classify transactions to train the ML model
3. Review monthly spending reports
4. Create custom categories for your needs
5. Let the ML model learn your spending patterns

## Need Help?

- Check the main README.md for detailed documentation
- Review the GraphQL schema at `backend/src/graphql/schema.ts`
- Check backend logs in `logs/` directory
- Open an issue on GitHub

## MVP Limitations

This MVP includes:
- ✅ Core functionality (import, classify, report)
- ✅ Simple ML classification
- ✅ Basic UI

Not included (future enhancements):
- ❌ Advanced ML features (TensorFlow.js neural network)
- ❌ Unit tests
- ❌ Advanced UI (virtual scrolling, charts)
- ❌ User authentication
- ❌ Multi-user support

Enjoy tracking your spending! 🎉
