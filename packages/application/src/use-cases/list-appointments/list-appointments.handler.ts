import { Appointment, AppointmentRepository } from '@crm/domain';
import type { ListAppointmentsQuery } from './list-appointments.query';

export class ListAppointmentsHandler {
  constructor(private readonly appointmentRepo: AppointmentRepository) {}

  async execute(query: ListAppointmentsQuery): Promise<ReturnType<Appointment['toJSON']>[]> {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    let appointments: Appointment[];

    if (query.clientId) {
      const all = await this.appointmentRepo.findByClientId(query.clientId);
      appointments = all.filter((a) => {
        const s = a.timeSlot.getStart();
        return s >= start && s <= end;
      });
    } else {
      appointments = await this.appointmentRepo.findByDateRange(start, end);
    }

    return appointments.map((a) => a.toJSON());
  }
}
