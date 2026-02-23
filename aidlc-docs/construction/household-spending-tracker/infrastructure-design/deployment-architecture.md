# Deployment Architecture - Household Spending Tracker

## Purpose
This document defines the deployment architecture, installation procedures, configuration management, and operational procedures for the Household Spending Tracker application.

---

## 1. Deployment Overview

### 1.1 Deployment Model

**Type**: Local Desktop Application

**Deployment Strategy**: Manual Installation

**Target Environment**: User's local machine (Windows, macOS, Linux)

**Deployment Frequency**: As needed (no continuous deployment)

---

### 1.2 Deployment Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User's Local Machine                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Operating System                         │ │
│  │              (Windows / macOS / Linux)                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Node.js Runtime                          │ │
│  │                    (v18.x LTS+)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          Household Spending Tracker Application            │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Express Server (Port 4000)                          │ │ │
│  │  │  - GraphQL API                                       │ │ │
│  │  │  - Static File Server                                │ │ │
│  │  │  - ML Classification Engine                          │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  File System                                         │ │ │
│  │  │  - ./data/household-spending.db (SQLite)             │ │ │
│  │  │  - ./logs/ (Application logs)                        │ │ │
│  │  │  - ./temp/uploads/ (Temporary CSV files)             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Web Browser                              │ │
│  │              http://localhost:4000                         │ │
│  │  - Vue 3 Frontend                                          │ │
│  │  - Apollo GraphQL Client                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Installation Procedures

### 2.1 Prerequisites

**Required Software**:
1. Node.js 18.x LTS or later
   - Download: https://nodejs.org/
   - Includes npm package manager
   - Verify: `node --version` (should show v18.x or later)

2. Git (optional, for cloning repository)
   - Download: https://git-scm.com/
   - Alternative: Download ZIP from repository

3. Modern Web Browser
   - Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

**System Requirements**:
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Disk: 1GB free space
- OS: Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)

---

### 2.2 Installation Steps

#### Step 1: Install Node.js

**Windows**:
```powershell
# Download installer from nodejs.org
# Run installer (nodejs-v18.x.x-x64.msi)
# Follow installation wizard
# Verify installation
node --version
npm --version
```

**macOS**:
```bash
# Option 1: Download installer from nodejs.org
# Run installer (nodejs-v18.x.x.pkg)

# Option 2: Using Homebrew
brew install node@18

# Verify installation
node --version
npm --version
```

**Linux (Ubuntu/Debian)**:
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

---

#### Step 2: Get Application Files

**Option A: Clone Repository (Recommended)**:
```bash
# Clone repository
git clone https://github.com/your-org/household-spending-tracker.git

# Navigate to directory
cd household-spending-tracker
```

**Option B: Download ZIP**:
```bash
# Download ZIP from repository
# Extract to desired location
# Navigate to directory
cd household-spending-tracker
```

---

#### Step 3: Install Dependencies

```bash
# Install all dependencies (root, frontend, backend)
npm run install:all

# This runs:
# - npm install (root)
# - cd frontend && npm install
# - cd backend && npm install
```

**Expected Output**:
```
Installing root dependencies...
✓ Root dependencies installed

Installing frontend dependencies...
✓ Frontend dependencies installed

Installing backend dependencies...
✓ Backend dependencies installed

Installation complete!
```

**Installation Time**: 5-10 minutes (depending on internet speed)

---

#### Step 4: Build Application

```bash
# Build frontend and backend
npm run build

# This runs:
# - cd frontend && npm run build (Vite build)
# - cd backend && npm run build (TypeScript compile)
```

**Expected Output**:
```
Building frontend...
vite v4.4.9 building for production...
✓ 150 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-abc123.css      12.34 kB
dist/assets/index-def456.js       234.56 kB
✓ Frontend built successfully

Building backend...
✓ Backend compiled successfully
```

**Build Time**: 1-2 minutes

---

