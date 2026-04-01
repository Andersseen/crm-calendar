import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Drizzle SQLite Schema
 * Maps domain entities to database tables.
 */

export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(),
  priceInCents: integer('price_in_cents').notNull(),
  currency: text('currency').notNull().default('EUR'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const appointments = sqliteTable('appointments', {
  id: text('id').primaryKey(),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id),
  serviceId: text('service_id')
    .notNull()
    .references(() => services.id),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  status: text('status').notNull().default('PENDING'),
  notes: text('notes'),
  googleCalendarEventId: text('google_calendar_event_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
