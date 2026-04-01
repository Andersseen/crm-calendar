import { Component } from '@angular/core';

@Component({
  selector: 'crm-appointment-form',
  standalone: true,
  template: `
    <div class="page-header">
      <h1>Nueva Cita</h1>
    </div>
    <div class="content-card">
      <p>Formulario de citas — próximamente con PrimeNG Forms</p>
    </div>
  `,
  styles: `
    :host { display: block; }
  `,
})
export class AppointmentFormComponent {}
