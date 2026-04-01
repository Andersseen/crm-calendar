// === Entities ===
export { Client } from './entities/client.entity';
export type { ClientProps } from './entities/client.entity';

export { Appointment, AppointmentStatus } from './entities/appointment.entity';
export type { AppointmentProps } from './entities/appointment.entity';

export { Service } from './entities/service.entity';
export type { ServiceProps } from './entities/service.entity';

// === Value Objects ===
export { Email } from './value-objects/email.vo';
export { Phone } from './value-objects/phone.vo';
export { Money } from './value-objects/money.vo';
export { TimeSlot } from './value-objects/time-slot.vo';

// === Domain Events ===
export { BaseDomainEvent } from './events/base-domain-event';
export { AppointmentCreatedEvent } from './events/appointment-created.event';
export { AppointmentConfirmedEvent } from './events/appointment-confirmed.event';

// === Repository Interfaces ===
export type { ClientRepository } from './repositories/client.repository';
export type { AppointmentRepository } from './repositories/appointment.repository';
export type { ServiceRepository } from './repositories/service.repository';
