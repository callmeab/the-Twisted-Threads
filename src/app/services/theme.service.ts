import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

const STORAGE_KEY = 'tt_theme';
export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private prefersDarkMedia = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  public readonly isDark = signal<boolean>(false);

  constructor() {
    // initialize based on stored preference or system
    const stored = this.getStored();
    if (stored) {
      this.apply(stored === 'dark');
    } else if (this.prefersDarkMedia) {
      this.apply(this.prefersDarkMedia.matches);
    }

    // listen for system changes
    if (this.prefersDarkMedia && this.prefersDarkMedia.addEventListener) {
      this.prefersDarkMedia.addEventListener('change', e => {
        const storedPref = this.getStored();
        if (!storedPref) {
          this.apply(e.matches);
        }
      });
    }
  }

  private getStored(): Theme | null {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'dark' || v === 'light') return v;
      return null;
    } catch {
      return null;
    }
  }

  private store(theme: Theme | null): void {
    try {
      if (theme) {
        localStorage.setItem(STORAGE_KEY, theme);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }

  apply(dark: boolean): void {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark-mode');
      this.isDark.set(true);
      this.store('dark');
    } else {
      root.classList.remove('dark-mode');
      this.isDark.set(false);
      this.store('light');
    }
  }

  toggle(): void {
    this.apply(!this.isDark());
  }
}
