export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'ok' | 'error' | 'timeout';
  latency?: number;
  responseTime?: number;
  error?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Record<string, ServiceHealth>;
}
