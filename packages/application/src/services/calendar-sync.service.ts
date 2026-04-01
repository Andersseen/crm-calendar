import type { CalendarPort, CalendarEvent } from '../ports/calendar.port';

/**
 * Calendar Sync Application Service
 * Coordinates synchronization between local appointments and external calendar.
 */
export class CalendarSyncService {
  constructor(private readonly calendarPort: CalendarPort) {}

  async syncAppointmentToCalendar(params: {
    clientName: string;
    serviceName: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
  }): Promise<string> {
    const event: CalendarEvent = {
      title: `${params.serviceName} - ${params.clientName}`,
      description: params.notes ?? '',
      startTime: params.startTime,
      endTime: params.endTime,
    };

    return this.calendarPort.createEvent(event);
  }

  async removeFromCalendar(eventId: string): Promise<void> {
    await this.calendarPort.deleteEvent(eventId);
  }
}
