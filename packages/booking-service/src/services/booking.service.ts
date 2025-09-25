import type { PrismaClient, Booking, Car } from '@prisma/client';
import {
  ConflictError,
  NotFoundError
} from '../utils/errors.js';
import type {
  CreateBookingRequest,
  BookingWithCar
} from '../types/index.js';
import { differenceInHours } from 'date-fns';

export interface AvailabilityResponse {
  [carId: string]: boolean;
}

/**
 * Booking Service - Handles atomic booking operations with race condition prevention
 */
export class BookingService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new booking with atomic transaction and conflict detection
   */
  async createBooking(
    userId: string,
    data: CreateBookingRequest
  ): Promise<BookingWithCar> {
    return await this.prisma.$transaction(
      async (tx) => {
        // 1. Verify car exists and is active
        const car = await tx.car.findUnique({
          where: { id: data.carId, isActive: true }
        });

        if (!car) {
          throw new NotFoundError('Car not found or inactive');
        }

        // 2. Check for overlapping bookings with pessimistic lock
        const conflicts = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id 
          FROM bookings
          WHERE car_id = ${data.carId}::uuid
            AND status != 'cancelled'
            AND tstzrange(pickup_time, dropoff_time) 
                && tstzrange(${data.pickupTime}::timestamptz, ${data.dropoffTime}::timestamptz)
          FOR UPDATE
        `;

        if (conflicts.length > 0) {
          throw new ConflictError('Car not available for selected dates');
        }

        // 3. Calculate total price
        const hours = differenceInHours(
          new Date(data.dropoffTime),
          new Date(data.pickupTime)
        );
        const days = Math.ceil(hours / 24);
        const totalPrice = days * Number(car.pricePerDay);

        // 4. Create booking
        const booking = await tx.booking.create({
          data: {
            userId,
            carId: data.carId,
            pickupTime: new Date(data.pickupTime),
            dropoffTime: new Date(data.dropoffTime),
            totalPrice,
            status: 'confirmed'
          },
          include: {
            car: {
              select: { id: true, name: true, images: true }
            }
          }
        });

        return this.toBookingWithCar(booking);
      },
      {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000
      }
    );
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId: string): Promise<BookingWithCar[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        car: {
          select: { id: true, name: true, images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return bookings.map((booking) => this.toBookingWithCar(booking));
  }

  /**
   * Get a single booking by ID for a user
   */
  async getBookingById(id: string, userId: string): Promise<BookingWithCar> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
      include: {
        car: {
          select: { id: true, name: true, images: true }
        }
      }
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    return this.toBookingWithCar(booking);
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, userId: string): Promise<BookingWithCar> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId, status: 'confirmed' }
    });

    if (!booking) {
      throw new NotFoundError('Booking not found or cannot be cancelled');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        car: {
          select: { id: true, name: true, images: true }
        }
      }
    });

    return this.toBookingWithCar(updated);
  }

  /**
   * Check availability of cars for given dates (internal endpoint)
   */
  async checkAvailability(
    carIds: string[],
    pickup: string,
    dropoff: string
  ): Promise<AvailabilityResponse> {
    // If no carIds provided, return empty availability
    if (!carIds || carIds.length === 0) {
      return {};
    }

    const unavailableCars = await this.prisma.$queryRaw<Array<{ car_id: string }>>`
      SELECT DISTINCT car_id::text
      FROM bookings
      WHERE car_id::text = ANY(${carIds})
        AND status != 'cancelled'
        AND tstzrange(pickup_time, dropoff_time)
            && tstzrange(${pickup}::timestamptz, ${dropoff}::timestamptz)
    `;

    const unavailableSet = new Set(unavailableCars.map((b) => b.car_id));

    const availability = carIds.reduce(
      (acc, carId) => {
        acc[carId] = !unavailableSet.has(carId);
        return acc;
      },
      {} as Record<string, boolean>
    );

    return availability;
  }

  /**
   * Convert Prisma Booking model to API response
   */
  private toBookingWithCar(
    booking: Booking & { car: Pick<Car, 'id' | 'name' | 'images'> }
  ): BookingWithCar {
    return {
      id: booking.id,
      userId: booking.userId,
      carId: booking.carId,
      pickupTime: booking.pickupTime.toISOString(),
      dropoffTime: booking.dropoffTime.toISOString(),
      totalPrice: Number(booking.totalPrice),
      status: booking.status as 'confirmed' | 'cancelled' | 'completed',
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      car: {
        id: booking.car.id,
        name: booking.car.name,
        images: booking.car.images
      }
    };
  }
}
