# Transacta - Household Spending Tracker

A comprehensive household spending tracker application with ML-powered transaction classification, built with Node.js, Vue 3, GraphQL, and TensorFlow.js.

## Features

- **CSV Import**: Import bank transactions from CSV files (14-column format)
- **ML Classification**: Automatic transaction categorization using neural networks
- **Manual Review**: Review and approve ML suggestions with confidence scores
- **Category Management**: Create, edit, and delete spending categories
- **Monthly Reports**: Generate detailed spending reports by category
- **Dashboard**: Overview of spending statistics and recent transactions

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **API**: GraphQL (Apollo Server)
- **Database**: SQLite 3
- **ML Framework**: TensorFlow.js
- **Logging**: Winston

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **API Client**: Apollo Client
- **UI**: Virtual scrolling for large lists

## Project Structure

```
transacta/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── api/            # GraphQL API layer
│   │   ├── services/       # Domain services
│   │   ├── managers/       # Business logic
│   │   ├── repositories/   # Data access
│   │   ├── database/       # Database setup
│   │   ├── models/         # TypeScript models
│   │   └── utils/          # Utilities
│   └── __tests__/          # Backend tests
├── frontend/               # Vue 3 frontend
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── composables/    # Composition functions
│   │   ├── services/       # API clients
│   │   └── types/          # TypeScript types
│   └── __tests__/          # Frontend tests
├── data/                   # SQLite database
├── models/                 # ML model files
└── aidlc-docs/            # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd transacta
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npm run db:init --workspace=backend
```

### Development

Run both backend and frontend in development mode:
```bash
npm run dev:all
```

Or run them separately:
```bash
# Backend (http://localhost:4000)
npm run dev --workspace=backend

# Frontend (http://localhost:5173)
npm run dev --workspace=frontend
```

### Building for Production

```bash
npm run build:all
```

### Testing

Run all tests:
```bash
npm run test:all
```

Run tests for specific workspace:
```bash
npm run test --workspace=backend
npm run test --workspace=frontend
```

## Usage

### 1. Import Transactions

1. Navigate to the Import page
2. Upload your bank CSV file (14-column format)
3. Review import results (imported, duplicates, errors)

### 2. Review Classifications

1. Navigate to the Review page
2. Review ML-suggested categories with confidence scores
3. Accept suggestions or manually select categories
4. Transactions with >80% confidence are auto-approved

### 3. View Reports

1. Navigate to the Reports page
2. Select month and year
3. View spending breakdown by category
4. See transaction counts and percentages

### 4. Manage Categories

1. Navigate to the Categories page
2. Create new categories with names and colors
3. Edit existing categories
4. Delete unused categories

### 5. Train ML Model

The ML model automatically trains on approved classifications. Manual training:
```bash
npm run train-model --workspace=backend
```

## CSV File Format

The application expects bank CSV files with 14 columns:

1. Date (DD/MM/YYYY)
2. Amount (negative for expenses, positive for income)
3. Payee
4. Particulars
5. Code
6. Reference
7. Tran Type
8. This Party Account
9. Other Party Account
10. Serial
11. Transaction Code
12. Batch Number
13. Originating Bank/Branch
14. Processed Date

## Configuration

Environment variables (`.env`):

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_PATH=./data/household-spending.db

# ML Model
ML_MODEL_PATH=./models/classifier_latest
CONFIDENCE_THRESHOLD=0.8
MIN_TRAINING_SAMPLES=10

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## API Documentation

GraphQL Playground available at: `http://localhost:4000/graphql`

See [API Documentation](./aidlc-docs/construction/household-spending-tracker/code/api-documentation.md) for detailed API reference.

## Architecture

The application follows a layered architecture:

1. **API Layer**: GraphQL resolvers and schema
2. **Service Layer**: Workflow orchestration and event handling
3. **Manager Layer**: Business logic and domain operations
4. **Repository Layer**: Data access and persistence

Event-driven workflows coordinate between layers for complex operations like CSV import and ML classification.

## ML Classification

The application uses a neural network (TensorFlow.js) for transaction classification:

- **Input**: TF-IDF vectors from payee, particulars, and transaction type
- **Architecture**: 100 → 64 → 32 → N (categories)
- **Training**: Supervised learning on approved classifications
- **Auto-approval**: Transactions with >80% confidence

See [ML Model Documentation](./aidlc-docs/construction/household-spending-tracker/code/ml-model-documentation.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
