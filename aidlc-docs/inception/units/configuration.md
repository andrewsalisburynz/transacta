# Configuration Specification - Household Spending Tracker

## Overview
Complete configuration specification for the Household Spending Tracker application. This document defines all configuration requirements for database, server, ML, file storage, and environment-specific settings.

---

## Configuration Structure

### Configuration File Organization

```
config/
├── default.json          # Default configuration (development)
├── development.json      # Development environment overrides
├── production.json       # Production environment overrides
├── test.json            # Test environment configuration
└── .env.example         # Environment variables template
```

---

## Database Configuration

### SQLite Configuration

```typescript
/**
 * Database configuration
 */
export interface DatabaseConfig {
  /** Database type (always 'sqlite' for this application) */
  type: 'sqlite';
  
  /** Path to SQLite database file */
  filePath: string;
  
  /** Enable foreign key constraints */
  foreignKeys: boolean;
  
  /** Enable WAL (Write-Ahead Logging) mode for better concurrency */
  walMode: boolean;
  
  /** Connection pool size (for concurrent operations) */
  poolSize: number;
  
  /** Query timeout in milliseconds */
  timeout: number;
  
  /** Enable query logging */
  logging: boolean;
  
  /** Busy timeout in milliseconds */
  busyTimeout: number;
}

/**
 * Default database configuration
 */
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  type: 'sqlite',
  filePath: './data/household-spending.db',
  foreignKeys: true,
  walMode: true,
  poolSize: 5,
  timeout: 5000,
  logging: false,
  busyTimeout: 3000
};
```

### Configuration File (JSON)

```json
{
  "database": {
    "type": "sqlite",
    "filePath": "./data/household-spending.db",
    "foreignKeys": true,
    "walMode": true,
    "poolSize": 5,
    "timeout": 5000,
    "logging": false,
    "busyTimeout": 3000
  }
}
```

### Environment Variables

```bash
# Database configuration
DB_FILE_PATH=./data/household-spending.db
DB_FOREIGN_KEYS=true
DB_WAL_MODE=true
DB_POOL_SIZE=5
DB_TIMEOUT=5000
DB_LOGGING=false
DB_BUSY_TIMEOUT=3000
```

---

## Server Configuration

### Backend Server Configuration

```typescript
/**
 * Server configuration
 */
export interface ServerConfig {
  /** Server port */
  port: number;
  
  /** Server host */
  host: string;
  
  /** Enable CORS */
  cors: CorsConfig;
  
  /** GraphQL configuration */
  graphql: GraphQLConfig;
  
  /** Request body size limit */
  bodyLimit: string;
  
  /** Enable request logging */
  logging: boolean;
  
  /** Log level (error, warn, info, debug) */
  logLevel: string;
}

/**
 * CORS configuration
 */
export interface CorsConfig {
  /** Enable CORS */
  enabled: boolean;
  
  /** Allowed origins */
  origins: string[];
  
  /** Allowed methods */
  methods: string[];
  
  /** Allowed headers */
  allowedHeaders: string[];
  
  /** Enable credentials */
  credentials: boolean;
}

/**
 * GraphQL configuration
 */
export interface GraphQLConfig {
  /** GraphQL endpoint path */
  path: string;
  
  /** Enable GraphQL Playground */
  playground: boolean;
  
  /** Enable introspection */
  introspection: boolean;
  
  /** Enable tracing */
  tracing: boolean;
  
  /** Enable caching */
  caching: boolean;
}

/**
 * Default server configuration
 */
export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  port: 4000,
  host: 'localhost',
  cors: {
    enabled: true,
    origins: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  graphql: {
    path: '/graphql',
    playground: true,
    introspection: true,
    tracing: false,
    caching: true
  },
  bodyLimit: '10mb',
  logging: true,
  logLevel: 'info'
};
```

### Configuration File (JSON)

