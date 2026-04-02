import { Injectable, inject } from '@angular/core';
import {
  Component,
  computed,
  signal,
  OnInit,
  viewChild,
  TemplateRef,
  OnDestroy,
  AfterViewInit,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderService } from '@crm/shared-ui';
import {
  CrmCalendarComponent,
  CalendarDateSelectEvent,
  CalendarEventClickEvent,
  CalendarEventMoveEvent,
  CalendarEventInput,
} from '@shared-ui/components/calendar/crm-calendar/crm-calendar.component';
import { CalendarSidebarComponent } from '@shared-ui/components/calendar/calendar-sidebar/calendar-sidebar.component';
import {
  AppointmentDialogExtendedComponent,
  ExtendedAppointmentFormData,
} from '../appointment-dialog-extended/appointment-dialog-extended.component';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { MockDataService } from '../../services/mock-data.service';
import { AppointmentSyncService } from '../../services/appointment-sync.service';
import { GoogleCalendarAdapterService } from '../../services/google-calendar-adapter.service';
import { CalendarStateService } from '@crm/shared-ui';
import { CALENDAR_DATA_PROVIDER, UiAppointment } from '@crm/shared-ui';
import { ThemeService } from '@shared-ui/services/theme.service';

export interface DailyStats {
  total: number;
  confirmed: number;
  pending: number;
}

/**
 * Extended Calendar State Service that uses our custom sync service
 */
@Injectable()
class ExtendedCalendarStateService extends CalendarStateService {
  private appointmentSync = inject(AppointmentSyncService);

  override async saveAppointment(appt: Omit<UiAppointment, 'id'> & { id?: string }) {
    try {
      const client = this.clients().find((c) => c.id === appt.clientId);
      const service = this.services().find((s) => s.id === appt.serviceId);
      const employee = this.employees().find((e) => e.id === appt.employeeId);

      await this.appointmentSync.saveAppointmentWithSync(appt, {
        syncToGoogleCalendar: false,
        clientEmail: client?.email,
        clientName: client?.name,
        serviceName: service?.name,
        employeeName: employee?.name,
      });

      await this.loadInitialData();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save appointment';
      this.error.set(errorMessage);
    }
  }
}

