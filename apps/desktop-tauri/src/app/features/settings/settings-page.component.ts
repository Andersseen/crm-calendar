import { Component } from '@angular/core';

@Component({
  selector: 'crm-settings-page',
  standalone: true,
  template: `
    <div class="page-header">
      <h1>Ajustes</h1>
    </div>
    <div class="content-card">
      <h3>Servicios</h3>
      <p>Gestión de servicios del centro — próximamente</p>
    </div>
  `,
  styles: `
    :host { display: block; }
    h3 { margin-bottom: 8px; }
  `,
})
export class SettingsPageComponent {}
