# Feature Roadmap - Household Spending Tracker

**Last Updated**: 2026-02-27  
**Current Version**: MVP (v1.0)  
**Status**: ✅ MVP Complete, Ready for Enhancement

---

## Overview

This document outlines planned features and enhancements for the Household Spending Tracker application. Features are organized by priority and complexity, with estimated effort and dependencies.

---

## Current State (MVP - v1.0)

### ✅ Implemented Features
- CSV import with 14-column bank format
- Transaction management (CRUD operations)
- Category management (create, list, delete)
- Simple frequency-based ML classifier
- Manual transaction classification
- Dashboard with statistics
- Monthly spending reports
- GraphQL API
- Vue 3 frontend with Apollo Client
- SQLite database with triggers
- Automated E2E tests (Playwright)

### 📊 Test Results
- 10/10 automated tests passing
- All critical bugs fixed
- Performance excellent (<1s page loads, <15ms API calls)

---

## Roadmap Categories

Features are organized into these categories:
- **P0 (Critical)**: Essential for production use
- **P1 (High)**: Significantly improves user experience
- **P2 (Medium)**: Nice-to-have enhancements
- **P3 (Low)**: Future considerations

**Effort Estimates**:
- 🟢 Small (1-3 days)
- 🟡 Medium (4-7 days)
- 🔴 Large (1-2 weeks)
- 🟣 Extra Large (2+ weeks)

---

## Phase 1: Production Readiness (v1.1)

**Goal**: Make the application production-ready with proper testing, error handling, and user experience improvements.

### P0 - Critical for Production

#### 1.1 Advanced ML Classification Engine 🟣
**Effort**: Extra Large (2-3 weeks)  
**Priority**: P0  
**Status**: Not Started

**Description**: Replace simple frequency-based classifier with TensorFlow.js neural network for better accuracy.

**Features**:
- TF-IDF feature extraction from payee and particulars
- Neural network architecture (100 → 64 → 32 → N categories)
- Model persistence and versioning
- Incremental training on new classifications
- Confidence scoring based on softmax output
- Handle new merchants with similarity matching

**Acceptance Criteria**:
- Classification accuracy >80% after 100 training samples
- Prediction time <500ms per transaction
- Model persists between sessions
- Auto-approval threshold configurable (default 80%)

**Dependencies**: None  
**User Stories**: 3.1, 3.2, 3.3, 3.4, 3.5

---

#### 1.2 Comprehensive Error Handling 🟡
**Effort**: Medium (5 days)  
**Priority**: P0  
**Status**: Not Started

**Description**: Add robust error handling throughout the application.

**Features**:
- Input validation on all forms
- GraphQL error handling with user-friendly messages
- CSV parsing error recovery
- Database error handling with retry logic
- Frontend error boundaries
- Toast notifications for errors
- Logging of all errors

**Acceptance Criteria**:
- No unhandled exceptions in production
- All errors show user-friendly messages
- Critical errors logged for debugging
- Users can recover from errors without restarting

**Dependencies**: None  
**User Stories**: 7.1, 7.2, 7.3

---

#### 1.3 Duplicate Transaction Detection 🟢
**Effort**: Small (2 days)  
**Priority**: P0  
**Status**: Not Started

**Description**: Prevent importing duplicate transactions from CSV files.

**Features**:
- Detect duplicates by date + amount + payee + reference
- Show duplicate count before import
- Allow user to skip duplicates or import anyway
- Display list of detected duplicates
- Summary of imported vs skipped transactions

**Acceptance Criteria**:
- Duplicate detection <2s for 1000 transactions
- User can review duplicates before deciding
- No accidental duplicate imports

**Dependencies**: None  
**User Stories**: 2.3

---

#### 1.4 Unit & Integration Tests 🟡
**Effort**: Medium (7 days)  
**Priority**: P0  
**Status**: Not Started

**Description**: Add comprehensive test coverage for backend and frontend.

**Features**:
- Unit tests for repositories (Jest)
- Unit tests for managers and services
- Unit tests for GraphQL resolvers
- Frontend component tests (Vitest)
- Integration tests for API workflows
- Test coverage reporting
- CI/CD integration

**Acceptance Criteria**:
- >80% code coverage
- All critical paths tested
- Tests run in CI/CD pipeline
- No flaky tests

**Dependencies**: None  
**User Stories**: All (quality assurance)

---

### P1 - High Priority Enhancements

#### 1.5 Transaction Review Improvements 🟢
**Effort**: Small (3 days)  
**Priority**: P1  
**Status**: Not Started

