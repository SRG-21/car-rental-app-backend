import type { FastifyInstance } from 'fastify';
import { ProxyService } from '../services/proxy.service.js';
import { HealthService } from '../services/health.service.js';
import { jwtValidationMiddleware } from '../middleware/auth.middleware.js';

/**
 * Register all gateway routes
 */
export function registerRoutes(fastify: FastifyInstance): void {
  const proxyService = new ProxyService();
  const healthService = new HealthService();

  // Health check endpoints
  fastify.get('/health', async (_request, reply) => {
    const health = await healthService.checkAllServices();
    reply.code(health.status === 'healthy' ? 200 : 503).send(health);
  });

  fastify.get('/health/:service', async (request, reply) => {
    const { service } = request.params as { service: string };
    const health = await healthService.checkAllServices();

    if (health.services[service]) {
      reply.send({
        service,
        timestamp: health.timestamp,
        ...health.services[service]
      });
    } else {
      reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: `Service '${service}' not found`,
          timestamp: new Date().toISOString()
        }
      });
    }
  });

  // ========================================
  // AUTH ROUTES (proxy to auth-service:3001)
  // ========================================

  // Public auth routes
  fastify.post('/auth/signup', proxyService.proxyToAuth.bind(proxyService));
  fastify.post('/auth/login', proxyService.proxyToAuth.bind(proxyService));
  fastify.post('/auth/refresh', proxyService.proxyToAuth.bind(proxyService));
  fastify.post('/auth/logout', proxyService.proxyToAuth.bind(proxyService));

  // Protected auth routes
  fastify.get(
    '/auth/me',
    {
      preHandler: [jwtValidationMiddleware],
      config: {
        rateLimit: {
          max: 60,
          timeWindow: '1 minute'
        }
      }
    },
    proxyService.proxyToAuth.bind(proxyService)
  );

  // ========================================
  // CAR ROUTES (proxy to car-service:3002)
  // ========================================

  // Public car routes
  fastify.get('/cars/:id', proxyService.proxyToCar.bind(proxyService));

  // Admin car routes (protected) - simplified for demo
  fastify.post(
    '/cars',
    { preHandler: [jwtValidationMiddleware] },
    proxyService.proxyToCar.bind(proxyService)
  );

  fastify.put(
    '/cars/:id',
    { preHandler: [jwtValidationMiddleware] },
    proxyService.proxyToCar.bind(proxyService)
  );

  fastify.delete(
    '/cars/:id',
    { preHandler: [jwtValidationMiddleware] },
    proxyService.proxyToCar.bind(proxyService)
  );

  // ========================================
  // SEARCH ROUTES (proxy to search-service:3003)
  // ========================================

  fastify.get(
    '/search',
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: '1 minute'
        }
      }
    },
    proxyService.proxyToSearch.bind(proxyService)
  );

  // Reindex endpoint - admin only (no auth for simplicity)
  fastify.post(
    '/search/reindex',
    proxyService.proxyToSearch.bind(proxyService)
  );

  // ========================================
  // BOOKING ROUTES (proxy to booking-service:3004)
  // ========================================

  // All booking routes require authentication
  fastify.post(
    '/bookings',
    {
      preHandler: [jwtValidationMiddleware],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute'
        }
      }
    },
    proxyService.proxyToBooking.bind(proxyService)
  );

  fastify.get(
    '/bookings',
    { preHandler: [jwtValidationMiddleware] },
    proxyService.proxyToBooking.bind(proxyService)
  );

  fastify.get(
    '/bookings/:id',
    { preHandler: [jwtValidationMiddleware] },
    proxyService.proxyToBooking.bind(proxyService)
  );

  fastify.patch(
    '/bookings/:id',
    { preHandler: [jwtValidationMiddleware] },
    proxyService.proxyToBooking.bind(proxyService)
  );

  // ========================================
  // NOTIFICATION ROUTES (proxy to notification-service:3005)
  // ========================================

  fastify.post(
    '/notifications/subscribe',
    { preHandler: [jwtValidationMiddleware] },
    proxyService.proxyToNotification.bind(proxyService)
  );

  // Catch-all for undefined routes
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      }
    });
  });
}
