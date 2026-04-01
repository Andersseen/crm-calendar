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
import { ColorPickerModule } from 'primeng/colorpicker';
import { CheckboxModule } from 'primeng/checkbox';
import { UiEmployee } from '../../features/calendar/calendar.provider';

@Component({
  selector: 'crm-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    ColorPickerModule,
    CheckboxModule,
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
      [style]="{ width: '400px' }"
    >
      <div class="employee-form">
        <div class="form-field">
          <label for="name">Nombre Completo *</label>
          <input
            pInputText
            id="name"
            [(ngModel)]="form.name"
            placeholder="Ej. Elena Estilista"
            (ngModelChange)="validateForm()"
          />
        </div>

        <div class="form-field">
          <label for="position">Cargo / Especialidad *</label>
          <input
            pInputText
            id="position"
            [(ngModel)]="form.position"
            placeholder="Ej. Senior Stylist"
            (ngModelChange)="validateForm()"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="color">Color Distintivo</label>
            <div class="color-picker-wrapper">
              <p-colorpicker
                id="color"
                [(ngModel)]="form.color"
                [inline]="false"
              />
              <span class="color-hex">{{ form.color }}</span>
            </div>
          </div>

          <div class="form-field checkbox-field">
            <label for="isActive">Activo</label>
            <p-checkbox
              id="isActive"
              [(ngModel)]="form.isActive"
              [binary]="true"
            />
          </div>
        </div>
      </div>

      <ng-template #footer>
        <div class="dialog-footer">
          <p-button
            label="Cancelar"
            severity="secondary"
            [text]="true"
            (onClick)="onClose()"
          />
          <p-button
            [label]="isEditing() ? 'Guardar Cambios' : 'Registrar Empleado'"
            icon="pi pi-check"
            (onClick)="onSave()"
            [disabled]="!isFormValid()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: `
    .employee-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 10px 0;
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
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .color-picker-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px;
    }

    .color-hex {
      font-family: monospace;
      font-size: 0.9rem;
      color: var(--p-text-secondary-color);
    }

    .checkbox-field {
      flex-direction: row !important;
      align-items: center;
      gap: 12px;
      margin-top: 20px;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `,
})
export class EmployeeDialogComponent {
  visible = input<boolean>(false);
  employee = input<UiEmployee | null>(null);

  visibleChange = output<boolean>();
  save = output<UiEmployee>();
  close = output<void>();

  form: UiEmployee = this.getEmptyForm();
  isFormValid = signal(false);

  isEditing = computed(() => !!this.employee()?.id);
  dialogTitle = computed(() => (this.isEditing() ? 'Editar Empleado' : 'Nuevo Empleado'));

  constructor() {
    effect(() => {
      const emp = this.employee();
      if (emp) {
        this.form = { ...emp };
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
    this.isFormValid.set(
      !!this.form.name?.trim() && 
      !!this.form.position?.trim()
    );
  }

  private getEmptyForm(): UiEmployee {
    return {
      id: '',
      name: '',
      position: '',
      color: '#10b981',
      isActive: true,
    };
  }
}