@Component({
  selector: 'crm-calendar-feature-extended',
  imports: [
    CommonModule,
    CrmCalendarComponent,
    CalendarSidebarComponent,
    AppointmentDialogExtendedComponent,
    ButtonModule,
    BadgeModule,
    TooltipModule,
  ],
  providers: [
    { provide: CALENDAR_DATA_PROVIDER, useExisting: MockDataService },
    ExtendedCalendarStateService,
    { provide: CalendarStateService, useExisting: ExtendedCalendarStateService },
  ],
  template: `
    <div class="calendar-layout-wrapper">
      <!-- Header Actions Template -->
      <ng-template #headerActions>
        <div class="header-actions">
          @if (isConnected()) {
            <button
              pButton
              type="button"
              icon="pi pi-google"
              class="p-button-outlined p-button-sm"
              pTooltip="Google Calendar conectado"
              tooltipPosition="bottom"
              (click)="goToSettings()"
            >
              <span class="connected-badge"></span>
            </button>
          }
          <button
            pButton
            type="button"
            label="Nueva Cita"
            icon="pi pi-plus"
            class="p-button-primary"
            (click)="openNewAppointment()"
          ></button>
        </div>
      </ng-template>

      <div class="calendar-container" [class.sidebar-hidden]="!isSidebarVisible()">
        <!-- Calendar -->
        <div class="calendar-main">
          <button
            class="sidebar-toggle-btn"
            (click)="toggleSidebar()"
            [title]="isSidebarVisible() ? 'Colapsar Panel' : 'Expandir Panel'"
          >
            <i [class]="isSidebarVisible() ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"></i>
          </button>

          <crm-calendar
            #cal
            [events]="state.calendarEvents()"
            [currentDate]="viewDate()"
            initialView="timeGridWeek"
            (dateSelect)="onSlotSelected($event)"
            (eventClick)="onAppointmentClick($event)"
            (eventDrop)="onAppointmentMoved($event)"
            (eventResize)="onAppointmentMoved($event)"
            (viewChange)="onViewChanged($event)"
          />
        </div>

        <!-- Sidebar -->
        <div class="calendar-sidebar-wrapper">
          <crm-calendar-sidebar
            [selectedDate]="viewDate()"
            [totalAppointments]="dailyStats().total"
            [confirmedCount]="dailyStats().confirmed"
            [pendingCount]="dailyStats().pending"
            [upcomingAppointments]="upcomingList()"
            (dateChange)="onSidebarDateChange($event)"
            (appointmentClick)="onSidebarAppointmentClick($event)"
            (statusFilterChange)="onFilterChange($event)"
          />
        </div>
      </div>

      <!-- Extended Appointment Dialog -->
      <crm-appointment-dialog-extended
        [(visible)]="dialogVisible"
        [clients]="clientsForDialog()"
        [employees]="employeesForDialog()"
        [services]="servicesForDialog()"
        [appointment]="dialogData()"
        (save)="onSaveAppointment($event)"
        (cancelAppointment)="onCancelAppointment($event)"
        (close)="onDialogClose()"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .calendar-layout-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .connected-badge {
      width: 8px;
      height: 8px;
      background-color: var(--green-500);
      border-radius: 50%;
      position: absolute;
      top: 4px;
      right: 4px;
    }

    .calendar-container {
      display: flex;
      flex: 1;
      overflow: hidden;
      transition: gap 0.4s ease;
      gap: 16px;
    }

    .calendar-main {
      flex: 1;
      overflow: hidden;
      position: relative;
      background: var(--color-surface);
      border-radius: 24px;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .calendar-sidebar-wrapper {
      width: 300px;
      min-width: 300px;
      flex-shrink: 0;
      height: 100%;
      overflow-y: auto;
      border-left: 1px solid var(--surface-200);
      background-color: var(--surface-50);
      transition: all 0.4s ease;

      &::-webkit-scrollbar {
        display: none;
      }
      scrollbar-width: none;
    }

    .calendar-container.sidebar-hidden .calendar-sidebar-wrapper {
      width: 0;
      min-width: 0;
      opacity: 0;
      pointer-events: none;
      margin: 0;
      padding: 0;
      border: none;
    }

    .sidebar-toggle-btn {
      position: absolute;
      right: -22px;
      top: 50%;
      transform: translateY(-50%) scale(0.9);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      border: 4px solid var(--color-surface);
      cursor: pointer;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-lg);
      transition: all 0.3s ease;
      opacity: 0.8;
    }

    .sidebar-toggle-btn:hover {
      transform: translateY(-50%) scale(1.1);
      background: var(--color-primary-soft);
      box-shadow: var(--shadow-xl);
      opacity: 1;
    }

    .calendar-container.sidebar-hidden .sidebar-toggle-btn {
      right: 24px;
      opacity: 1;
      transform: translateY(-50%) scale(1);
      border-color: white;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarFeatureExtendedComponent implements OnInit, OnDestroy, AfterViewInit {
  protected readonly state = inject(ExtendedCalendarStateService);
  private headerService = inject(HeaderService);
  private googleCalendar = inject(GoogleCalendarAdapterService);

  readonly headerActions = viewChild<TemplateRef<unknown>>('headerActions');
  readonly calendar = viewChild<CrmCalendarComponent>('cal');

  // Local View State
  viewDate = signal(new Date());
  currentView = signal<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('timeGridWeek');
  dialogVisible = signal(false);
  dialogData = signal<ExtendedAppointmentFormData | null>(null);
  isSidebarVisible = signal(true);

  readonly isConnected = computed(() => this.googleCalendar.isConnected());

  constructor() {
    this.state.loadInitialData();

    // Refresh calendar size when sidebar toggles
    effect(() => {
      this.isSidebarVisible();
      const cal = this.calendar();
      if (cal) {
        setTimeout(() => cal.updateSize(), 450);
      }
    });
  }

  ngOnInit() {
    // Initialize Google Calendar service
    // This should ideally be done once at app startup, but we ensure it's ready here
    if (!this.googleCalendar.isConnected()) {
      // Service is already initialized in settings page
    }
  }

  ngAfterViewInit() {
    const template = this.headerActions();
    if (template) {
      this.headerService.setActions(template);
    }
  }

  ngOnDestroy() {
    this.headerService.clearActions(this.headerActions() || null);
  }

  // Computed properties for dialog
  readonly clientsForDialog = computed(() =>
    this.state.clients().map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
    })),
  );

  readonly employeesForDialog = computed(() =>
    this.state.employees().map((e) => ({
      id: e.id,
      name: e.name,
    })),
  );

  readonly servicesForDialog = computed(() =>
    this.state.services().map((s) => ({
      id: s.id,
      name: s.name,
      durationMinutes: s.durationMinutes,
      priceFormatted: s.priceFormatted,
    })),
  );

  readonly dailyStats = computed<DailyStats>(() => {
    const todayStr = this.viewDate().toDateString();
    const appts = this.state.appointments().filter((a) => a.startTime.toDateString() === todayStr);

    return {
      total: appts.length,
      confirmed: appts.filter((a) => a.status === 'CONFIRMED').length,
      pending: appts.filter((a) => a.status === 'PENDING').length,
    };
  });

  readonly upcomingList = computed<CalendarEventInput[]>(() => {
    const todayStr = this.viewDate().toDateString();
    const now = new Date();

    return this.state
      .appointments()
      .filter((a) => a.startTime.toDateString() === todayStr && a.startTime >= now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 4)
      .map((a) => {
        const employee = this.state.employees().find((e) => e.id === a.employeeId);
        const clientName =
          this.state.clients().find((c) => c.id === a.clientId)?.name ?? 'Sin Asignar';

        return {
          id: a.id,
          title: clientName,
          start: a.startTime,
          end: a.endTime,
          backgroundColor: employee?.color || '#10b981',
          extendedProps: {
            employeeName: employee?.name ?? 'Sin asignar',
          },
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

  onAppointmentClick(
    evt: CalendarEventClickEvent | { eventId: string; event: Record<string, unknown> },
  ) {
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
    this.onAppointmentClick({ eventId, event: {} });
  }

  onAppointmentMoved(evt: CalendarEventMoveEvent) {
    this.state.rescheduleAppointment(evt.eventId, evt.newStart, evt.newEnd);
  }

  onViewChanged(viewType: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') {
    this.currentView.set(viewType);
  }

  onSidebarDateChange(date: Date) {
    this.viewDate.set(date);
  }

  onDialogClose() {
    this.dialogVisible.set(false);
  }

  onFilterChange(status: 'total' | 'confirmed' | 'pending'): void {
    // Filter logic can be implemented here
    console.log('Filter by:', status);
  }

  async onSaveAppointment(data: ExtendedAppointmentFormData) {
    try {
      await this.state.saveAppointment({
        id: data.id,
        clientId: data.clientId,
        employeeId: data.employeeId,
        serviceId: data.serviceId,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        status: data.status as UiAppointment['status'],
      });

      await this.refreshAppointments();
      this.dialogVisible.set(false);
    } catch (error) {
      console.error('Failed to save appointment:', error);
    }
  }

  async onCancelAppointment(id: string) {
    await this.state.cancelAppointment(id);
    this.dialogVisible.set(false);
  }

  toggleSidebar() {
    this.isSidebarVisible.update((v) => !v);
  }

  goToSettings() {
    window.location.href = '/settings';
  }

  private async refreshAppointments() {
    // Reload appointments from the data provider
    await this.state.loadInitialData();
  }
}
