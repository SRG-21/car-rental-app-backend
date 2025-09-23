import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { PrismaClient } from '@prisma/client';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { CarService } from './services/car.service.js';
import { CarController } from './controllers/car.controller.js';
import { carRoutes } from './routes/car.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { config } from './utils/config.js';

const prisma = new PrismaClient({
  log: ['warn', 'error']
});

const esClient = new ElasticsearchClient({
  node: config.ELASTICSEARCH_URL
});

const carService = new CarService(prisma, esClient);
const carController = new CarController(carService);

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
    await carRoutes(fastify, carController);
  },
  { prefix: '' }
);

// Health check
app.get('/health', async () => ({
  status: 'ok',
  service: 'car-service',
  timestamp: new Date().toISOString()
}));

// Global error handler
app.setErrorHandler(errorMiddleware);

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, closing server...`);
    await prisma.$disconnect();
    await esClient.close();
    await app.close();
    process.exit(0);
  });
});

export { prisma, esClient };
