import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full',
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./features/calendar/calendar-page.component').then(
        (m) => m.CalendarPageComponent,
      ),
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./features/clients/client-list.component').then(
        (m) => m.ClientListComponent,
      ),
  },
  {
    path: 'clients/:id',
    loadComponent: () =>
      import('./features/clients/client-detail.component').then(
        (m) => m.ClientDetailComponent,
      ),
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./features/appointments/appointment-form.component').then(
        (m) => m.AppointmentFormComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings-page.component').then(
        (m) => m.SettingsPageComponent,
      ),
  },
];
