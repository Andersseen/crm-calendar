// === Use Cases ===
export type { CreateAppointmentCommand } from './use-cases/create-appointment/create-appointment.command';
export { CreateAppointmentHandler } from './use-cases/create-appointment/create-appointment.handler';

export type { ConfirmAppointmentCommand } from './use-cases/confirm-appointment/confirm-appointment.command';
export { ConfirmAppointmentHandler } from './use-cases/confirm-appointment/confirm-appointment.handler';

export type { ListAppointmentsQuery } from './use-cases/list-appointments/list-appointments.query';
export { ListAppointmentsHandler } from './use-cases/list-appointments/list-appointments.handler';

// === Application Services ===
export { CalendarSyncService } from './services/calendar-sync.service';
export { NotificationService } from './services/notification.service';

// === Ports ===
export type { CalendarPort, CalendarEvent } from './ports/calendar.port';
export type { NotificationPort, NotificationParams } from './ports/notification.port';