#### Step 5: Start Application

```bash
# Start production server
npm start

# Or start from backend directory
cd backend
npm start
```

**Expected Output**:
```
Starting Household Spending Tracker...

✓ Database initialized
✓ ML model loaded
✓ Server started on port 4000
✓ Application ready at http://localhost:4000

Press Ctrl+C to stop
```

---

#### Step 6: Access Application

1. Open web browser
2. Navigate to: http://localhost:4000
3. Application should load and display dashboard

**First-Time Setup**:
- Create at least one category before importing transactions
- Import CSV file to get started
- Review and classify transactions

---

### 2.3 Verification

**Verify Installation**:
```bash
# Check Node.js version
node --version
# Expected: v18.x.x or later

# Check npm version
npm --version
# Expected: 9.x.x or later

# Check application files
ls -la
# Should see: backend/, frontend/, data/, logs/, package.json

# Check dependencies installed
ls node_modules
# Should see many packages

# Check build output
ls frontend/dist
# Should see: index.html, assets/

ls backend/dist
# Should see: *.js files
```

**Verify Application Running**:
```bash
# Check server is running
curl http://localhost:4000
# Should return HTML

# Check GraphQL endpoint
curl http://localhost:4000/graphql
# Should return GraphQL response

# Check logs
cat logs/application.log
# Should see startup logs
```

---

## 3. Configuration Management

### 3.1 Environment Variables

**Configuration File**: `.env` (root directory)

**Default Configuration**:
```bash
# Server Configuration
NODE_ENV=production
PORT=4000

# Database Configuration
DATABASE_PATH=./data/household-spending.db

# Logging Configuration
LOG_LEVEL=info
LOG_DIR=./logs

# File Upload Configuration
TEMP_UPLOAD_DIR=./temp/uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes

# ML Configuration
ML_CONFIDENCE_THRESHOLD=0.8
```

**Environment Variables**:

| Variable | Default | Description | Valid Values |
|----------|---------|-------------|--------------|
| NODE_ENV | production | Environment mode | development, production |
| PORT | 4000 | Server port | 1024-65535 |
| DATABASE_PATH | ./data/household-spending.db | Database file path | Any valid path |
| LOG_LEVEL | info | Logging level | error, warn, info, debug |
| LOG_DIR | ./logs | Log directory | Any valid path |
| TEMP_UPLOAD_DIR | ./temp/uploads | Temp upload directory | Any valid path |
| MAX_FILE_SIZE | 10485760 | Max CSV file size (bytes) | Any positive integer |
| ML_CONFIDENCE_THRESHOLD | 0.8 | ML auto-approval threshold | 0.0 - 1.0 |

---

### 3.2 Configuration Examples

**Development Configuration**:
```bash
# .env.development
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug
DATABASE_PATH=./data/household-spending-dev.db
```

**Production Configuration**:
```bash
# .env.production
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
DATABASE_PATH=./data/household-spending.db
```

**Custom Port Configuration**:
```bash
# .env
PORT=8080
```

**Custom Database Location**:
```bash
# .env
DATABASE_PATH=/Users/john/Documents/spending-tracker.db
```

---

### 3.3 Configuration Loading

**Priority Order** (highest to lowest):
1. Environment variables (set in shell)
2. `.env` file
3. Default values in code

**Example**:
```bash
# Override port via environment variable
PORT=5000 npm start

# Override multiple variables
PORT=5000 LOG_LEVEL=debug npm start
```

---

## 4. Directory Structure

### 4.1 Application Directory Layout

