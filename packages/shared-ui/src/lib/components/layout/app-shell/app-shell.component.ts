import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@shared-ui/services/theme.service';

export interface NavItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'crm-app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  title = input<string>('CRM Dashboard');

  navItems = input<NavItem[]>([]);

  public themeService = inject(ThemeService);

  onSync = output<void>();
}
