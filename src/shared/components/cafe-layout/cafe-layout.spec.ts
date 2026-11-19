import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signInForTest } from '../../../features/auth/utils/auth.fixture';
import { HttpCafeProfileRepository } from '../../../features/cafe-profile/services/http-cafe-profile.repository';
import { CAFE_PROFILE_FIXTURE } from '../../../features/cafe-profile/utils/cafe-profile.fixture';
import { toCafeProfile } from '../../../features/cafe-profile/utils/cafe-profile.mapper';
import { CafeLayout } from './cafe-layout';

const EXPECTED_ITEMS = [
  { label: 'Panel', href: '/cafe/dashboard' },
  { label: 'Perfil del local', href: '/cafe/profile' },
  { label: 'Productos', href: '/cafe/products' },
  { label: 'Historial de compras', href: '/cafe/purchases' },
  { label: 'Beneficios', href: '/cafe/benefits' },
  { label: 'Reseñas', href: '/cafe/reviews' },
  { label: 'Validar cupones', href: '/cafe/validate' },
];

describe('CafeLayout', () => {
  let fixture: ComponentFixture<CafeLayout>;
  let root: HTMLElement;

  const navLinks = () => Array.from(root.querySelectorAll<HTMLAnchorElement>('nav[aria-label] a'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: HttpCafeProfileRepository, useValue: { getProfile: () => of(toCafeProfile(CAFE_PROFILE_FIXTURE)) } },
      ],
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

  it('shows the cafe name, the password link, the logout and the night mode in the footer', () => {
    const footer = root.querySelector('aside footer');

    expect(footer?.querySelector('[data-testid="cafe-name"]')?.textContent?.trim()).toBe('Café Central');
    expect(footer?.querySelector('a[href="/cafe/password"]')?.textContent?.trim()).toBe('Cambiar contraseña');
    expect(footer?.querySelector('app-logout-button')?.textContent).toContain('Cerrar sesión');
    expect(footer?.querySelector('app-theme-toggle')).not.toBeNull();
  });

  it('does not link to the client view, even when the cafe is also a client', async () => {
    signInForTest(['ROLE_CAFETERIA', 'ROLE_CLIENTE']);
    await fixture.whenStable();

    expect(root.querySelector('aside footer a[href="/home"]')).toBeNull();
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
