import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { elasticsearchClient, initializeElasticsearch } from './elasticsearch';
import { startImapSync } from './imap';
import { initializeRAG } from './rag';
import { webhookRouter } from './routes/webhook';
import { emailRouter } from './routes/emails';
import { aiRouter } from './routes/ai';
import { ragRouter } from './routes/rag';

// Load environment variables
dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/webhooks', webhookRouter);
app.use('/api/emails', emailRouter);
app.use('/api/ai', aiRouter);
app.use('/api/rag', ragRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      elasticsearch: elasticsearchClient ? 'connected' : 'disconnected'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  
  try {
    // Initialize Elasticsearch
    await elasticsearchClient.ping();
    await initializeElasticsearch();
    logger.info('Connected to Elasticsearch');
    
    // Initialize RAG (optional)
    try {
      await initializeRAG();
      logger.info('RAG system initialized');
    } catch (ragError) {
      logger.warn('RAG initialization failed (optional feature):', ragError);
    }
    
    // Start IMAP sync
    await startImapSync();
    logger.info('IMAP sync started');
    
  } catch (error) {
    logger.error('Failed to initialize services:', error);
  }
});

export default app;
