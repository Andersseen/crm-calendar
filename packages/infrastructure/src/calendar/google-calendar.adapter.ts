import type { CalendarPort, CalendarEvent } from '@crm/application';

/**
 * Google Calendar Adapter (Stub)
 * Phase 1: Logs operations. Phase 2: Real Google Calendar API integration.
 */
export class GoogleCalendarAdapter implements CalendarPort {
  async createEvent(event: CalendarEvent): Promise<string> {
    console.warn('[GoogleCalendar] CREATE event stub:', event.title);
    return `gcal-${crypto.randomUUID()}`;
  }

  async updateEvent(eventId: string, event: CalendarEvent): Promise<void> {
    console.warn(`[GoogleCalendar] UPDATE event ${eventId}:`, event.title);
  }

  async deleteEvent(eventId: string): Promise<void> {
    console.warn(`[GoogleCalendar] DELETE event ${eventId}`);
  }

  async listEvents(_start: Date, _end: Date): Promise<CalendarEvent[]> {
    console.warn('[GoogleCalendar] LIST events stub');
    return [];
  }
}