```json
{
  "server": {
    "port": 4000,
    "host": "localhost",
    "cors": {
      "enabled": true,
      "origins": ["http://localhost:3000"],
      "methods": ["GET", "POST", "OPTIONS"],
      "allowedHeaders": ["Content-Type", "Authorization"],
      "credentials": true
    },
    "graphql": {
      "path": "/graphql",
      "playground": true,
      "introspection": true,
      "tracing": false,
      "caching": true
    },
    "bodyLimit": "10mb",
    "logging": true,
    "logLevel": "info"
  }
}
```

### Environment Variables

```bash
# Server configuration
SERVER_PORT=4000
SERVER_HOST=localhost
CORS_ENABLED=true
CORS_ORIGINS=http://localhost:3000
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
LOG_LEVEL=info
```

---

## Frontend Configuration

### React Application Configuration

```typescript
/**
 * Frontend configuration
 */
export interface FrontendConfig {
  /** API endpoint URL */
  apiUrl: string;
  
  /** GraphQL endpoint URL */
  graphqlUrl: string;
  
  /** Enable development mode */
  devMode: boolean;
  
  /** Application title */
  appTitle: string;
  
  /** Currency symbol */
  currencySymbol: string;
  
  /** Date format */
  dateFormat: string;
  
  /** Pagination page size */
  pageSize: number;
  
  /** Enable analytics */
  analytics: boolean;
}

/**
 * Default frontend configuration
 */
export const DEFAULT_FRONTEND_CONFIG: FrontendConfig = {
  apiUrl: 'http://localhost:4000',
  graphqlUrl: 'http://localhost:4000/graphql',
  devMode: true,
  appTitle: 'Household Spending Tracker',
  currencySymbol: '$',
  dateFormat: 'YYYY-MM-DD',
  pageSize: 20,
  analytics: false
};
```

### Configuration File (JSON)

```json
{
  "frontend": {
    "apiUrl": "http://localhost:4000",
    "graphqlUrl": "http://localhost:4000/graphql",
    "devMode": true,
    "appTitle": "Household Spending Tracker",
    "currencySymbol": "$",
    "dateFormat": "YYYY-MM-DD",
    "pageSize": 20,
    "analytics": false
  }
}
```

### Environment Variables (.env)

```bash
# Frontend configuration
REACT_APP_API_URL=http://localhost:4000
REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql
REACT_APP_DEV_MODE=true
REACT_APP_TITLE=Household Spending Tracker
REACT_APP_CURRENCY_SYMBOL=$
REACT_APP_DATE_FORMAT=YYYY-MM-DD
REACT_APP_PAGE_SIZE=20
```

---

## ML Configuration

### Machine Learning Configuration

```typescript
/**
 * ML configuration
 */
export interface MLConfig {
  /** Path to model directory */
  modelDirectory: string;
  
  /** Active model file name */
  activeModelFile: string;
  
  /** Confidence threshold for auto-approval */
  confidenceThreshold: number;
  
  /** Minimum training samples required */
  minTrainingSamples: number;
  
  /** Training configuration */
  training: TrainingConfig;
  
  /** Feature extraction configuration */
  features: FeatureConfig;
  
  /** Enable automatic retraining */
  autoRetrain: boolean;
  
  /** Retraining interval (number of new classifications) */
  retrainInterval: number;
}

/**
 * Training configuration
 */
export interface TrainingConfig {
  /** Number of epochs */
  epochs: number;
  
  /** Batch size */
  batchSize: number;
  
  /** Validation split ratio */
  validationSplit: number;
  
  /** Learning rate */
  learningRate: number;
  
  /** Early stopping patience */
  patience: number;
  
  /** Minimum delta for early stopping */
  minDelta: number;
}

/**
 * Feature extraction configuration
 */
export interface FeatureConfig {
  /** Maximum vocabulary size */
  maxVocabSize: number;
  
  /** Maximum features (output dimension) */
  maxFeatures: number;
  
  /** N-gram range */
  ngramRange: [number, number];
  
  /** Minimum document frequency */
  minDocFreq: number;
  
  /** Maximum document frequency */
  maxDocFreq: number;
}

/**
 * Default ML configuration
 */
export const DEFAULT_ML_CONFIG: MLConfig = {
  modelDirectory: './models',
  activeModelFile: 'classifier_latest',
  confidenceThreshold: 0.8,
  minTrainingSamples: 10,
  training: {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    learningRate: 0.001,
    patience: 5,
    minDelta: 0.001
  },
  features: {
    maxVocabSize: 1000,
    maxFeatures: 100,
    ngramRange: [1, 2],
    minDocFreq: 2,
    maxDocFreq: 0.8
  },
  autoRetrain: true,
  retrainInterval: 50
};
```

