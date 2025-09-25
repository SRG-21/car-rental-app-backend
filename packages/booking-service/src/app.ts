import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { PrismaClient } from '@prisma/client';
import { BookingService } from './services/booking.service.js';
import { BookingController } from './controllers/booking.controller.js';
import { bookingRoutes } from './routes/booking.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const prisma = new PrismaClient({
  log: ['warn', 'error']
});

const bookingService = new BookingService(prisma);
const bookingController = new BookingController(bookingService);

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

// Add auth middleware to Fastify instance
app.decorate('authenticate', authMiddleware);

// Register routes
await app.register(
  async (fastify) => {
    await bookingRoutes(fastify, bookingController);
  },
  { prefix: '' }
);

// Health check
app.get('/health', async () => ({
  status: 'ok',
  service: 'booking-service',
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
    await app.close();
    process.exit(0);
  });
});

export { prisma };
