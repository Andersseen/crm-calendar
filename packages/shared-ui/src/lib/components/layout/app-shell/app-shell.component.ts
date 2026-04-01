import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@shared-ui/services/theme.service';
import { HeaderService } from '@shared-ui/services/header.service';
import { NgTemplateOutlet } from '@angular/common';

export interface NavItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'crm-app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, NgTemplateOutlet],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  title = input<string>('CRM Dashboard');
  subtitle = input<string | null>(null);

  navItems = input<NavItem[]>([]);

  public themeService = inject(ThemeService);
  public headerService = inject(HeaderService);

  onSync = output<void>();
}
