export interface CreateAppointmentCommand {
  clientId: string;
  serviceId: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  notes?: string;
}
