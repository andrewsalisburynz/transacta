# Infrastructure Design - Household Spending Tracker

## Purpose
This document defines the complete infrastructure design for the Household Spending Tracker application, mapping functional and non-functional requirements to physical infrastructure components for a local desktop application.

---

## 1. Infrastructure Overview

### 1.1 Deployment Model

**Type**: Local Desktop Application

**Characteristics**:
- Single-user application running on user's local machine
- No cloud services or remote servers
- All data stored locally
- Self-contained deployment

**Infrastructure Decisions**:
- Q1: User's local machine (desktop application)
- Q2: Same machine as application (./data/ directory)
- Q3: Git clone + npm install (developer setup)
- Q4: User installs Node.js separately
- Q5: Express serves built frontend (single server)
- Q6: Configurable via environment variable (default 4000)
- Q7: Local ./logs/ directory
- Q8: Manual file copy (user responsibility)

---

## 2. Compute Infrastructure

### 2.1 Runtime Environment

**Component**: Node.js Runtime

**Specifications**:
- Node.js version: 18.x LTS or later
- Architecture: x64 (Intel/AMD) or ARM64 (Apple Silicon)
- Operating Systems: Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)

**Resource Requirements**:
- CPU: 2+ cores recommended
- RAM: 4GB minimum, 8GB recommended
- Disk Space: 500MB for application + database

**Installation**:
- User installs Node.js from nodejs.org
- Application does not bundle Node.js
- npm comes bundled with Node.js

---

### 2.2 Application Server

**Component**: Express HTTP Server

**Configuration**:
```javascript
// Single server process
const app = express()
const PORT = process.env.PORT || 4000

// Middleware stack
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../frontend/dist')))

// GraphQL endpoint
app.use('/graphql', apolloServer.getMiddleware())

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
```

**Characteristics**:
- Single process (no clustering)
- Single-threaded event loop
- Handles HTTP requests and GraphQL API
- Serves static frontend files
- No load balancer needed

**Port Configuration**:
- Default port: 4000
- Configurable via PORT environment variable
- Localhost only (not exposed to network)

---

### 2.3 ML Processing

**Component**: TensorFlow.js (Node.js backend)

**Configuration**:
- Model loaded on application startup
- Runs in same process as Express server
- Uses CPU for inference (no GPU required)
- Model stored in SQLite database as BLOB

**Resource Usage**:
- Memory: ~100MB for model in memory
- CPU: Minimal (classification takes ~2 seconds per transaction)
- No separate ML service or container

---

## 3. Storage Infrastructure

### 3.1 Database

**Component**: SQLite 3.x

**File Location**: `./data/household-spending.db`

**Configuration**:
```javascript
// Database connection
const db = await open({
  filename: './data/household-spending.db',
  driver: sqlite3.Database
})

// Pragmas
await db.exec('PRAGMA foreign_keys = ON')
await db.exec('PRAGMA synchronous = NORMAL')
await db.exec('PRAGMA journal_mode = DELETE')
```

**Characteristics**:
- Single file database
- No server process
- ACID compliant
- No connection pooling (single connection)
- No replication or clustering

**Capacity**:
- Designed for < 5,000 transactions
- Database file size: ~5-10MB for typical usage
- No automatic cleanup or archiving

**Backup Strategy**:
- Manual file copy by user
- No automatic backups
- User responsible for backup schedule

---

### 3.2 File System Storage

**Directory Structure**:
```
household-spending-tracker/
├── backend/
│   ├── src/              # TypeScript source
│   ├── dist/             # Compiled JavaScript
│   └── package.json
├── frontend/
│   ├── src/              # Vue source
│   ├── dist/             # Built frontend (production)
│   └── package.json
├── data/
│   └── household-spending.db    # SQLite database
├── logs/
│   ├── application.log          # Combined logs
│   └── error.log                # Error logs only
├── temp/
│   └── uploads/                 # Temporary CSV files
├── .env                         # Environment variables
└── package.json                 # Root package.json
```

**Storage Locations**:

