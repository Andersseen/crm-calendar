import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'crm-app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <nav class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">
            <i class="pi pi-sparkles"></i>
          </div>
          <span>CRM Estética</span>
        </div>

        <div class="sidebar-menu">
          <ul class="nav-list">
            <li class="nav-item">
              <a routerLink="/calendar" routerLinkActive="active" class="nav-link">
                <i class="pi pi-calendar"></i>
                <span class="nav-text">Calendario</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/employees" routerLinkActive="active" class="nav-link">
                <i class="pi pi-users"></i>
                <span class="nav-text">Empleados</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/clients" routerLinkActive="active" class="nav-link">
                <i class="pi pi-address-book"></i>
                <span class="nav-text">Clientes</span>
              </a>
            </li>
          </ul>

          <div class="nav-divider"></div>

          <ul class="nav-list">
            <li class="nav-item">
              <a routerLink="/settings" routerLinkActive="active" class="nav-link disabled-link">
                <i class="pi pi-cog"></i>
                <span class="nav-text">Ajustes</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="sidebar-footer">
          <div class="status-indicator">
            <div class="status-dot" [class.connected]="isConnected()"></div>
            <span class="status-text">{{ isConnected() ? 'Sidecar Conectado' : 'Modo Mock Local' }}</span>
          </div>
        </div>
      </nav>

      <!-- Main Content Container -->
      <div class="main-container">
        <!-- Header -->
        <header class="app-header">
          <div class="header-content">
            <h1 class="page-title">{{ pageTitle() }}</h1>
            
            <div class="header-actions">
              <ng-content select="[header-actions]"></ng-content>
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="main-content">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .app-layout {
      display: flex;
      height: 100vh;
      background: transparent;
    }

    /* --- Sidebar --- */
    .sidebar {
      width: 280px;
      min-width: 280px;
      background: var(--p-surface-0);
      border-right: 1px solid var(--p-surface-200);
      display: flex;
      flex-direction: column;
      z-index: 20;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 32px 24px;
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--p-text-color);
      letter-spacing: -0.03em;
    }

    .brand-icon {
      background: linear-gradient(135deg, var(--p-primary-color) 0%, var(--p-primary-600) 100%);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px color-mix(in srgb, var(--p-primary-color) 30%, transparent);
      
      i {
        font-size: 1.2rem;
        font-size: 20px;
        color: white;
      }
    }

    .brand-name {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(to right, #fff, var(--slate-300));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .sidebar-menu {
      flex: 1;
      padding: 0 16px;
    }

    .nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--slate-400);
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
      position: relative;

      i {
        font-size: 1.1rem;
        transition: transform 0.2s ease;
      }

      &:hover {
        color: white;
        background: rgba(255, 255, 255, 0.05);
        
        i {
          transform: translateX(2px);
        }
      }

      &.active {
        color: white;
        background: rgba(16, 185, 129, 0.1);
        box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.2);

        i {
          color: var(--emerald-500);
        }

        &::after {
          content: '';
          position: absolute;
          left: -16px;
          top: 12px;
          bottom: 12px;
          width: 4px;
          background: var(--emerald-500);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px var(--emerald-500);
        }
      }
    }

    .nav-divider {
      height: 1px;
      background: var(--slate-800);
      margin: 24px 16px;
    }

    .disabled-link {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .sidebar-footer {
      padding: 24px;
      border-top: 1px solid var(--slate-800);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      font-size: 0.85rem;
      letter-spacing: 0.2px;
    }

    /* --- Main Container --- */
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .app-header {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      padding: 0 40px;
      height: 80px;
      min-height: 80px;
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--p-text-color);
      letter-spacing: -0.04em;
      margin: 0;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 40px;
      background: transparent;
    }
  `,
})
export class AppShellComponent {
  pageTitle = input<string>('');
  isConnected = input<boolean>(false);
}
