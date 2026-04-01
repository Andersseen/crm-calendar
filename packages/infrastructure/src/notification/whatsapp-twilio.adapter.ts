import type { NotificationPort, NotificationParams } from '@crm/application';

/**
 * WhatsApp/Twilio Notification Adapter (Phase 2 Placeholder)
 * Will integrate with Twilio WhatsApp Business API.
 */
export class WhatsAppTwilioAdapter implements NotificationPort {
  async sendAppointmentConfirmation(_params: NotificationParams): Promise<void> {
    throw new Error('WhatsApp integration not implemented yet (Phase 2)');
  }

  async sendAppointmentReminder(_params: NotificationParams): Promise<void> {
    throw new Error('WhatsApp integration not implemented yet (Phase 2)');
  }

  async sendAppointmentCancellation(_params: NotificationParams): Promise<void> {
    throw new Error('WhatsApp integration not implemented yet (Phase 2)');
  }
}