### Configuration File (JSON)

```json
{
  "ml": {
    "modelDirectory": "./models",
    "activeModelFile": "classifier_latest",
    "confidenceThreshold": 0.8,
    "minTrainingSamples": 10,
    "training": {
      "epochs": 50,
      "batchSize": 32,
      "validationSplit": 0.2,
      "learningRate": 0.001,
      "patience": 5,
      "minDelta": 0.001
    },
    "features": {
      "maxVocabSize": 1000,
      "maxFeatures": 100,
      "ngramRange": [1, 2],
      "minDocFreq": 2,
      "maxDocFreq": 0.8
    },
    "autoRetrain": true,
    "retrainInterval": 50
  }
}
```

### Environment Variables

```bash
# ML configuration
ML_MODEL_DIRECTORY=./models
ML_ACTIVE_MODEL=classifier_latest
ML_CONFIDENCE_THRESHOLD=0.8
ML_MIN_TRAINING_SAMPLES=10
ML_EPOCHS=50
ML_BATCH_SIZE=32
ML_LEARNING_RATE=0.001
ML_AUTO_RETRAIN=true
ML_RETRAIN_INTERVAL=50
```

---

## File Storage Configuration

### File Storage Configuration

```typescript
/**
 * File storage configuration
 */
export interface FileStorageConfig {
  /** Upload directory for CSV files */
  uploadDirectory: string;
  
  /** Maximum file size (bytes) */
  maxFileSize: number;
  
  /** Allowed file extensions */
  allowedExtensions: string[];
  
  /** Enable file cleanup */
  autoCleanup: boolean;
  
  /** Cleanup interval (milliseconds) */
  cleanupInterval: number;
  
  /** File retention period (milliseconds) */
  retentionPeriod: number;
}

/**
 * Default file storage configuration
 */
export const DEFAULT_FILE_STORAGE_CONFIG: FileStorageConfig = {
  uploadDirectory: './uploads',
  maxFileSize: 10 * 1024 * 1024,  // 10MB
  allowedExtensions: ['.csv'],
  autoCleanup: true,
  cleanupInterval: 24 * 60 * 60 * 1000,  // 24 hours
  retentionPeriod: 7 * 24 * 60 * 60 * 1000  // 7 days
};
```

### Configuration File (JSON)

```json
{
  "fileStorage": {
    "uploadDirectory": "./uploads",
    "maxFileSize": 10485760,
    "allowedExtensions": [".csv"],
    "autoCleanup": true,
    "cleanupInterval": 86400000,
    "retentionPeriod": 604800000
  }
}
```

### Environment Variables

```bash
# File storage configuration
UPLOAD_DIRECTORY=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.csv
AUTO_CLEANUP=true
CLEANUP_INTERVAL=86400000
RETENTION_PERIOD=604800000
```

---

## Environment-Specific Configurations

### Development Configuration

```json
{
  "database": {
    "filePath": "./data/household-spending-dev.db",
    "logging": true
  },
  "server": {
    "port": 4000,
    "graphql": {
      "playground": true,
      "introspection": true,
      "tracing": true
    },
    "logging": true,
    "logLevel": "debug"
  },
  "frontend": {
    "devMode": true,
    "analytics": false
  },
  "ml": {
    "autoRetrain": true
  }
}
```

---

### Production Configuration

