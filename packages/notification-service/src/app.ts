import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { NotificationService } from './services/notification.service.js';
import { NotificationController } from './controllers/notification.controller.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const notificationService = new NotificationService();
const notificationController = new NotificationController(notificationService);

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
    await notificationRoutes(fastify, notificationController);
  },
  { prefix: '' }
);

// Health check
app.get('/health', async () => ({
  status: 'ok',
  service: 'notification-service',
  timestamp: new Date().toISOString()
}));

// Global error handler
app.setErrorHandler(errorMiddleware);

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, closing server...`);
    await app.close();
    process.exit(0);
  });
});
