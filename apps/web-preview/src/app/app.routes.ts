import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full',
  },
  {
    path: 'calendar',
    loadComponent: () => import('./pages/calendar-demo.page').then(m => m.default),
  },
  {
    path: 'employees',
    loadComponent: () => import('./pages/employees.page').then(m => m.default),
  },
  {
    path: 'clients',
    loadComponent: () => import('./pages/clients.page').then(m => m.default),
  },
];
