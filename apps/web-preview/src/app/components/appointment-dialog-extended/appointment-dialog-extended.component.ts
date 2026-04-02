import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { GoogleCalendarAdapterService } from '../../services/google-calendar-adapter.service';

export interface AppointmentFormData {
  id?: string;
  clientId: string;
  employeeId?: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  notes: string;
  status?: string;
}

export interface ExtendedAppointmentFormData extends AppointmentFormData {
  sendCalendarInvite?: boolean;
  clientEmail?: string;
}

export interface ClientOption {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface EmployeeOption {
  id: string;
  name: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  priceFormatted: string;
}

@Component({
  selector: 'crm-appointment-dialog-extended',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    DatePickerModule,
    TextareaModule,
    ButtonModule,
    TagModule,
    SelectModule,
    InputTextModule,
    CheckboxModule,
    TooltipModule,
  ],
  template: `
    <p-dialog
      [visible]="visible"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
      [resizable]="false"
      [header]="dialogTitle()"
      styleClass="appointment-dialog"
    >
      <div class="form-container">
        <!-- Client Selection -->
        <div class="field">
          <label for="client">Cliente *</label>
          <p-dropdown
            id="client"
            [options]="clients"
            [(ngModel)]="form.clientId"
            optionLabel="name"
            optionValue="id"
            placeholder="Selecciona un cliente"
            styleClass="w-full"
            (onChange)="onClientChange()"
          ></p-dropdown>
        </div>

        <!-- Client Email (shown when client selected) -->
        @if (selectedClient()?.email || isEditing() === false) {
          <div class="field">
            <label for="clientEmail">Email del cliente</label>
            <input
              id="clientEmail"
              type="email"
              pInputText
              [(ngModel)]="form.clientEmail"
              placeholder="cliente@ejemplo.com"
              class="w-full"
              [disabled]="!!selectedClient()?.email"
            />
            @if (selectedClient()?.email) {
              <small class="text-secondary">Email del cliente registrado</small>
            }
          </div>
        }

        <!-- Service Selection -->
        <div class="field">
          <label for="service">Servicio *</label>
          <p-dropdown
            id="service"
            [options]="services"
            [(ngModel)]="form.serviceId"
            optionLabel="name"
            optionValue="id"
            placeholder="Selecciona un servicio"
            styleClass="w-full"
            (onChange)="onServiceChange()"
          ></p-dropdown>
        </div>

        <!-- Employee Selection -->
        <div class="field">
          <label for="employee">Profesional</label>
          <p-dropdown
            id="employee"
            [options]="employees"
            [(ngModel)]="form.employeeId"
            optionLabel="name"
            optionValue="id"
            placeholder="Selecciona un profesional"
            styleClass="w-full"
          ></p-dropdown>
        </div>

        <!-- Date & Time -->
        <div class="field">
          <label>Fecha y hora *</label>
          <p-datePicker
            [(ngModel)]="form.startTime"
            [showTime]="true"
            [hourFormat]="'24'"
            styleClass="w-full"
            (onSelect)="onStartTimeChange()"
          ></p-datePicker>
        </div>

        <!-- Time Summary -->
        @if (timeSummary()) {
          <div class="time-summary">
            <i class="pi pi-clock"></i>
            <span>{{ timeSummary() }}</span>
          </div>
        }

        <!-- Notes -->
        <div class="field">
          <label for="notes">Notas</label>
          <textarea
            id="notes"
            pTextarea
            [(ngModel)]="form.notes"
            rows="3"
            class="w-full"
            placeholder="Notas adicionales..."
          ></textarea>
        </div>

        <!-- Status (only when editing) -->
        @if (isEditing() && form.status) {
          <div class="field status-field">
            <label>Estado</label>
            <p-tag
              [value]="getStatusLabel(form.status)"
              [severity]="getStatusSeverity(form.status)"
            ></p-tag>
          </div>
        }

        <!-- Google Calendar Sync Option -->
        @if (showGoogleCalendarOption) {
          <div class="field calendar-sync-field">
            <div class="calendar-sync-option">
              <p-checkbox
                [(ngModel)]="form.sendCalendarInvite"
                [binary]="true"
                inputId="sendCalendarInvite"
              ></p-checkbox>
              <label for="sendCalendarInvite" class="calendar-label">
                <i class="pi pi-calendar"></i>
                <span>Enviar invitación a Google Calendar</span>
                @if (isConnected()) {
                  <i
                    class="pi pi-check-circle connected-icon"
                    pTooltip="Conectado a Google Calendar"
                    tooltipPosition="top"
                  ></i>
                }
              </label>
            </div>
            @if (form.sendCalendarInvite && !isConnected()) {
              <small class="warning-text">
                <i class="pi pi-exclamation-circle"></i>
                Debes conectar Google Calendar primero en la configuración
              </small>
            }
            @if (form.sendCalendarInvite && isConnected() && !form.clientEmail) {
              <small class="warning-text">
                <i class="pi pi-exclamation-circle"></i>
                Añade el email del cliente para enviar la invitación
              </small>
            }
          </div>
        }
      </div>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          @if (isEditing()) {
            <button
              pButton
              type="button"
              label="Cancelar Cita"
              class="p-button-outlined p-button-danger"
              (click)="onCancelAppointment()"
            ></button>
          }
          <div class="spacer"></div>
          <button
            pButton
            type="button"
            label="Cerrar"
            class="p-button-text"
            (click)="onClose()"
          ></button>
          <button
            pButton
            type="button"
            label="Guardar"
            [disabled]="!isFormValid()"
            (click)="onSave()"
          ></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: `
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field label {
      font-weight: 500;
      color: var(--text-color);
    }

    .time-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background-color: var(--surface-100);
      border-radius: 0.5rem;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .status-field {
      align-items: flex-start;
    }

    .calendar-sync-field {
      background-color: var(--blue-50);
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .calendar-sync-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .calendar-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      cursor: pointer;
      font-weight: 500;
    }

    .calendar-label i.pi-calendar {
      color: #4285f4;
    }

    .connected-icon {
      color: var(--green-500);
      font-size: 0.875rem;
    }

    .warning-text {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--orange-500);
      margin-top: 0.5rem;
    }

