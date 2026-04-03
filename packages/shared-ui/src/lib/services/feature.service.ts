import { Injectable, signal, computed } from '@angular/core';
import { NavItem } from '../models/nav-item.model';

export type FeatureType = 'calendar' | 'clients' | 'employees' | 'settings' | 'reports';

export interface FeatureConfig {
  id: FeatureType;
  label: string;
  icon: string;
  routerLink: string;
  enabled: boolean;
  priority: number;
}

@Injectable({
  providedIn: 'root',
})
export class FeatureService {
  private readonly allFeatures = signal<FeatureConfig[]>([
    {
      id: 'calendar',
      label: 'Calendario',
      icon: 'pi pi-calendar',
      routerLink: '/calendar',
      enabled: true,
      priority: 1,
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: 'pi pi-users',
      routerLink: '/clients',
      enabled: true,
      priority: 2,
    },
    {
      id: 'employees',
      label: 'Empleados',
      icon: 'pi pi-id-card',
      routerLink: '/employees',
      enabled: true,
      priority: 3,
    },
  ]);

  /**
   * The list of navigation items based on currently enabled features.
   */
  readonly navItems = computed<NavItem[]>(() => {
    return this.allFeatures()
      .filter((f) => f.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map((f) => ({
        label: f.label,
        icon: f.icon,
        routerLink: f.routerLink,
      }));
  });

  /**
   * Enable or disable a feature by ID.
   */
  setFeatureEnabled(id: FeatureType, enabled: boolean): void {
    this.allFeatures.update((features) =>
      features.map((f) => (f.id === id ? { ...f, enabled } : f)),
    );
  }

  /**
   * Check if a feature is enabled.
   */
  isFeatureEnabled(id: FeatureType): boolean {
    return this.allFeatures().find((f) => f.id === id)?.enabled ?? false;
  }
}
