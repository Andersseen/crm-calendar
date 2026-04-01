export interface ListAppointmentsQuery {
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  clientId?: string;
}
