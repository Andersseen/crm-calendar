import {
  CreateAppointmentHandler,
  ConfirmAppointmentHandler,
  ListAppointmentsHandler,
} from '@crm/application';
import type { AppointmentRepository, ClientRepository, ServiceRepository } from '@crm/domain';

/**
 * Appointment JSON-RPC method handlers.
 */
export function createAppointmentHandlers(
  appointmentRepo: AppointmentRepository,
  clientRepo: ClientRepository,
  serviceRepo: ServiceRepository,
) {
  const createHandler = new CreateAppointmentHandler(appointmentRepo, clientRepo, serviceRepo);
  const confirmHandler = new ConfirmAppointmentHandler(appointmentRepo);
  const listHandler = new ListAppointmentsHandler(appointmentRepo);

  return {
    'appointment.create': async (params: Record<string, unknown>) => {
      return createHandler.execute({
        clientId: params.clientId as string,
        serviceId: params.serviceId as string,
        startTime: params.startTime as string,
        endTime: params.endTime as string,
        notes: params.notes as string | undefined,
      });
    },

    'appointment.confirm': async (params: Record<string, unknown>) => {
      await confirmHandler.execute({
        appointmentId: params.appointmentId as string,
      });
      return { success: true };
    },

    'appointment.list': async (params: Record<string, unknown>) => {
      return listHandler.execute({
        startDate: params.startDate as string,
        endDate: params.endDate as string,
        clientId: params.clientId as string | undefined,
      });
    },

    'appointment.cancel': async (params: Record<string, unknown>) => {
      const appointment = await appointmentRepo.findById(params.appointmentId as string);
      if (!appointment) throw new Error('Appointment not found');
      appointment.cancel();
      await appointmentRepo.save(appointment);
      return { success: true };
    },

    'appointment.delete': async (params: Record<string, unknown>) => {
      await appointmentRepo.delete(params.appointmentId as string);
      return { success: true };
    },
  };
}
