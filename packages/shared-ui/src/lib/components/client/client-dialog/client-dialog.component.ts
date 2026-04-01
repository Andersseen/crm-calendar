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
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { UiClient, UiAppointment } from '@shared-ui/features/calendar/calendar.provider';

@Component({
  selector: 'crm-client-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    TextareaModule,
    TabsModule,
  ],
  templateUrl: './client-dialog.component.html',
  styleUrls: ['./client-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDialogComponent {
  visible = input<boolean>(false);
  client = input<UiClient | null>(null);
  appointments = input<UiAppointment[]>([]);

  visibleChange = output<boolean>();
  save = output<UiClient>();
  close = output<void>();

  form: UiClient = this.getEmptyForm();
  isFormValid = signal(false);

  isEditing = computed(() => !!this.client()?.id);
  dialogTitle = computed(() => (this.isEditing() ? 'Perfil de Cliente' : 'Nuevo Cliente'));

  clientAppointments = computed(() => {
    const c = this.client();
    if (!c) return [];
    return this.appointments()
      .filter((a) => a.clientId === c.id)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  });

  constructor() {
    effect(() => {
      const c = this.client();
      if (c) {
        this.form = { ...c };
      } else {
        this.form = this.getEmptyForm();
      }
      this.validateForm();
    });
  }

  onVisibleChange(visible: boolean) {
    this.visibleChange.emit(visible);
    if (!visible) this.close.emit();
  }

  onSave() {
    if (this.isFormValid()) {
      this.save.emit({ ...this.form });
    }
  }

  onClose() {
    this.visibleChange.emit(false);
    this.close.emit();
  }

  validateForm() {
    this.isFormValid.set(!!this.form.name?.trim());
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'CONF',
      COMPLETED: 'OK',
      CANCELLED: 'CANC',
      NO_SHOW: 'NO',
    };
    return map[status] ?? status;
  }

  private getEmptyForm(): UiClient {
    return {
      id: '',
      name: '',
      phone: '',
      email: '',
      notes: '',
    };
  }
}
