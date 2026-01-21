import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './services/auth.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { authRoutes } from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import config from './utils/config.js';

export async function buildApp() {
  // Create Fastify instance
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport:
        config.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
              }
            }
          : undefined
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    genReqId: () => {
      return Math.random().toString(36).substring(2, 15);
    }
  });

  // Register plugins
  await app.register(helmet, {
    contentSecurityPolicy: false
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  });

  // Initialize database connection
  const prisma = new PrismaClient({
    log:
      config.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error']
  });

  // Initialize service and controller
  const authService = new AuthService(prisma);
  const authController = new AuthController(authService);

  // Register routes
  authRoutes(app, authController);

  // Health check endpoint
  app.get('/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'auth-service'
      };
    } catch (error) {
      throw new Error('Database connection failed');
    }
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Graceful shutdown
  const shutdown = async () => {
    app.log.info('Shutting down gracefully...');
    await prisma.$disconnect();
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return app;
}
