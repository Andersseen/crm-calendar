import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CrmCalendarComponent,
  CalendarDateSelectEvent,
  CalendarEventClickEvent,
  CalendarEventMoveEvent,
  CalendarEventInput
} from '@shared-ui/components/calendar/crm-calendar/crm-calendar.component';
import {
  CalendarSidebarComponent,
} from '@shared-ui/components/calendar/calendar-sidebar/calendar-sidebar.component';
import {
  AppointmentDialogComponent,
  AppointmentFormData,
} from '@shared-ui/components/calendar/appointment-dialog/appointment-dialog.component';
import { ButtonModule } from 'primeng/button';
import { CalendarStateService } from '../calendar-state.service';

export interface DailyStats {
  total: number;
  confirmed: number;
  pending: number;
}

@Component({
  selector: 'crm-calendar-feature',
  standalone: true,
  imports: [
    CommonModule,
    CrmCalendarComponent,
    CalendarSidebarComponent,
    AppointmentDialogComponent,
    ButtonModule,
  ],
  providers: [CalendarStateService],
  templateUrl: './calendar-feature.component.html',
  styleUrls: ['./calendar-feature.component.scss'],
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

  upcomingList = computed<CalendarEventInput[]>(() => {
    const todayStr = this.viewDate().toDateString();
    const now = new Date();

    return this.state
      .appointments()
      .filter((a) => a.startTime.toDateString() === todayStr && a.startTime >= now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 4)
      .map((a) => {
        const employee = this.state.employees().find((e) => e.id === a.employeeId);
        const clientName = this.state.clients().find((c) => c.id === a.clientId)?.name ?? 'Sin Asignar';
        
        return {
          id: a.id,
          title: clientName,
          start: a.startTime,
          end: a.endTime,
          backgroundColor: employee?.color || '#10b981',
          extendedProps: {
            employeeName: employee?.name ?? 'Sin asignar'
          }
        };
      });
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
  }

  onVisibleChange(visible: boolean) {
    this.dialogVisible.set(visible);
  }

  onDialogClose() {
    this.dialogVisible.set(false);
  }

  onFilterChange(status: 'total' | 'confirmed' | 'pending') {
    // Implement filter logic if needed
    console.log('Filter by:', status);
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