```json
{
  "database": {
    "filePath": "./data/household-spending-prod.db",
    "logging": false,
    "walMode": true
  },
  "server": {
    "port": 4000,
    "host": "0.0.0.0",
    "cors": {
      "origins": ["https://yourdomain.com"]
    },
    "graphql": {
      "playground": false,
      "introspection": false,
      "tracing": false,
      "caching": true
    },
    "logging": true,
    "logLevel": "warn"
  },
  "frontend": {
    "apiUrl": "https://api.yourdomain.com",
    "graphqlUrl": "https://api.yourdomain.com/graphql",
    "devMode": false,
    "analytics": true
  },
  "ml": {
    "autoRetrain": true,
    "retrainInterval": 100
  },
  "fileStorage": {
    "autoCleanup": true,
    "retentionPeriod": 604800000
  }
}
```

---

### Test Configuration

```json
{
  "database": {
    "filePath": ":memory:",
    "logging": false
  },
  "server": {
    "port": 4001,
    "logging": false,
    "logLevel": "error"
  },
  "ml": {
    "minTrainingSamples": 5,
    "training": {
      "epochs": 10,
      "batchSize": 16
    },
    "autoRetrain": false
  },
  "fileStorage": {
    "uploadDirectory": "./test-uploads",
    "autoCleanup": true,
    "retentionPeriod": 3600000
  }
}
```

---

## Configuration Loading

### Configuration Loader Implementation

```typescript
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration loader
 */
export class ConfigLoader {
  private config: any;
  
  constructor() {
    this.config = {};
  }
  
  /**
   * Load configuration from files and environment variables
   * 
   * @param environment - Environment name (development, production, test)
   */
  load(environment: string = 'development'): void {
    // Load default configuration
    this.loadConfigFile('default.json');
    
    // Load environment-specific configuration
    this.loadConfigFile(`${environment}.json`);
    
    // Override with environment variables
    this.loadEnvironmentVariables();
  }
  
  /**
   * Load configuration from JSON file
   */
  private loadConfigFile(filename: string): void {
    const filePath = path.join(__dirname, '../../config', filename);
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const fileConfig = JSON.parse(fileContent);
      this.config = this.mergeDeep(this.config, fileConfig);
    }
  }
  
  /**
   * Load configuration from environment variables
   */
  private loadEnvironmentVariables(): void {
    // Database
    if (process.env.DB_FILE_PATH) {
      this.config.database.filePath = process.env.DB_FILE_PATH;
    }
    
    // Server
    if (process.env.SERVER_PORT) {
      this.config.server.port = parseInt(process.env.SERVER_PORT, 10);
    }
    if (process.env.SERVER_HOST) {
      this.config.server.host = process.env.SERVER_HOST;
    }
    
    // ML
    if (process.env.ML_CONFIDENCE_THRESHOLD) {
      this.config.ml.confidenceThreshold = parseFloat(process.env.ML_CONFIDENCE_THRESHOLD);
    }
    
    // Add more environment variable mappings as needed
  }
  
  /**
   * Get configuration value
   */
  get<T>(key: string): T {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        throw new Error(`Configuration key not found: ${key}`);
      }
    }
    
    return value as T;
  }
  
  /**
   * Deep merge two objects
   */
  private mergeDeep(target: any, source: any): any {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }
  
  /**
   * Check if value is an object
   */
  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

/**
 * Global configuration instance
 */
export const config = new ConfigLoader();
```

---

## Usage Examples

### Loading Configuration

```typescript
import { config } from './config-loader';

// Load configuration for current environment
const environment = process.env.NODE_ENV || 'development';
config.load(environment);

// Access configuration values
const dbConfig = config.get<DatabaseConfig>('database');
const serverPort = config.get<number>('server.port');
const mlThreshold = config.get<number>('ml.confidenceThreshold');
```

---

### Using Configuration in Application

