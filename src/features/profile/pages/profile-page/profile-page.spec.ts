import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ProfileRepository } from '../../services/profile.repository';
import { ProfileStore } from '../../services/profile.store';
import { ProfileDashboard, RedeemedBenefit } from '../../types/profile.model';
import { buildProfileDashboardFixture } from '../../utils/profile.fixture';
import { toProfileDashboard } from '../../utils/profile.mapper';
import { ProfilePage } from './profile-page';
import { signInForTest } from '../../../auth/utils/auth.fixture';

describe('ProfilePage coupon entry points', () => {
  let fixture: ComponentFixture<ProfilePage>;
  let element: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        ProfileStore,
        {
          provide: ProfileRepository,
          useValue: {
            getDashboard: () => of(toProfileDashboard(buildProfileDashboardFixture(new Date()))),
          },
        },
      ],
    }).compileComponents();
    signInForTest(['ROLE_CLIENTE']);

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ProfilePage);
    TestBed.flushEffects();
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('opens the my coupons page from the "Mis cupones" quick action', () => {
    const tile = Array.from(element.querySelectorAll('app-quick-actions button')).find((button) =>
      button.textContent?.includes('Mis cupones'),
    ) as HTMLButtonElement;

    tile.click();

    expect(router.navigate).toHaveBeenCalledWith(['/profile/coupons']);
  });

  it('opens the list of benefits from the "Canjear puntos" quick action', () => {
    const tile = Array.from(element.querySelectorAll('app-quick-actions button')).find((button) =>
      button.textContent?.includes('Canjear puntos'),
    ) as HTMLButtonElement;

    tile.click();

    expect(router.navigate).toHaveBeenCalledWith(['/rewards']);
  });

  it('makes every quick action a tappable row of the list', () => {
    const tiles = Array.from(element.querySelectorAll('app-quick-actions button'));

    expect(tiles.length).toBe(4);
    for (const tile of tiles) {
      expect(tile.classList).toContain('list-row');
    }
  });
});

describe('ProfilePage featured benefits', () => {
  const dashboard = toProfileDashboard(buildProfileDashboardFixture(new Date()));
  const redeemed: RedeemedBenefit = {
    id: 'redemption-9',
    validationCode: 'XYZ',
    benefitName: 'Capuccino por tus puntos',
    cafeName: null,
    usedPoints: 300,
    redeemedAt: new Date(2026, 10, 17),
  };
  let getDashboard: Mock<() => Observable<ProfileDashboard>>;
  let redeemBenefit: Mock<(benefitId: string) => Observable<RedeemedBenefit>>;
  let router: Router;
  let toast: ToastService;
  let fixture: ComponentFixture<ProfilePage>;
  let element: HTMLElement;

  function click(text: string): void {
    const button = (Array.from(element.querySelectorAll('button')) as HTMLButtonElement[]).find((candidate) =>
      candidate.textContent?.includes(text),
    );
    button?.click();
    TestBed.flushEffects();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    getDashboard = vi.fn(() => of(dashboard));
    redeemBenefit = vi.fn(() => of(redeemed));
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        ProfileStore,
        { provide: ProfileRepository, useValue: { getDashboard, redeemBenefit } },
      ],
    }).compileComponents();
    signInForTest(['ROLE_CLIENTE']);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    toast = TestBed.inject(ToastService);
    vi.spyOn(toast, 'success');
    vi.spyOn(toast, 'error');
    fixture = TestBed.createComponent(ProfilePage);
    TestBed.flushEffects();
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('takes the client to the list of benefits from "Ver todos" of the featured ones', () => {
    const section = element.querySelector('section[aria-labelledby="featured-benefits-heading"]');
    const action = Array.from(section!.querySelectorAll('button')).find((button) => button.textContent?.includes('Ver todos'));

    action?.click();

    expect(element.textContent).not.toContain('Ver catálogo');
    expect(router.navigate).toHaveBeenCalledWith(['/rewards']);
  });

  it('asks to confirm the cost and redeems the benefit only after confirming', () => {
    click('Canjear Capuccino por tus puntos');

    expect(element.textContent).toContain('¿Canjear Capuccino por tus puntos por 300 pts?');
    expect(redeemBenefit).not.toHaveBeenCalled();

    click('Confirmar');

    expect(redeemBenefit).toHaveBeenCalledExactlyOnceWith('benefit-capuccino');
  });

  it('confirms the redeem in a toast and loads the dashboard again for the new points', () => {
    click('Canjear Capuccino por tus puntos');

    click('Confirmar');

    expect(toast.success).toHaveBeenCalledWith('¡Canjeaste Capuccino por tus puntos! Tu cupón ya está en Mis cupones.');
    expect(getDashboard).toHaveBeenCalledTimes(2);
  });

  it('leaves the redeem aside when the client cancels the confirmation', () => {
    click('Canjear Capuccino por tus puntos');

    click('Cancelar');

    expect(redeemBenefit).not.toHaveBeenCalled();
    expect(element.textContent).not.toContain('¿Canjear');
  });

  it('shows the reason of the backend in a toast when the redeem is rejected', () => {
    redeemBenefit.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'El beneficio está agotado' } })),
    );
    click('Canjear Capuccino por tus puntos');

    click('Confirmar');

    expect(toast.error).toHaveBeenCalledWith('Este beneficio ya no tiene canjes disponibles.');
    expect(getDashboard).toHaveBeenCalledOnce();
  });
});

describe('ProfilePage loading', () => {
  const dashboard = toProfileDashboard(buildProfileDashboardFixture(new Date()));
  let getDashboard: Mock<() => Observable<ProfileDashboard>>;

  async function settle(): Promise<void> {
    TestBed.flushEffects();
    await Promise.resolve();
    TestBed.flushEffects();
  }

  function openPage(): ComponentFixture<ProfilePage> {
    const fixture = TestBed.createComponent(ProfilePage);
    TestBed.flushEffects();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    getDashboard = vi.fn(() => of(dashboard));
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        ProfileStore,
        { provide: ProfileRepository, useValue: { getDashboard } },
      ],
    }).compileComponents();
    signInForTest(['ROLE_CLIENTE']);
  });

  it('loads the dashboard once on the first visit', () => {
    const element: HTMLElement = openPage().nativeElement;

    expect(getDashboard).toHaveBeenCalledOnce();
    expect(element.querySelector('[aria-busy="true"]')).toBeNull();
    expect(element.querySelector('app-loyalty-card')).not.toBeNull();
  });

  it('shows the loading placeholders while the dashboard is on its way', () => {
    getDashboard.mockReturnValueOnce(new Subject<ProfileDashboard>());

    const element: HTMLElement = openPage().nativeElement;

    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(element.querySelector('app-loyalty-card')).toBeNull();
  });

  it('loads the dashboard again and shows the placeholders when the client comes back', async () => {
    openPage().destroy();
    const freshDashboard = new Subject<ProfileDashboard>();
    getDashboard.mockReturnValueOnce(freshDashboard);

    const fixture = openPage();
    await settle();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(getDashboard).toHaveBeenCalledTimes(2);
    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();

    freshDashboard.next(dashboard);
    freshDashboard.complete();
    await settle();
    fixture.detectChanges();

    expect(element.querySelector('[aria-busy="true"]')).toBeNull();
    expect(element.querySelector('app-loyalty-card')).not.toBeNull();
  });
});
