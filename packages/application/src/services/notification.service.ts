import type { NotificationPort, NotificationParams } from '../ports/notification.port';

/**
 * Notification Application Service
 * Coordinates sending notifications to clients.
 */
export class NotificationService {
  constructor(private readonly notificationPort: NotificationPort) {}

  async notifyAppointmentConfirmed(params: NotificationParams): Promise<void> {
    await this.notificationPort.sendAppointmentConfirmation(params);
  }

  async notifyAppointmentReminder(params: NotificationParams): Promise<void> {
    await this.notificationPort.sendAppointmentReminder(params);
  }

  async notifyAppointmentCancelled(params: NotificationParams): Promise<void> {
    await this.notificationPort.sendAppointmentCancellation(params);
  }
}