**Description**: Enhance the transaction review interface for better usability.

**Features**:
- Keyboard shortcuts for quick classification
- Bulk accept for multiple similar transactions
- Filter by confidence level
- Sort by date, amount, or confidence
- Quick search by payee or amount
- Pagination for large transaction lists
- Transaction details modal/expandable view

**Acceptance Criteria**:
- Users can classify 50+ transactions in <5 minutes
- Keyboard navigation works smoothly
- Filters and sorting are intuitive

**Dependencies**: None  
**User Stories**: 4.1, 4.3, 4.4

---

#### 1.6 Enhanced Reporting 🟡
**Effort**: Medium (5 days)  
**Priority**: P1  
**Status**: Not Started

**Description**: Add visualizations and drill-down capabilities to reports.

**Features**:
- Pie chart for category breakdown
- Bar chart for monthly spending trends
- Click category to see transaction list
- Export report to CSV/PDF
- Compare spending across months
- Income vs expense summary
- Year-to-date totals

**Acceptance Criteria**:
- Charts render in <1s
- Drill-down shows relevant transactions
- Export works for all report types
- Mobile-friendly visualizations

**Dependencies**: None  
**User Stories**: 5.3, 5.4

---

#### 1.7 Category Management Enhancements 🟢
**Effort**: Small (2 days)  
**Priority**: P1  
**Status**: Not Started

**Description**: Add editing and reassignment capabilities for categories.

**Features**:
- Edit category name and color
- Reassign transactions when deleting category
- Bulk reclassify transactions
- Category usage statistics
- Merge duplicate categories
- Category icons/emojis

**Acceptance Criteria**:
- Category edits update all references
- Bulk operations handle 1000+ transactions
- No orphaned transactions after deletion

**Dependencies**: None  
**User Stories**: 6.2, 6.3, 6.4, 6.5

---

## Phase 2: User Experience (v1.2)

**Goal**: Improve usability, add convenience features, and polish the interface.

### P1 - High Priority

#### 2.1 Virtual Scrolling for Large Lists 🟢
**Effort**: Small (2 days)  
**Priority**: P1  
**Status**: Not Started

**Description**: Implement virtual scrolling for transaction and category lists.

**Features**:
- Virtual scrolling for 1000+ transactions
- Smooth scrolling performance
- Maintain scroll position on navigation
- Load more on scroll

**Acceptance Criteria**:
- Lists with 10,000 items scroll smoothly
- Memory usage stays constant
- No lag or jank

**Dependencies**: None  
**Technical**: Use vue-virtual-scroller or similar

---

#### 2.2 Advanced Filtering & Search 🟡
**Effort**: Medium (4 days)  
**Priority**: P1  
**Status**: Not Started

**Description**: Add comprehensive filtering and search capabilities.

**Features**:
- Search by payee, particulars, or amount
- Filter by date range
- Filter by category
- Filter by classification status
- Filter by amount range
- Save filter presets
- Clear all filters button

**Acceptance Criteria**:
- Search returns results in <500ms
- Multiple filters can be combined
- Filter state persists during session

**Dependencies**: None  
**User Stories**: 4.1

---

#### 2.3 Dashboard Enhancements 🟢
**Effort**: Small (3 days)  
**Priority**: P1  
**Status**: Not Started

**Description**: Add more insights and visualizations to dashboard.

**Features**:
- Spending trend chart (last 6 months)
- Top 5 spending categories
- Recent transactions widget
- Unclassified transaction count with quick link
- Budget vs actual (if budgets implemented)
- Quick actions (import CSV, review transactions)

**Acceptance Criteria**:
- Dashboard loads in <1s
- Charts are interactive
- Quick actions work correctly

**Dependencies**: None  
**User Stories**: Dashboard improvements

---

### P2 - Medium Priority

#### 2.4 Dark Mode 🟢
**Effort**: Small (2 days)  
**Priority**: P2  
**Status**: Not Started

**Description**: Add dark mode theme option.

**Features**:
- Dark mode toggle
- Persist theme preference
- Smooth theme transition
- Accessible color contrast
- Dark mode for all components

**Acceptance Criteria**:
- WCAG AA contrast ratios met
- Theme persists across sessions
- No flash of wrong theme on load

**Dependencies**: None  
**Technical**: CSS variables for theming

---

## Phase 3: Advanced Features (v2.0)

**Goal**: Add power user features and advanced functionality.

### P1 - High Priority

#### 3.1 Budget Tracking 🟡
**Effort**: Medium (7 days)  
**Priority**: P1  
**Status**: Not Started

**Description**: Add budget planning and tracking capabilities.

