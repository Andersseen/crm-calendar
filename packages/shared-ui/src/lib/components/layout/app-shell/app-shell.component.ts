import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../../services/layout.service';
import { CrmHeaderComponent } from '../header/header.component';
import { CrmSidebarComponent } from '../sidebar/sidebar.component';
import { CrmAuxPanelComponent } from '../aux-panel/aux-panel.component';
import { NavItem } from '../../../models/nav-item.model';

@Component({
  selector: 'crm-app-shell',
  imports: [
    CommonModule,
    RouterModule,
    CrmHeaderComponent,
    CrmSidebarComponent,
    CrmAuxPanelComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  title = input<string>('CRM Dashboard');
  subtitle = input<string | null>(null);
  navItems = input<NavItem[]>([]);

  public layoutService = inject(LayoutService);

  onSync = output<void>();
}
