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
    <crm-app-shell [navItems]="navigationItems" pageTitle="Calendario (Mock)">
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
export default class CalendarDemoPage {
  navigationItems = [
    { label: 'Calendario', icon: 'pi pi-calendar', routerLink: '/calendar' },
    { label: 'Clientes', icon: 'pi pi-users', routerLink: '/clients' },
    { label: 'Empleados', icon: 'pi pi-id-card', routerLink: '/employees' },
  ];
}
