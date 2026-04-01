import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CrmCalendarComponent,
  CalendarDateSelectEvent,
  CalendarEventClickEvent,
  CalendarEventMoveEvent,
} from '../../components/calendar/crm-calendar.component';
import {
  CalendarSidebarComponent,
  DailyStats,
  UpcomingAppointment,
} from '../../components/calendar/calendar-sidebar.component';
import {
  AppointmentDialogComponent,
  AppointmentFormData,
} from '../../components/calendar/appointment-dialog.component';
import { ButtonModule } from 'primeng/button';
import { CalendarStateService } from './calendar-state.service';

@Component({
  selector: 'crm-calendar-feature',
  imports: [
    CommonModule,
    CrmCalendarComponent,
    CalendarSidebarComponent,
    AppointmentDialogComponent,
    ButtonModule,
  ],
  providers: [CalendarStateService],
  template: `
    <div class="calendar-layout">
      <div class="sidebar-col">
        <crm-calendar-sidebar
          [selectedDate]="viewDate()"
          [stats]="dailyStats()"
          [upcoming]="upcomingList()"
          (newAppointment)="openNewAppointment()"
          (dateChange)="onSidebarDateChange($event)"
          (appointmentClick)="onSidebarAppointmentClick($event)"
        />
      </div>

      <div class="calendar-col">
        <crm-calendar
          #cal
          [events]="state.calendarEvents()"
          initialView="timeGridWeek"
          (dateSelect)="onSlotSelected($event)"
          (eventClick)="onAppointmentClick($event)"
          (eventDrop)="onAppointmentMoved($event)"
          (eventResize)="onAppointmentMoved($event)"
          (viewChange)="onViewChanged($event)"
        />
      </div>
    </div>

    <crm-appointment-dialog
      [(visible)]="dialogVisible"
      [clients]="state.clients()"
      [employees]="state.employees()"
      [services]="state.services()"
      [appointment]="dialogData()"
      (save)="onSaveAppointment($event)"
      (cancelAppointment)="onCancelAppointment($event)"
    />
  `,
  styles: `
    .calendar-layout {
      display: flex;
      gap: 32px;
      height: 100%;
      padding-bottom: 24px;
      overflow: hidden; /* Ensure no internal scroll for the layout itself */
    }

    .sidebar-col {
      width: 320px;
      min-width: 320px;
      flex-shrink: 0;
      height: 100%;
      overflow-y: auto;
      
      /* Hide scrollbar for cleaner look */
      &::-webkit-scrollbar { display: none; }
      scrollbar-width: none;
    }

    .calendar-col {
      flex: 1;
      min-width: 0;
      background: white;
      border-radius: 24px;
      padding: 32px;
      border: 1px solid var(--slate-200);
      box-shadow: var(--premium-shadow);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
  `,
})
export class CalendarFeatureComponent implements OnInit {
  protected readonly state = inject(CalendarStateService);

  // Local View State
  viewDate = signal(new Date());
  currentView = signal('timeGridWeek');
  dialogVisible = signal(false);
  dialogData = signal<AppointmentFormData | null>(null);

  ngOnInit() {
    this.state.loadInitialData();
  }

  dailyStats = computed<DailyStats>(() => {
    const todayStr = this.viewDate().toDateString();
    const appts = this.state.appointments().filter((a) => a.startTime.toDateString() === todayStr);

    return {
      total: appts.length,
      confirmed: appts.filter((a) => a.status === 'CONFIRMED').length,
      pending: appts.filter((a) => a.status === 'PENDING').length,
    };
  });

  upcomingList = computed<UpcomingAppointment[]>(() => {
    const todayStr = this.viewDate().toDateString();
    const now = new Date();

    return this.state
      .appointments()
      .filter((a) => a.startTime.toDateString() === todayStr && a.startTime >= now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        time: a.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        clientName: this.state.clients().find((c) => c.id === a.clientId)?.name ?? 'Sin Asignar',
        serviceName:
          this.state.services().find((s) => s.id === a.serviceId)?.name ?? 'Servicio Especial',
      }));
  });

  // === Actions === //

  openNewAppointment() {
    this.dialogData.set(null);
    this.dialogVisible.set(true);
  }

  onSlotSelected(selection: CalendarDateSelectEvent) {
    this.dialogData.set({
      clientId: '',
      employeeId: '',
      serviceId: '',
      startTime: selection.start,
      endTime: selection.end,
      notes: '',
    });
    this.dialogVisible.set(true);
  }

  onAppointmentClick(evt: CalendarEventClickEvent | { eventId: string; event: any }) {
    const id = evt.eventId;
    const appt = this.state.appointments().find((a) => a.id === id);
    if (!appt) return;

    this.dialogData.set({
      id: appt.id,
      clientId: appt.clientId,
      employeeId: appt.employeeId,
      serviceId: appt.serviceId,
      startTime: appt.startTime,
      endTime: appt.endTime,
      notes: appt.notes,
      status: appt.status,
    });
    this.dialogVisible.set(true);
  }

  onSidebarAppointmentClick(eventId: string) {
    this.onAppointmentClick({ eventId, event: {} as any });
  }

  onAppointmentMoved(evt: CalendarEventMoveEvent) {
    this.state.rescheduleAppointment(evt.eventId, evt.newStart, evt.newEnd);
  }

  onViewChanged(viewType: string) {
    this.currentView.set(viewType);
  }

  onSidebarDateChange(date: Date) {
    this.viewDate.set(date);
    // Future Note: Call FullCalendar API to change date here
  }

  onSaveAppointment(data: AppointmentFormData) {
    this.state.saveAppointment(data as any);
    this.dialogVisible.set(false);
  }

  onCancelAppointment(id: string) {
    this.state.cancelAppointment(id);
    this.dialogVisible.set(false);
  }
}
