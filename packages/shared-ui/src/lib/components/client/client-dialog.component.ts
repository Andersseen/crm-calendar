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
import { UiClient, UiAppointment } from '../../features/calendar/calendar.provider';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [header]="dialogTitle()"
      [visible]="visible()"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '560px' }"
    >
      <div class="client-dialog-content">
        <p-tabs [value]="0">
          <p-tablist>
            <p-tab [value]="0">Información General</p-tab>
            <p-tab [value]="1" *ngIf="isEditing()">Historial de Citas</p-tab>
          </p-tablist>
          
          <p-tabpanels>
            <p-tabpanel [value]="0">
              <div class="client-form">
                <div class="form-field">
                  <label for="name">Nombre Completo *</label>
                  <input
                    pInputText
                    id="name"
                    [(ngModel)]="form.name"
                    placeholder="Ej. María García"
                    (ngModelChange)="validateForm()"
                  />
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label for="phone">Teléfono</label>
                    <input
                      pInputText
                      id="phone"
                      [(ngModel)]="form.phone"
                      placeholder="600 000 000"
                    />
                  </div>
                  <div class="form-field">
                    <label for="email">Email</label>
                    <input
                      pInputText
                      id="email"
                      [(ngModel)]="form.email"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>

                <div class="form-field">
                  <label for="notes">Notas Internas</label>
                  <textarea
                    pTextarea
                    id="notes"
                    [(ngModel)]="form.notes"
                    [rows]="5"
                    placeholder="Preferencias, alergias, o información relevante..."
                  ></textarea>
                </div>

                <div *ngIf="form.createdAt" class="client-meta">
                  Cliente desde: {{ form.createdAt | date: 'dd/MM/yyyy' }}
                </div>
              </div>
            </p-tabpanel>

            <p-tabpanel [value]="1" *ngIf="isEditing()">
              <div class="history-list">
                @if (clientAppointments().length === 0) {
                  <div class="empty-history">
                    <i class="pi pi-calendar-times"></i>
                    <p>No hay citas previas registradas.</p>
                  </div>
                } @else {
                  @for (appt of clientAppointments(); track appt.id) {
                    <div class="history-item">
                      <div class="history-date">
                        {{ appt.startTime | date: 'dd MMM yyyy' }}
                        <span class="history-time">{{ appt.startTime | date: 'HH:mm' }}</span>
                      </div>
                      <div class="history-info">
                        <span class="history-status" [class]="appt.status">{{ getStatusLabel(appt.status) }}</span>
                        <div class="history-svc">Cita de servicio</div>
                      </div>
                    </div>
                  }
                }
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </div>

      <ng-template #footer>
        <div class="dialog-footer">
          <p-button
            label="Cerrar"
            severity="secondary"
            [text]="true"
            (onClick)="onClose()"
          />
          <p-button
            [label]="isEditing() ? 'Guardar Cambios' : 'Registrar Cliente'"
            icon="pi pi-check"
            (onClick)="onSave()"
            [disabled]="!isFormValid()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: `
    .client-dialog-content {
      margin-top: -10px;
    }

    .client-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
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
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .client-meta {
      font-size: 0.75rem;
      color: var(--p-text-muted-color);
      text-align: right;
    }

    /* History Styles */
    .history-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--p-surface-50);
      border-radius: 8px;
      border: 1px solid var(--p-surface-100);
    }

    .history-date {
      font-weight: 700;
      font-size: 0.9rem;
      display: flex;
      flex-direction: column;
    }

    .history-time {
      font-weight: 400;
      font-size: 0.8rem;
      color: var(--p-text-secondary-color);
    }

    .history-info {
      text-align: right;
    }

    .history-svc {
      font-size: 0.8rem;
      color: var(--p-text-secondary-color);
      margin-top: 4px;
    }

    .history-status {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--p-surface-200);

      &.COMPLETED { background: #dcfce7; color: #166534; }
      &.CANCELLED { background: #fee2e2; color: #991b1b; }
      &.PENDING { background: #fef9c3; color: #854d0e; }
    }

    .empty-history {
      text-align: center;
      padding: 40px;
      color: var(--p-text-secondary-color);
      i { font-size: 2rem; margin-bottom: 12px; }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `,
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
    if (!this.client()) return [];
    return this.appointments().filter(a => a.clientId === this.client()?.id)
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
