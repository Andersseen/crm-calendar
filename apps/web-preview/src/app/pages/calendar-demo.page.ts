import { Component } from '@angular/core';
import { CalendarFeatureExtendedComponent } from '../components/calendar-feature-extended/calendar-feature-extended.component';

@Component({
  selector: 'crm-calendar-demo',
  imports: [CalendarFeatureExtendedComponent],
  template: `
    <div class="calendar-layout-wrapper">
      <crm-calendar-feature-extended />
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
