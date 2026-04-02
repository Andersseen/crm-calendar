import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { GoogleCalendarAdapterService } from '../../services/google-calendar-adapter.service';

@Component({
  selector: 'crm-google-calendar-connect',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, DividerModule],
  template: `
    <p-card styleClass="calendar-connect-card">
      <ng-template pTemplate="header">
        <div class="card-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path
                d="M19.5 3.5h-15A2.5 2.5 0 0 0 2 6v12a2.5 2.5 0 0 0 2.5 2.5h15A2.5 2.5 0 0 0 22 18V6a2.5 2.5 0 0 0-2.5-2.5zm-15 1.5h15a1 1 0 0 1 1 1v1.5h-17V6a1 1 0 0 1 1-1zm15 13h-15a1 1 0 0 1-1-1V9.5h17V17a1 1 0 0 1-1 1z"
              />
              <path d="M7 12h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
            </svg>
          </div>
          <h3>Google Calendar</h3>
        </div>
      </ng-template>

      <div class="connection-content">
        @if (isConnected()) {
          <div class="connected-state">
            <div class="status-badge connected">
              <i class="pi pi-check-circle"></i>
              <span>Conectado</span>
            </div>
            <p class="description">
              Tus citas se sincronizarán automáticamente con Google Calendar. Los clientes recibirán
              invitaciones por email.
            </p>
          </div>
        } @else {
          <div class="disconnected-state">
            <div class="status-badge disconnected">
              <i class="pi pi-times-circle"></i>
              <span>No conectado</span>
            </div>
            <p class="description">
              Conecta tu cuenta de Google Calendar para sincronizar citas automáticamente y enviar
              invitaciones a tus clientes.
            </p>
          </div>
        }

        @if (error()) {
          <div class="error-message">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ error() }}</span>
          </div>
        }
      </div>

      <ng-template pTemplate="footer">
        <div class="card-footer">
          @if (isConnected()) {
            <button
              pButton
              type="button"
              label="Desconectar"
              icon="pi pi-sign-out"
              class="p-button-outlined p-button-danger"
              (click)="disconnect()"
              [disabled]="isLoading()"
            ></button>
          } @else {
            <button
              pButton
              type="button"
              label="Conectar con Google"
              icon="pi pi-google"
              class="p-button-primary"
              (click)="connect()"
              [disabled]="isLoading()"
              [loading]="isLoading()"
            ></button>
          }
        </div>
      </ng-template>
    </p-card>
  `,
  styles: `
    :host {
      display: block;
    }

    .calendar-connect-card {
      max-width: 400px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 1.5rem 0.5rem;
    }

    .header-icon {
      color: #4285f4;
    }

    .header-icon svg {
      display: block;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .connection-content {
      padding: 0.5rem 1.5rem;
    }

    .connected-state,
    .disconnected-state {
      text-align: center;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .status-badge.connected {
      background-color: var(--green-100);
      color: var(--green-700);
    }

    .status-badge.disconnected {
      background-color: var(--gray-100);
      color: var(--gray-600);
    }

    .status-badge i {
      font-size: 1rem;
    }

    .description {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: var(--red-50);
      border-radius: 0.5rem;
      color: var(--red-700);
      font-size: 0.875rem;
    }

    .error-message i {
      flex-shrink: 0;
    }

    .card-footer {
      display: flex;
      justify-content: center;
      padding: 1rem 1.5rem 1.5rem;
    }

    ::ng-deep .calendar-connect-card .p-card-content {
      padding: 0;
    }

    ::ng-deep .calendar-connect-card .p-card-footer {
      padding: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleCalendarConnectComponent {
  private readonly googleCalendar = inject(GoogleCalendarAdapterService);

  readonly isConnected = computed(() => this.googleCalendar.isConnected());
  readonly isLoading = computed(() => this.googleCalendar.isLoading());
  readonly error = computed(() => this.googleCalendar.error());

  async connect(): Promise<void> {
    try {
      await this.googleCalendar.connect();
    } catch (err) {
      // Error is already handled in the service
      console.error('Failed to connect:', err);
    }
  }

  async disconnect(): Promise<void> {
    await this.googleCalendar.disconnect();
  }
}
