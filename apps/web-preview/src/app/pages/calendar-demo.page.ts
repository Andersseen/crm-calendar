import { Component } from '@angular/core';
import {
  AppShellComponent,
  CalendarFeatureComponent,
  CALENDAR_DATA_PROVIDER,
} from '@crm/shared-ui';
import { MockDataService } from '../services/mock-data.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'crm-calendar-demo',

  imports: [AppShellComponent, CalendarFeatureComponent, ButtonModule],
  providers: [{ provide: CALENDAR_DATA_PROVIDER, useExisting: MockDataService }],
  template: `
    <crm-app-shell pageTitle="Calendario (Mock)">
      <div header-actions class="actions-row">
        <p-button label="Sincronizar" icon="pi pi-sync" severity="secondary" [text]="true" />
      </div>

      <div class="calendar-layout-wrapper">
        <crm-calendar-feature />
      </div>
    </crm-app-shell>
  `,
  styles: `
    .calendar-layout-wrapper {
      height: 100%;
      min-height: 600px;
    }

    .actions-row {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  `,
})
export default class CalendarDemoPage {}
