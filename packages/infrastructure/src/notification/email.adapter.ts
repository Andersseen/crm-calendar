import type { NotificationPort, NotificationParams } from '@crm/application';

/**
 * Email Notification Adapter (Stub)
 * Phase 1: Logs notifications. Phase 2: Real email service integration.
 */
export class EmailNotificationAdapter implements NotificationPort {
  async sendAppointmentConfirmation(params: NotificationParams): Promise<void> {
    console.warn(`[Email] Confirmation to ${params.clientEmail}: ${params.serviceName} on ${params.appointmentDate.toISOString()}`);
  }

  async sendAppointmentReminder(params: NotificationParams): Promise<void> {
    console.warn(`[Email] Reminder to ${params.clientEmail}: ${params.serviceName} on ${params.appointmentDate.toISOString()}`);
  }

  async sendAppointmentCancellation(params: NotificationParams): Promise<void> {
    console.warn(`[Email] Cancellation to ${params.clientEmail}: ${params.serviceName}`);
  }
}
