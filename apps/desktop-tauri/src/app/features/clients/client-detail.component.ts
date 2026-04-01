import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IpcService } from '../../core/services/ipc.service';

interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

@Component({
  selector: 'crm-client-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/clients" class="back-link">
          <i class="pi pi-arrow-left"></i> Volver
        </a>
        <h1>{{ client()?.firstName }} {{ client()?.lastName }}</h1>
      </div>
    </div>

    @if (client(); as c) {
      <div class="content-card">
        <div class="detail-grid">
          <div class="detail-item">
            <label>Email</label>
            <p>{{ c.email }}</p>
          </div>
          <div class="detail-item">
            <label>Teléfono</label>
            <p>{{ c.phone }}</p>
          </div>
          <div class="detail-item">
            <label>Notas</label>
            <p>{{ c.notes || 'Sin notas' }}</p>
          </div>
          <div class="detail-item">
            <label>Registrado</label>
            <p>{{ c.createdAt }}</p>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--p-surface-500);
      text-decoration: none;
      font-size: 0.85rem;
      margin-bottom: 8px;
      &:hover { color: var(--p-primary-color); }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .detail-item {
      label {
        display: block;
        font-size: 0.8rem;
        text-transform: uppercase;
        color: var(--p-surface-500);
        font-weight: 600;
        margin-bottom: 4px;
      }
      p {
        font-size: 1rem;
        color: var(--p-text-color);
      }
    }
  `,
})
export class ClientDetailComponent implements OnInit {
  client = signal<ClientDetail | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ipc: IpcService,
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const result = await this.ipc.call<ClientDetail>('client.get', { id });
        this.client.set(result);
      } catch (error) {
        console.error('Failed to load client:', error);
      }
    }
  }
}
