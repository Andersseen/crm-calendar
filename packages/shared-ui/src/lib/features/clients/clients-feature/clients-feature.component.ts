import { Component, inject, viewChild, TemplateRef, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ClientDialogComponent } from '../../../components/client/client-dialog/client-dialog.component';
import { CalendarStateService } from '../../calendar/calendar-state.service';
import { HeaderService } from '../../../services/header.service';
import { UiClient } from '../../calendar/calendar.provider';

@Component({
  selector: 'crm-clients-feature',
  standalone: true,
  imports: [
    CommonModule,
    ClientDialogComponent,
    TableModule,
    ButtonModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './clients-feature.component.html',
  styleUrls: ['./clients-feature.component.scss'],
})
export class ClientsFeatureComponent implements OnDestroy, AfterViewInit {
  public readonly state = inject(CalendarStateService);
  private confirmationService = inject(ConfirmationService);
  private headerService = inject(HeaderService);

  readonly headerActions = viewChild<TemplateRef<any>>('headerActions');

  dialogVisible = signal(false);
  selectedClient = signal<UiClient | null>(null);

  constructor() {
    // Note: Data loading is handled by the state service which is provided at a higher level (usually in the app or shell)
  }

  ngAfterViewInit() {
    const template = this.headerActions();
    if (template) {
      this.headerService.setActions(template);
    }
  }

  ngOnDestroy() {
    this.headerService.clearActions(this.headerActions() || null);
  }

  openNew() {
    this.selectedClient.set(null);
    this.dialogVisible.set(true);
  }

  editClient(client: UiClient) {
    this.selectedClient.set({ ...client });
    this.dialogVisible.set(true);
  }

  deleteClient(client: UiClient) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar a <b>${client.name}</b>? Se perderá todo su historial.`,
      header: 'Eliminar Cliente',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.state.deleteClient(client.id);
      },
    });
  }

  onSave(client: UiClient) {
    this.state.saveClient(client);
    this.dialogVisible.set(false);
  }
}
