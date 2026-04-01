import { Component, OnInit, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { IpcService } from '../../core/services/ipc.service';

@Component({
  selector: 'crm-calendar-page',
  standalone: true,
  imports: [FullCalendarModule],
  template: `
    <div class="page-header">
      <h1>Calendario</h1>
    </div>
    <div class="content-card">
      <full-calendar [options]="calendarOptions()" />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .content-card {
      background: var(--p-surface-0);
      border-radius: 12px;
      border: 1px solid var(--p-surface-200);
      padding: 24px;
    }
  `,
})
export class CalendarPageComponent implements OnInit {
  private events = signal<EventInput[]>([]);

  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '21:00:00',
    allDaySlot: false,
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    events: [],
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
  });

  constructor(private readonly ipc: IpcService) {}

  async ngOnInit() {
    await this.loadAppointments();
  }

  private async loadAppointments() {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      const appointments = await this.ipc.call<Record<string, unknown>[]>('appointment.list', {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      const calEvents: EventInput[] = appointments.map((a) => ({
        id: a['id'] as string,
        title: `Cita #${(a['id'] as string).slice(0, 8)}`,
        start: a['startTime'] as string,
        end: a['endTime'] as string,
        backgroundColor: this.getStatusColor(a['status'] as string),
      }));

      this.events.set(calEvents);
      this.calendarOptions.update((opts) => ({ ...opts, events: calEvents }));
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  }

  private handleDateSelect(selectInfo: { startStr: string; endStr: string }) {
    // TODO: Open appointment creation dialog
    console.warn('Date selected:', selectInfo.startStr, '-', selectInfo.endStr);
  }

  private handleEventClick(clickInfo: { event: { id: string } }) {
    // TODO: Open appointment detail dialog
    console.warn('Event clicked:', clickInfo.event.id);
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'CONFIRMED':
        return '#3b82f6';
      case 'COMPLETED':
        return '#10b981';
      case 'CANCELLED':
        return '#ef4444';
      case 'NO_SHOW':
        return '#6b7280';
      default:
        return '#8b5cf6';
    }
  }
}