```
household-spending-tracker/
│
├── backend/                      # Backend application
│   ├── src/                      # TypeScript source code
│   │   ├── api/                  # GraphQL API
│   │   │   ├── schema/           # GraphQL schema
│   │   │   └── resolvers/        # GraphQL resolvers
│   │   ├── services/             # Business logic services
│   │   ├── repositories/         # Data access layer
│   │   ├── models/               # Domain models
│   │   ├── utils/                # Utility functions
│   │   ├── database/             # Database setup
│   │   ├── ml/                   # ML classification
│   │   └── server.ts             # Server entry point
│   ├── dist/                     # Compiled JavaScript (generated)
│   ├── package.json              # Backend dependencies
│   └── tsconfig.json             # TypeScript configuration
│
├── frontend/                     # Frontend application
│   ├── src/                      # Vue source code
│   │   ├── components/           # Vue components
│   │   ├── views/                # Page views
│   │   ├── router/               # Vue Router
│   │   ├── apollo/               # Apollo Client setup
│   │   ├── types/                # TypeScript types
│   │   ├── utils/                # Utility functions
│   │   ├── App.vue               # Root component
│   │   └── main.ts               # Application entry point
│   ├── dist/                     # Built frontend (generated)
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   └── vite.config.ts            # Vite configuration
│
├── data/                         # Data directory (created on first run)
│   └── household-spending.db     # SQLite database
│
├── logs/                         # Log directory (created on first run)
│   ├── application.log           # Combined logs
│   └── error.log                 # Error logs only
│
├── temp/                         # Temporary files (created on first run)
│   └── uploads/                  # Temporary CSV uploads
│
├── .env                          # Environment variables (user creates)
├── .gitignore                    # Git ignore file
├── package.json                  # Root package.json (scripts)
├── README.md                     # Documentation
└── LICENSE                       # License file
```

---

### 4.2 Runtime Directories

**Created Automatically on First Run**:
- `data/` - Database storage
- `logs/` - Log files
- `temp/uploads/` - Temporary CSV files

**Created During Build**:
- `backend/dist/` - Compiled backend
- `frontend/dist/` - Built frontend
- `node_modules/` - Dependencies (root, frontend, backend)

**User-Created**:
- `.env` - Environment configuration (optional)

---

## 5. Startup and Shutdown

### 5.1 Startup Procedure

**Manual Startup**:
```bash
# Navigate to application directory
cd household-spending-tracker

# Start application
npm start
```

**Startup Sequence**:
1. Load environment variables from `.env`
2. Create directories (data/, logs/, temp/uploads/) if not exist
3. Initialize database connection
4. Run database migrations (if needed)
5. Load ML model from database
6. Start Express server on configured port
7. Log startup success

**Startup Logs**:
```
2024-01-15 10:00:00 [info] Starting Household Spending Tracker...
2024-01-15 10:00:01 [info] Environment: production
2024-01-15 10:00:01 [info] Port: 4000
2024-01-15 10:00:02 [info] Database connection established
2024-01-15 10:00:03 [info] ML model loaded successfully
2024-01-15 10:00:03 [info] Server started on port 4000
2024-01-15 10:00:03 [info] Application ready at http://localhost:4000
```

**Startup Time**: 3-5 seconds

---

### 5.2 Shutdown Procedure

**Manual Shutdown**:
```bash
# Press Ctrl+C in terminal where application is running
^C
```

**Graceful Shutdown Sequence**:
1. Receive SIGINT signal (Ctrl+C)
2. Stop accepting new requests
3. Complete in-flight requests
4. Close database connection
5. Flush logs to disk
6. Exit process

**Shutdown Logs**:
```
2024-01-15 15:30:00 [info] Shutdown signal received
2024-01-15 15:30:00 [info] Closing database connection
2024-01-15 15:30:01 [info] Database connection closed
2024-01-15 15:30:01 [info] Server stopped
2024-01-15 15:30:01 [info] Application shutdown complete
```

**Shutdown Time**: 1-2 seconds

---

### 5.3 Restart Procedure

**Manual Restart**:
```bash
# Stop application (Ctrl+C)
^C

# Start application again
npm start
```

**When to Restart**:
- After configuration changes (.env)
- After code updates
- After database corruption (with restored backup)
- If application becomes unresponsive

