import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';

export interface DailyStats {
  total: number;
  confirmed: number;
  pending: number;
}

export interface UpcomingAppointment {
  id: string;
  time: string;
  clientName: string;
  serviceName: string;
}

@Component({
  selector: 'crm-calendar-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="calendar-sidebar">
      <div class="sidebar-section">
        <p-button
          label="Nueva Cita"
          icon="pi pi-plus"
          [style]="{ width: '100%' }"
          (onClick)="newAppointment.emit()"
        />
      </div>

      <div class="sidebar-section mini-calendar">
        <p-datepicker
          [ngModel]="selectedDate()"
          (ngModelChange)="onDateSelect($event)"
          [inline]="true"
          dateFormat="dd/mm/yy"
          [style]="{ width: '100%' }"
        />
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">Resumen del Día</h3>
        <div class="stats-grid">
          <div class="stat-box primary">
            <div class="stat-text-group">
              <span class="stat-value">{{ stats().total }}</span>
              <span class="stat-label">Total Citas</span>
            </div>
          </div>
          <div class="stat-box info">
            <div class="stat-text-group">
              <span class="stat-value">{{ stats().confirmed }}</span>
              <span class="stat-label">Confirmadas</span>
            </div>
          </div>
          <div class="stat-box warn">
            <div class="stat-text-group">
              <span class="stat-value">{{ stats().pending }}</span>
              <span class="stat-label">Pendientes</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-section upcoming">
        <h3 class="section-title">Próximas Citas</h3>
        @if (upcoming().length > 0) {
          <ul class="upcoming-list">
            @for (appt of upcoming(); track appt.id) {
              <li class="upcoming-item" (click)="appointmentClick.emit(appt.id)">
                <div class="upcoming-time-pill">
                  <i class="pi pi-clock time-icon"></i>
                  <span class="time-val">{{ appt.time }}</span>
                </div>
                <div class="upcoming-details">
                  <span class="upcoming-client">{{ appt.clientName }}</span>
                  <span class="upcoming-service">{{ appt.serviceName }}</span>
                </div>
              </li>
            }
          </ul>
        } @else {
          <p class="empty-state">No hay más citas hoy</p>
        }
      </div>
    </div>
  `,
  styles: `
    .calendar-sidebar {
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding: 24px;
      background: var(--p-surface-0);
      border-radius: var(--premium-radius, 16px);
      border: 1px solid var(--p-surface-200);
      height: 100%;
      overflow-y: auto;
      box-shadow: var(--premium-shadow);
    }

    .sidebar-section {
      display: flex;
      flex-direction: column;
    }

    .section-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      color: var(--p-text-secondary-color);
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: 0.08em;
      display: flex;
      align-items: center;
      gap: 8px;

      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--p-surface-100);
      }
    }

    /* Primary Action Button */
    .sidebar-section :ng-deep .p-button {
      padding: 14px 20px;
      border-radius: 14px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--p-primary-color) 0%, var(--p-primary-600) 100%);
      border: none;
      box-shadow: 0 4px 15px color-mix(in srgb, var(--p-primary-color) 30%, transparent);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px color-mix(in srgb, var(--p-primary-color) 40%, transparent);
        filter: brightness(1.1);
      }
      
      .p-button-icon {
        font-size: 1.1rem;
      }
    }

    /* Mini Calendar */
    .mini-calendar ::ng-deep .p-datepicker {
      border: none;
      padding: 0;
      background: transparent;

      .p-datepicker-header {
        background: transparent;
        border-bottom: 1px solid var(--p-surface-100);
        padding-bottom: 12px;
        margin-bottom: 8px;
      }

      .p-datepicker-calendar td > span {
        border-radius: 10px;
        width: 32px;
        height: 32px;
        transition: all 0.2s;
        
        &.p-datepicker-today {
          background: var(--p-surface-100);
          color: var(--p-primary-color);
        }
        
        &.p-highlight {
          background: var(--p-primary-color);
          color: white;
          box-shadow: 0 4px 10px color-mix(in srgb, var(--p-primary-color) 30%, transparent);
        }
      }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .stat-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 20px;
      border-radius: 16px;
      background: var(--p-surface-0);
      border: 1px solid var(--p-surface-100);
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--premium-shadow-hover);
        border-color: var(--p-surface-200);
      }

      &.primary { 
        background: color-mix(in srgb, var(--p-primary-color) 5%, var(--p-surface-0)); 
        border-left: 5px solid var(--p-primary-color);
      }
      &.info { 
        background: color-mix(in srgb, var(--p-blue-500) 5%, var(--p-surface-0));
        border-left: 5px solid var(--p-blue-500); 
      }
      &.warn { 
        background: color-mix(in srgb, var(--p-amber-500) 5%, var(--p-surface-0));
        border-left: 5px solid var(--p-amber-500); 
      }
    }

    .stat-text-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--p-text-color);
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--p-text-secondary-color);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Upcoming List */
    .upcoming-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .upcoming-item {
      display: flex;
      gap: 16px;
      padding: 14px;
      border-radius: 14px;
      background: var(--p-surface-50);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--p-surface-0);
        border-color: var(--p-surface-200);
        box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        transform: scale(1.02);
      }
    }

    .upcoming-time-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
      padding: 8px;
      border-radius: 10px;
      min-width: 54px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      border: 1px solid var(--p-surface-100);

      .time-icon {
        font-size: 0.75rem;
        color: var(--p-primary-color);
        margin-bottom: 2px;
      }

      .time-val {
        font-weight: 800;
        color: var(--p-text-color);
        font-size: 0.85rem;
      }
    }

    .upcoming-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 3px;
    }

    .upcoming-client {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .upcoming-service {
      font-size: 0.8rem;
      color: var(--p-text-secondary-color);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;

      &::before {
        content: '•';
        color: var(--p-primary-color);
        font-weight: 900;
      }
    }

    .empty-state {
      font-size: 0.9rem;
      color: var(--p-text-secondary-color);
      font-style: italic;
      text-align: center;
      padding: 32px 16px;
      background: var(--p-surface-50);
      border-radius: 14px;
      border: 1px dashed var(--p-surface-200);
    }
  `,
})
export class CalendarSidebarComponent {
  // Inputs
  selectedDate = input<Date>(new Date());
  stats = input<DailyStats>({ total: 0, confirmed: 0, pending: 0 });
  upcoming = input<UpcomingAppointment[]>([]);

  // Outputs
  dateChange = output<Date>();
  newAppointment = output<void>();
  appointmentClick = output<string>();

  onDateSelect(date: Date) {
    this.dateChange.emit(date);
  }
}
