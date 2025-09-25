import type { FastifyRequest, FastifyReply } from 'fastify';
import type { BookingService } from '../services/booking.service.js';
import { createBookingSchema, checkAvailabilitySchema } from '../utils/validation.js';
import type { CreateBookingRequest, CheckAvailabilityRequest } from '../types/index.js';

export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Create a new booking
   * POST /bookings
   */
  async createBooking(
    request: FastifyRequest<{ Body: CreateBookingRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user.id; // Injected by auth middleware
    const data = createBookingSchema.parse(request.body);

    const booking = await this.bookingService.createBooking(userId, data);

    reply.code(201).send({
      success: true,
      data: booking
    });
  }

  /**
   * Get all bookings for authenticated user
   * GET /bookings
   */
  async getUserBookings(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user.id;

    const bookings = await this.bookingService.getUserBookings(userId);

    reply.code(200).send({
      success: true,
      data: bookings
    });
  }

  /**
   * Get a single booking by ID
   * GET /bookings/:id
   */
  async getBookingById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user.id;
    const { id } = request.params;

    const booking = await this.bookingService.getBookingById(id, userId);

    reply.code(200).send({
      success: true,
      data: booking
    });
  }

  /**
   * Cancel a booking
   * DELETE /bookings/:id
   */
  async cancelBooking(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user.id;
    const { id } = request.params;

    const booking = await this.bookingService.cancelBooking(id, userId);

    reply.code(200).send({
      success: true,
      data: booking
    });
  }

  /**
   * Check availability for cars (internal endpoint)
   * POST /bookings/availability
   */
  async checkAvailability(
    request: FastifyRequest<{ Body: CheckAvailabilityRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = checkAvailabilitySchema.parse(request.body);

    const availability = await this.bookingService.checkAvailability(
      data.carIds,
      data.pickupTime,
      data.dropoffTime
    );

    reply.code(200).send({
      success: true,
      data: availability
    });
  }
}
