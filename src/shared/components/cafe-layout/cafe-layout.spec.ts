import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signInForTest } from '../../../features/auth/utils/auth.fixture';
import { CafeLayout } from './cafe-layout';

const EXPECTED_ITEMS = [
  { label: 'Panel', href: '/cafe/dashboard' },
  { label: 'Perfil del local', href: '/cafe/profile' },
  { label: 'Productos', href: '/cafe/products' },
  { label: 'Beneficios', href: '/cafe/benefits' },
  { label: 'Validar cupones', href: '/cafe/validate' },
];

describe('CafeLayout', () => {
  let fixture: ComponentFixture<CafeLayout>;
  let root: HTMLElement;

  const navLinks = () => Array.from(root.querySelectorAll<HTMLAnchorElement>('nav[aria-label] a'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(CafeLayout);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('lists the sections of the cafe inside its own navigation landmark', () => {
    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Mi cafetería');
    expect(navLinks().map((link) => link.textContent?.trim())).toEqual(EXPECTED_ITEMS.map((item) => item.label));
    expect(navLinks().map((link) => link.getAttribute('href'))).toEqual(EXPECTED_ITEMS.map((item) => item.href));
  });

  it('offers the night mode and the logout in the footer', () => {
    const footer = root.querySelector('aside footer');

    expect(footer?.textContent).toContain('Cafetería');
    expect(footer?.querySelector('app-theme-toggle')).not.toBeNull();
    expect(footer?.querySelector('app-logout-button')).not.toBeNull();
  });

  it('links to the client view only when the cafe is also a client', async () => {
    signInForTest(['ROLE_CAFETERIA']);
    await fixture.whenStable();
    expect(root.querySelector('aside footer a[href="/home"]')).toBeNull();

    signInForTest(['ROLE_CAFETERIA', 'ROLE_CLIENTE']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector('aside footer a[href="/home"]')?.textContent?.trim()).toBe('Vista cliente');
  });

  it('opens and closes the sidebar on small screens', () => {
    const button = root.querySelector<HTMLButtonElement>('button[aria-controls="cafe-sidebar"]');

    button?.click();
    fixture.detectChanges();
    expect(button?.getAttribute('aria-expanded')).toBe('true');

    root.querySelector<HTMLElement>('[data-testid="cafe-backdrop"]')?.click();
    fixture.detectChanges();
    expect(button?.getAttribute('aria-expanded')).toBe('false');
  });
});
