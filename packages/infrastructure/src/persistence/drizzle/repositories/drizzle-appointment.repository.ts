import { eq, and, gte, lte, or } from 'drizzle-orm';
import { Appointment, AppointmentStatus, TimeSlot } from '@crm/domain';
import type { AppointmentRepository } from '@crm/domain';
import { appointments } from '../schema';
import { getDatabase } from '../db';

/**
 * Drizzle implementation of the Appointment Repository.
 */
export class DrizzleAppointmentRepository implements AppointmentRepository {
  private get db() {
    return getDatabase();
  }

  async findById(id: string): Promise<Appointment | null> {
    const rows = await this.db.select().from(appointments).where(eq(appointments.id, id));
    const row = rows[0];
    if (!row) return null;
    return this.toDomain(row);
  }

  async findByClientId(clientId: string): Promise<Appointment[]> {
    const rows = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.clientId, clientId));
    return rows.map((r) => this.toDomain(r));
  }

  async findByDateRange(start: Date, end: Date): Promise<Appointment[]> {
    const rows = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, start.toISOString()),
          lte(appointments.startTime, end.toISOString()),
        ),
      );
    return rows.map((r) => this.toDomain(r));
  }

  async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    const rows = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.status, status));
    return rows.map((r) => this.toDomain(r));
  }

  async findOverlapping(start: Date, end: Date): Promise<Appointment[]> {
    // An appointment overlaps if its start < our end AND its end > our start
    const rows = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          lte(appointments.startTime, end.toISOString()),
          gte(appointments.endTime, start.toISOString()),
          // Don't include cancelled appointments
          or(
            eq(appointments.status, AppointmentStatus.PENDING),
            eq(appointments.status, AppointmentStatus.CONFIRMED),
          ),
        ),
      );
    return rows.map((r) => this.toDomain(r));
  }

  async save(appointment: Appointment): Promise<void> {
    const data = appointment.toJSON() as Record<string, unknown>;
    await this.db
      .insert(appointments)
      .values({
        id: data.id as string,
        clientId: data.clientId as string,
        serviceId: data.serviceId as string,
        startTime: data.startTime as string,
        endTime: data.endTime as string,
        status: data.status as string,
        notes: (data.notes as string) ?? null,
        googleCalendarEventId: (data.googleCalendarEventId as string) ?? null,
        createdAt: data.createdAt as string,
        updatedAt: data.updatedAt as string,
      })
      .onConflictDoUpdate({
        target: appointments.id,
        set: {
          clientId: data.clientId as string,
          serviceId: data.serviceId as string,
          startTime: data.startTime as string,
          endTime: data.endTime as string,
          status: data.status as string,
          notes: (data.notes as string) ?? null,
          googleCalendarEventId: (data.googleCalendarEventId as string) ?? null,
          updatedAt: data.updatedAt as string,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(appointments).where(eq(appointments.id, id));
  }

  private toDomain(row: typeof appointments.$inferSelect): Appointment {
    return Appointment.reconstitute({
      id: row.id,
      clientId: row.clientId,
      serviceId: row.serviceId,
      timeSlot: TimeSlot.create(new Date(row.startTime), new Date(row.endTime)),
      status: row.status as AppointmentStatus,
      notes: row.notes ?? undefined,
      googleCalendarEventId: row.googleCalendarEventId ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
