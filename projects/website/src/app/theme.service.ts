import { DOCUMENT, Inject, Injectable, PLATFORM_ID, computed, effect, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser: boolean;
  private readonly systemPrefersDark = signal(false);

  readonly preference = signal<ThemePreference>('system');

  readonly resolved = computed<ResolvedTheme>(() => {
    const pref = this.preference();
    if (pref === 'system') return this.systemPrefersDark() ? 'dark' : 'light';
    return pref;
  });

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const stored = this.readStoredPreference();
      if (stored) this.preference.set(stored);

      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPrefersDark.set(mql.matches);
      mql.addEventListener('change', (e) => this.systemPrefersDark.set(e.matches));
    }

    effect(() => {
      if (!this.isBrowser) return;
      const isDark = this.resolved() === 'dark';
      this.document.documentElement.classList.toggle('dark', isDark);
    });
  }

  setPreference(pref: ThemePreference): void {
    this.preference.set(pref);
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, pref);
      } catch {
        /* ignore quota / privacy-mode errors */
      }
    }
  }

  private readStoredPreference(): ThemePreference | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
    } catch {
      /* ignore privacy-mode errors */
    }
    return null;
  }
}
