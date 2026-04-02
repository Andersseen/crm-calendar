import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { AuxPanelService } from '../../../services/aux-panel.service';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'crm-aux-panel',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  templateUrl: './aux-panel.component.html',
  styleUrls: ['./aux-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrmAuxPanelComponent {
  public auxPanelService = inject(AuxPanelService);
  public layoutService = inject(LayoutService);
}
