import { Component } from '@angular/core';
import {
  CalendarFeatureComponent,
  CALENDAR_DATA_PROVIDER,
} from '@crm/shared-ui';
import { MockDataService } from '../services/mock-data.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'crm-calendar-demo',
  standalone: true,
  imports: [CalendarFeatureComponent, ButtonModule],
  providers: [{ provide: CALENDAR_DATA_PROVIDER, useExisting: MockDataService }],
  template: `
    <div class="calendar-layout-wrapper">
      <crm-calendar-feature />
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .calendar-layout-wrapper {
      height: 100%;
      min-height: 600px;
    }
  `,
})
export default class CalendarDemoPage {}
