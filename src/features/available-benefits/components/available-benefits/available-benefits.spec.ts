import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { CafeService } from '../../../home/services/cafe.service';
import { ProfileRepository } from '../../../profile/services/profile.repository';
import { RedeemedBenefit } from '../../../profile/types/profile.model';
import { AvailableBenefitService } from '../../services/available-benefit.service';
import { CAFE_BENEFIT_FIXTURE, GLOBAL_BENEFIT_FIXTURE } from '../../utils/available-benefit.fixture';
import { AvailableBenefits } from './available-benefits';

describe('AvailableBenefits', () => {
  const redeemed: RedeemedBenefit = {
    id: 'redemption-1',
    validationCode: 'ABC123',
    benefitName: GLOBAL_BENEFIT_FIXTURE.name,
    cafeName: null,
    usedPoints: 500,
    redeemedAt: new Date(2026, 10, 17),
  };
  let getAvailable: ReturnType<typeof vi.fn>;
  let getTierDetail: ReturnType<typeof vi.fn>;
  let redeemBenefit: ReturnType<typeof vi.fn>;

  function render(): ComponentFixture<AvailableBenefits> {
    const fixture = TestBed.createComponent(AvailableBenefits);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    getAvailable = vi.fn(() => of([GLOBAL_BENEFIT_FIXTURE, CAFE_BENEFIT_FIXTURE]));
    getTierDetail = vi.fn(() => of({ currentTierThreshold: 0, availablePoints: 800 }));
    redeemBenefit = vi.fn(() => of(redeemed));
    await TestBed.configureTestingModule({
      imports: [AvailableBenefits],
      providers: [
        provideRouter([]),
        { provide: AvailableBenefitService, useValue: { getAvailable } },
        {
          provide: CafeService,
          useValue: { getAll: () => of([{ externalId: 'cafe-central', name: 'Cafe Central' }]) },
        },
        { provide: ProfileRepository, useValue: { getTierDetail, redeemBenefit } },
      ],
    }).compileComponents();
  });

  it('shows a card for every active benefit of the platform', () => {
    const fixture = render();
    const cards = fixture.nativeElement.querySelectorAll('app-available-benefit-card');

    expect(getAvailable).toHaveBeenCalledWith('', '');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('Descuento 15% bienvenida');
    expect(cards[1].textContent).toContain('Cafe Central');
  });

  it('puts the night mode button next to the cart in the header', () => {
    const header = render().nativeElement.querySelector('header');

    expect(header.querySelector('app-theme-toggle + app-cart-button')).not.toBeNull();
  });

  it('counts the benefits the tier of the client unlocks', () => {
    const component = render().componentInstance;

    expect(component.unlockedCount()).toBe(1);
  });

  it('asks again with the cafe and the type chosen and clears them', () => {
    const component = render().componentInstance;

    component.selectCafe('cafe-central');
    component.selectType('PRODUCTO_POR_PUNTOS');
    expect(getAvailable).toHaveBeenLastCalledWith('cafe-central', 'PRODUCTO_POR_PUNTOS');
    expect(component.hasFilters()).toBe(true);

    component.clearFilters();
    expect(getAvailable).toHaveBeenLastCalledWith('', '');
    expect(component.hasFilters()).toBe(false);
  });

  it('offers to retry when the catalog cannot be loaded', () => {
    getAvailable.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = render();

    expect(fixture.componentInstance.hasError()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('No pudimos cargar los beneficios');
  });

  it('explains when no benefit matches the filters', () => {
    getAvailable.mockReturnValue(of([]));
    const fixture = render();

    expect(fixture.nativeElement.textContent).toContain('No encontramos beneficios');
  });

  describe('redeeming a benefit', () => {
    const click = (fixture: ComponentFixture<AvailableBenefits>, text: string) => {
      const button = (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]).find(
        (candidate) => candidate.textContent?.includes(text) || candidate.getAttribute('aria-label')?.includes(text),
      );
      button?.click();
      fixture.detectChanges();
    };

    it('states the cost and redeems only after the client confirms', () => {
      const fixture = render();

      click(fixture, 'Canjear Descuento 15% bienvenida');

      expect(fixture.nativeElement.textContent).toContain('¿Canjear Descuento 15% bienvenida por 500 pts?');
      expect(redeemBenefit).not.toHaveBeenCalled();

      click(fixture, 'Confirmar');

      expect(redeemBenefit).toHaveBeenCalledExactlyOnceWith('benefit-welcome');
    });

    it('tells the client the coupon is in "Mis cupones" and refreshes the points and the list', () => {
      const success = vi.spyOn(TestBed.inject(ToastService), 'success');
      const fixture = render();
      click(fixture, 'Canjear Descuento 15% bienvenida');

      click(fixture, 'Confirmar');

      expect(success).toHaveBeenCalledWith(
        '¡Canjeaste Descuento 15% bienvenida por 500 pts! Tu cupón ya está en Mis cupones.',
        { label: 'Ver mis cupones', route: '/profile/coupons' },
      );
      expect(getTierDetail).toHaveBeenCalledTimes(2);
      expect(getAvailable).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.isLoading()).toBe(false);
    });

    it('does not redeem when the client cancels the confirmation', () => {
      const fixture = render();
      click(fixture, 'Canjear Descuento 15% bienvenida');

      click(fixture, 'Cancelar');

      expect(redeemBenefit).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).not.toContain('¿Canjear');
    });

    it('shows the reason of the backend in a toast when the redeem is rejected', () => {
      const error = vi.spyOn(TestBed.inject(ToastService), 'error');
      redeemBenefit.mockReturnValue(
        throwError(
          () => new HttpErrorResponse({ status: 422, error: { detail: 'El cliente no tiene puntos suficientes' } }),
        ),
      );
      const fixture = render();
      click(fixture, 'Canjear Descuento 15% bienvenida');

      click(fixture, 'Confirmar');

      expect(error).toHaveBeenCalledWith('No tenés puntos suficientes para este beneficio.');
    });

    it('offers the redeem action only on the benefits the client can redeem and says why on the others', () => {
      const fixture = render();
      const cards = Array.from(fixture.nativeElement.querySelectorAll('app-available-benefit-card')) as HTMLElement[];

      expect(cards.map((card) => card.querySelectorAll('button').length)).toEqual([1, 0]);
      expect(cards[1].textContent).toContain('Disponible desde Plata');
    });
  });
});
