import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../../services/layout.service';

import { NavItem } from '../../../models/nav-item.model';

@Component({
  selector: 'crm-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrmSidebarComponent {
  navItems = input<NavItem[]>([]);
  public layoutService = inject(LayoutService);
}
