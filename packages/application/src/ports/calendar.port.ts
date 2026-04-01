/**
 * Calendar Port (Driven Adapter Interface)
 * Defines the contract for external calendar integration.
 */
export interface CalendarPort {
  createEvent(event: CalendarEvent): Promise<string>; // Returns external event ID
  updateEvent(eventId: string, event: CalendarEvent): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  listEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
}

export interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}
