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
import { UiEmployee } from '@shared-ui/features/calendar/calendar.provider';

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
  templateUrl: './employee-dialog.component.html',
  styleUrls: ['./employee-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    this.isFormValid.set(!!this.form.name?.trim() && !!this.form.position?.trim());
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
