import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AppShellComponent, NavItem } from '@crm/shared-ui';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AppShellComponent],
  template: `
    <crm-app-shell [navItems]="navigationItems" [title]="pageTitle()">
      <router-outlet />
    </crm-app-shell>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
  `
})
export class MainLayoutComponent {
  private router = inject(Router);

  navigationItems: NavItem[] = [
    { label: 'Calendario', icon: 'pi pi-calendar', routerLink: '/calendar' },
    { label: 'Clientes', icon: 'pi pi-users', routerLink: '/clients' },
    { label: 'Empleados', icon: 'pi pi-id-card', routerLink: '/employees' },
  ];

  // Derive page title from current URL
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    )
  );

  pageTitle = computed(() => {
    const url = this.currentUrl() || '';
    if (url.includes('/calendar')) return 'Dashboard de Citas';
    if (url.includes('/employees')) return 'Gestión de Empleados';
    if (url.includes('/clients')) return 'Directorio de Clientes';
    return 'CRM Dashboard';
  });
}
