import { BaseDomainEvent } from './base-domain-event';

export class AppointmentCreatedEvent extends BaseDomainEvent {
  get eventName(): string {
    return 'appointment.created';
  }

  constructor(
    public readonly appointmentId: string,
    public readonly clientId: string,
    public readonly serviceId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
  ) {
    super();
  }
}
