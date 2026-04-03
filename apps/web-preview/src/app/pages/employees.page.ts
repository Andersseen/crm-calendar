import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EmployeesFeatureComponent,
  CalendarStateService,
  CALENDAR_DATA_PROVIDER,
} from '@crm/shared-ui';
import { MockDataService } from '../services/mock-data.service';

@Component({
  selector: 'app-employees-page',
  standalone: true,
  imports: [
    CommonModule,
    EmployeesFeatureComponent,
  ],
  providers: [
    CalendarStateService,
    { provide: CALENDAR_DATA_PROVIDER, useExisting: MockDataService },
  ],
  template: `
    <crm-employees-feature />
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export default class EmployeesPage {
  private state = inject(CalendarStateService);

  constructor() {
    // Initial data loading
    this.state.loadInitialData();
  }
}
