# Transfer Category Type

## Overview

The `TRANSFER` category type is used to classify transactions that represent money moving between accounts. Unlike `EXPENSE` and `INCOME` categories, transfers don't represent actual spending or earning—they're just moving money around.

## Purpose

Transfers are important to track separately because:
- They don't affect your net worth (money just moves between accounts)
- They shouldn't be counted in spending or income totals
- They help identify account-to-account movements
- They're often paired (transfer out from one account, transfer in to another)

## Examples of Transfers

- Moving money from checking to savings
- Transferring between bank accounts
- Credit card payments from checking account
- Investment account deposits from checking
- Loan payments between accounts

## How Transfers Work

### In Reports
- Transfers are tracked and displayed separately
- They are NOT included in total expenses
- They are NOT included in total income
- They appear in their own "Transfer" category section

### In the Database
- Category type: `transfer`
- Default category: "Transfer" (created automatically)
- Stored in the same `categories` table with `category_type = 'transfer'`

### Expected Patterns
While not enforced, you'll typically see:
- **Paired transfers**: A negative amount (transfer out) and a positive amount (transfer in)
- **Same date**: Both sides of the transfer usually occur on the same day
- **Same amount**: The amounts should match (though timing differences may occur)

## Migration

If you have an existing database, run the migration to add support for the transfer category type:

```bash
npm run db:migrate --workspace=backend
```

This will:
1. Update the database schema to allow `transfer` as a category type
2. Create a default "Transfer" category
3. Preserve all existing data

## Usage

### Creating Transfer Categories

You can create additional transfer categories if needed:

```graphql
mutation {
  createCategory(input: {
    name: "Savings Transfer"
    description: "Transfers to savings account"
    categoryType: TRANSFER
    color: "#607D8B"
  }) {
    id
    name
    categoryType
  }
}
```

### Classifying Transactions as Transfers

Classify a transaction as a transfer:

```graphql
mutation {
  classifyTransaction(
    transactionId: "123"
    categoryId: "11"  # Transfer category ID
  ) {
    id
    category {
      name
      categoryType
    }
  }
}
```

### Viewing Transfers in Reports

Transfers appear in monthly reports but are excluded from expense/income totals:

```graphql
query {
  monthlyReport(month: "2026-02") {
    totalExpenses      # Does NOT include transfers
    totalIncome        # Does NOT include transfers
    categorySummaries {
      category {
        name
        categoryType   # Will show "TRANSFER" for transfer categories
      }
      totalAmount
      transactionCount
    }
  }
}
```

## Implementation Details

### Database Schema
```sql
CHECK (category_type IN ('expense', 'income', 'transfer'))
```

### TypeScript Enum
```typescript
export enum CategoryType {
  EXPENSE = 'expense',
  INCOME = 'income',
  TRANSFER = 'transfer'
}
```

### GraphQL Schema
```graphql
enum CategoryType {
  EXPENSE
  INCOME
  TRANSFER
}
```

## Best Practices

1. **Use the default Transfer category** for most account-to-account movements
2. **Create specific transfer categories** only if you need to track different types of transfers separately
3. **Don't worry about matching pairs** - the system doesn't enforce or validate paired transfers
4. **Review transfers regularly** to ensure they're classified correctly and not actual expenses/income

## Future Enhancements

Potential future features for transfers:
- Automatic detection of paired transfers
- Transfer matching and reconciliation
- Multi-account support with automatic transfer tracking
- Transfer validation and warnings