**No Automatic Restart**:
- No process manager (PM2, systemd)
- No automatic restart on crash
- User must manually restart

---

## 6. Development Environment

### 6.1 Development Setup

**Install Development Dependencies**:
```bash
# Already installed with npm run install:all
# Includes: TypeScript, ESLint, Prettier, Jest, etc.
```

**Start Development Servers**:
```bash
# Start both frontend and backend in development mode
npm run dev

# This runs:
# - Frontend: Vite dev server on port 3000
# - Backend: ts-node with nodemon on port 4000
```

**Development Features**:
- Hot reload for frontend (Vite HMR)
- Auto-restart for backend (nodemon)
- Source maps for debugging
- Console logging enabled
- GraphQL Playground enabled

---

### 6.2 Development Workflow

**Code Changes**:
```bash
# 1. Make code changes in src/

# 2. Frontend changes auto-reload (Vite HMR)
# 3. Backend changes auto-restart (nodemon)

# 4. Check for errors in terminal
# 5. Test in browser at http://localhost:3000
```

**Linting**:
```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

**Formatting**:
```bash
# Format code with Prettier
npm run format
```

**Testing**:
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

### 6.3 Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Frontend Server | Vite dev server (port 3000) | Express static (port 4000) |
| Backend Server | ts-node + nodemon | Compiled JavaScript |
| Hot Reload | Enabled | Disabled |
| Source Maps | Enabled | Disabled |
| Logging | Console + File (debug level) | File only (info level) |
| GraphQL Playground | Enabled | Disabled |
| Error Details | Full stack traces | User-friendly messages |
| Build | Not required | Required (npm run build) |

---

## 7. Operational Procedures

### 7.1 Backup Procedures

**Manual Backup**:
```bash
# Stop application
^C

# Backup database
cp ./data/household-spending.db ~/backups/household-spending-$(date +%Y%m%d).db

# Or backup entire data directory
cp -r ./data ~/backups/data-$(date +%Y%m%d)

# Restart application
npm start
```

**Backup Schedule** (User's Responsibility):
- Daily: For active users
- Weekly: For occasional users
- Before major operations: CSV import, bulk changes

**Backup Storage**:
- External hard drive
- Cloud storage (Dropbox, Google Drive, iCloud)
- Network attached storage (NAS)

**Backup Verification**:
```bash
# Check backup file exists
ls -lh ~/backups/household-spending-*.db

# Check backup file size (should be > 0)
du -h ~/backups/household-spending-*.db

# Test backup integrity
sqlite3 ~/backups/household-spending-20240115.db "PRAGMA integrity_check;"
```

---

### 7.2 Restore Procedures

**Restore from Backup**:
```bash
# Stop application
^C

# Backup current database (just in case)
cp ./data/household-spending.db ./data/household-spending-before-restore.db

# Restore from backup
cp ~/backups/household-spending-20240115.db ./data/household-spending.db

# Restart application
npm start

# Verify data in browser
# If successful, delete backup of current database
rm ./data/household-spending-before-restore.db
```

**Restore Time**: < 1 minute

**Data Loss**: Depends on backup age

---

### 7.3 Update Procedures

**Update Application**:
```bash
# Stop application
^C

# Backup database
cp ./data/household-spending.db ~/backups/household-spending-before-update.db

# Pull latest code (if using Git)
git pull origin main

# Or download and extract new version

# Install dependencies (if changed)
npm run install:all

# Build application
npm run build

# Start application
npm start

# Verify application works
# If issues, restore backup and revert code
```

**Update Frequency**: As needed (no automatic updates)

---

### 7.4 Log Management

**View Logs**:
```bash
# View all logs
cat ./logs/application.log

# View error logs only
cat ./logs/error.log

# Tail logs (real-time)
tail -f ./logs/application.log

