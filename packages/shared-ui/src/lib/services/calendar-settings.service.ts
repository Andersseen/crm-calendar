import { Injectable, signal, effect } from '@angular/core';

export type CalendarEventColorSource = 'employee' | 'service';

const STORAGE_KEY = 'crm-calendar-event-color-source';

@Injectable({ providedIn: 'root' })
export class CalendarSettingsService {
  readonly eventColorSource = signal<CalendarEventColorSource>(this.load());

  constructor() {
    // Persist to localStorage whenever it changes
    effect(() => {
      localStorage.setItem(STORAGE_KEY, this.eventColorSource());
    });
  }

  setEventColorSource(source: CalendarEventColorSource): void {
    this.eventColorSource.set(source);
  }

  private load(): CalendarEventColorSource {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'service' ? 'service' : 'employee';
  }
}
