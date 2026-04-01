import { BaseDomainEvent } from './base-domain-event';

export class AppointmentConfirmedEvent extends BaseDomainEvent {
  get eventName(): string {
    return 'appointment.confirmed';
  }

  constructor(
    public readonly appointmentId: string,
    public readonly confirmedAt: Date,
  ) {
    super();
  }
}