# Search logs
grep "CSV import" ./logs/application.log
```

**Log Rotation**:
- Automatic rotation when file reaches 10MB
- Keeps 7 files (one week)
- Old files automatically deleted

**Manual Log Cleanup**:
```bash
# Delete old logs
rm ./logs/*.log

# Logs will be recreated on next startup
```

---

### 7.5 Database Maintenance

**Check Database Size**:
```bash
ls -lh ./data/household-spending.db
```

**Vacuum Database** (Reclaim Space):
```bash
# Stop application
^C

# Vacuum database
sqlite3 ./data/household-spending.db "VACUUM;"

# Restart application
npm start
```

**Check Database Integrity**:
```bash
sqlite3 ./data/household-spending.db "PRAGMA integrity_check;"
# Expected output: ok
```

**Database Statistics**:
```bash
# Count transactions
sqlite3 ./data/household-spending.db "SELECT COUNT(*) FROM transactions;"

# Count categories
sqlite3 ./data/household-spending.db "SELECT COUNT(*) FROM categories;"

# Database file size
du -h ./data/household-spending.db
```

---

## 8. Troubleshooting

### 8.1 Installation Issues

**Issue: Node.js Not Found**
```bash
# Error: node: command not found
# Solution: Install Node.js from nodejs.org
# Verify: node --version
```

**Issue: npm Install Fails**
```bash
# Error: npm ERR! code EACCES
# Solution: Fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Or use sudo (not recommended)
sudo npm install
```

**Issue: Build Fails**
```bash
# Error: TypeScript compilation errors
# Solution: Check TypeScript errors
npm run build 2>&1 | grep error

# Fix errors in source code
# Rebuild
npm run build
```

---

### 8.2 Runtime Issues

**Issue: Port Already in Use**
```bash
# Error: EADDRINUSE: address already in use :::4000
# Solution 1: Change port
PORT=4001 npm start

# Solution 2: Kill process using port
# macOS/Linux:
lsof -ti:4000 | xargs kill -9

# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Issue: Database Locked**
```bash
# Error: SQLITE_BUSY: database is locked
# Solution: Close other applications accessing database
# Or restart application
```

**Issue: Application Won't Start**
```bash
# Check logs for errors
cat ./logs/error.log

# Check database exists
ls -la ./data/household-spending.db

# Check permissions
ls -la ./data/

# Try starting with debug logging
LOG_LEVEL=debug npm start
```

**Issue: Out of Memory**
```bash
# Error: JavaScript heap out of memory
# Solution: Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

---

### 8.3 Data Issues

**Issue: Database Corruption**
```bash
# Check integrity
sqlite3 ./data/household-spending.db "PRAGMA integrity_check;"

# If corrupted, restore from backup
cp ~/backups/household-spending-20240115.db ./data/household-spending.db
```

**Issue: Missing Transactions**
```bash
# Check transaction count
sqlite3 ./data/household-spending.db "SELECT COUNT(*) FROM transactions;"

# Check if transactions exist but not displayed
# (might be filtered by status)

# If data loss, restore from backup
```

**Issue: ML Model Not Loading**
```bash
# Check logs
grep "ML model" ./logs/application.log

# If model missing, it will be created on first training
# Import transactions and classify manually to train model
```

---

### 8.4 Performance Issues

**Issue: Slow CSV Import**
```bash
# Check file size
ls -lh <csv-file>

# If > 10MB, split into smaller files

# Check transaction count
# If > 5,000 transactions, performance will degrade
```

**Issue: Slow Page Load**
```bash
# Check transaction count
sqlite3 ./data/household-spending.db "SELECT COUNT(*) FROM transactions;"

# If > 5,000, consider archiving old transactions

# Check browser console for errors
# Open DevTools → Console
```

**Issue: High Memory Usage**
```bash
# Check Node.js memory usage
ps aux | grep node

# If high, restart application
^C
npm start
```

---

## 9. Monitoring and Maintenance

### 9.1 Health Checks

**Manual Health Check**:
```bash
# Check if server is running
curl http://localhost:4000
# Should return HTML

# Check GraphQL endpoint
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
# Should return JSON

# Check logs for errors
tail -n 50 ./logs/error.log
```

**Health Indicators**:
- Server responds to HTTP requests = Healthy
- Server doesn't respond = Unhealthy
- Error logs empty = Healthy
- Error logs growing = Investigate

---

### 9.2 Performance Monitoring

**Monitor Performance Metrics**:
```bash
# Check operation durations in logs
grep "duration" ./logs/application.log

# Find slow operations (> 5 seconds)
grep "duration" ./logs/application.log | grep -E "duration\":[5-9]"

# Count operations
grep "CSV import completed" ./logs/application.log | wc -l
```

**Performance Targets**:
- CSV import: < 5 seconds for 100 transactions
- ML classification: < 2 seconds per transaction
- Report generation: < 1 second
- Page load: < 2 seconds

---

### 9.3 Maintenance Schedule

**Daily** (Automated):
- Log rotation (automatic)
- Temp file cleanup (automatic, 1 hour retention)

**Weekly** (Manual):
- Review error logs
- Backup database
- Check disk space

**Monthly** (Manual):
- Vacuum database (reclaim space)
- Check database integrity
- Review performance metrics
- Update dependencies (if needed)

**As Needed**:
- Update application
- Restore from backup
- Archive old transactions (if > 5,000)

---

## 10. Deployment Checklist

### 10.1 Pre-Deployment Checklist

- [ ] Node.js 18.x or later installed
- [ ] npm 9.x or later installed
- [ ] Application files downloaded/cloned
- [ ] Dependencies installed (`npm run install:all`)
- [ ] Application built (`npm run build`)
- [ ] `.env` file created (if custom configuration needed)
- [ ] Directories created (data/, logs/, temp/)

---

### 10.2 Post-Deployment Checklist

- [ ] Application starts successfully (`npm start`)
- [ ] Server responds at http://localhost:4000
- [ ] Frontend loads in browser
- [ ] Database file created (./data/household-spending.db)
- [ ] Logs being written (./logs/application.log)
- [ ] Can create category
- [ ] Can import CSV file
- [ ] Can classify transaction
- [ ] Can generate report

---

### 10.3 Production Readiness Checklist

- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] Environment variables configured
- [ ] Backup procedure documented
- [ ] User trained on basic operations
- [ ] Troubleshooting guide available
- [ ] Support contact information provided

---

## 11. Deployment Summary

### 11.1 Deployment Characteristics

**Simplicity**:
- Manual installation (no installer)
- No containerization (Docker)
- No orchestration (Kubernetes)
- No CI/CD pipeline

**Reliability**:
- Manual startup/shutdown
- No automatic restart
- No health monitoring
- Manual backups

**Scalability**:
- Single user only
- Single machine only
- No horizontal scaling
- No load balancing

**Maintenance**:
- User responsible for backups
- User responsible for updates
- User responsible for monitoring
- No automatic maintenance

---

### 11.2 Deployment Best Practices

**For Users**:
1. Backup database regularly (weekly minimum)
2. Store backups on external drive or cloud storage
3. Review error logs weekly
4. Update application when new version available
5. Don't modify database file directly
6. Don't delete logs while application is running
7. Use Ctrl+C to stop application (graceful shutdown)

**For Developers**:
1. Test installation procedure on clean machine
2. Document all configuration options
3. Provide troubleshooting guide
4. Version all releases
5. Maintain changelog
6. Test backup/restore procedures
7. Provide migration scripts for database changes

---

## Notes

- Deployment designed for simplicity and ease of use
- No enterprise deployment features (containers, orchestration, CI/CD)
- User responsible for all operational tasks
- Suitable for personal use, not production enterprise deployment
- Manual processes preferred over automation for transparency
- Focus on reliability and data safety over convenience
