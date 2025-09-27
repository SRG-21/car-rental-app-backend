import type { FastifyInstance } from 'fastify';
import type { NotificationController } from '../controllers/notification.controller.js';

export async function notificationRoutes(
  fastify: FastifyInstance,
  controller: NotificationController
): Promise<void> {
  // Send email
  fastify.post('/email', {
    handler: controller.sendEmail.bind(controller)
  });
}
