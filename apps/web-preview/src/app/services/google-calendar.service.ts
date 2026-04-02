/**
 * Google Calendar Service for Web Preview
 * Handles OAuth2 authentication and Google Calendar API operations
 */

export interface GoogleCalendarConfig {
  clientId: string;
  apiKey: string;
  scope: string;
}

export interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: { email: string; displayName?: string }[];
}

export interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

export interface GoogleCalendarEventItem {
  id?: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  attendees?: Array<{
    email?: string;
    displayName?: string;
  }>;
}

export interface GoogleCalendarListResponse {
  items?: GoogleCalendarEventItem[];
}

export class GoogleCalendarService {
  private tokenClient: TokenClient | null = null;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;
  private config: GoogleCalendarConfig;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
    this.loadGisScript();
  }

  /**
   * Load Google Identity Services script
   */
  private loadGisScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-gis-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gis-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize the OAuth2 token client
   */
  async initialize(): Promise<void> {
    await this.loadGisScript();

    const google = window.google;
    if (!google?.accounts?.oauth2) {
      throw new Error('Google Identity Services not loaded');
    }

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.config.clientId,
      scope: this.config.scope,
      callback: (tokenResponse: GoogleTokenResponse) => {
        if (tokenResponse.access_token) {
          this.accessToken = tokenResponse.access_token;
        }
        // Tokens typically expire in 3600 seconds (1 hour)
        if (tokenResponse.expires_in) {
          this.tokenExpiresAt = Date.now() + tokenResponse.expires_in * 1000;
        }
      },
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiresAt;
  }

  /**
   * Request authentication from user
   */
  async authenticate(): Promise<void> {
    if (!this.tokenClient) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }

      // Store original callback
      const originalCallback = this.tokenClient.callback;

      this.tokenClient.callback = (tokenResponse: GoogleTokenResponse) => {
        if (tokenResponse.error) {
          reject(new Error(`OAuth error: ${tokenResponse.error}`));
          return;
        }

        if (tokenResponse.access_token) {
          this.accessToken = tokenResponse.access_token;
        }
        if (tokenResponse.expires_in) {
          this.tokenExpiresAt = Date.now() + tokenResponse.expires_in * 1000;
        }

        // Restore original callback
        this.tokenClient!.callback = originalCallback;

        resolve();
      };

      this.tokenClient.requestAccessToken();
    });
  }

  /**
   * Sign out and revoke token
   */
  async signOut(): Promise<void> {
    if (this.accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      } catch (error) {
        console.warn('Error revoking token:', error);
      }
    }

    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  /**
   * Create a calendar event
   */
  async createEvent(event: CalendarEvent): Promise<string> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const eventBody: Record<string, unknown> = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    if (event.location) {
      eventBody['location'] = event.location;
    }

    if (event.attendees && event.attendees.length > 0) {
      eventBody['attendees'] = event.attendees.map((att) => ({
        email: att.email,
        displayName: att.displayName,
      }));
    }

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      },
    );

    if (!response.ok) {
      const error = (await response.json()) as { error?: { message?: string } };
      throw new Error(`Failed to create event: ${error.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as { id?: string };
    return data.id || '';
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, event: CalendarEvent): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const eventBody: Record<string, unknown> = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    if (event.location) {
      eventBody['location'] = event.location;
    }

    if (event.attendees && event.attendees.length > 0) {
      eventBody['attendees'] = event.attendees.map((att) => ({
        email: att.email,
        displayName: att.displayName,
      }));
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      },
    );

    if (!response.ok) {
      const error = (await response.json()) as { error?: { message?: string } };
      throw new Error(`Failed to update event: ${error.error?.message || response.statusText}`);
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    if (!response.ok && response.status !== 404) {
      const error = (await response.json()) as { error?: { message?: string } };
      throw new Error(`Failed to delete event: ${error.error?.message || response.statusText}`);
    }
  }

  /**
   * List calendar events
   */
  async listEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const params = new URLSearchParams({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const error = (await response.json()) as { error?: { message?: string } };
      throw new Error(`Failed to list events: ${error.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as GoogleCalendarListResponse;

    return (data.items || []).map((item: GoogleCalendarEventItem) => ({
      title: item.summary || 'Untitled',
      description: item.description || '',
      startTime: new Date(item.start?.dateTime || item.start?.date || new Date()),
      endTime: new Date(item.end?.dateTime || item.end?.date || new Date()),
      location: item.location,
    }));
  }
}

// TokenClient interface
interface TokenClient {
  callback?: ((response: GoogleTokenResponse) => void) | null;
  requestAccessToken: () => void;
}

// Global type declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback?: (response: GoogleTokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}
