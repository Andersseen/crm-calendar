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
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
