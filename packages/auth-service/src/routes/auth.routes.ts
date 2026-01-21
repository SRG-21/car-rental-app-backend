import type { FastifyInstance } from 'fastify';
import type { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export function authRoutes(
  fastify: FastifyInstance,
  controller: AuthController
): void {
  // Public routes
  fastify.post('/signup', controller.signup);
  fastify.post('/login', controller.login);
  fastify.post('/refresh', controller.refresh);
  fastify.post('/logout', controller.logout);

  // Protected routes
  fastify.get('/me', { preHandler: [authMiddleware] }, controller.me);
}
