import { Injectable, signal, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuxPanelService {
  /**
   * Current template to render in the auxiliary panel.
   */
  readonly currentTemplate = signal<TemplateRef<any> | null>(null);

  /**
   * Optional title for the auxiliary panel.
   */
  readonly title = signal<string | null>(null);

  /**
   * Set the template and title for the aux panel.
   */
  setPanel(template: TemplateRef<any>, title: string | null = null): void {
    this.currentTemplate.set(template);
    this.title.set(title);
  }

  /**
   * Clear the aux panel content.
   */
  clearPanel(template?: TemplateRef<any>): void {
    // Only clear if the template matches the current one (to avoid accidental clears from previous components)
    if (!template || this.currentTemplate() === template) {
      this.currentTemplate.set(null);
      this.title.set(null);
    }
  }
}