| Directory | Purpose | Size | Retention |
|-----------|---------|------|-----------|
| data/ | SQLite database | 5-10MB | Permanent |
| logs/ | Application logs | 10MB per file | 7 days |
| temp/uploads/ | CSV uploads | Variable | 1 hour |
| frontend/dist/ | Built frontend | ~2MB | Permanent |
| backend/dist/ | Compiled backend | ~5MB | Permanent |

**File Permissions**:
- All files owned by user running application
- No special permissions required
- Standard user read/write access

---

### 3.3 Log Storage

**Component**: Winston File Transports

**Configuration**:
```javascript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Error log
    new winston.transports.File({
      filename: './logs/error.log',
      level: 'error',
      maxsize: 10485760,  // 10MB
      maxFiles: 7,
      tailable: true
    }),
    // Combined log
    new winston.transports.File({
      filename: './logs/application.log',
      maxsize: 10485760,  // 10MB
      maxFiles: 7,
      tailable: true
    })
  ]
})
```

**Log Rotation**:
- Max file size: 10MB
- Max files: 7 (one week)
- Rotation: Automatic when size limit reached
- Old logs: Automatically deleted

**Log Format**:
```json
{
  "timestamp": "2024-01-15 14:30:45",
  "level": "info",
  "message": "CSV import completed",
  "transactionCount": 150,
  "duration": 4.2
}
```

---

## 4. Network Infrastructure

### 4.1 Network Architecture

**Topology**: Localhost Only

```
┌─────────────────────────────────────────────┐
│         User's Local Machine                │
│                                             │
│  ┌──────────────┐                          │
│  │   Browser    │                          │
│  │ (localhost)  │                          │
│  └──────┬───────┘                          │
│         │ HTTP                              │
│         │ Port 4000                         │
│         ↓                                   │
│  ┌──────────────────────────────────────┐  │
│  │     Express Server                   │  │
│  │  - GraphQL API                       │  │
│  │  - Static File Server                │  │
│  │  - ML Classification                 │  │
│  └──────┬───────────────────────────────┘  │
│         │                                   │
│         ↓                                   │
│  ┌──────────────────────────────────────┐  │
│  │     SQLite Database                  │  │
│  │  (./data/household-spending.db)      │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

**Characteristics**:
- All communication on localhost (127.0.0.1)
- No external network access required
- No firewall configuration needed
- No SSL/TLS (HTTP only on localhost)

---

### 4.2 Port Configuration

**Primary Port**: 4000 (default)

**Configuration**:
```bash
# .env file
PORT=4000
```

**Port Usage**:
- HTTP server: Port 4000
- GraphQL endpoint: http://localhost:4000/graphql
- Frontend: http://localhost:4000/
- No additional ports required

**Port Conflicts**:
- If port 4000 is in use, user can change PORT environment variable
- Application will fail to start if port is unavailable
- No automatic port selection

---

### 4.3 API Endpoints

**GraphQL Endpoint**: `http://localhost:4000/graphql`

**Static Files**: `http://localhost:4000/*`

