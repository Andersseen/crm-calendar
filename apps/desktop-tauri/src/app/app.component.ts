import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'crm-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <nav class="sidebar">
        <div class="sidebar-brand">
          <i class="pi pi-calendar"></i>
          <span>CRM Estética</span>
        </div>
        <ul class="sidebar-nav">
          <li>
            <a routerLink="/calendar" routerLinkActive="active">
              <i class="pi pi-calendar"></i>
              <span>Calendario</span>
            </a>
          </li>
          <li>
            <a routerLink="/clients" routerLinkActive="active">
              <i class="pi pi-users"></i>
              <span>Clientes</span>
            </a>
          </li>
          <li>
            <a routerLink="/appointments" routerLinkActive="active">
              <i class="pi pi-clock"></i>
              <span>Citas</span>
            </a>
          </li>
          <li>
            <a routerLink="/settings" routerLinkActive="active">
              <i class="pi pi-cog"></i>
              <span>Ajustes</span>
            </a>
          </li>
        </ul>
      </nav>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'CRM Estética';
}
