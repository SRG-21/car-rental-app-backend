import type { FastifyInstance } from 'fastify';
import type { SearchController } from '../controllers/search.controller.js';

export async function searchRoutes(
  fastify: FastifyInstance,
  controller: SearchController
): Promise<void> {
  // Search cars - GET / (from gateway as /search)
  fastify.get('/', {
    handler: controller.searchCars.bind(controller)
  });

  // Also support POST for backward compatibility
  fastify.post('/', {
    handler: controller.searchCars.bind(controller)
  });

  // Reindex endpoint - POST /reindex
  fastify.post('/reindex', {
    handler: controller.reindexCars.bind(controller)
  });
}
