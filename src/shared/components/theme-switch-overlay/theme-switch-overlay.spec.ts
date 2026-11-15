import { ComponentFixture, TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, THEME_SWITCH_DURATION_MS, ThemeService } from '../../services/theme';
import { ThemeSwitchOverlay } from './theme-switch-overlay';

describe('ThemeSwitchOverlay', () => {
  let fixture: ComponentFixture<ThemeSwitchOverlay>;
  let theme: ThemeService;

  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove('dark', 'theme-switching');
    await TestBed.configureTestingModule({ imports: [ThemeSwitchOverlay] }).compileComponents();
    fixture = TestBed.createComponent(ThemeSwitchOverlay);
    theme = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove('dark', 'theme-switching');
  });

  const overlay = () => fixture.nativeElement.querySelector('[role="status"]') as HTMLElement | null;

  it('stays hidden until the theme changes', () => {
    expect(overlay()).toBeNull();
  });

  it('shows the moon and a message while the night mode turns on', () => {
    theme.toggle();
    fixture.detectChanges();

    expect(overlay()?.textContent).toContain('Activando modo nocturno…');
    expect(overlay()?.classList).toContain('theme-overlay');
  });

  it('says it is going back to light mode on the second toggle', () => {
    theme.toggle();
    theme.toggle();
    fixture.detectChanges();

    expect(overlay()?.textContent).toContain('Activando modo claro…');
  });

  it('disappears once the animation ends', () => {
    theme.toggle();
    fixture.detectChanges();

    vi.advanceTimersByTime(THEME_SWITCH_DURATION_MS);
    fixture.detectChanges();

    expect(overlay()).toBeNull();
  });
});
