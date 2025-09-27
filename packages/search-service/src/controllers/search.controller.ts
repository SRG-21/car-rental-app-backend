import type { FastifyRequest, FastifyReply } from 'fastify';
import type { SearchService } from '../services/search.service.js';
import { searchCarsSchema } from '../utils/validation.js';
import type { SearchCarsRequest } from '../types/index.js';

export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Search for cars
   * GET /search or POST /search
   */
  async searchCars(
    request: FastifyRequest<{ Body: SearchCarsRequest; Querystring: SearchCarsRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    // Support both GET (query params) and POST (body)
    const rawParams = request.method === 'GET' ? request.query : request.body;
    
    // Normalize parameter names: support both lat/lon and latitude/longitude
    const normalizedParams = {
      ...rawParams,
      latitude: (rawParams as any).latitude || (rawParams as any).lat,
      longitude: (rawParams as any).longitude || (rawParams as any).lon,
    };
    
    const params = searchCarsSchema.parse(normalizedParams) as SearchCarsRequest;

    const result = await this.searchService.searchCars(params);

    reply.code(200).send({
      success: true,
      data: result
    });
  }
}
