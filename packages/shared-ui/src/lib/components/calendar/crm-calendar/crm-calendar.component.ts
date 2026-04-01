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
  templateUrl: './crm-calendar.component.html',
  styleUrls: ['./crm-calendar.component.scss'],
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
  currentDate = input<Date>();

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
        eventTextColor: 'var(--color-text-primary)', // Dynamic semantic color
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

    // Reactive date sync
    effect(() => {
      const date = this.currentDate();
      if (date) {
        this.goToDate(date);
      }
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

  /** Refresh the calendar's internal size calculations */
  updateSize(): void {
    const api = this.calendarRef()?.getApi();
    if (api) {
      api.updateSize();
    }
  }
}
