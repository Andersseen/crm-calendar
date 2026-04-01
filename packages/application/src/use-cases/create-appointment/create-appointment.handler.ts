import {
  Appointment,
  AppointmentRepository,
  ClientRepository,
  ServiceRepository,
} from '@crm/domain';
import type { CreateAppointmentCommand } from './create-appointment.command';

export interface CreateAppointmentResult {
  appointment: ReturnType<Appointment['toJSON']>;
}

/**
 * Create Appointment Use Case Handler
 * Orchestrates the creation of a new appointment with business validation.
 */
export class CreateAppointmentHandler {
  constructor(
    private readonly appointmentRepo: AppointmentRepository,
    private readonly clientRepo: ClientRepository,
    private readonly serviceRepo: ServiceRepository,
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<CreateAppointmentResult> {
    // 1. Validate client exists
    const client = await this.clientRepo.findById(command.clientId);
    if (!client) {
      throw new Error(`Client not found: ${command.clientId}`);
    }

    // 2. Validate service exists and is active
    const service = await this.serviceRepo.findById(command.serviceId);
    if (!service) {
      throw new Error(`Service not found: ${command.serviceId}`);
    }
    if (!service.isActive) {
      throw new Error(`Service is not active: ${service.name}`);
    }

    // 3. Parse times
    const startTime = new Date(command.startTime);
    const endTime = new Date(command.endTime);

    // 4. Check for overlapping appointments
    const overlapping = await this.appointmentRepo.findOverlapping(startTime, endTime);
    if (overlapping.length > 0) {
      throw new Error(
        `Time slot conflicts with ${overlapping.length} existing appointment(s)`,
      );
    }

    // 5. Create the appointment entity
    const appointment = Appointment.create({
      id: crypto.randomUUID(),
      clientId: command.clientId,
      serviceId: command.serviceId,
      startTime,
      endTime,
      notes: command.notes,
    });

    // 6. Persist
    await this.appointmentRepo.save(appointment);

    // 7. Pull domain events (for future event bus integration)
    const _events = appointment.pullDomainEvents();

    return { appointment: appointment.toJSON() };
  }
}
