import { Injectable, inject } from '@angular/core';
import { GoogleCalendarAdapterService } from './google-calendar-adapter.service';
import { MockDataService } from './mock-data.service';

export interface AppointmentSyncData {
  appointmentId: string;
  clientName: string;
  clientEmail?: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  employeeName?: string;
}

/**
 * Service that coordinates appointment creation with Google Calendar sync
 */
@Injectable({ providedIn: 'root' })
export class AppointmentSyncService {
  private googleCalendar = inject(GoogleCalendarAdapterService);
  private mockData = inject(MockDataService);

  /**
   * Save an appointment and optionally sync it to Google Calendar
   */
  async saveAppointmentWithSync(
    appointment: Parameters<MockDataService['saveAppointment']>[0],
    options: {
      syncToGoogleCalendar?: boolean;
      clientEmail?: string;
      clientName?: string;
      serviceName?: string;
      employeeName?: string;
    } = {},
  ): Promise<{
    appointment: ReturnType<MockDataService['saveAppointment']>;
    googleEventId?: string;
  }> {
    // First, save the appointment locally
    const savedAppointment = this.mockData.saveAppointment(appointment);

    let googleEventId: string | undefined;

    // Then, sync to Google Calendar if requested and connected
    if (options.syncToGoogleCalendar && this.googleCalendar.isConnected()) {
      try {
        const attendees: Array<{ email: string; displayName?: string }> = [];

        if (options.clientEmail) {
          attendees.push({
            email: options.clientEmail,
            displayName: options.clientName,
          });
        }

        const eventTitle =
          options.serviceName && options.clientName
            ? `${options.serviceName} - ${options.clientName}`
            : `Cita - ${options.clientName || 'Cliente'}`;

        const description = [
          options.employeeName ? `Profesional: ${options.employeeName}` : '',
          appointment.notes,
          '',
          '---',
          'Enviado desde CRM Calendar',
        ]
          .filter(Boolean)
          .join('\n');

        googleEventId = await this.googleCalendar.createEventWithAttendees(
          {
            title: eventTitle,
            description,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
          },
          attendees,
        );

        // Store the Google Calendar event ID with the appointment
        // In a real app, this would be saved to the database
        console.log(`[Google Calendar] Event created: ${googleEventId}`);
      } catch (error) {
        console.error('Failed to sync to Google Calendar:', error);
        // Don't throw - appointment is already saved locally
        // In production, you might want to queue this for retry
      }
    }

    return {
      appointment: savedAppointment,
      googleEventId,
    };
  }

  /**
   * Delete an appointment and remove from Google Calendar if synced
   */
  async deleteAppointmentWithSync(appointmentId: string, googleEventId?: string): Promise<void> {
    // Delete locally first
    this.mockData.deleteAppointment(appointmentId);

    // Remove from Google Calendar if we have an event ID and are connected
    if (googleEventId && this.googleCalendar.isConnected()) {
      try {
        await this.googleCalendar.deleteEvent(googleEventId);
      } catch (error) {
        console.error('Failed to delete from Google Calendar:', error);
        // Don't throw - appointment is already deleted locally
      }
    }
  }
}
