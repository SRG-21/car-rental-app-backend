import type { PrismaClient, Car } from '@prisma/client';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { NotFoundError } from '../utils/errors.js';
import type {
  CreateCarRequest,
  UpdateCarRequest,
  CarResponse
} from '../types/index.js';

/**
 * Car Service - Handles CRUD operations and Elasticsearch synchronization
 */
export class CarService {
  private readonly esIndex = 'cars';

  constructor(
    private readonly prisma: PrismaClient,
    private readonly esClient: ElasticsearchClient
  ) {}

  /**
   * Create a new car and index in Elasticsearch
   */
  async createCar(data: CreateCarRequest): Promise<CarResponse> {
    const car = await this.prisma.car.create({
      data: {
        name: data.name,
        brand: data.brand,
        model: data.model,
        year: data.year,
        fuelType: data.fuelType,
        transmission: data.transmission,
        seats: data.seats,
        pricePerDay: data.pricePerDay,
        images: data.images,
        features: data.features,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        address: data.location.address,
        city: data.location.city,
        state: data.location.state,
        country: data.location.country,
        isActive: true
      }
    });

    // Index in Elasticsearch
    await this.indexCar(car);

    return this.toCarResponse(car);
  }

  /**
   * Get all active cars
   */
  async getAllCars(): Promise<CarResponse[]> {
    const cars = await this.prisma.car.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return cars.map((car) => this.toCarResponse(car));
  }

  /**
   * Get a single car by ID
   */
  async getCarById(id: string): Promise<CarResponse> {
    const car = await this.prisma.car.findUnique({
      where: { id, isActive: true }
    });

    if (!car) {
      throw new NotFoundError('Car not found');
    }

    return this.toCarResponse(car);
  }

  /**
   * Update a car and re-index in Elasticsearch
   */
  async updateCar(id: string, data: UpdateCarRequest): Promise<CarResponse> {
    const car = await this.prisma.car.findUnique({
      where: { id }
    });

    if (!car) {
      throw new NotFoundError('Car not found');
    }

    const updated = await this.prisma.car.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.brand && { brand: data.brand }),
        ...(data.model && { model: data.model }),
        ...(data.year && { year: data.year }),
        ...(data.fuelType && { fuelType: data.fuelType }),
        ...(data.transmission && { transmission: data.transmission }),
        ...(data.seats && { seats: data.seats }),
        ...(data.pricePerDay && { pricePerDay: data.pricePerDay }),
        ...(data.images && { images: data.images }),
        ...(data.features && { features: data.features }),
        ...(data.location && {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          address: data.location.address,
          city: data.location.city,
          state: data.location.state,
          country: data.location.country
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      }
    });

    // Re-index in Elasticsearch
    await this.indexCar(updated);

    return this.toCarResponse(updated);
  }

  /**
   * Delete a car (soft delete) and remove from Elasticsearch
   */
  async deleteCar(id: string): Promise<void> {
    const car = await this.prisma.car.findUnique({
      where: { id }
    });

    if (!car) {
      throw new NotFoundError('Car not found');
    }

    // Soft delete
    await this.prisma.car.update({
      where: { id },
      data: { isActive: false }
    });

    // Remove from Elasticsearch
    await this.removeFromIndex(id);
  }

  /**
   * Index a car document in Elasticsearch
   */
  private async indexCar(car: Car): Promise<void> {
    try {
      await this.esClient.index({
        index: this.esIndex,
        id: car.id,
        document: {
          id: car.id,
          name: car.name,
          brand: car.brand,
          model: car.model,
          year: car.year,
          fuelType: car.fuelType,
          transmission: car.transmission,
          seats: car.seats,
          pricePerDay: Number(car.pricePerDay),
          images: car.images,
          features: car.features,
          location: {
            lat: car.latitude,
            lon: car.longitude
          },
          address: car.address,
          city: car.city,
          state: car.state,
          country: car.country,
          isActive: car.isActive,
          createdAt: car.createdAt.toISOString(),
          updatedAt: car.updatedAt.toISOString()
        }
      });
    } catch (error) {
      console.error('Elasticsearch indexing error:', error);
      // Don't throw - car was created in DB successfully
    }
  }

  /**
   * Remove a car from Elasticsearch index
   */
  private async removeFromIndex(id: string): Promise<void> {
    try {
      await this.esClient.delete({
        index: this.esIndex,
        id
      });
    } catch (error) {
      console.error('Elasticsearch delete error:', error);
      // Don't throw - car was deleted from DB successfully
    }
  }

  /**
   * Convert Prisma Car model to API response
   */
  private toCarResponse(car: Car): CarResponse {
    return {
      id: car.id,
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      fuelType: car.fuelType as 'petrol' | 'diesel' | 'electric' | 'hybrid',
      transmission: car.transmission as 'manual' | 'automatic',
      seats: car.seats,
      pricePerDay: Number(car.pricePerDay),
      images: car.images,
      features: car.features,
      location: {
        latitude: car.latitude,
        longitude: car.longitude,
        address: car.address,
        city: car.city,
        state: car.state,
        country: car.country
      },
      isActive: car.isActive,
      createdAt: car.createdAt.toISOString(),
      updatedAt: car.updatedAt.toISOString()
    };
  }
}
