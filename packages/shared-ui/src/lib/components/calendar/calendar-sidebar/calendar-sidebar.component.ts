import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CalendarEventInput } from '@shared-ui/components/calendar/crm-calendar/crm-calendar.component';

@Component({
  selector: 'crm-calendar-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DatePickerModule],
  templateUrl: './calendar-sidebar.component.html',
  styleUrls: ['./calendar-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarSidebarComponent {
  // === Inputs ===
  selectedDate = input<Date>(new Date());
  totalAppointments = input<number>(0);
  confirmedCount = input<number>(0);
  pendingCount = input<number>(0);
  upcomingAppointments = input<CalendarEventInput[]>([]);

  // === Outputs ===
  dateChange = output<Date>();
  newAppointment = output<void>();
  appointmentClick = output<string>();
  statusFilterChange = output<'total' | 'confirmed' | 'pending'>();

  onDateSelect(date: Date): void {
    if (date) {
      this.dateChange.emit(date);
    }
  }

  filterByStatus(status: 'total' | 'confirmed' | 'pending'): void {
    this.statusFilterChange.emit(status);
  }
}
