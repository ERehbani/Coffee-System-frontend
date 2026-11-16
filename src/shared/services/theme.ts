import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'coffee-theme';

export const THEME_SWITCH_DURATION_MS = 700;

function readSavedTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private switchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly theme = signal<Theme>(readSavedTheme());
  readonly switchingTo = signal<Theme | null>(null);

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.classList.toggle('dark', theme === 'dark');
      saveTheme(theme);
    });
    effect(() => {
      this.document.documentElement.classList.toggle('theme-switching', this.switchingTo() !== null);
    });
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.switchingTo.set(next);
    if (this.switchTimer) {
      clearTimeout(this.switchTimer);
    }
    this.switchTimer = setTimeout(() => {
      this.switchingTo.set(null);
      this.switchTimer = null;
    }, THEME_SWITCH_DURATION_MS);
  }
}
