import type { FastifyInstance } from 'fastify';
import type { SearchController } from '../controllers/search.controller.js';

export async function searchRoutes(
  fastify: FastifyInstance,
  controller: SearchController
): Promise<void> {
  // Search cars - GET /search (proxied from gateway)
  fastify.get('/search', {
    handler: controller.searchCars.bind(controller)
  });

  // Also support POST for backward compatibility
  fastify.post('/search', {
    handler: controller.searchCars.bind(controller)
  });
}
