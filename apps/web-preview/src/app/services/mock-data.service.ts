import { Injectable, signal } from '@angular/core';
import {
  CalendarDataProvider,
  UiAppointment,
  UiClient,
  UiEmployee,
  UiService,
} from '@crm/shared-ui';

@Injectable({ providedIn: 'root' })
export class MockDataService implements CalendarDataProvider {
  // Static data stores (Signals for internal reactivity, but we expose Promises for the API)
  private readonly clientsList = signal<UiClient[]>([
    { id: 'c1', name: 'María García', phone: '600000001', email: 'maria@example.com', notes: 'Prefiere citas por la tarde', createdAt: new Date(2024, 0, 1) },
    { id: 'c2', name: 'Laura Martínez', phone: '600000002', email: 'laura@example.com', notes: '', createdAt: new Date(2024, 1, 15) },
    { id: 'c3', name: 'Ana López', phone: '600000003', email: 'ana@example.com', notes: 'Alérgica a ciertos esmaltes', createdAt: new Date(2024, 2, 10) },
    { id: 'c4', name: 'Carmen Rodríguez', phone: '600000004', email: 'carmen@example.com', notes: '', createdAt: new Date(2024, 2, 20) },
    { id: 'c5', name: 'Isabel Fernández', phone: '600000005', email: 'isabel@example.com', notes: '', createdAt: new Date(2024, 3, 5) },
  ]);

  private readonly employeesList = signal<UiEmployee[]>([
    { id: 'e1', name: 'Elena Estilista', position: 'Senior Stylist', color: '#10b981', isActive: true },
    { id: 'e2', name: 'Marcos Manicura', position: 'Nail Artist', color: '#3b82f6', isActive: true },
    { id: 'e3', name: 'Sara Spa', position: 'Therapist', color: '#8b5cf6', isActive: true },
  ]);

  readonly servicesList = signal<UiService[]>([
    { id: 's1', name: 'Manicura Semipermanente', durationMinutes: 45, priceFormatted: '25€' },
    { id: 's2', name: 'Pedicura Spa', durationMinutes: 60, priceFormatted: '35€' },
    { id: 's3', name: 'Limpieza Facial Profunda', durationMinutes: 90, priceFormatted: '60€' },
    { id: 's4', name: 'Lifting de Pestañas', durationMinutes: 60, priceFormatted: '45€' },
    { id: 's5', name: 'Masaje Relajante', durationMinutes: 60, priceFormatted: '50€' },
    { id: 's6', name: 'Depilación Láser', durationMinutes: 30, priceFormatted: '40€' },
  ]);

  private readonly appointmentsState = signal<UiAppointment[]>([]);

  constructor() {
    this.generateMockWeek();
  }

  // --- Clients ---
  getClients(): UiClient[] { return this.clientsList(); }

  saveClient(client: Omit<UiClient, 'id'> & { id?: string }): UiClient {
    if (client.id) {
      this.clientsList.update(list => list.map(c => c.id === client.id ? { ...client, id: c.id } as UiClient : c));
      return this.clientsList().find(c => c.id === client.id)!;
    } else {
      const newClient = { ...client, id: `c-${Date.now()}`, createdAt: new Date() } as UiClient;
      this.clientsList.update(list => [...list, newClient]);
      return newClient;
    }
  }

  deleteClient(id: string): void {
    this.clientsList.update(list => list.filter(c => c.id !== id));
  }

  // --- Employees ---
  getEmployees(): UiEmployee[] { return this.employeesList(); }

  saveEmployee(employee: Omit<UiEmployee, 'id'> & { id?: string }): UiEmployee {
    if (employee.id) {
      this.employeesList.update(list => list.map(e => e.id === employee.id ? { ...employee, id: e.id } as UiEmployee : e));
      return this.employeesList().find(e => e.id === employee.id)!;
    } else {
      const newEmployee = { ...employee, id: `e-${Date.now()}` } as UiEmployee;
      this.employeesList.update(list => [...list, newEmployee]);
      return newEmployee;
    }
  }

  deleteEmployee(id: string): void {
    this.employeesList.update(list => list.filter(e => e.id !== id));
  }

  // --- Services ---
  getServices(): UiService[] { return this.servicesList(); }

  // --- Appointments ---
  getAppointments(start: Date, end: Date): UiAppointment[] {
    return this.appointmentsState();
  }

  saveAppointment(appt: Omit<UiAppointment, 'id'> & { id?: string }): UiAppointment {
    if (appt.id) {
      this.appointmentsState.update(list => 
        list.map(a => a.id === appt.id ? { ...appt, id: a.id } as UiAppointment : a)
      );
      return this.appointmentsState().find(a => a.id === appt.id)!;
    } else {
      const newAppt: UiAppointment = {
        ...appt,
        id: `m-appt-${Date.now()}`,
        status: appt['status'] ?? 'PENDING'
      };
      this.appointmentsState.update(list => [...list, newAppt]);
      return newAppt;
    }
  }

  deleteAppointment(id: string): void {
    this.appointmentsState.update(list => list.filter(a => a.id !== id));
  }

  rescheduleAppointment(id: string, newStart: Date, newEnd: Date): void {
    this.appointmentsState.update(list => 
      list.map(a => a.id === id ? { ...a, startTime: newStart, endTime: newEnd } : a)
    );
  }

  // --- Mock Generators ---
  private generateMockWeek() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    monday.setHours(0, 0, 0, 0);

    const generated: UiAppointment[] = [];
    const cl = this.clientsList();
    const svcs = this.servicesList();
    const emps = this.employeesList();

    for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
      const count = Math.floor(Math.random() * 4) + 3;
      
      for (let i = 0; i < count; i++) {
        const hour = Math.floor(Math.random() * 10) + 9;
        const min = Math.random() > 0.5 ? 0 : 30;
        
        const start = new Date(monday);
        start.setDate(start.getDate() + dayOffset);
        start.setHours(hour, min, 0, 0);

        const clientId = cl[Math.floor(Math.random() * cl.length)].id;
        const svc = svcs[Math.floor(Math.random() * svcs.length)];
        const employeeId = emps[Math.floor(Math.random() * emps.length)].id;
        
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + svc.durationMinutes);

        let status: UiAppointment['status'] = 'PENDING';
        if (start < today) {
          status = Math.random() > 0.1 ? 'COMPLETED' : 'NO_SHOW';
        } else if (start.getDate() === today.getDate()) {
          status = Math.random() > 0.4 ? 'CONFIRMED' : 'PENDING';
        } else {
          status = Math.random() > 0.7 ? 'CONFIRMED' : 'PENDING';
        }

        generated.push({
          id: `m-init-${dayOffset}-${i}`,
          clientId,
          employeeId,
          serviceId: svc.id,
          startTime: start,
          endTime: end,
          status,
          notes: Math.random() > 0.8 ? 'Nota de ejemplo generada' : ''
        });
      }
    }

    this.appointmentsState.set(generated);
  }
}
