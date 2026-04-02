import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { environment } from '../../environments/environment';
import { GoogleCalendarConnectComponent } from '../components/google-calendar-connect/google-calendar-connect.component';
import { GoogleCalendarAdapterService } from '../services/google-calendar-adapter.service';

@Component({
  selector: 'crm-settings-page',
  standalone: true,
  imports: [CommonModule, CardModule, GoogleCalendarConnectComponent],
  template: `
    <div class="settings-container">
      <h1>Configuración</h1>

      <div class="settings-sections">
        <!-- Google Calendar Integration Section -->
        <section class="settings-section">
          <h2>Integraciones</h2>
          <p class="section-description">
            Conecta tus cuentas externas para sincronizar citas automáticamente.
          </p>

          @if (isGoogleCalendarConfigured) {
            <crm-google-calendar-connect />
          } @else {
            <div class="not-configured-notice">
              <i class="pi pi-exclamation-circle"></i>
              <p>
                Google Calendar is not configured yet. Please set up your Google Calendar
                credentials in the environment configuration file.
              </p>
            </div>
          }
        </section>

        <!-- Demo Notice Section -->
        <section class="settings-section demo-section">
          <p-card>
            <div class="demo-content">
              <i class="pi pi-info-circle"></i>
              <div>
                <h3>Versión Demo</h3>
                <p>
                  Esta es una versión de demostración. Las citas se guardan localmente en tu
                  navegador. Para una versión completa con base de datos y sincronización
                  persistente, contacta con nosotros.
                </p>
              </div>
            </div>
          </p-card>
        </section>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 2rem;
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .settings-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .settings-section h2 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .section-description {
      margin: 0 0 1.5rem;
      color: var(--text-color-secondary);
    }

    .demo-section {
      margin-top: 2rem;
    }

    .demo-content {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .demo-content i {
      font-size: 1.5rem;
      color: var(--blue-500);
      flex-shrink: 0;
    }

    .demo-content h3 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .demo-content p {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsPage {
  private readonly googleCalendar = inject(GoogleCalendarAdapterService);

  // Check if Google Calendar is configured
  isGoogleCalendarConfigured = environment.googleCalendar.clientId !== '';

  constructor() {
    // Initialize Google Calendar with environment configuration
    if (this.isGoogleCalendarConfigured) {
      this.googleCalendar.initialize({
        clientId: environment.googleCalendar.clientId,
        apiKey: environment.googleCalendar.apiKey,
        scope: environment.googleCalendar.scope,
      });
    }
  }
}
