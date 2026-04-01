import { TimeSlot } from '../value-objects/time-slot.vo';
import { AppointmentCreatedEvent } from '../events/appointment-created.event';
import { AppointmentConfirmedEvent } from '../events/appointment-confirmed.event';
import { BaseDomainEvent } from '../events/base-domain-event';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export interface AppointmentProps {
  id: string;
  clientId: string;
  serviceId: string;
  timeSlot: TimeSlot;
  status: AppointmentStatus;
  notes?: string;
  googleCalendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Appointment Entity (Aggregate Root)
 * Central entity of the CRM. Manages the lifecycle of an appointment.
 */
export class Appointment {
  private readonly domainEvents: BaseDomainEvent[] = [];

  private constructor(private props: AppointmentProps) {}

  static create(params: {
    id: string;
    clientId: string;
    serviceId: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
  }): Appointment {
    if (!params.clientId) {
      throw new Error('Client ID is required for an appointment');
    }
    if (!params.serviceId) {
      throw new Error('Service ID is required for an appointment');
    }

    const timeSlot = TimeSlot.create(params.startTime, params.endTime);
    const now = new Date();

    const appointment = new Appointment({
      id: params.id,
      clientId: params.clientId,
      serviceId: params.serviceId,
      timeSlot,
      status: AppointmentStatus.PENDING,
      notes: params.notes?.trim(),
      createdAt: now,
      updatedAt: now,
    });

    appointment.addDomainEvent(
      new AppointmentCreatedEvent(
        params.id,
        params.clientId,
        params.serviceId,
        params.startTime,
        params.endTime,
      ),
    );

    return appointment;
  }

  static reconstitute(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  // --- Getters ---

  get id(): string {
    return this.props.id;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get serviceId(): string {
    return this.props.serviceId;
  }

  get timeSlot(): TimeSlot {
    return this.props.timeSlot;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get googleCalendarEventId(): string | undefined {
    return this.props.googleCalendarEventId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // --- Business Methods ---

  confirm(): void {
    if (this.props.status !== AppointmentStatus.PENDING) {
      throw new Error(`Cannot confirm appointment in status: ${this.props.status}`);
    }
    this.props.status = AppointmentStatus.CONFIRMED;
    this.props.updatedAt = new Date();
    this.addDomainEvent(new AppointmentConfirmedEvent(this.props.id, this.props.updatedAt));
  }

  cancel(): void {
    if (
      this.props.status === AppointmentStatus.COMPLETED ||
      this.props.status === AppointmentStatus.CANCELLED
    ) {
      throw new Error(`Cannot cancel appointment in status: ${this.props.status}`);
    }
    this.props.status = AppointmentStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  complete(): void {
    if (this.props.status !== AppointmentStatus.CONFIRMED) {
      throw new Error(`Cannot complete appointment in status: ${this.props.status}`);
    }
    this.props.status = AppointmentStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  markNoShow(): void {
    if (this.props.status !== AppointmentStatus.CONFIRMED) {
      throw new Error(`Cannot mark no-show for appointment in status: ${this.props.status}`);
    }
    this.props.status = AppointmentStatus.NO_SHOW;
    this.props.updatedAt = new Date();
  }

  reschedule(startTime: Date, endTime: Date): void {
    if (
      this.props.status === AppointmentStatus.COMPLETED ||
      this.props.status === AppointmentStatus.CANCELLED
    ) {
      throw new Error(`Cannot reschedule appointment in status: ${this.props.status}`);
    }
    this.props.timeSlot = TimeSlot.create(startTime, endTime);
    this.props.status = AppointmentStatus.PENDING; // Reset to pending after reschedule
    this.props.updatedAt = new Date();
  }

  linkGoogleCalendarEvent(eventId: string): void {
    this.props.googleCalendarEventId = eventId;
    this.props.updatedAt = new Date();
  }

  /** Check if this appointment overlaps with another */
  overlaps(other: Appointment): boolean {
    return this.props.timeSlot.overlaps(other.timeSlot);
  }

  // --- Domain Events ---

  pullDomainEvents(): BaseDomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  private addDomainEvent(event: BaseDomainEvent): void {
    this.domainEvents.push(event);
  }

  // --- Serialization ---

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      clientId: this.props.clientId,
      serviceId: this.props.serviceId,
      startTime: this.props.timeSlot.getStart().toISOString(),
      endTime: this.props.timeSlot.getEnd().toISOString(),
      durationMinutes: this.props.timeSlot.getDurationMinutes(),
      status: this.props.status,
      notes: this.props.notes,
      googleCalendarEventId: this.props.googleCalendarEventId,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
