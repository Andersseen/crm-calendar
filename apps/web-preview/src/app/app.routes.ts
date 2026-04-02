import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'calendar',
        pathMatch: 'full',
      },
      {
        path: 'calendar',
        loadComponent: () => import('./pages/calendar-demo.page'),
      },
      {
        path: 'employees',
        loadComponent: () => import('./pages/employees.page'),
      },
      {
        path: 'clients',
        loadComponent: () => import('./pages/clients.page'),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings.page'),
      },
    ],
  },
];
