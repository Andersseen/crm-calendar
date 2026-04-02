import { Injectable, signal, computed } from '@angular/core';
import type { CalendarPort, CalendarEvent } from '@crm/application';
import {
  GoogleCalendarService,
  GoogleCalendarConfig,
  CalendarEvent as GoogleCalendarEvent,
} from './google-calendar.service';

export interface GoogleCalendarState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Angular wrapper for Google Calendar integration
 * Implements the CalendarPort interface from the application layer
 */
@Injectable({ providedIn: 'root' })
export class GoogleCalendarAdapterService implements CalendarPort {
  private googleService: GoogleCalendarService | null = null;

  readonly state = signal<GoogleCalendarState>({
    isConnected: false,
    isLoading: false,
    error: null,
  });

  readonly isConnected = computed(() => this.state().isConnected);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  /**
   * Initialize the Google Calendar service with configuration
   * This should be called once when the app starts
   */
  initialize(config: GoogleCalendarConfig): void {
    this.googleService = new GoogleCalendarService(config);
    this.state.update((s) => ({ ...s, isLoading: true }));

    this.googleService
      .initialize()
      .then(() => {
        // Check if already authenticated (token in memory from previous session)
        const isAuth = this.googleService?.isAuthenticated() ?? false;
        this.state.update((s) => ({
          ...s,
          isConnected: isAuth,
          isLoading: false,
        }));
      })
      .catch((err) => {
        this.state.update((s) => ({
          ...s,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to initialize Google Calendar',
        }));
      });
  }

  /**
   * Connect to Google Calendar (trigger OAuth flow)
   */
  async connect(): Promise<void> {
    if (!this.googleService) {
      throw new Error('Google Calendar not initialized. Call initialize() first.');
    }

    this.state.update((s) => ({ ...s, isLoading: true, error: null }));

    try {
      await this.googleService.authenticate();
      this.state.update((s) => ({
        ...s,
        isConnected: true,
        isLoading: false,
      }));
    } catch (err) {
      this.state.update((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to connect to Google Calendar',
      }));
      throw err;
    }
  }

  /**
   * Disconnect from Google Calendar
   */
  async disconnect(): Promise<void> {
    if (!this.googleService) {
      return;
    }

    this.state.update((s) => ({ ...s, isLoading: true, error: null }));

    try {
      await this.googleService.signOut();
      this.state.update((s) => ({
        ...s,
        isConnected: false,
        isLoading: false,
      }));
    } catch (err) {
      this.state.update((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to disconnect',
      }));
    }
  }

  /**
   * Create an event in Google Calendar
   * Implements CalendarPort.createEvent
   */
  async createEvent(event: CalendarEvent): Promise<string> {
    if (!this.googleService) {
      throw new Error('Google Calendar not initialized');
    }

    if (!this.googleService.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const googleEvent: GoogleCalendarEvent = {
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
    };

    return this.googleService.createEvent(googleEvent);
  }

  /**
   * Create an event with attendees (for sending invitations)
   */
  async createEventWithAttendees(
    event: CalendarEvent,
    attendees: Array<{ email: string; displayName?: string }>,
  ): Promise<string> {
    if (!this.googleService) {
      throw new Error('Google Calendar not initialized');
    }

    if (!this.googleService.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const googleEvent: GoogleCalendarEvent = {
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      attendees,
    };

    return this.googleService.createEvent(googleEvent);
  }

  /**
   * Update an existing event
   * Implements CalendarPort.updateEvent
   */
  async updateEvent(eventId: string, event: CalendarEvent): Promise<void> {
    if (!this.googleService) {
      throw new Error('Google Calendar not initialized');
    }

    const googleEvent: GoogleCalendarEvent = {
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
    };

    await this.googleService.updateEvent(eventId, googleEvent);
  }

  /**
   * Delete an event
   * Implements CalendarPort.deleteEvent
   */
  async deleteEvent(eventId: string): Promise<void> {
    if (!this.googleService) {
      throw new Error('Google Calendar not initialized');
    }

    await this.googleService.deleteEvent(eventId);
  }

  /**
   * List events
   * Implements CalendarPort.listEvents
   */
  async listEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    if (!this.googleService) {
      throw new Error('Google Calendar not initialized');
    }

    const events = await this.googleService.listEvents(start, end);

    return events.map((event) => ({
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
    }));
  }
}
