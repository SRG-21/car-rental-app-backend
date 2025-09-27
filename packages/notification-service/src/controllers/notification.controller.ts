import type { FastifyRequest, FastifyReply } from 'fastify';
import type { NotificationService } from '../services/notification.service.js';
import { sendEmailSchema } from '../utils/validation.js';
import type { SendEmailRequest } from '../types/index.js';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Send email notification
   * POST /notifications/email
   */
  async sendEmail(
    request: FastifyRequest<{ Body: SendEmailRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = sendEmailSchema.parse(request.body);

    await this.notificationService.sendEmail(data);

    reply.code(200).send({
      success: true,
      message: 'Email sent successfully'
    });
  }
}
