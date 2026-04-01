import {
  Component,
  input,
  output,
  signal,
  effect,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

/** Input event format for the calendar */
export interface CalendarEventInput {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: Record<string, unknown>;
}

/** Output when a date range is selected (click on empty slot) */
export interface CalendarDateSelectEvent {
  start: Date;
  end: Date;
  allDay: boolean;
  view: string;
}

/** Output when an event is clicked */
export interface CalendarEventClickEvent {
  eventId: string;
  event: CalendarEventInput;
}

/** Output when an event is dragged or resized */
export interface CalendarEventMoveEvent {
  eventId: string;
  newStart: Date;
  newEnd: Date;
}

@Component({
  selector: 'crm-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="crm-calendar-container">
      <full-calendar #calendar [options]="calendarOptions()" />
    </div>
  `,
  styles: `
    .crm-calendar-container {
      height: 100%;
      min-height: 600px;

      :host ::ng-deep {
        .fc {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          height: 100%;
        }

        /* ─── Toolbar ─── */
        .fc .fc-toolbar {
          margin-bottom: 24px;
          gap: 16px;
          padding: 0 4px;
        }

        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--p-text-color);
          letter-spacing: -0.02em;
        }

        .fc .fc-button-group {
          gap: 4px;
          background: var(--p-surface-100);
          padding: 4px;
          border-radius: 12px;
        }

        .fc .fc-button-primary {
          background: transparent;
          border: none;
          color: var(--p-text-secondary-color);
          font-size: 0.9rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px !important;
          text-transform: capitalize;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fc .fc-button-primary:hover {
          background: var(--p-surface-200);
          color: var(--p-text-color);
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background: white;
          color: var(--p-primary-color);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .fc .fc-today-button {
          background: var(--p-primary-color);
          border: none;
          color: white;
          border-radius: 10px !important;
          font-weight: 700;
          padding: 8px 18px;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--p-primary-color) 25%, transparent);
          
          &:hover:not(:disabled) {
            background: var(--p-primary-600);
            transform: translateY(-1px);
          }
        }

        /* ─── Day Grid (Month View) ─── */
        .fc .fc-daygrid-day {
          transition: background 0.2s;
        }

        .fc .fc-daygrid-day:hover {
          background: var(--p-surface-50);
        }

        .fc .fc-daygrid-day.fc-day-today {
          background: color-mix(in srgb, var(--p-primary-color) 6%, transparent);
        }

        .fc-day-today .fc-daygrid-day-top {
          flex-direction: row;
        }

        .fc .fc-daygrid-day-number {
          font-weight: 600;
          padding: 10px;
          color: var(--p-text-secondary-color);
        }

        .fc .fc-day-today .fc-daygrid-day-number {
          background: var(--p-primary-color);
          color: white;
          border-radius: 10px;
          margin: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px color-mix(in srgb, var(--p-primary-color) 30%, transparent);
        }

        /* ─── Time Grid (Week/Day Views) ─── */
        .fc .fc-timegrid-slot {
          height: 3.5rem;
        }

        .fc .fc-timegrid-slot-lane:hover {
          background: var(--p-surface-50);
        }

        .fc .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
          border-width: 2px;
        }

        .fc .fc-timegrid-col.fc-day-today {
          background: color-mix(in srgb, var(--p-primary-color) 4%, transparent);
        }

        /* ─── Events (all views) ─── */
        .fc-event {
          border-radius: 10px !important;
          border-left-width: 5px !important;
          border-top-width: 1px !important;
          border-right-width: 1px !important;
          border-bottom-width: 1px !important;
          padding: 6px 8px;
          font-size: 0.88rem;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;

          /* High visibility with premium feel */
          background-color: color-mix(in srgb, var(--fc-event-bg-color) 24%, white) !important;
          border-style: solid !important;
          border-color: color-mix(in srgb, var(--fc-event-border-color) 15%, transparent) !important;
          border-left-color: var(--fc-event-border-color) !important;
          color: var(--p-surface-900) !important;
        }

        .fc-event:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px) scale(1.01);
          z-index: 5;
        }

        .fc-event .fc-event-main {
          padding: 0;
        }

        .fc-event .fc-event-time {
          font-weight: 800;
          font-size: 0.75rem;
          color: var(--p-primary-700);
          margin-bottom: 2px;
          display: block;
        }

        .fc-event .fc-event-title {
          font-weight: 700;
          line-height: 1.3;
          color: var(--p-surface-900);
        }

        .fc .fc-timegrid-event {
          margin: 1px 3px 3px 3px;
        }

        /* ─── Column Headers ─── */
        .fc .fc-col-header-cell {
          padding: 12px 0;
          background: var(--p-surface-50);
          border-bottom: 2px solid var(--p-surface-100);
        }

        .fc .fc-col-header-cell-cushion {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--p-text-secondary-color);
          text-decoration: none !important;
        }

        /* ─── Borders & Containers ─── */
        .fc .fc-scrollgrid {
          border-radius: 16px;
          border: 1px solid var(--p-surface-200);
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .fc td, .fc th {
          border-color: var(--p-surface-100);
        }

        .fc .fc-highlight {
          background: color-mix(in srgb, var(--p-primary-color) 15%, transparent);
        }

        .fc .fc-timegrid-slot-label-cushion {
          font-size: 0.8rem;
          color: var(--p-text-secondary-color);
          font-weight: 600;
        }
      }
    }
  `,
})
export class CrmCalendarComponent {
  // === Inputs ===
  events = input<CalendarEventInput[]>([]);
  initialView = input<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('timeGridWeek');
  slotMinTime = input<string>('08:00:00');
  slotMaxTime = input<string>('21:00:00');
  slotDuration = input<string>('00:30:00');
  weekends = input<boolean>(true);
  editable = input<boolean>(true);
  nowIndicator = input<boolean>(true);

  // === Outputs ===
  dateSelect = output<CalendarDateSelectEvent>();
  eventClick = output<CalendarEventClickEvent>();
  eventDrop = output<CalendarEventMoveEvent>();
  eventResize = output<CalendarEventMoveEvent>();
  viewChange = output<string>();

  // === Internal ===
  calendarRef = viewChild<FullCalendarComponent>('calendar');
  calendarOptions = signal<CalendarOptions>({});

  constructor() {
    // Build options reactively
    effect(() => {
      const opts: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: this.initialView(),
        locale: esLocale,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        buttonText: {
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
        },
        slotMinTime: this.slotMinTime(),
        slotMaxTime: this.slotMaxTime(),
        slotDuration: this.slotDuration(),
        allDaySlot: false,
        weekends: this.weekends(),
        editable: this.editable(),
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        nowIndicator: this.nowIndicator(),
        eventMaxStack: 3,
        height: '100%',
        expandRows: true,
        stickyHeaderDates: true,
        events: this.events(),

        // Callbacks
        select: (arg: DateSelectArg) => {
          this.dateSelect.emit({
            start: arg.start,
            end: arg.end,
            allDay: arg.allDay,
            view: arg.view.type,
          });
        },
        eventClick: (arg: EventClickArg) => {
          this.eventClick.emit({
            eventId: arg.event.id,
            event: {
              id: arg.event.id,
              title: arg.event.title,
              start: arg.event.start!,
              end: arg.event.end!,
              backgroundColor: arg.event.backgroundColor,
              extendedProps: arg.event.extendedProps as Record<string, unknown>,
            },
          });
        },
        eventDrop: (arg: EventDropArg) => {
          this.eventDrop.emit({
            eventId: arg.event.id,
            newStart: arg.event.start!,
            newEnd: arg.event.end!,
          });
        },
        eventResize: (arg: EventResizeDoneArg) => {
          this.eventResize.emit({
            eventId: arg.event.id,
            newStart: arg.event.start!,
            newEnd: arg.event.end!,
          });
        },
        viewDidMount: (arg) => {
          this.viewChange.emit(arg.view.type);
        },
      };
      this.calendarOptions.set(opts);
    });
  }

  /** Navigate the calendar to a specific date */
  goToDate(date: Date): void {
    const api = this.calendarRef()?.getApi();
    if (api) {
      api.gotoDate(date);
    }
  }

  /** Change the calendar view */
  changeView(view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'): void {
    const api = this.calendarRef()?.getApi();
    if (api) {
      api.changeView(view);
    }
  }
}
