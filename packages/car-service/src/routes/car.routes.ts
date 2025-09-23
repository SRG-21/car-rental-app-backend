import type { FastifyInstance } from 'fastify';
import type { CarController } from '../controllers/car.controller.js';

export async function carRoutes(
  fastify: FastifyInstance,
  controller: CarController
): Promise<void> {
  // Create car (admin only - no auth for now)
  fastify.post('/', {
    handler: controller.createCar.bind(controller)
  });

  // Get all cars
  fastify.get('/', {
    handler: controller.getAllCars.bind(controller)
  });

  // Get car by ID
  fastify.get('/:id', {
    handler: controller.getCarById.bind(controller)
  });

  // Update car (admin only - no auth for now)
  fastify.patch('/:id', {
    handler: controller.updateCar.bind(controller)
  });

  // Delete car (admin only - no auth for now)
  fastify.delete('/:id', {
    handler: controller.deleteCar.bind(controller)
  });
}
