import { AppointmentRepository } from '@crm/domain';
import type { ConfirmAppointmentCommand } from './confirm-appointment.command';

export class ConfirmAppointmentHandler {
  constructor(private readonly appointmentRepo: AppointmentRepository) {}

  async execute(command: ConfirmAppointmentCommand): Promise<void> {
    const appointment = await this.appointmentRepo.findById(command.appointmentId);
    if (!appointment) {
      throw new Error(`Appointment not found: ${command.appointmentId}`);
    }

    appointment.confirm();
    await this.appointmentRepo.save(appointment);
  }
}
