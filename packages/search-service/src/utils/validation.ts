import { z } from 'zod';

export const searchCarsSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().optional().default(10),
  pickupTime: z.coerce.date().optional(),
  dropoffTime: z.coerce.date().optional(),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']).optional(),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).optional(),
  seats: z.coerce.number().positive().optional(),
  query: z.string().optional(),
  page: z.coerce.number().positive().optional().default(1),
  limit: z.coerce.number().positive().optional().default(20),
});

export const searchEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3003),
  ELASTICSEARCH_URL: z.string().url(),
  CAR_SERVICE_URL: z.string().url(),
  BOOKING_SERVICE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});