**Health Check**: None (implicit - server responds or doesn't)

**API Security**:
- No authentication (single-user local app)
- No authorization
- CORS enabled for development
- GraphQL schema validation only

---

## 5. Infrastructure Components Mapping

### 5.1 Frontend Infrastructure

| Component | Technology | Infrastructure | Configuration |
|-----------|-----------|----------------|---------------|
| UI Framework | Vue 3 | Browser runtime | No server required |
| Build Tool | Vite | Development only | Builds to static files |
| GraphQL Client | Apollo Client | Browser runtime | Points to localhost:4000 |
| Virtual Scroller | vue-virtual-scroller | Browser runtime | Client-side rendering |
| Static Files | HTML/CSS/JS | Express static server | Served from backend/dist |

**Deployment**:
- Frontend built to `frontend/dist/`
- Files copied to backend for serving
- No separate frontend server in production

---

### 5.2 Backend Infrastructure

| Component | Technology | Infrastructure | Configuration |
|-----------|-----------|----------------|---------------|
| HTTP Server | Express | Node.js process | Port 4000 |
| GraphQL API | Apollo Server | Express middleware | /graphql endpoint |
| File Upload | Multer | Express middleware | temp/uploads/ |
| CSV Parser | csv-parse | Node.js library | In-process |
| ML Engine | TensorFlow.js | Node.js library | In-process, CPU |
| Logger | Winston | Node.js library | File transports |
| Database Client | sqlite3 | Node.js library | Single connection |

**Deployment**:
- Backend compiled to `backend/dist/`
- Single Node.js process
- No process manager (user runs directly)

---

### 5.3 Data Infrastructure

| Component | Technology | Infrastructure | Configuration |
|-----------|-----------|----------------|---------------|
| Database | SQLite | File system | ./data/household-spending.db |
| ML Model | TensorFlow.js | Database BLOB | Loaded to memory on startup |
| Logs | Text files | File system | ./logs/*.log |
| Temp Files | CSV files | File system | ./temp/uploads/ |
| Static Assets | HTML/CSS/JS | File system | frontend/dist/ |

**Data Flow**:
```
CSV Upload → temp/uploads/ → Parse → SQLite → ML Classification → Update SQLite
                ↓
           Delete after processing
```

---

## 6. System Requirements

### 6.1 Hardware Requirements

**Minimum**:
- CPU: Dual-core processor (2.0 GHz)
- RAM: 4GB
- Disk: 1GB free space
- Display: 1280x720 resolution

**Recommended**:
- CPU: Quad-core processor (2.5 GHz+)
- RAM: 8GB
- Disk: 2GB free space (for logs and database growth)
- Display: 1920x1080 resolution

---

### 6.2 Software Requirements

**Required**:
- Node.js 18.x LTS or later
- npm 9.x or later (bundled with Node.js)
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

**Operating Systems**:
- Windows 10 or later
- macOS 11 (Big Sur) or later
- Linux: Ubuntu 20.04+, Debian 11+, Fedora 35+

**Not Required**:
- Docker
- Database server
- Web server (Apache/Nginx)
- Python runtime
- Java runtime

---

### 6.3 Network Requirements

**Internet Access**: Not required for operation

**Localhost Access**: Required (127.0.0.1)

**Firewall**: No configuration needed (localhost only)

**Proxy**: Not applicable

---

## 7. Deployment Architecture

### 7.1 Development Environment

**Setup**:
```bash
# Clone repository
git clone <repository-url>
cd household-spending-tracker

# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

**Development Servers**:
- Frontend: Vite dev server on port 3000
- Backend: ts-node with nodemon on port 4000
- Hot reload enabled for both

**Development Tools**:
- VS Code (recommended IDE)
- ESLint for linting
- Prettier for formatting
- Chrome DevTools for debugging

---

### 7.2 Production Environment

**Build Process**:
```bash
# Build frontend
cd frontend
npm run build  # Output: frontend/dist/

# Build backend
cd backend
npm run build  # Output: backend/dist/

# Copy frontend to backend (optional)
cp -r frontend/dist backend/dist/public
```

**Startup**:
```bash
# Start production server
cd backend
npm start

# Or from root
npm start
```

**Production Configuration**:
```bash
# .env file
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
DATABASE_PATH=./data/household-spending.db
```

**Process Management**:
- No process manager (PM2, systemd) required
- User runs `npm start` manually
- Application runs until user stops it (Ctrl+C)
- No automatic restart on crash

---

### 7.3 Installation Process

**User Installation Steps**:

1. **Install Node.js**
   - Download from nodejs.org
   - Install Node.js 18.x LTS or later
   - Verify: `node --version` and `npm --version`

2. **Get Application**
   - Clone repository: `git clone <url>`
   - Or download and extract ZIP file

3. **Install Dependencies**
   ```bash
   cd household-spending-tracker
   npm run install:all
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Start Application**
   ```bash
   npm start
   ```

6. **Access Application**
   - Open browser to http://localhost:4000
   - Application is ready to use

**Installation Time**: ~5-10 minutes (depending on internet speed)

---

## 8. Infrastructure Monitoring

### 8.1 Application Monitoring

**Method**: Log File Analysis

**Monitoring Points**:
- Application startup/shutdown
- CSV import operations
- ML classification performance
- Database errors
- API errors

**Log Locations**:
- `./logs/application.log` - All logs
- `./logs/error.log` - Errors only

**Monitoring Tools**:
- Manual log review
- Text editor or `tail -f` command
- No real-time dashboard

---

### 8.2 Performance Monitoring

**Metrics Logged**:
```javascript
// CSV Import
logger.info('CSV import completed', {
  operation: 'csv_import',
  duration: 4.2,  // seconds
  transactionCount: 150,
  duplicates: 5
})

// ML Classification
logger.info('ML classification completed', {
  operation: 'ml_classification',
  duration: 1.8,  // seconds
  transactionId: '123',
  confidence: 0.92
})

// Report Generation
logger.info('Report generated', {
  operation: 'report_generation',
  duration: 0.5,  // seconds
  month: 1,
  year: 2024,
  transactionCount: 200
})
```

**Performance Targets**:
- CSV import: < 5 seconds for 100 transactions
- ML classification: < 2 seconds per transaction
- Report generation: < 1 second
- Page load: < 2 seconds

---

### 8.3 Health Monitoring

**Method**: Implicit Health Check

**Health Indicators**:
- Server responds to HTTP requests = Healthy
- Server doesn't respond = Unhealthy

**No Dedicated Health Endpoint**:
- No `/health` or `/status` endpoint
- No programmatic health checks
- User determines health by using application

**Startup Verification**:
```javascript
// Logged on successful startup
console.log('✓ Database initialized')
console.log('✓ ML model loaded')
console.log('✓ Server started on port 4000')
console.log('✓ Application ready at http://localhost:4000')
```

---

## 9. Backup and Recovery

### 9.1 Backup Strategy

**Method**: Manual File Copy

**What to Backup**:
- `./data/household-spending.db` - Database file (REQUIRED)
- `./logs/` - Log files (optional)
- `.env` - Environment configuration (optional)

**Backup Frequency**: User's responsibility

**Backup Procedure**:
```bash
# Stop application
# Copy database file
cp ./data/household-spending.db ~/backups/household-spending-$(date +%Y%m%d).db

# Or backup entire data directory
cp -r ./data ~/backups/data-$(date +%Y%m%d)
```

**Backup Location**: User's choice (external drive, cloud storage, etc.)

---

### 9.2 Recovery Strategy

**Recovery Procedure**:
```bash
# Stop application
# Restore database file
cp ~/backups/household-spending-20240115.db ./data/household-spending.db

# Start application
npm start
```

**Recovery Time**: < 1 minute

**Data Loss**: Depends on backup frequency (user's responsibility)

---

### 9.3 Disaster Recovery

**Scenarios**:

1. **Database Corruption**
   - Restore from backup
   - If no backup: Data loss

2. **Application Deletion**
   - Reinstall application
   - Restore database from backup

3. **Hard Drive Failure**
   - Restore from external backup
   - If no external backup: Data loss

**Prevention**:
- User should backup database regularly
- User should store backups on external drive or cloud storage
- No automatic backup mechanism

---

## 10. Security Infrastructure

### 10.1 Application Security

**Security Measures**:
- Parameterized SQL queries (prevent SQL injection)
- GraphQL schema validation (prevent invalid inputs)
- File upload validation (CSV only, max 10MB)
- CORS enabled (development only)
- No authentication (single-user local app)

**Not Implemented**:
- User authentication
- Authorization
- Encryption at rest
- Encryption in transit (HTTP only on localhost)
- API rate limiting
- Session management

---

### 10.2 Data Security

**Database Security**:
- File permissions: User read/write only
- No encryption (SQLite file is plain text)
- No access control (single user)

**File Security**:
- Temporary files deleted after processing
- Logs contain no sensitive data (no PII)
- Database file accessible to user only

**Network Security**:
- Localhost only (not exposed to network)
- No SSL/TLS (HTTP only)
- No firewall rules needed

---

### 10.3 Dependency Security

**Dependency Management**:
- npm audit for vulnerability scanning
- Regular dependency updates
- No automatic security patches

**Security Updates**:
- User responsible for updating dependencies
- No automatic update mechanism
- Security advisories via npm audit

---

## 11. Scalability Considerations

### 11.1 Current Limitations

**Transaction Volume**: < 5,000 transactions
- No pagination
- Eager loading of all data
- No database indexes (except primary keys)

**Concurrent Users**: 1 user only
- Single database connection
- No connection pooling
- No session management

**File Size**: CSV files < 10MB
- No streaming parser
- Entire file loaded to memory

---

### 11.2 Scaling Options (Future)

**If Transaction Volume Grows**:
- Add database indexes (date, categoryId)
- Implement pagination
- Use lazy loading

**If Multiple Users Needed**:
- Add authentication
- Implement connection pooling
- Deploy to server (not localhost)

**If File Size Grows**:
- Implement streaming CSV parser
- Add progress indicators
- Process in batches

**Not Planned**: Cloud deployment, microservices, containerization

---

## 12. Troubleshooting

### 12.1 Common Issues

**Port Already in Use**:
```bash
# Error: EADDRINUSE: address already in use :::4000
# Solution: Change port in .env file
PORT=4001 npm start
```

**Database Locked**:
```bash
# Error: SQLITE_BUSY: database is locked
# Solution: Close other applications accessing database
# Or restart application
```

**Node.js Not Found**:
```bash
# Error: node: command not found
# Solution: Install Node.js from nodejs.org
```

**Out of Memory**:
```bash
# Error: JavaScript heap out of memory
# Solution: Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

---

### 12.2 Log Analysis

**Finding Errors**:
```bash
# View error log
cat ./logs/error.log

# Tail error log (real-time)
tail -f ./logs/error.log

# Search for specific error
grep "CSV import failed" ./logs/application.log
```

**Performance Analysis**:
```bash
# Find slow operations
grep "duration" ./logs/application.log | grep -E "duration\":[5-9]"

# Count operations
grep "CSV import completed" ./logs/application.log | wc -l
```

---

### 12.3 Database Maintenance

**Check Database Size**:
```bash
ls -lh ./data/household-spending.db
```

**Vacuum Database** (reclaim space):
```bash
sqlite3 ./data/household-spending.db "VACUUM;"
```

**Check Database Integrity**:
```bash
sqlite3 ./data/household-spending.db "PRAGMA integrity_check;"
```

---

## 13. Infrastructure Summary

### 13.1 Component Summary

| Component | Technology | Location | Purpose |
|-----------|-----------|----------|---------|
| Runtime | Node.js 18.x | User's machine | Execute application |
| HTTP Server | Express 4.x | localhost:4000 | Serve API and frontend |
| API | GraphQL (Apollo) | /graphql | Data access layer |
| Database | SQLite 3.x | ./data/*.db | Data persistence |
| ML Engine | TensorFlow.js | In-process | Classification |
| Logger | Winston | ./logs/*.log | Logging |
| Frontend | Vue 3 | Browser | User interface |
| Build Tool | Vite | Development | Frontend build |

---

### 13.2 Infrastructure Characteristics

**Simplicity**:
- Single machine deployment
- No distributed systems
- No containers or orchestration
- No cloud services

**Reliability**:
- ACID database
- Structured logging
- Error handling
- Manual backups

**Performance**:
- Sufficient for < 5,000 transactions
- No caching (except categories)
- No optimization needed

**Security**:
- Localhost only
- No authentication
- Basic input validation
- Manual backups

---

## Notes

- Infrastructure designed for simplicity and ease of use
- All components run on user's local machine
- No external dependencies or services
- User responsible for backups and maintenance
- Suitable for personal use, not enterprise deployment
- No scalability beyond 5,000 transactions
- No high availability or disaster recovery
