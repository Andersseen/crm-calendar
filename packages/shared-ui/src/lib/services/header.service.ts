import { Injectable, signal, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  /** The current template to render in the header actions area */
  private actionsTemplate = signal<TemplateRef<any> | null>(null);

  /** Signal to expose the template to the AppShell */
  readonly currentActions = this.actionsTemplate.asReadonly();

  /** 
   * Sets the current header actions template.
   * Call with null to clear the actions.
   */
  setActions(template: TemplateRef<any> | null): void {
    this.actionsTemplate.set(template);
  }

  /**
   * Clears the current header actions only if it matches the provided template.
   * This prevents race conditions during navigation.
   */
  clearActions(template: TemplateRef<any> | null): void {
    if (this.actionsTemplate() === template) {
      this.actionsTemplate.set(null);
    }
  }
}
