import type { FastifyRequest, FastifyReply } from 'fastify';
import type { CarService } from '../services/car.service.js';
import {
  createCarSchema,
  updateCarSchema
} from '../utils/validation.js';
import type {
  CreateCarRequest,
  UpdateCarRequest
} from '../types/index.js';

export class CarController {
  constructor(private readonly carService: CarService) {}

  /**
   * Create a new car
   * POST /cars
   */
  async createCar(
    request: FastifyRequest<{ Body: CreateCarRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = createCarSchema.parse(request.body);

    const car = await this.carService.createCar(data);

    reply.code(201).send({
      success: true,
      data: car
    });
  }

  /**
   * Get all cars
   * GET /cars
   */
  async getAllCars(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const cars = await this.carService.getAllCars();

    reply.code(200).send({
      success: true,
      data: cars
    });
  }

  /**
   * Get a single car by ID
   * GET /cars/:id
   */
  async getCarById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;

    const car = await this.carService.getCarById(id);

    reply.code(200).send({
      success: true,
      data: car
    });
  }

  /**
   * Update a car
   * PATCH /cars/:id
   */
  async updateCar(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCarRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const data = updateCarSchema.parse(request.body);

    const car = await this.carService.updateCar(id, data);

    reply.code(200).send({
      success: true,
      data: car
    });
  }

  /**
   * Delete a car
   * DELETE /cars/:id
   */
  async deleteCar(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;

    await this.carService.deleteCar(id);

    reply.code(204).send();
  }
}
