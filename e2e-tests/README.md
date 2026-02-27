# End-to-End Tests

This directory contains all Playwright end-to-end tests for the Household Spending Tracker application.

## Structure

```
e2e-tests/
├── playwright.config.ts       # Playwright configuration
├── e2e-test.spec.ts           # Main E2E test suite
├── test-category-ui.spec.ts   # Category UI test suite
├── playwright-report/         # HTML test reports (generated)
├── test-results/              # Test execution results (generated)
└── screenshots/               # Test screenshots (generated)
```

## Running Tests

From the project root:

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

## Prerequisites

- Backend server running on http://localhost:4000
- Frontend server running on http://localhost:5173

## Test Suites

- **e2e-test.spec.ts**: Comprehensive end-to-end tests covering transaction management, CSV upload, category management, and reporting
- **test-category-ui.spec.ts**: Focused tests for category management UI functionality
