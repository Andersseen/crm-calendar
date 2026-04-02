import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ClientsFeatureComponent,
  CalendarStateService,
  CALENDAR_DATA_PROVIDER,
} from '@crm/shared-ui';
import { MockDataService } from '../services/mock-data.service';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    CommonModule,
    ClientsFeatureComponent,
  ],
  providers: [
    CalendarStateService,
    { provide: CALENDAR_DATA_PROVIDER, useExisting: MockDataService },
  ],
  template: `
    <crm-clients-feature />
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export default class ClientsPage {
  private state = inject(CalendarStateService);

  constructor() {
    // Initial data loading
    this.state.loadInitialData();
  }
}
