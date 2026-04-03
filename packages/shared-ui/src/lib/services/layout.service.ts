import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  /**
   * Whether the sidebar is expanded (true) or collapsed (false).
   */
  readonly sidebarExpanded = signal<boolean>(true);

  /**
   * Whether the auxiliary panel (right side content) is visible.
   */
  readonly auxPanelVisible = signal<boolean>(false);

  /**
   * Whether the auxiliary panel is collapsed (if visible).
   */
  readonly auxPanelExpanded = signal<boolean>(true);

  toggleSidebar(): void {
    this.sidebarExpanded.update((val) => !val);
  }

  setSidebarExpanded(expanded: boolean): void {
    this.sidebarExpanded.set(expanded);
  }

  toggleAuxPanel(): void {
    this.auxPanelVisible.update((val) => !val);
  }

  setAuxPanelVisible(visible: boolean): void {
    this.auxPanelVisible.set(visible);
  }
}
