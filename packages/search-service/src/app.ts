import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { Client } from '@opensearch-project/opensearch';
import { SearchService } from './services/search.service.js';
import { SearchController } from './controllers/search.controller.js';
import { searchRoutes } from './routes/search.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { config } from './utils/config.js';

const esClient = new Client({
  node: config.ELASTICSEARCH_URL
});

const searchService = new SearchService(esClient, config.BOOKING_SERVICE_URL);
const searchController = new SearchController(searchService, config.CAR_SERVICE_URL);

export const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined
  }
});

// Register plugins
await app.register(cors, {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});

await app.register(helmet, {
  contentSecurityPolicy: false
});

// Register routes
await app.register(
  async (fastify) => {
    await searchRoutes(fastify, searchController);
  },
  { prefix: '' }
);

// Health check
app.get('/health', async () => ({
  status: 'ok',
  service: 'search-service',
  timestamp: new Date().toISOString()
}));

// Global error handler
app.setErrorHandler(errorMiddleware);

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, closing server...`);
    await esClient.close();
    await app.close();
    process.exit(0);
  });
});

export { esClient };
