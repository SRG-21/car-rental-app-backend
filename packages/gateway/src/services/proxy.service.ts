import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { FastifyRequest, FastifyReply } from 'fastify';
import config from '../utils/config';

/**
 * Service for proxying requests to backend microservices
 */
export class ProxyService {
  /**
   * Proxy request to auth service
   */
  async proxyToAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Remove /auth prefix from the URL
    const targetUrl = request.url.replace(/^\/auth/, '');
    await this.proxy(request, reply, config.AUTH_SERVICE_URL, targetUrl);
  }

  /**
   * Proxy request to car service
   */
  async proxyToCar(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Remove /cars prefix from the URL
    const targetUrl = request.url.replace(/^\/cars/, '');
    await this.proxy(request, reply, config.CAR_SERVICE_URL, targetUrl);
  }

  /**
   * Proxy request to search service
   */
  async proxyToSearch(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.proxy(request, reply, config.SEARCH_SERVICE_URL, request.url);
  }

  /**
   * Proxy request to booking service
   */
  async proxyToBooking(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Remove /bookings prefix from the URL
    const targetUrl = request.url.replace(/^\/bookings/, '');
    await this.proxy(request, reply, config.BOOKING_SERVICE_URL, targetUrl);
  }

  /**
   * Proxy request to notification service
   */
  async proxyToNotification(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.proxy(request, reply, config.NOTIFICATION_SERVICE_URL);
  }

  /**
   * Generic proxy function
   */
  private async proxy(
    request: FastifyRequest,
    reply: FastifyReply,
    serviceUrl: string,
    targetPath?: string
  ): Promise<void> {
    try {
      // Prepare headers (remove host header)
      const headers = { ...request.headers };
      delete headers.host;
      delete headers['content-length'];

      // Use targetPath if provided, otherwise use request.url
      const path = targetPath !== undefined ? targetPath : request.url;

      // Prepare request config
      const axiosConfig: AxiosRequestConfig = {
        method: request.method as any,
        url: `${serviceUrl}${path}`,
        headers,
        timeout: 30000, // 30 second timeout
        validateStatus: () => true // Don't throw on any status code
      };

      // Add body for non-GET requests
      if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
        axiosConfig.data = request.body;
      }

      // Make request to backend service
      const response = await axios(axiosConfig);

      // Forward response
      reply.code(response.status).send(response.data);
    } catch (error) {
      request.log.error(
        { error, url: `${serviceUrl}${request.url}` },
        'Proxy request failed'
      );

      if (error instanceof AxiosError) {
        if (error.code === 'ECONNREFUSED') {
          reply.code(503).send({
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Backend service is unavailable',
              timestamp: new Date().toISOString(),
              path: request.url,
              requestId: request.id
            }
          });
          return;
        }

        if (error.code === 'ETIMEDOUT') {
          reply.code(504).send({
            error: {
              code: 'GATEWAY_TIMEOUT',
              message: 'Request to backend service timed out',
              timestamp: new Date().toISOString(),
              path: request.url,
              requestId: request.id
            }
          });
          return;
        }
      }

      throw error;
    }
  }
}
