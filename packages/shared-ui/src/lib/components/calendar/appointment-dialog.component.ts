import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
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

export interface ClientOption {
  id: string;
  name: string;
  phone?: string;
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
  selector: 'crm-appointment-dialog',
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [header]="dialogTitle()"
      [visible]="visible()"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '480px' }"
      [contentStyle]="{ padding: '24px' }"
    >
      <div class="appointment-form">
        @if (isEditing() && form.status) {
          <div class="form-status">
            <p-tag
              [value]="getStatusLabel(form.status)"
              [severity]="getStatusSeverity(form.status)"
            />
          </div>
        }

        <div class="form-field">
          <label for="client">Cliente *</label>
          <p-select
            id="client"
            [options]="clients()"
            [(ngModel)]="form.clientId"
            optionLabel="name"
            optionValue="id"
            placeholder="Seleccionar cliente..."
            [filter]="true"
            filterPlaceholder="Buscar..."
            [style]="{ width: '100%' }"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="service">Servicio *</label>
            <p-select
              id="service"
              [options]="services()"
              [(ngModel)]="form.serviceId"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccionar servicio..."
              [style]="{ width: '100%' }"
              (onChange)="onServiceChange()"
            >
              <ng-template #item let-svc>
                <div class="service-option">
                  <span>{{ svc.name }}</span>
                  <span class="service-meta">{{ svc.durationMinutes }}min · {{ svc.priceFormatted }}</span>
                </div>
              </ng-template>
            </p-select>
          </div>

          <div class="form-field">
            <label for="employee">Atendido por</label>
            <p-select
              id="employee"
              [options]="employees()"
              [(ngModel)]="form.employeeId"
              optionLabel="name"
              optionValue="id"
              placeholder="Asignar empleado..."
              [showClear]="true"
              [style]="{ width: '100%' }"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="startTime">Fecha y Hora *</label>
            <p-datepicker
              id="startTime"
              [(ngModel)]="form.startTime"
              [showTime]="true"
              [stepMinute]="30"
              dateFormat="dd/mm/yy"
              [style]="{ width: '100%' }"
              (onSelect)="onStartTimeChange()"
            />
          </div>
          <div class="form-field">
            <label>Duración</label>
            <div class="duration-display">
              <i class="pi pi-clock"></i>
              <span>{{ selectedDuration() }} min</span>
            </div>
          </div>
        </div>

        <div class="form-field">
          <label for="notes">Notas</label>
          <textarea
            pTextarea
            id="notes"
            [(ngModel)]="form.notes"
            [rows]="3"
            placeholder="Notas adicionales..."
            [style]="{ width: '100%' }"
          ></textarea>
        </div>

        <div class="form-field time-summary">
          <i class="pi pi-calendar"></i>
          <span>{{ timeSummary() }}</span>
        </div>
      </div>

      <ng-template #footer>
        <div class="dialog-footer">
          @if (isEditing()) {
            <p-button
              label="Cancelar Cita"
              severity="danger"
              [text]="true"
              icon="pi pi-times"
              (onClick)="onCancelAppointment()"
            />
          }
          <div class="footer-right">
            <p-button
              label="Cerrar"
              severity="secondary"
              [text]="true"
              (onClick)="onClose()"
            />
            <p-button
              [label]="isEditing() ? 'Guardar Cambios' : 'Crear Cita'"
              icon="pi pi-check"
              (onClick)="onSave()"
              [disabled]="!isFormValid()"
            />
          </div>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: `
    .appointment-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-status {
      display: flex;
      justify-content: flex-end;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--p-text-secondary-color);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: end;
    }

    .duration-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: var(--p-surface-100);
      border-radius: 8px;
      font-weight: 600;
      color: var(--p-primary-color);
      font-size: 0.95rem;

      i { font-size: 1rem; }
    }

    .service-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .service-meta {
      font-size: 0.8rem;
      color: var(--p-text-secondary-color);
    }

    .time-summary {
      flex-direction: row !important;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: var(--p-surface-50);
      border-radius: 8px;
      font-size: 0.9rem;
      color: var(--p-text-secondary-color);

      i { color: var(--p-primary-color); }
    }

    .dialog-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .footer-right {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
  `,
})
export class AppointmentDialogComponent {
  // === Inputs ===
  visible = input<boolean>(false);
  clients = input<ClientOption[]>([]);
  employees = input<EmployeeOption[]>([]);
  services = input<ServiceOption[]>([]);
  appointment = input<AppointmentFormData | null>(null);

  // === Outputs ===
  visibleChange = output<boolean>();
  save = output<AppointmentFormData>();
  cancelAppointment = output<string>(); // emits appointment ID
  close = output<void>();

  // === Form State ===
  form: AppointmentFormData = {
    clientId: '',
    serviceId: '',
    startTime: new Date(),
    endTime: new Date(),
    notes: '',
  };

  // === Computed ===
  isEditing = computed(() => !!this.appointment()?.id);
  dialogTitle = computed(() => (this.isEditing() ? 'Editar Cita' : 'Nueva Cita'));

  selectedDuration = computed(() => {
    const svc = this.services().find((s) => s.id === this.form.serviceId);
    return svc?.durationMinutes ?? 30;
  });

  timeSummary = computed(() => {
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

  isFormValid = signal(false);

  constructor() {
    // Populate form when appointment input changes
    effect(() => {
      const appt = this.appointment();
      if (appt) {
        this.form = { ...appt };
      } else {
        this.resetForm();
      }
      this.validateForm();
    });
  }

  onVisibleChange(visible: boolean) {
    this.visibleChange.emit(visible);
    if (!visible) {
      this.close.emit();
    }
  }

  onServiceChange() {
    this.recalculateEndTime();
    this.validateForm();
  }

  onStartTimeChange() {
    this.recalculateEndTime();
    this.validateForm();
  }

  onSave() {
    if (this.isFormValid()) {
      this.save.emit({ ...this.form });
    }
  }

  onCancelAppointment() {
    if (this.form.id) {
      this.cancelAppointment.emit(this.form.id);
    }
  }

  onClose() {
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

  private recalculateEndTime() {
    const duration = this.selectedDuration();
    if (this.form.startTime) {
      this.form.endTime = new Date(this.form.startTime.getTime() + duration * 60 * 1000);
    }
  }

  private validateForm() {
    this.isFormValid.set(
      !!this.form.clientId &&
        !!this.form.serviceId &&
        !!this.form.startTime &&
        !!this.form.endTime,
    );
  }

  private resetForm() {
    this.form = {
      clientId: '',
      serviceId: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60 * 1000),
      notes: '',
    };
  }
}
