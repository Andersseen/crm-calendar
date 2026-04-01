import { InjectionToken } from '@angular/core';

// Domain-agnostic DTOs for the UI feature
export interface UiClient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt?: Date;
}

export interface UiEmployee {
  id: string;
  name: string;
  position: string;
  color: string;
  isActive: boolean;
}

export interface UiService {
  id: string;
  name: string;
  durationMinutes: number;
  priceFormatted: string;
}

export interface UiAppointment {
  id: string;
  clientId: string;
  employeeId?: string; // New: Assigned employee
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes: string;
}

export interface CalendarDataProvider {
  /** Reactive stream or Promise of all active clients */
  getClients(): Promise<UiClient[]> | UiClient[];
  /** Save a client */
  saveClient(client: Omit<UiClient, 'id'> & { id?: string }): Promise<UiClient> | UiClient | void;
  /** Delete a client */
  deleteClient(id: string): Promise<void> | void;

  /** Get all employees */
  getEmployees(): Promise<UiEmployee[]> | UiEmployee[];
  /** Save an employee */
  saveEmployee(employee: Omit<UiEmployee, 'id'> & { id?: string }): Promise<UiEmployee> | UiEmployee | void;
  /** Delete an employee */
  deleteEmployee(id: string): Promise<void> | void;

  /** Reactive stream or Promise of all available services */
  getServices(): Promise<UiService[]> | UiService[];
  /** Load appointments for a specific date range */
  getAppointments(start: Date, end: Date): Promise<UiAppointment[]> | UiAppointment[];
  /** Save (create or update) an appointment */
  saveAppointment(appointment: Omit<UiAppointment, 'id'> & { id?: string }): Promise<UiAppointment> | UiAppointment | void;
  /** Delete an appointment strictly */
  deleteAppointment(id: string): Promise<void> | void;
  /** Quick reschedule action */
  rescheduleAppointment(id: string, newStart: Date, newEnd: Date): Promise<UiAppointment> | UiAppointment | void;
}

export const CALENDAR_DATA_PROVIDER = new InjectionToken<CalendarDataProvider>('CALENDAR_DATA_PROVIDER');