```typescript
// Database connection
import { config } from './config-loader';
import sqlite3 from 'sqlite3';

const dbConfig = config.get<DatabaseConfig>('database');
const db = new sqlite3.Database(dbConfig.filePath);

// Server setup
import express from 'express';

const serverConfig = config.get<ServerConfig>('server');
const app = express();

app.listen(serverConfig.port, serverConfig.host, () => {
  console.log(`Server running on ${serverConfig.host}:${serverConfig.port}`);
});

// ML model
import { MLManager } from './ml-manager';

const mlConfig = config.get<MLConfig>('ml');
const mlManager = new MLManager(mlConfig);
```

---

## Configuration Validation

### Validation Schema

```typescript
import Joi from 'joi';

/**
 * Configuration validation schema
 */
export const configSchema = Joi.object({
  database: Joi.object({
    type: Joi.string().valid('sqlite').required(),
    filePath: Joi.string().required(),
    foreignKeys: Joi.boolean().required(),
    walMode: Joi.boolean().required(),
    poolSize: Joi.number().integer().min(1).max(20).required(),
    timeout: Joi.number().integer().min(1000).required(),
    logging: Joi.boolean().required(),
    busyTimeout: Joi.number().integer().min(1000).required()
  }).required(),
  
  server: Joi.object({
    port: Joi.number().integer().min(1).max(65535).required(),
    host: Joi.string().required(),
    cors: Joi.object({
      enabled: Joi.boolean().required(),
      origins: Joi.array().items(Joi.string()).required(),
      methods: Joi.array().items(Joi.string()).required(),
      allowedHeaders: Joi.array().items(Joi.string()).required(),
      credentials: Joi.boolean().required()
    }).required(),
    graphql: Joi.object({
      path: Joi.string().required(),
      playground: Joi.boolean().required(),
      introspection: Joi.boolean().required(),
      tracing: Joi.boolean().required(),
      caching: Joi.boolean().required()
    }).required(),
    bodyLimit: Joi.string().required(),
    logging: Joi.boolean().required(),
    logLevel: Joi.string().valid('error', 'warn', 'info', 'debug').required()
  }).required(),
  
  ml: Joi.object({
    modelDirectory: Joi.string().required(),
    activeModelFile: Joi.string().required(),
    confidenceThreshold: Joi.number().min(0).max(1).required(),
    minTrainingSamples: Joi.number().integer().min(1).required(),
    training: Joi.object({
      epochs: Joi.number().integer().min(1).required(),
      batchSize: Joi.number().integer().min(1).required(),
      validationSplit: Joi.number().min(0).max(1).required(),
      learningRate: Joi.number().min(0).required(),
      patience: Joi.number().integer().min(1).required(),
      minDelta: Joi.number().min(0).required()
    }).required(),
    features: Joi.object({
      maxVocabSize: Joi.number().integer().min(1).required(),
      maxFeatures: Joi.number().integer().min(1).required(),
      ngramRange: Joi.array().items(Joi.number().integer()).length(2).required(),
      minDocFreq: Joi.number().integer().min(1).required(),
      maxDocFreq: Joi.number().min(0).max(1).required()
    }).required(),
    autoRetrain: Joi.boolean().required(),
    retrainInterval: Joi.number().integer().min(1).required()
  }).required(),
  
  fileStorage: Joi.object({
    uploadDirectory: Joi.string().required(),
    maxFileSize: Joi.number().integer().min(1).required(),
    allowedExtensions: Joi.array().items(Joi.string()).required(),
    autoCleanup: Joi.boolean().required(),
    cleanupInterval: Joi.number().integer().min(1).required(),
    retentionPeriod: Joi.number().integer().min(1).required()
  }).required()
});

/**
 * Validate configuration
 */
export function validateConfig(config: any): void {
  const { error } = configSchema.validate(config);
  
  if (error) {
    throw new Error(`Configuration validation failed: ${error.message}`);
  }
}
```

---

## Notes

- **Environment Variables**: Override file-based configuration
- **Validation**: All configuration validated on startup
- **Type Safety**: TypeScript interfaces for all configuration
- **Defaults**: Sensible defaults for all settings
- **Environment-Specific**: Separate configs for dev, prod, test
- **Security**: Sensitive values (if any) in environment variables only
- **Documentation**: All configuration options documented
