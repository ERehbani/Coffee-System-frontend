import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { ProfileRepository } from '../../services/profile.repository';
import { ProfileStore } from '../../services/profile.store';
import { ActiveRedemption, ProfileDashboard } from '../../types/profile.model';
import { buildProfileDashboardFixture } from '../../utils/profile.fixture';
import { toProfileDashboard } from '../../utils/profile.mapper';
import { CouponsPage } from './coupons-page';

const DAY_MS = 24 * 60 * 60 * 1000;

const coupons: ActiveRedemption[] = [
  {
    id: 'redemption-2',
    title: '2x1 en medialunas',
    description: 'Dos medialunas por el precio de una',
    code: 'VLD-2201-B4KE',
    expiresAt: new Date(Date.now() + 12 * DAY_MS),
    expiresAtHasTime: true,
    cafeName: 'Cafe Norte',
    conditions: [],
  },
  {
    id: 'redemption-1',
    title: 'Descuento 15% bienvenida',
    description: 'Válido en cualquier sucursal adherida',
    code: 'VLD-8492-C0FF',
    expiresAt: null,
    expiresAtHasTime: false,
    cafeName: null,
    conditions: [],
  },
];

function dashboardWith(activeRedemptions: readonly ActiveRedemption[]): ProfileDashboard {
  return { ...toProfileDashboard(buildProfileDashboardFixture(new Date())), activeRedemptions };
}

describe('CouponsPage', () => {
  let fixture: ComponentFixture<CouponsPage>;
  let element: HTMLElement;

  async function render(getDashboard: () => Observable<ProfileDashboard>) {
    await TestBed.configureTestingModule({
      imports: [CouponsPage],
      providers: [
        provideRouter([]),
        ProfileStore,
        { provide: ProfileRepository, useValue: { getDashboard } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CouponsPage);
    TestBed.flushEffects();
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  it('titles the page "Mis cupones" with a link back to the profile', async () => {
    await render(() => of(dashboardWith(coupons)));

    expect(element.querySelector('h1')?.textContent).toContain('Mis cupones');
    const back = element.querySelector('header a');
    expect(back?.getAttribute('href')).toBe('/profile');
    expect(back?.querySelector('app-icon')?.getAttribute('aria-label')).toBe('Volver al perfil');
  });

  it('CA1: lists only the coupons that are ready to use', async () => {
    const expired = { ...coupons[0], id: 'expired', expiresAt: new Date(Date.now() - DAY_MS) };
    await render(() => of(dashboardWith([expired, ...coupons])));

    const items = element.querySelectorAll('app-coupon-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('2x1 en medialunas');
    expect(items[1].textContent).toContain('Descuento 15% bienvenida');
    expect(element.textContent).not.toContain('expired');
  });

  it('CA2: each coupon opens its redeem view through "Ver código"', async () => {
    await render(() => of(dashboardWith(coupons)));

    const links = Array.from(element.querySelectorAll('app-coupon-item a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/profile/redemptions/redemption-2',
      '/profile/redemptions/redemption-1',
    ]);
  });

  it('shows an empty state that points to the benefits when nothing is ready', async () => {
    await render(() => of(dashboardWith([])));

    expect(element.querySelector('app-coupon-item')).toBeNull();
    expect(element.textContent).toContain('Todavía no tienes cupones listos para usar.');
    const activate = Array.from(element.querySelectorAll('a')).find((link) =>
      link.textContent?.includes('Activar beneficios'),
    );
    expect(activate?.getAttribute('href')).toBe('/profile/tier');
  });

  it('shows a loading state while the coupons are loading', async () => {
    await render(() => new Subject<ProfileDashboard>());

    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(element.textContent).toContain('Cargando tus cupones');
    expect(element.querySelector('app-coupon-item')).toBeNull();
  });

  it('shows an error and reloads the dashboard when "Reintentar" is clicked', async () => {
    let calls = 0;
    await render(() =>
      ++calls === 1 ? throwError(() => new Error('500')) : of(dashboardWith(coupons)),
    );

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar tus cupones',
    );

    const retry = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Reintentar'),
    );
    retry!.click();
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(calls).toBe(2);
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelectorAll('app-coupon-item').length).toBe(2);
  });
});
