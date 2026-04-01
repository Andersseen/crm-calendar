import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IpcService } from '../../core/services/ipc.service';

interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'crm-client-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <h1>Clientes</h1>
      <button class="btn-primary" (click)="showCreateForm = true">
        <i class="pi pi-plus"></i> Nuevo Cliente
      </button>
    </div>

    <div class="content-card">
      <div class="search-bar">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Buscar clientes..."
          (input)="onSearch($event)"
        />
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (client of clients(); track client.id) {
            <tr>
              <td>
                <a [routerLink]="['/clients', client.id]" class="client-link">
                  {{ client.firstName }} {{ client.lastName }}
                </a>
              </td>
              <td>{{ client.email }}</td>
              <td>{{ client.phone }}</td>
              <td>
                <button class="btn-icon" (click)="deleteClient(client.id)">
                  <i class="pi pi-trash"></i>
                </button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="empty-state">
                No hay clientes registrados
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    showCreateForm = false;
  `,
  styles: `
    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--p-surface-100);
      border-radius: 8px;
      margin-bottom: 16px;

      input {
        border: none;
        background: transparent;
        outline: none;
        flex: 1;
        font-size: 0.9rem;
        color: var(--p-text-color);
      }

      i { color: var(--p-surface-400); }
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;

      th {
        text-align: left;
        padding: 12px 16px;
        border-bottom: 2px solid var(--p-surface-200);
        font-weight: 600;
        font-size: 0.8rem;
        text-transform: uppercase;
        color: var(--p-surface-500);
      }

      td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--p-surface-100);
      }

      tbody tr:hover {
        background: var(--p-surface-50);
      }
    }

    .client-link {
      color: var(--p-primary-color);
      text-decoration: none;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--p-primary-color);
      color: var(--p-primary-contrast-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.2s;
      &:hover { opacity: 0.9; }
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--p-surface-400);
      padding: 6px;
      border-radius: 4px;
      &:hover { color: #ef4444; background: #fef2f2; }
    }

    .empty-state {
      text-align: center;
      color: var(--p-surface-400);
      padding: 40px !important;
    }
  `,
})
export class ClientListComponent implements OnInit {
  clients = signal<ClientRow[]>([]);
  showCreateForm = false;

  constructor(private readonly ipc: IpcService) {}

  async ngOnInit() {
    await this.loadClients();
  }

  async loadClients() {
    try {
      const result = await this.ipc.call<ClientRow[]>('client.list');
      this.clients.set(result);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  }

  async onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (query.length < 2) {
      await this.loadClients();
      return;
    }
    try {
      const result = await this.ipc.call<ClientRow[]>('client.search', { query });
      this.clients.set(result);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  async deleteClient(id: string) {
    try {
      await this.ipc.call('client.delete', { id });
      this.clients.update((list) => list.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }
}
