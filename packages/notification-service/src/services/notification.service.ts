import type { SendEmailRequest } from '../types/index.js';

/**
 * Notification Service - Stub implementation for email notifications
 * In production, integrate with SendGrid, AWS SES, or similar service
 */
export class NotificationService {
  /**
   * Send email notification (stub)
   */
  async sendEmail(data: SendEmailRequest): Promise<void> {
    // Stub implementation - just log to console
    console.log('📧 Email Notification (STUB):');
    console.log(`  To: ${data.to}`);
    console.log(`  Subject: ${data.subject}`);
    console.log(`  HTML: ${data.html}`);
    if (data.text) {
      console.log(`  Text: ${data.text}`);
    }

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(
    email: string,
    bookingId: string,
    carName: string
  ): Promise<void> {
    const message = `Your booking (ID: ${bookingId}) for ${carName} has been confirmed!`;
    await this.sendEmail({
      to: email,
      subject: 'Booking Confirmation',
      html: `<h1>Booking Confirmed</h1><p>${message}</p>`,
      text: message
    });
  }

  /**
   * Send booking cancellation email
   */
  async sendBookingCancellation(
    email: string,
    bookingId: string,
    carName: string
  ): Promise<void> {
    const message = `Your booking (ID: ${bookingId}) for ${carName} has been cancelled.`;
    await this.sendEmail({
      to: email,
      subject: 'Booking Cancelled',
      html: `<h1>Booking Cancelled</h1><p>${message}</p>`,
      text: message
    });
  }
}