**Features**:
- Set monthly budget per category
- Budget vs actual comparison
- Budget alerts when approaching limit
- Budget rollover options
- Budget templates
- Budget history and trends

**Acceptance Criteria**:
- Budgets can be set for any category
- Alerts trigger at 80% and 100%
- Budget data persists

**Dependencies**: Enhanced Reporting (1.6)  
**User Stories**: New feature

---

#### 3.2 Recurring Transaction Detection 🟡
**Effort**: Medium (5 days)  
**Priority**: P1  
**Status**: Not Started

**Description**: Automatically detect and flag recurring transactions.

**Features**:
- Detect recurring patterns (monthly, weekly, etc.)
- Flag recurring transactions
- Auto-classify recurring transactions
- Recurring transaction management
- Predict upcoming recurring transactions

**Acceptance Criteria**:
- Detects 90%+ of true recurring transactions
- <5% false positives
- User can confirm/reject recurring patterns

**Dependencies**: Advanced ML (1.1)  
**User Stories**: New feature

---

### P2 - Medium Priority

#### 3.3 Data Export & Backup 🟢
**Effort**: Small (3 days)  
**Priority**: P2  
**Status**: Not Started

**Description**: Export data and create backups.

**Features**:
- Export transactions to CSV
- Export reports to PDF
- Full database backup
- Restore from backup
- Scheduled automatic backups
- Export to accounting software formats

**Acceptance Criteria**:
- Exports complete in <5s for 10k transactions
- Backups are restorable
- No data loss in export/import

**Dependencies**: None  
**User Stories**: New feature

---

#### 3.4 Transaction Notes & Attachments 🟢
**Effort**: Small (3 days)  
**Priority**: P2  
**Status**: Not Started

**Description**: Add notes and attach receipts to transactions.

**Features**:
- Add text notes to transactions
- Attach receipt images
- Search notes
- Filter by notes/attachments
- Receipt OCR (future)

**Acceptance Criteria**:
- Notes save immediately
- Images stored efficiently
- Search includes notes

**Dependencies**: None  
**User Stories**: New feature

---

## Technical Debt & Infrastructure

### Ongoing Improvements

#### I.1 Performance Optimization
- Database query optimization
- Index tuning
- Caching strategy
- Bundle size reduction
- Lazy loading components

#### I.2 Code Quality
- Refactor large components
- Improve type safety
- Add JSDoc comments
- Code style consistency
- Remove dead code

#### I.3 Security Hardening
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens (if multi-user)
- Security audit

#### I.4 Accessibility
- WCAG 2.1 AA compliance
- Screen reader testing
- Keyboard navigation
- Focus management
- ARIA labels

#### I.5 Documentation
- API documentation
- User guide
- Developer guide
- Architecture documentation
- Deployment guide

---

## Release Planning

### v1.1 - Production Ready (Target: 4-6 weeks)
- Advanced ML Classification (1.1)
- Error Handling (1.2)
- Duplicate Detection (1.3)
- Unit & Integration Tests (1.4)
- Transaction Review Improvements (1.5)

### v1.2 - Enhanced UX (Target: 2-3 weeks after v1.1)
- Enhanced Reporting (1.6)
- Category Management (1.7)
- Virtual Scrolling (2.1)
- Advanced Filtering (2.2)
- Dashboard Enhancements (2.3)

### v2.0 - Advanced Features (Target: 3-4 months after v1.2)
- Budget Tracking (3.1)
- Recurring Transactions (3.2)
- Data Export & Backup (3.3)
- Transaction Notes & Attachments (3.4)
- Dark Mode (2.4)

---

## Success Metrics

### v1.1 Goals
- Classification accuracy >80%
- Test coverage >80%
- Zero critical bugs
- Page load <1s
- API response <500ms

### v1.2 Goals
- User can classify 100 transactions in <10 minutes
- Reports generate in <2s
- Dashboard provides actionable insights

### v2.0 Goals
- Support 50k+ transactions
- Budget tracking used by 80% of users
- Recurring detection accuracy >90%
- Data export/backup used regularly

---

## Feedback & Iteration

This roadmap is a living document and will be updated based on:
- User feedback and feature requests
- Technical discoveries during implementation
- Changing priorities and business needs
- Performance and scalability requirements

**Last Review**: 2026-02-27  
**Next Review**: After v1.1 release

---

## Contributing

To propose a new feature:
1. Create an issue with feature description
2. Include user stories and acceptance criteria
3. Estimate effort and priority
4. Identify dependencies
5. Discuss with team before adding to roadmap
