import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  /** Reactive current theme */
  theme = signal<Theme>('light');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Restore from localStorage
      const savedTheme = localStorage.getItem('crm-theme') as Theme;
      if (savedTheme) {
        this.theme.set(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Fallback to system preference
        this.theme.set('dark');
      }

      // Effect to sync attribute on HTML element
      effect(() => {
        const currentTheme = this.theme();
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('crm-theme', currentTheme);
      });
    }
  }

  /** Toggle the current theme */
  toggleTheme(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  /** Set a specific theme */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }
}
