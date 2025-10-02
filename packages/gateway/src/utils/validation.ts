import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info')
});

export const gatewayEnvSchema = envSchema.extend({
  FRONTEND_URL: z.string().url(),
  AUTH_SERVICE_URL: z.string().url(),
  CAR_SERVICE_URL: z.string().url(),
  SEARCH_SERVICE_URL: z.string().url(),
  BOOKING_SERVICE_URL: z.string().url(),
  NOTIFICATION_SERVICE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  RATE_LIMIT_MAX: z.coerce.number().int().default(100),
  RATE_LIMIT_WINDOW: z.string().default('15m')
});
