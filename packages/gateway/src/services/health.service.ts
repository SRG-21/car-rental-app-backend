import axios from 'axios';
import type { HealthResponse, ServiceHealth } from '../types/index.js';
import config from '../utils/config.js';

/**
 * Service for aggregating health checks from all microservices
 */
export class HealthService {
  private readonly services = [
    { name: 'auth', url: `${config.AUTH_SERVICE_URL}/health` },
    { name: 'car', url: `${config.CAR_SERVICE_URL}/health` },
    { name: 'search', url: `${config.SEARCH_SERVICE_URL}/health` },
    { name: 'booking', url: `${config.BOOKING_SERVICE_URL}/health` },
    { name: 'notification', url: `${config.NOTIFICATION_SERVICE_URL}/health` }
  ];

  /**
   * Check health of all services
   */
  async checkAllServices(): Promise<HealthResponse> {
    const results = await Promise.allSettled(
      this.services.map((service) => this.checkService(service.name, service.url))
    );

    const services: { [key: string]: ServiceHealth } = {};
    let hasError = false;
    let hasTimeout = false;

    results.forEach((result, index) => {
      const serviceName = this.services[index].name;

      if (result.status === 'fulfilled') {
        services[serviceName] = result.value;
        if (result.value.status === 'error') hasError = true;
        if (result.value.status === 'timeout') hasTimeout = true;
      } else {
        services[serviceName] = {
          status: 'error',
          error: 'Health check failed'
        };
        hasError = true;
      }
    });

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (hasError && hasTimeout) {
      overallStatus = 'unhealthy';
    } else if (hasError || hasTimeout) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services
    };
  }

  /**
   * Check health of a single service
   */
  private async checkService(_name: string, url: string): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true
      });

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        return {
          status: 'ok',
          responseTime
        };
      } else {
        return {
          status: 'error',
          responseTime,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return {
          status: 'timeout',
          responseTime,
          error: 'Request timeout'
        };
      }

      return {
        status: 'error',
        responseTime,
        error: error.message || 'Unknown error'
      };
    }
  }
}
