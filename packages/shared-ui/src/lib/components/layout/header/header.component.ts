import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import { HeaderService } from '../../../services/header.service';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'crm-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrmHeaderComponent {
  title = input<string>('CRM Dashboard');
  subtitle = input<string | null>(null);

  public themeService = inject(ThemeService);
  public headerService = inject(HeaderService);
  public layoutService = inject(LayoutService);
}
