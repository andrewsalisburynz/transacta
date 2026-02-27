# Unit Test Instructions - Household Spending Tracker MVP

## Current Status: No Unit Tests (MVP)

### Decision Rationale

For this MVP release, **unit tests have been intentionally deferred** to prioritize rapid development and delivery of core functionality. This is a common trade-off in MVP development where:

- **Speed to market** is prioritized over comprehensive test coverage
- **Manual testing** provides sufficient validation for initial release
- **Technical debt** is acknowledged and will be addressed post-MVP

### Impact Assessment

**Risks:**
- Potential for undetected bugs in edge cases
- Refactoring requires more manual verification
- Regression testing is manual and time-consuming

**Mitigations:**
- Comprehensive manual testing checklist (see `manual-testing-checklist.md`)
- Integration testing scenarios (see `integration-test-instructions.md`)
- TypeScript strict mode catches many errors at compile time
- Code review process before deployment

## Future Unit Test Implementation Plan

### Phase 1: Critical Path Testing (Post-MVP)

**Priority 1 - Backend Services:**
1. **ImportService** (`backend/src/services/ImportService.ts`)
   - CSV parsing validation
   - Transaction normalization
   - Error handling for malformed data

2. **ClassificationService** (`backend/src/services/ClassificationService.ts`)
   - Classification logic
   - Confidence score calculation
   - Fallback to rule-based classification

3. **MLClassificationEngine** (`backend/src/managers/MLClassificationEngine.ts`)
   - Model loading and inference
   - Feature extraction
   - Prediction accuracy

**Priority 2 - Backend Repositories:**
1. **TransactionRepository** (`backend/src/repositories/TransactionRepository.ts`)
   - CRUD operations
   - Query filtering and pagination
   - Data integrity

2. **CategoryRepository** (`backend/src/repositories/CategoryRepository.ts`)
   - Category management
   - Validation rules

3. **ClassificationHistoryRepository** (`backend/src/repositories/ClassificationHistoryRepository.ts`)
   - History tracking
   - Audit trail integrity

**Priority 3 - Frontend Components:**
1. **CSVUpload.vue** (`frontend/src/components/CSVUpload.vue`)
   - File validation
   - Upload state management
   - Error display

2. **TransactionReview.vue** (`frontend/src/components/TransactionReview.vue`)
   - Transaction display and filtering
   - Classification updates
   - Bulk operations

3. **CategoryManagement.vue** (`frontend/src/components/CategoryManagement.vue`)
   - Category CRUD operations
   - Form validation

### Phase 2: Testing Framework Setup

**Backend Testing Stack:**
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  }
}
```

**Frontend Testing Stack:**
```json
{
  "devDependencies": {
    "vitest": "^1.1.0",
    "@vue/test-utils": "^2.4.3",
    "@testing-library/vue": "^8.0.1",
    "@testing-library/jest-dom": "^6.1.5",
    "jsdom": "^23.0.1"
  }
}
```

### Phase 3: Test Coverage Goals

**Target Coverage (Post-MVP):**
- Backend Services: 80%+ coverage
- Backend Repositories: 70%+ coverage
- Frontend Components: 60%+ coverage
- Overall Project: 70%+ coverage

**Coverage Exclusions:**
- Type definitions
- Configuration files
- Database schema
- Build scripts

## Recommended Testing Patterns

### Backend Unit Test Example

```typescript
// backend/__tests__/services/ImportService.test.ts
import { ImportService } from '../../src/services/ImportService';
import { CSVParser } from '../../src/managers/CSVParser';

describe('ImportService', () => {
  let importService: ImportService;
  let mockCSVParser: jest.Mocked<CSVParser>;

  beforeEach(() => {
    mockCSVParser = {
      parse: jest.fn(),
    } as any;
    importService = new ImportService(mockCSVParser);
  });

  describe('importTransactions', () => {
    it('should parse and normalize valid CSV data', async () => {
      const mockData = [
        { date: '2024-01-01', description: 'Grocery Store', amount: '-50.00' }
      ];
      mockCSVParser.parse.mockResolvedValue(mockData);

      const result = await importService.importTransactions('file.csv');

      expect(result.success).toBe(true);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].amount).toBe(-50.00);
    });

    it('should handle malformed CSV data gracefully', async () => {
      mockCSVParser.parse.mockRejectedValue(new Error('Invalid CSV'));

      const result = await importService.importTransactions('bad.csv');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid CSV');
    });
  });
});
```

### Frontend Component Test Example

```typescript
// frontend/__tests__/components/CSVUpload.test.ts
import { mount } from '@vue/test-utils';
import CSVUpload from '../../src/components/CSVUpload.vue';

describe('CSVUpload', () => {
  it('should render file input', () => {
    const wrapper = mount(CSVUpload);
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
  });

  it('should validate file type', async () => {
    const wrapper = mount(CSVUpload);
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    await wrapper.vm.handleFileSelect({ target: { files: [file] } });

    expect(wrapper.vm.error).toContain('CSV file');
  });

  it('should emit upload event with valid file', async () => {
    const wrapper = mount(CSVUpload);
    const file = new File(['content'], 'test.csv', { type: 'text/csv' });
    
    await wrapper.vm.handleFileSelect({ target: { files: [file] } });

    expect(wrapper.emitted('upload')).toBeTruthy();
    expect(wrapper.emitted('upload')[0][0]).toBe(file);
  });
});
```

## Running Tests (Future)

Once tests are implemented:

```bash
# Run all tests
npm run test:all

# Run backend tests only
npm run test --workspace=backend

# Run frontend tests only
npm run test --workspace=frontend

# Run with coverage
npm run test:coverage --workspace=backend
npm run test:coverage --workspace=frontend

# Run in watch mode (development)
npm run test:watch --workspace=backend
```

## Current Testing Approach (MVP)

Since unit tests are not implemented, rely on:

1. **TypeScript Strict Mode**: Catches type errors at compile time
2. **Manual Testing**: Follow `manual-testing-checklist.md`
3. **Integration Testing**: Follow `integration-test-instructions.md`
4. **Code Review**: Peer review before merging changes
5. **GraphQL Schema Validation**: Ensures API contract integrity

## Test-Driven Development (TDD) for Future Features

When adding new features post-MVP, consider TDD approach:

1. Write failing test first
2. Implement minimal code to pass test
3. Refactor while keeping tests green
4. Repeat for each feature

This will help build test coverage incrementally while maintaining quality.

## Monitoring and Quality Metrics

**Current Metrics (MVP):**
- TypeScript compilation: ✅ No errors
- Linting: ✅ ESLint passes
- Manual testing: ⏳ In progress

**Future Metrics (Post-MVP):**
- Unit test coverage: Target 70%+
- Integration test coverage: Target 80%+
- E2E test coverage: Critical paths 100%
- Code quality score: Maintain A grade

## Next Steps

1. Complete manual testing using `manual-testing-checklist.md`
2. Document any bugs found during manual testing
3. After MVP release, prioritize unit test implementation
4. Set up CI/CD pipeline with automated testing
5. Establish test coverage requirements for new features

## References

- [Manual Testing Checklist](./manual-testing-checklist.md)
- [Integration Test Instructions](./integration-test-instructions.md)
- [Build Instructions](./build-instructions.md)

---

**Note**: This document will be updated once unit tests are implemented. The testing framework setup and initial test suites should be prioritized in the first post-MVP sprint.
