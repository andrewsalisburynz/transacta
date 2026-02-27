/**
 * Express + Apollo Server Setup
 */

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { json } from 'body-parser';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { getDatabase, initializeDatabase } from './database/connection';
import { TransactionRepository } from './repositories/TransactionRepository';
import { CategoryRepository } from './repositories/CategoryRepository';
import { ClassificationHistoryRepository } from './repositories/ClassificationHistoryRepository';
import { CSVParser } from './managers/CSVParser';
import { TransactionDataManager } from './managers/TransactionDataManager';
import { MLClassificationEngine } from './managers/MLClassificationEngine';
import { ImportService } from './services/ImportService';
import { ClassificationService } from './services/ClassificationService';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();

  // Initialize database
  logger.info('Initializing database...');
  const db = await initializeDatabase();

  // Initialize repositories
  const transactionRepo = new TransactionRepository(db);
  const categoryRepo = new CategoryRepository(db);
  const historyRepo = new ClassificationHistoryRepository(db);

  // Initialize managers
  const csvParser = new CSVParser();
  const transactionManager = new TransactionDataManager(transactionRepo, csvParser);
  const mlEngine = new MLClassificationEngine();

  // Initialize services
  const importService = new ImportService(csvParser, transactionManager);
  const classificationService = new ClassificationService(
    mlEngine,
    transactionManager,
    transactionRepo,
    categoryRepo,
    historyRepo
  );

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();
  logger.info('Apollo Server started');

  // Middleware
  app.use(cors());
  app.use(json({ limit: '10mb' }));

  // GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async () => ({
        db,
        importService,
        classificationService
      })
    })
  );

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}/graphql`);
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server', { error });
  console.error('Failed to start server:', error);
  process.exit(1);
});
