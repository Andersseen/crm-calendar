import { Injectable, inject, signal, computed } from '@angular/core';
import {
  CALENDAR_DATA_PROVIDER,
  UiAppointment,
  UiClient,
  UiEmployee,
  UiService,
} from './calendar.provider';
import type { CalendarEventInput } from '@shared-ui/components/calendar/crm-calendar/crm-calendar.component';

@Injectable()
export class CalendarStateService {
  private readonly dataProvider = inject(CALENDAR_DATA_PROVIDER);

  readonly clients = signal<UiClient[]>([]);
  readonly employees = signal<UiEmployee[]>([]);
  readonly services = signal<UiService[]>([]);
  readonly appointments = signal<UiAppointment[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly calendarEvents = computed<CalendarEventInput[]>(() => {
    return this.appointments().map((appt) => {
      const client = this.clients().find((c) => c.id === appt.clientId);
      const service = this.services().find((s) => s.id === appt.serviceId);
      const employee = this.employees().find((e) => e.id === appt.employeeId);

      const title = client && service ? `${client.name} — ${service.name}` : 'Cita sin asignar';

      return {
        id: appt.id,
        title,
        start: appt.startTime,
        end: appt.endTime,
        backgroundColor: employee?.color,
        borderColor: employee?.color,
        extendedProps: {
          clientId: appt.clientId,
          serviceId: appt.serviceId,
          employeeId: appt.employeeId,
          status: appt.status,
          notes: appt.notes,
        },
      };
    });
  });

  async loadInitialData() {
    this.isLoading.set(true);
    try {
      const [clientsData, servicesData, apptsData, employeesData] = await Promise.all([
        Promise.resolve(this.dataProvider.getClients()),
        Promise.resolve(this.dataProvider.getServices()),

        Promise.resolve(
          this.dataProvider.getAppointments(
            new Date(new Date().setMonth(new Date().getMonth() - 1)),
            new Date(new Date().setMonth(new Date().getMonth() + 2)),
          ),
        ),
        Promise.resolve(this.dataProvider.getEmployees()),
      ]);

      this.clients.set(clientsData);
      this.services.set(servicesData);
      this.appointments.set(apptsData);
      this.employees.set(employeesData);
    } catch (e: any) {
      this.error.set(e.message || 'Error loading data');
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveAppointment(appt: Omit<UiAppointment, 'id'> & { id?: string }) {
    try {
      await Promise.resolve(this.dataProvider.saveAppointment(appt));
      await this.refreshAppointments();
    } catch (e: any) {
      this.error.set(e.message || 'Failed to save appointment');
    }
  }

  async rescheduleAppointment(id: string, newStart: Date, newEnd: Date) {
    try {
      await Promise.resolve(this.dataProvider.rescheduleAppointment(id, newStart, newEnd));
      await this.refreshAppointments();
    } catch (e) {
      this.error.set('Failed to reschedule appointment');
    }
  }

  async cancelAppointment(id: string) {
    const appt = this.appointments().find((a) => a.id === id);
    if (!appt) return;
    try {
      await Promise.resolve(this.dataProvider.saveAppointment({ ...appt, status: 'CANCELLED' }));
      await this.refreshAppointments();
    } catch (e) {
      this.error.set('Failed to cancel appointment');
    }
  }

  async saveEmployee(emp: Omit<UiEmployee, 'id'> & { id?: string }) {
    try {
      await Promise.resolve(this.dataProvider.saveEmployee(emp));
      const updated = await Promise.resolve(this.dataProvider.getEmployees());
      this.employees.set(updated);
    } catch (e) {
      this.error.set('Failed to save employee');
    }
  }

  async deleteEmployee(id: string) {
    try {
      await Promise.resolve(this.dataProvider.deleteEmployee(id));
      const updated = await Promise.resolve(this.dataProvider.getEmployees());
      this.employees.set(updated);
    } catch (e) {
      this.error.set('Failed to delete employee');
    }
  }

  async saveClient(client: Omit<UiClient, 'id'> & { id?: string }) {
    try {
      await Promise.resolve(this.dataProvider.saveClient(client));
      const updated = await Promise.resolve(this.dataProvider.getClients());
      this.clients.set(updated);
    } catch (e) {
      this.error.set('Failed to save client');
    }
  }

  async deleteClient(id: string) {
    try {
      await Promise.resolve(this.dataProvider.deleteClient(id));
      const updated = await Promise.resolve(this.dataProvider.getClients());
      this.clients.set(updated);
    } catch (e) {
      this.error.set('Failed to delete client');
    }
  }

  private async refreshAppointments() {
    const appts = await Promise.resolve(
      this.dataProvider.getAppointments(
        new Date(new Date().setMonth(new Date().getMonth() - 1)),
        new Date(new Date().setMonth(new Date().getMonth() + 2)),
      ),
    );
    this.appointments.set(appts);
  }
}
