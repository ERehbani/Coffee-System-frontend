import { ComponentFixture, TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from '../../services/theme';
import { ThemeToggle, ThemeToggleAppearance } from './theme-toggle';

describe('ThemeToggle', () => {
  function render(appearance?: ThemeToggleAppearance): ComponentFixture<ThemeToggle> {
    const fixture = TestBed.createComponent(ThemeToggle);
    if (appearance) {
      fixture.componentRef.setInput('appearance', appearance);
    }
    fixture.detectChanges();
    return fixture;
  }

  const button = (fixture: ComponentFixture<ThemeToggle>) =>
    fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  beforeEach(async () => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove('dark');
    await TestBed.configureTestingModule({ imports: [ThemeToggle] }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove('dark');
  });

  it('offers the night mode while the app is light', () => {
    const fixture = render();

    expect(button(fixture).getAttribute('aria-label')).toBe('Activar modo nocturno');
    expect(button(fixture).getAttribute('aria-pressed')).toBe('false');
  });

  it('switches to the night mode and offers to go back to light', () => {
    const fixture = render();

    button(fixture).click();
    fixture.detectChanges();

    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
    expect(button(fixture).getAttribute('aria-label')).toBe('Activar modo claro');
    expect(button(fixture).getAttribute('aria-pressed')).toBe('true');
  });

  it('appears with its colors and only animates them once it is on screen', async () => {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.componentRef.setInput('appearance', 'card');

    fixture.componentRef.changeDetectorRef.detectChanges();

    expect(button(fixture).className).toContain('bg-surface');
    expect(button(fixture).className).not.toContain('transition-colors');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(button(fixture).className).toContain('transition-colors');
  });

  it('looks like the cart button next to it in the client headers', () => {
    expect(button(render('card')).className).toContain('size-11');
    expect(button(render('pill')).className).toContain('rounded-full');
  });
});
