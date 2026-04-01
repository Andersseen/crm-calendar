import { Component, inject, signal } from '@angular/core';
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
  AppShellComponent,
  ClientDialogComponent,
  CalendarStateService,
  UiClient,
  CALENDAR_DATA_PROVIDER,
} from '@crm/shared-ui';
import { MockDataService } from '../services/mock-data.service';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    CommonModule,
    AppShellComponent,
    ClientDialogComponent,
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
    <crm-app-shell>
      <div class="page-header mt-[-10px]">
        <div class="header-content">
          <h1 class="text-3xl font-black tracking-tighter text-slate-900">Directorio de Clientes</h1>
          <p class="text-slate-500 font-medium">Gestiona la base de datos de tus clientes y su historial de visitas.</p>
        </div>
        <p-button
          label="Nuevo Cliente"
          icon="pi pi-plus"
          (onClick)="openNew()"
          severity="primary"
          [raised]="true"
        />
      </div>

      <div class="premium-stats-grid">
        <div class="stat-card glass-card">
          <div class="stat-icon bg-emerald-100 text-emerald-600">
            <i class="pi pi-users text-xl"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Clientes</span>
            <span class="stat-value">{{ state.clients().length }}</span>
          </div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            <i class="pi pi-user-plus text-xl"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Nuevos (Mes)</span>
            <span class="stat-value text-emerald-600">8</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-amber-100 text-amber-600">
            <i class="pi pi-star text-xl"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Clientes VIP</span>
            <span class="stat-value">15</span>
          </div>
        </div>
      </div>

      <div class="table-outer premium-shadow fade-in">
        <p-table
          [value]="state.clients()"
          [rows]="10"
          [paginator]="true"
          responsiveLayout="stack"
          breakpoint="960px"
          [globalFilterFields]="['name', 'email', 'phone']"
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
                    placeholder="Buscar por nombre, tel o email..."
                    class="w-full md:w-80"
                  />
                </p-iconfield>
              </div>
            </div>
          </ng-template>

          <ng-template #header>
            <tr>
              <th pSortableColumn="name">Cliente <p-sortIcon field="name" /></th>
              <th>Contacto</th>
              <th pSortableColumn="createdAt" style="width: 12rem">Desde <p-sortIcon field="createdAt" /></th>
              <th style="width: 10rem" class="text-right">Acciones</th>
            </tr>
          </ng-template>

          <ng-template #body let-client>
            <tr class="hover:bg-slate-50 transition-colors">
              <td>
                <div class="flex align-items-center gap-3">
                  <div class="client-avatar">
                    {{ client.name.charAt(0) }}
                  </div>
                  <div class="font-bold text-slate-800">{{ client.name }}</div>
                </div>
              </td>
              <td>
                <div class="flex flex-column gap-1 text-sm">
                  <div class="flex align-items-center gap-2 text-slate-600">
                    <i class="pi pi-phone text-xs"></i>
                    {{ client.phone }}
                  </div>
                  <div class="flex align-items-center gap-2 text-slate-500">
                    <i class="pi pi-envelope text-xs"></i>
                    {{ client.email }}
                  </div>
                </div>
              </td>
              <td>
                <span class="text-slate-600 font-medium">
                  {{ client.createdAt | date: 'MMM yyyy' }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <p-button
                    icon="pi pi-id-card"
                    label="Ver Perfil"
                    [text]="true"
                    severity="secondary"
                    (onClick)="editClient(client)"
                    class="text-xs"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [text]="true"
                    [rounded]="true"
                    severity="danger"
                    (onClick)="deleteClient(client)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <crm-client-dialog
        [visible]="dialogVisible"
        [client]="selectedClient"
        (visibleChange)="dialogVisible = $event"
        (save)="onSave($event)"
        (close)="selectedClient = null"
      />

      <p-confirmdialog />
    </crm-app-shell>
  `,
  styles: `
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
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
      color: var(--slate-500);
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--slate-900);
      line-height: 1.2;
    }

    .table-outer {
      background: white;
      border-radius: 20px;
      border: 1px solid var(--slate-200);
      overflow: hidden;
    }

    .table-header-toolbar {
      padding: 20px 24px;
      background: var(--slate-50);
      border-bottom: 1px solid var(--slate-200);
    }

    .client-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--emerald-100);
      color: var(--emerald-700);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
      justify-content: flex-end;
      align-items: center;
    }

    ::ng-deep {
      .p-datatable-header {
        padding: 0 !important;
        border: none !important;
        background: transparent !important;
      }

      .p-datatable-thead > tr > th {
        background: var(--slate-50) !important;
        color: var(--slate-600) !important;
        font-weight: 700 !important;
        font-size: 0.85rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        padding: 16px 24px !important;
        border-bottom: 1px solid var(--slate-200) !important;
      }

      .p-datatable-tbody > tr > td {
        padding: 16px 24px !important;
        border-bottom: 1px solid var(--slate-100) !important;
      }

      .p-paginator {
        background: var(--slate-50) !important;
        border-top: 1px solid var(--slate-200) !important;
        padding: 12px !important;
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
export default class ClientsPage {
  state = inject(CalendarStateService);
  confirmationService = inject(ConfirmationService);

  dialogVisible = false;
  selectedClient: UiClient | null = null;

  constructor() {
    this.state.loadInitialData();
  }

  openNew() {
    this.selectedClient = null;
    this.dialogVisible = true;
  }

  editClient(client: UiClient) {
    this.selectedClient = { ...client };
    this.dialogVisible = true;
  }

  deleteClient(client: UiClient) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar a <b>${client.name}</b>? Se perderá todo su historial.`,
      header: 'Eliminar Cliente',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.state.deleteClient(client.id);
      },
    });
  }

  onSave(client: UiClient) {
    this.state.saveClient(client);
    this.dialogVisible = false;
  }
}
