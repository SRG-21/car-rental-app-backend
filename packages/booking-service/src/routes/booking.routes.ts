import type { FastifyInstance } from 'fastify';
import type { BookingController } from '../controllers/booking.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function bookingRoutes(
  fastify: FastifyInstance,
  controller: BookingController
): Promise<void> {
  // Create booking
  fastify.post('/', {
    preHandler: [authMiddleware],
    handler: controller.createBooking.bind(controller)
  });

  // Get user's bookings
  fastify.get('/', {
    preHandler: [authMiddleware],
    handler: controller.getUserBookings.bind(controller)
  });

  // Get booking by ID
  fastify.get('/:id', {
    preHandler: [authMiddleware],
    handler: controller.getBookingById.bind(controller)
  });

  // Cancel booking
  fastify.delete('/:id', {
    preHandler: [authMiddleware],
    handler: controller.cancelBooking.bind(controller)
  });

  // Check availability (internal endpoint, no auth)
  fastify.post('/availability', {
    handler: controller.checkAvailability.bind(controller)
  });
}
