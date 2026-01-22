import { z } from 'zod';

export type FuelType = 'electric' | 'petrol' | 'diesel' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic';

export const createCarSchema = z.object({
  name: z.string().min(1).max(255),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  fuelType: z.enum(['electric', 'petrol', 'diesel', 'hybrid']),
  transmission: z.enum(['manual', 'automatic']),
  seats: z.number().int().min(1).max(20),
  pricePerDay: z.number().positive(),
  images: z.array(z.string()).min(1),
  features: z.array(z.string()).default([]),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1)
  })
});

export const updateCarSchema = createCarSchema.partial();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info')
});

export const carEnvSchema = envSchema.extend({
  DATABASE_URL: z.string().url(),
  ELASTICSEARCH_URL: z.string().url(),
  SEARCH_SERVICE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('*')
});
