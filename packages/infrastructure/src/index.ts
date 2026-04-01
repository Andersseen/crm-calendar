// === Persistence ===
export { getDatabase, closeDatabase } from './persistence/drizzle/db';
export * from './persistence/drizzle/schema';
export { DrizzleClientRepository } from './persistence/drizzle/repositories/drizzle-client.repository';
export { DrizzleAppointmentRepository } from './persistence/drizzle/repositories/drizzle-appointment.repository';
export { DrizzleServiceRepository } from './persistence/drizzle/repositories/drizzle-service.repository';

// === Calendar ===
export { GoogleCalendarAdapter } from './calendar/google-calendar.adapter';

// === Notification ===
export { EmailNotificationAdapter } from './notification/email.adapter';
export { WhatsAppTwilioAdapter } from './notification/whatsapp-twilio.adapter';
