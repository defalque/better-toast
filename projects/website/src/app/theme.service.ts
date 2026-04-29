import {
  DOCUMENT,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const FAVICON_BY_THEME: Record<ResolvedTheme, string> = {
  light: '/favicon-light.ico',
  dark: '/favicon-dark.ico',
};

const APPLE_TOUCH_ICON_BY_THEME: Record<ResolvedTheme, string> = {
  light: '/apple-touch-icon-light.png',
  dark: '/apple-touch-icon-dark.png',
};

const THEME_COLOR_BY_THEME: Record<ResolvedTheme, string> = {
  light: '#ffffff',
  dark: '#0a0a0a',
};

const OG_SHARE_IMAGE_PATH: Record<ResolvedTheme, string> = {
  light: '/og-light.png',
  dark: '/og-dark.png',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser: boolean;
  private readonly systemPrefersDark = signal(false);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly preference = signal<ThemePreference>('system');

  readonly resolved = computed<ResolvedTheme>(() => {
    const pref = this.preference();
    if (pref === 'system') return this.systemPrefersDark() ? 'dark' : 'light';
    return pref;
  });

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const stored = this.readStoredPreference();
      if (stored) this.preference.set(stored);

      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPrefersDark.set(mql.matches);
      mql.addEventListener('change', (e) => this.systemPrefersDark.set(e.matches));
    }

    effect(() => {
      if (!this.isBrowser) return;
      const resolved = this.resolved();
      const isDark = resolved === 'dark';
      this.document.documentElement.classList.toggle('dark', isDark);
      this.updateFavicon(resolved);
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

  private updateFavicon(theme: ResolvedTheme): void {
    this.document.getElementById('app-favicon')?.setAttribute('href', FAVICON_BY_THEME[theme]);
    this.document
      .getElementById('app-apple-touch-icon')
      ?.setAttribute('href', APPLE_TOUCH_ICON_BY_THEME[theme]);
    this.document
      .getElementById('app-theme-color')
      ?.setAttribute('content', THEME_COLOR_BY_THEME[theme]);
    const origin = window.location.origin;
    const ogUrl = origin + OG_SHARE_IMAGE_PATH[theme];
    this.document.getElementById('app-og-image')?.setAttribute('content', ogUrl);
    this.document.getElementById('app-twitter-image')?.setAttribute('content', ogUrl);
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
