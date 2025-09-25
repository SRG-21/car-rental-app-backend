import { z } from 'zod';

export const createBookingSchema = z
  .object({
    carId: z.string().uuid('Invalid car ID format'),
    pickupTime: z.string().datetime('Invalid pickup time format'),
    dropoffTime: z.string().datetime('Invalid dropoff time format')
  })
  .refine(
    (data) => {
      const pickup = new Date(data.pickupTime);
      const dropoff = new Date(data.dropoffTime);
      return dropoff > pickup;
    },
    { message: 'Dropoff time must be after pickup time' }
  )
  .refine(
    (data) => {
      const pickup = new Date(data.pickupTime);
      const now = new Date();
      return pickup > now;
    },
    { message: 'Pickup time must be in the future' }
  );

export const checkAvailabilitySchema = z.object({
  carIds: z.array(z.string().uuid()),
  pickupTime: z.string().datetime(),
  dropoffTime: z.string().datetime()
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info')
});

export const bookingEnvSchema = envSchema.extend({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().default('*')
});
