import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, THEME_SWITCH_DURATION_MS, ThemeService } from './theme';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove('dark');
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove('dark');
  });

  it('starts in light mode when nothing was chosen', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.flushEffects();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('turns the night mode on and remembers it', () => {
    const service = TestBed.inject(ThemeService);

    service.toggle();
    TestBed.flushEffects();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('starts in the mode the user chose before', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const service = TestBed.inject(ThemeService);
    TestBed.flushEffects();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('goes back to light mode on a second toggle', () => {
    const service = TestBed.inject(ThemeService);

    service.toggle();
    service.toggle();
    TestBed.flushEffects();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('shows the switching screen while the colors change and hides it afterwards', () => {
    vi.useFakeTimers();
    const service = TestBed.inject(ThemeService);

    service.toggle();
    TestBed.flushEffects();

    expect(service.switchingTo()).toBe('dark');
    expect(document.documentElement.classList.contains('theme-switching')).toBe(true);

    vi.advanceTimersByTime(THEME_SWITCH_DURATION_MS);
    TestBed.flushEffects();

    expect(service.switchingTo()).toBeNull();
    expect(document.documentElement.classList.contains('theme-switching')).toBe(false);
    vi.useRealTimers();
  });

  it('restarts the switching screen when the user toggles again quickly', () => {
    vi.useFakeTimers();
    const service = TestBed.inject(ThemeService);

    service.toggle();
    vi.advanceTimersByTime(THEME_SWITCH_DURATION_MS - 100);
    service.toggle();
    vi.advanceTimersByTime(200);

    expect(service.switchingTo()).toBe('light');

    vi.advanceTimersByTime(THEME_SWITCH_DURATION_MS);
    expect(service.switchingTo()).toBeNull();
    vi.useRealTimers();
  });
});