    .dialog-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .spacer {
      flex: 1;
    }

    ::ng-deep .appointment-dialog .p-dialog-content {
      padding-bottom: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDialogExtendedComponent {
  private readonly googleCalendar = inject(GoogleCalendarAdapterService);

  @Input() visible = false;
  @Input() clients: ClientOption[] = [];
  @Input() employees: EmployeeOption[] = [];
  @Input() services: ServiceOption[] = [];
  @Input() appointment: ExtendedAppointmentFormData | null = null;
  @Input() showGoogleCalendarOption = true;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<ExtendedAppointmentFormData>();
  @Output() cancelAppointment = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  form: ExtendedAppointmentFormData = {
    clientId: '',
    serviceId: '',
    startTime: new Date(),
    endTime: new Date(),
    notes: '',
    sendCalendarInvite: false,
    clientEmail: '',
  };

  isFormValid = signal(false);

  readonly isConnected = computed(() => this.googleCalendar.isConnected());

  readonly selectedClient = computed(() => {
    return this.clients.find((c) => c.id === this.form.clientId) || null;
  });

  readonly selectedService = computed(() => {
    return this.services.find((s) => s.id === this.form.serviceId);
  });

  readonly selectedEmployee = computed(() => {
    return this.employees.find((e) => e.id === this.form.employeeId);
  });

  readonly isEditing = computed(() => !!this.appointment?.id);

  readonly dialogTitle = computed(() => (this.isEditing() ? 'Editar Cita' : 'Nueva Cita'));

  readonly selectedDuration = computed(() => {
    const svc = this.selectedService();
    return svc?.durationMinutes ?? 30;
  });

  readonly timeSummary = computed(() => {
    if (!this.form.startTime) return '';
    const start = this.form.startTime;
    const end = this.form.endTime;
    const fmt = (d: Date) =>
      d.toLocaleString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    return `${fmt(start)} → ${end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  });

  constructor() {
    // Populate form when appointment input changes
    effect(() => {
      const appt = this.appointment;
      if (appt) {
        this.form = { ...appt };
        // Pre-populate client email if available
        const client = this.clients.find((c) => c.id === appt.clientId);
        if (client?.email && !this.form.clientEmail) {
          this.form.clientEmail = client.email;
        }
      } else {
        this.resetForm();
      }
      this.validateForm();
    });
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
    if (!visible) {
      this.close.emit();
    }
  }

  onClientChange(): void {
    const client = this.selectedClient();
    if (client?.email) {
      this.form.clientEmail = client.email;
    } else {
      this.form.clientEmail = '';
    }
    this.validateForm();
  }

  onServiceChange(): void {
    this.recalculateEndTime();
    this.validateForm();
  }

  onStartTimeChange(): void {
    this.recalculateEndTime();
    this.validateForm();
  }

  onSave(): void {
    if (this.isFormValid()) {
      this.save.emit({ ...this.form });
    }
  }

  onCancelAppointment(): void {
    if (this.form.id) {
      this.cancelAppointment.emit(this.form.id);
    }
  }

  onClose(): void {
    this.visibleChange.emit(false);
    this.close.emit();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      NO_SHOW: 'No presentado',
    };
    return labels[status] ?? status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      PENDING: 'warn',
      CONFIRMED: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      NO_SHOW: 'secondary',
    };
    return map[status] ?? 'secondary';
  }

  private recalculateEndTime(): void {
    const duration = this.selectedDuration();
    if (this.form.startTime) {
      this.form.endTime = new Date(this.form.startTime.getTime() + duration * 60 * 1000);
    }
  }

  private validateForm(): void {
    this.isFormValid.set(
      !!this.form.clientId && !!this.form.serviceId && !!this.form.startTime && !!this.form.endTime,
    );
  }

  private resetForm(): void {
    this.form = {
      clientId: '',
      serviceId: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60 * 1000),
      notes: '',
      sendCalendarInvite: false,
      clientEmail: '',
    };
  }
}
