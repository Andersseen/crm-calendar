import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import {
  EmployeeDialogComponent,
  CalendarStateService,
  UiEmployee,
  CALENDAR_DATA_PROVIDER,
} from '@crm/shared-ui';
import { MockDataService } from '../services/mock-data.service';

@Component({
  selector: 'app-employees-page',
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
  providers: [
    CalendarStateService,
    ConfirmationService,
    { provide: CALENDAR_DATA_PROVIDER, useExisting: MockDataService },
  ],
  template: `
    <div class="page-header mt-[-10px]">
      <div class="header-content">
        <h1 class="page-title">Gestión de Empleados</h1>
        <p class="page-subtitle">Administra el personal y sus especialidades de servicio.</p>
      </div>
      <p-button
        label="Nuevo Empleado"
        icon="pi pi-plus"
        (onClick)="openNew()"
        severity="primary"
        [raised]="true"
      />
    </div>

    <div class="premium-stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-emerald-500/10 text-emerald-500">
          <i class="pi pi-users text-xl"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Empleados</span>
          <span class="stat-value">{{ state.employees().length }}</span>
        </div>
      </div>
      
      <div class="stat-card glass-card">
        <div class="stat-icon bg-blue-500/10 text-blue-500">
          <i class="pi pi-check-circle text-xl"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Personal Activo</span>
          <span class="stat-value text-emerald-500">{{ activeCount() }}</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon bg-purple-500/10 text-purple-500">
          <i class="pi pi-calendar text-xl"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Citas de Hoy</span>
          <span class="stat-value">12</span>
        </div>
      </div>
    </div>

    <div class="table-outer premium-shadow fade-in">
      <p-table
        [value]="state.employees()"
        [rows]="10"
        [paginator]="true"
        responsiveLayout="stack"
        breakpoint="960px"
        [globalFilterFields]="['name', 'position']"
        #dt
        styleClass="p-datatable-sm"
      >
        <ng-template #caption>
          <div class="table-header-toolbar">
            <div class="search-box">
              <p-iconfield>
                <p-inputicon styleClass="pi pi-search" />
                <input
                  pInputText
                  type="text"
                  (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                  placeholder="Buscar por nombre o cargo..."
                  class="w-full md:w-80"
                />
              </p-iconfield>
            </div>
          </div>
        </ng-template>

        <ng-template #header>
          <tr>
            <th style="width: 4rem" class="text-center"></th>
            <th pSortableColumn="name">Nombre <p-sortIcon field="name" /></th>
            <th pSortableColumn="position">Cargo <p-sortIcon field="position" /></th>
            <th pSortableColumn="isActive" style="width: 10rem">Estado <p-sortIcon field="isActive" /></th>
            <th style="width: 10rem" class="text-right">Acciones</th>
          </tr>
        </ng-template>

        <ng-template #body let-employee>
          <tr class="hover-row transition-colors">
            <td class="text-center">
              <div class="employee-avatar" [style.background-color]="employee.color + '20'" [style.color]="employee.color">
                  {{ employee.name.charAt(0) }}
              </div>
            </td>
            <td>
              <div class="font-bold text-primary">{{ employee.name }}</div>
            </td>
            <td>
              <span class="text-secondary">{{ employee.position }}</span>
            </td>
            <td>
              <p-tag
                [severity]="employee.isActive ? 'success' : 'secondary'"
                [value]="employee.isActive ? 'Activo' : 'Inactivo'"
                [rounded]="true"
                class="premium-tag"
              />
            </td>
            <td class="text-right">
              <div class="action-buttons">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  [rounded]="true"
                  severity="secondary"
                  (onClick)="editEmployee(employee)"
                  pTooltip="Editar"
                />
                <p-button
                  icon="pi pi-trash"
                  [text]="true"
                  [rounded]="true"
                  severity="danger"
                  (onClick)="deleteEmployee(employee)"
                  pTooltip="Eliminar"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <crm-employee-dialog
      [visible]="dialogVisible"
      [employee]="selectedEmployee"
      (visibleChange)="dialogVisible = $event"
      (save)="onSave($event)"
      (close)="selectedEmployee = null"
    />

    <p-confirmdialog />
  `,
  styles: `
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 1.875rem;
      font-weight: 900;
      letter-spacing: -0.05em;
      color: var(--color-text-primary);
      margin: 0;
    }

    .page-subtitle {
      color: var(--color-text-secondary);
      font-weight: 500;
      margin: 4px 0 0 0;
    }

    .premium-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text-primary);
      line-height: 1.2;
    }

    .table-outer {
      background: var(--color-surface);
      border-radius: 20px;
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    .table-header-toolbar {
      padding: 20px 24px;
      background: var(--color-bg-secondary);
      border-bottom: 1px solid var(--color-border);
    }

    .employee-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      margin: 0 auto;
    }

    .text-primary { color: var(--color-text-primary); }
    .text-secondary { color: var(--color-text-secondary); }

    .action-buttons {
      display: flex;
      gap: 4px;
      justify-content: flex-end;
    }

    ::ng-deep {
      .dark .table-outer {
         box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
      }

      .p-datatable-header {
        padding: 0 !important;
        border: none !important;
        background: transparent !important;
      }

      .p-datatable-thead > tr > th {
        background: var(--color-bg-secondary) !important;
        color: var(--color-text-secondary) !important;
        font-weight: 700 !important;
        font-size: 0.85rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        padding: 16px 24px !important;
        border-bottom: 1px solid var(--color-border) !important;
      }

      .p-datatable-tbody > tr > td {
        padding: 16px 24px !important;
        border-bottom: 1px solid var(--color-border) !important;
        background: var(--color-surface) !important;
        color: var(--color-text-primary) !important;
      }

      .p-datatable-tbody > tr.hover-row:hover > td {
         background: var(--color-bg-secondary) !important;
      }

      .p-paginator {
        background: var(--color-bg-secondary) !important;
        border-top: 1px solid var(--color-border) !important;
        padding: 12px !important;
        color: var(--color-text-secondary) !important;
      }

      .p-paginator .p-paginator-page, 
      .p-paginator .p-paginator-next, 
      .p-paginator .p-paginator-last, 
      .p-paginator .p-paginator-first, 
      .p-paginator .p-paginator-prev {
         color: var(--color-text-primary) !important;
      }

      .p-tag.premium-tag {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 4px 10px;
      }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export default class EmployeesPage {
  state = inject(CalendarStateService);
  confirmationService = inject(ConfirmationService);

  dialogVisible = false;
  selectedEmployee: UiEmployee | null = null;

  activeCount = computed(() => this.state.employees().filter((e) => e.isActive).length);

  constructor() {
    this.state.loadInitialData();
  }

  openNew() {
    this.selectedEmployee = null;
    this.dialogVisible = true;
  }

  editEmployee(employee: UiEmployee) {
    this.selectedEmployee = { ...employee };
    this.dialogVisible = true;
  }

  async deleteEmployee(employee: UiEmployee) {
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
    this.dialogVisible = false;
  }
}
