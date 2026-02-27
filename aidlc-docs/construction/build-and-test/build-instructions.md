# Build Instructions - Household Spending Tracker MVP

## Prerequisites

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher

Verify your installation:
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 9.0.0 or higher
```

### System Requirements
- Operating System: Linux, macOS, or Windows
- Disk Space: ~500MB for dependencies
- RAM: 2GB minimum

## Installation Steps

### 1. Clone and Navigate to Project
```bash
cd /path/to/transacta
```

### 2. Install Dependencies
The project uses npm workspaces for monorepo management.

```bash
# Install all dependencies (root + backend + frontend)
npm install
```

This will install:
- Root workspace dependencies (concurrently)
- Backend dependencies (Apollo Server, Express, SQLite, etc.)
- Frontend dependencies (Vue 3, Apollo Client, Vite, etc.)

### 3. Environment Configuration
Create environment files from examples:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Edit the files if needed (defaults should work for local development):
- `backend/.env`: Database path, port (default: 4000)
- `frontend/.env`: API URL (default: http://localhost:4000/graphql)

### 4. Database Initialization
Initialize the SQLite database with schema and seed data:

```bash
npm run db:init --workspace=backend
```

This creates:
- Database file at `data/transacta.db`
- Tables: transactions, categories, classification_history
- Seed categories (Groceries, Utilities, Entertainment, etc.)

Expected output:
```
Database initialized successfully
Created tables: transactions, categories, classification_history
Seeded 10 default categories
```

## Build Commands

### Build All (Production)
Compile both backend and frontend for production:

```bash
npm run build:all
```

This executes:
1. **Backend build**: TypeScript compilation to `backend/dist/`
2. **Frontend build**: Vue + Vite build to `frontend/dist/`

### Build Individual Workspaces

**Backend only:**
```bash
npm run build --workspace=backend
```

**Frontend only:**
```bash
npm run build --workspace=frontend
```

### Development Mode
Run both services in watch mode:

```bash
npm run dev:all
```

This starts:
- Backend: http://localhost:4000 (GraphQL endpoint at /graphql)
- Frontend: http://localhost:5173

## Verification Steps

### 1. Check TypeScript Compilation
Verify no type errors without emitting files:

```bash
# Backend
cd backend && npx tsc --noEmit

# Frontend
cd frontend && npx vue-tsc --noEmit
```

Expected: No output means success.

### 2. Verify Build Artifacts

**Backend:**
```bash
ls -la backend/dist/
```
Should contain:
- `server.js` (main entry point)
- `database/`, `graphql/`, `managers/`, `repositories/`, `services/`, `utils/` directories
- `.d.ts` declaration files
- `.js.map` source maps

**Frontend:**
```bash
ls -la frontend/dist/
```
Should contain:
- `index.html`
- `assets/` directory with bundled JS and CSS

### 3. Test Database Connection
```bash
# Check database file exists
ls -la data/transacta.db

# Query categories (requires sqlite3 CLI)
sqlite3 data/transacta.db "SELECT COUNT(*) FROM categories;"
```
Should return: 10 (default seed categories)

### 4. Start Production Build
```bash
# Start backend
cd backend && npm start

# In another terminal, serve frontend
cd frontend && npm run preview
```

Access:
- Backend GraphQL Playground: http://localhost:4000/graphql
- Frontend: http://localhost:4173

### 5. GraphQL Schema Validation
Visit http://localhost:4000/graphql and run:

```graphql
query {
  categories {
    id
    name
    categoryType
  }
}
```

Expected: List of 10 categories.

## Troubleshooting

### Issue: "Cannot find module" errors during build

**Cause**: Dependencies not installed or corrupted node_modules

**Solution**:
```bash
# Clean and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
rm package-lock.json backend/package-lock.json frontend/package-lock.json
npm install
```

### Issue: TypeScript compilation errors

**Cause**: Type definition mismatches or missing types

**Solution**:
```bash
# Check for specific errors
cd backend && npx tsc --noEmit
cd frontend && npx vue-tsc --noEmit

# Common fixes:
# 1. Remove unused type references in tsconfig.json
# 2. Install missing @types packages
# 3. Check for syntax errors in .ts/.vue files
```

### Issue: Database initialization fails

**Cause**: Permission issues or data directory doesn't exist

**Solution**:
```bash
# Create data directory
mkdir -p data

# Remove existing database and reinitialize
rm data/transacta.db
npm run db:init --workspace=backend
```

### Issue: Port already in use

**Cause**: Another process using port 4000 or 5173

**Solution**:
```bash
# Find and kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or change port in .env files
# backend/.env: PORT=4001
# frontend/.env: VITE_API_URL=http://localhost:4001/graphql
```

### Issue: Frontend build fails with "out of memory"

**Cause**: Insufficient Node.js heap memory

**Solution**:
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build --workspace=frontend
```

### Issue: SQLite3 native module errors

**Cause**: Native bindings not compiled for your platform

**Solution**:
```bash
# Rebuild native modules
cd backend
npm rebuild sqlite3
```

## Build Artifacts

### Backend (backend/dist/)
- Compiled JavaScript (CommonJS modules)
- Type declarations (.d.ts)
- Source maps (.js.map)
- Size: ~500KB

### Frontend (frontend/dist/)
- Minified HTML, JS, CSS bundles
- Optimized assets
- Size: ~200KB (gzipped)

## Next Steps

After successful build:
1. Review **Integration Test Instructions** for manual testing scenarios
2. Run through CSV import workflow
3. Test classification and reporting features
4. Proceed to deployment (see deployment-architecture.md)

## Build Performance

Typical build times (on modern hardware):
- Backend: 5-10 seconds
- Frontend: 10-20 seconds
- Total: ~30 seconds

For faster development builds, use `npm run dev:all` which includes hot-reload.
