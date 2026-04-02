import { Component, inject, viewChild, TemplateRef, OnDestroy, AfterViewInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { EmployeeDialogComponent } from '../../../components/employee/employee-dialog/employee-dialog.component';
import { CalendarStateService } from '../../calendar/calendar-state.service';
import { HeaderService } from '../../../services/header.service';
import { UiEmployee } from '../../calendar/calendar.provider';

@Component({
  selector: 'crm-employees-feature',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeDialogComponent,
    TableModule,
    ButtonModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './employees-feature.component.html',
  styleUrls: ['./employees-feature.component.scss'],
})
export class EmployeesFeatureComponent implements OnDestroy, AfterViewInit {
  public readonly state = inject(CalendarStateService);
  private confirmationService = inject(ConfirmationService);
  private headerService = inject(HeaderService);

  readonly headerActions = viewChild<TemplateRef<any>>('headerActions');

  dialogVisible = signal(false);
  selectedEmployee = signal<UiEmployee | null>(null);

  activeCount = computed(() => this.state.employees().filter((e: UiEmployee) => e.isActive).length);

  constructor() {
    // Note: Data loading is handled by the state service which is provided at a higher level (usually in the app or shell)
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

  openNew() {
    this.selectedEmployee.set(null);
    this.dialogVisible.set(true);
  }

  editEmployee(employee: UiEmployee) {
    this.selectedEmployee.set({ ...employee });
    this.dialogVisible.set(true);
  }

  deleteEmployee(employee: UiEmployee) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar a <b>${employee.name}</b>? Esta acción no se puede deshacer.`,
      header: 'Eliminar Empleado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.state.deleteEmployee(employee.id);
      },
    });
  }

  onSave(employee: UiEmployee) {
    this.state.saveEmployee(employee);
    this.dialogVisible.set(false);
  }
}
