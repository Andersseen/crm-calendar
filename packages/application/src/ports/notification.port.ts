/**
 * Notification Port (Driven Adapter Interface)
 * Defines the contract for sending notifications to clients.
 */
export interface NotificationPort {
  sendAppointmentConfirmation(params: NotificationParams): Promise<void>;
  sendAppointmentReminder(params: NotificationParams): Promise<void>;
  sendAppointmentCancellation(params: NotificationParams): Promise<void>;
}

export interface NotificationParams {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  appointmentDate: Date;
  serviceName: string;
  message?: string;
}
